"""
Demo Seed Service
Provides sample dataset seeding for newly registered accounts so key dashboards
and modules present meaningful data before the first real upload.
"""
from __future__ import annotations
import logging
import os
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Optional, Tuple

from database.supabase_client import get_supabase_service_client
from services.background_tasks import (
    dashboard_category_key,
    dashboard_monthly_key,
    dashboard_vendor_key,
    dashboard_weekly_key,
    price_anomalies_key,
    price_dashboard_key,
    price_savings_key,
    warm_dashboard_cache,
    warm_price_analytics_cache,
)
from services.redis_client import cache
from services.user_preferences_service import UserPreferencesService

logger = logging.getLogger(__name__)

TAX_RATE = Decimal("0.08")


class DemoSeedService:
    """Encapsulates creation and cleanup of demo datasets for new users."""

    def __init__(self) -> None:
        self.enabled = os.getenv("DEMO_SEED_ENABLED", "true").lower() != "false"
        self.client = get_supabase_service_client()
        self.preferences_service = UserPreferencesService()

    # ---------------------------------------------------------------------#
    # Public API
    # ---------------------------------------------------------------------#
    def seed_user(self, user_id: str) -> None:
        """Seed demo data for a user if enabled and not already seeded."""
        if not self.enabled:
            logger.debug("Demo seed disabled via env; skipping for %s", user_id)
            return

        try:
            state = self._get_state(user_id)
            if state and state.get("status") == "seeded":
                logger.debug("Demo seed already present for %s", user_id)
                return

            if state and state.get("metadata"):
                # Clean up partial/old seed before reattempting.
                logger.debug("Cleaning residual demo seed data for %s", user_id)
                self._cleanup_seed_metadata(state)

            self._upsert_state(
                user_id,
                {
                    "status": "pending",
                    "seeded_at": datetime.utcnow().isoformat(),
                    "last_error": None,
                },
            )

            metadata = self._create_demo_dataset(user_id)
            self._upsert_state(
                user_id,
                {
                    "status": "seeded",
                    "metadata": metadata,
                    "last_error": None,
                },
            )

            self._warm_caches(user_id)
            logger.info("✅ Demo dataset seeded for user %s", user_id)
        except Exception as exc:  # pylint: disable=broad-except
            logger.exception("❌ Demo seed failed for user %s: %s", user_id, exc)
            self._upsert_state(
                user_id,
                {
                    "status": "error",
                    "last_error": str(exc),
                },
            )

    def mark_seed_consumed(self, user_id: str) -> None:
        """Remove demo data once the user generates real content."""
        if not self.enabled:
            return

        state = self._get_state(user_id)
        if not state or state.get("status") != "seeded":
            return

        metadata = state.get("metadata") or {}
        invoice_ids = metadata.get("invoice_ids") or []
        menu_id = metadata.get("menu_id")

        try:
            if menu_id:
                logger.info("🗑️ Removing demo menu for %s", user_id)
                self.client.table("restaurant_menus").delete().eq("id", menu_id).execute()

            if invoice_ids:
                logger.info("🗑️ Removing demo invoices for %s", user_id)
                self.client.table("invoices").delete().in_("id", invoice_ids).execute()

            self._clear_caches(user_id)

            self._upsert_state(
                user_id,
                {
                    "status": "cleared",
                    "cleared_at": datetime.utcnow().isoformat(),
                    "metadata": None,
                },
            )

            logger.info("✅ Demo dataset cleared for user %s", user_id)
        except Exception as exc:  # pylint: disable=broad-except
            logger.exception("Failed to clear demo seed for %s: %s", user_id, exc)
            self._upsert_state(
                user_id,
                {
                    "status": "error",
                    "last_error": str(exc),
                },
            )

    # ---------------------------------------------------------------------#
    # Internal helpers
    # ---------------------------------------------------------------------#
    def _get_state(self, user_id: str) -> Optional[Dict]:
        result = (
            self.client.table("demo_seed_states")
            .select("*")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None

    def _upsert_state(self, user_id: str, fields: Dict) -> None:
        current = self._get_state(user_id)
        payload = {k: v for k, v in fields.items() if v is not None}
        if current:
            self.client.table("demo_seed_states").update(payload).eq("user_id", user_id).execute()
        else:
            insert_payload = {"user_id": user_id}
            insert_payload.update(payload)
            self.client.table("demo_seed_states").insert(insert_payload).execute()

    def _cleanup_seed_metadata(self, state: Dict) -> None:
        metadata = state.get("metadata") or {}
        invoice_ids = metadata.get("invoice_ids") or []
        menu_id = metadata.get("menu_id")

        if menu_id:
            try:
                self.client.table("restaurant_menus").delete().eq("id", menu_id).execute()
            except Exception as exc:  # pylint: disable=broad-except
                logger.warning("Could not purge demo menu %s: %s", menu_id, exc)

        if invoice_ids:
            try:
                self.client.table("invoices").delete().in_("id", invoice_ids).execute()
            except Exception as exc:  # pylint: disable=broad-except
                logger.warning("Could not purge demo invoices: %s", exc)

    def _create_demo_dataset(self, user_id: str) -> Dict:
        metadata: Dict[str, object] = {}

        self.preferences_service.get_preferences(user_id)

        account_lookup = self.client.rpc(
            'get_primary_account_id',
            {'p_user_id': user_id}
        ).execute()
        account_id = None
        if isinstance(account_lookup.data, str):
            account_id = account_lookup.data
        elif isinstance(account_lookup.data, list) and account_lookup.data:
            account_id = account_lookup.data[0]

        if not account_id:
            raise RuntimeError(f"Unable to resolve account for demo seeding user {user_id}")

        invoice_metadata, invoice_item_lookup = self._insert_invoices(user_id, account_id)
        metadata.update(invoice_metadata)

        menu_metadata = self._insert_menu(user_id, account_id, invoice_item_lookup)
        metadata.update(menu_metadata)
        metadata["seed_version"] = "2025-11-demo-v1"

        return metadata

    # ------------------------------------------------------------------#
    # Invoice seeding
    # ------------------------------------------------------------------#
    def _insert_invoices(self, user_id: str, account_id: str) -> Tuple[Dict[str, object], Dict[str, str]]:
        today = date.today()
        invoice_specs = [
            self._build_invoice_spec(
                invoice_number="DEMO-INV-001",
                vendor="Sysco Foods",
                invoice_date=today - timedelta(days=30),
                line_items=[
                    self._line_item(
                        seed_key="ground_beef_sysco_old",
                        description="Premium Ground Beef 80/20 10lb",
                        quantity=4,
                        unit_price=Decimal("48.50"),
                        pack_size="Case 4 x 10 lb",
                        category="Proteins",
                    ),
                    self._line_item(
                        seed_key="brioche_buns",
                        description='Brioche Burger Buns 4" 96ct',
                        quantity=3,
                        unit_price=Decimal("18.75"),
                        pack_size="Tray 96 ct",
                        category="Bakery",
                    ),
                    self._line_item(
                        seed_key="truffle_oil",
                        description="Black Truffle Oil 16oz",
                        quantity=1,
                        unit_price=Decimal("32.00"),
                        pack_size="Bottle 16 oz",
                        category="Specialty",
                    ),
                    self._line_item(
                        seed_key="parmesan_wheel",
                        description="Imported Parmesan Wheel 20lb",
                        quantity=1,
                        unit_price=Decimal("98.00"),
                        pack_size="Wheel 20 lb",
                        category="Dairy",
                    ),
                ],
            ),
            self._build_invoice_spec(
                invoice_number="DEMO-INV-002",
                vendor="Performance Foodservice",
                invoice_date=today - timedelta(days=6),
                line_items=[
                    self._line_item(
                        seed_key="ground_beef_perf_mid",
                        description="Premium Ground Beef 80/20 10lb",
                        quantity=4,
                        unit_price=Decimal("54.00"),
                        pack_size="Case 4 x 10 lb",
                        category="Proteins",
                    ),
                    self._line_item(
                        seed_key="kale_high",
                        description="Fresh Kale 24ct",
                        quantity=2,
                        unit_price=Decimal("28.00"),
                        pack_size="20 lb",
                        category="Produce",
                    ),
                    self._line_item(
                        seed_key="fries",
                        description="Premium Shoestring Fries 30lb",
                        quantity=3,
                        unit_price=Decimal("24.00"),
                        pack_size="Case 30 lb",
                        category="Frozen",
                    ),
                    self._line_item(
                        seed_key="garlic_aioli",
                        description="Roasted Garlic Aioli 1gal",
                        quantity=1,
                        unit_price=Decimal("22.50"),
                        pack_size="128 oz",
                        category="Sauces",
                    ),
                ],
            ),
            self._build_invoice_spec(
                invoice_number="DEMO-INV-003",
                vendor="Performance Foodservice",
                invoice_date=today - timedelta(days=2),
                line_items=[
                    self._line_item(
                        seed_key="ground_beef_perf_latest",
                        description="Premium Ground Beef 80/20 10lb",
                        quantity=4,
                        unit_price=Decimal("60.00"),
                        pack_size="Case 4 x 10 lb",
                        category="Proteins",
                    ),
                    self._line_item(
                        seed_key="kale_low",
                        description="Fresh Kale 24ct",
                        quantity=2,
                        unit_price=Decimal("21.00"),
                        pack_size="20 lb",
                        category="Produce",
                    ),
                    self._line_item(
                        seed_key="truffle_salt",
                        description="Truffle Sea Salt 8oz",
                        quantity=2,
                        unit_price=Decimal("14.00"),
                        pack_size="Jar 8 oz",
                        category="Specialty",
                    ),
                    self._line_item(
                        seed_key="sweet_potatoes",
                        description="Sweet Potato Wedges 20lb",
                        quantity=2,
                        unit_price=Decimal("19.50"),
                        pack_size="Case 20 lb",
                        category="Produce",
                    ),
                ],
            ),
        ]

        invoice_records: List[Dict] = []
        line_item_records: List[Dict] = []
        seed_key_lookup: Dict[str, str] = {}

        for spec in invoice_specs:
            subtotal = sum(item["extended_price"] for item in spec["line_items"])
            tax = (subtotal * TAX_RATE).quantize(Decimal("0.01"))
            total = subtotal + tax

            invoice_record = {
                "user_id": user_id,
                "invoice_number": spec["invoice_number"],
                "invoice_date": spec["invoice_date"].isoformat(),
                "vendor_name": spec["vendor"],
                "subtotal": float(subtotal),
                "tax": float(tax),
                "total": float(total),
                "parse_method": "demo_seed",
            "parse_cost": 0,
            "parse_time_seconds": 0,
                "parse_tokens_used": 0,
                "status": "demo_seed",
                "raw_file_url": "https://restaurantiq.us/demo/invoices/sample.pdf",
                "parsed_json": {
                    "source": "demo_seed",
                    "invoice_number": spec["invoice_number"],
                    "vendor": spec["vendor"],
                },
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "account_id": account_id,
            }
            invoice_records.append(invoice_record)

        insert_result = self.client.table("invoices").insert(invoice_records).execute()
        if not insert_result.data:
            raise RuntimeError("Failed to insert demo invoices")
        invoice_id_map = {
            record["invoice_number"]: record["id"] for record in insert_result.data
        }

        for spec in invoice_specs:
            invoice_id = invoice_id_map[spec["invoice_number"]]
            for item in spec["line_items"]:
                record = {
                    "invoice_id": invoice_id,
                    "item_number": item["item_number"],
                    "description": item["description"],
                    "quantity": float(item["quantity"]),
                    "pack_size": item["pack_size"],
                    "unit_price": float(item["unit_price"]),
                    "extended_price": float(item["extended_price"]),
                    "category": item["category"],
                    "user_corrected": False,
                    "created_at": datetime.utcnow().isoformat(),
                    "account_id": account_id,
                }
                line_item_records.append(record)

        line_insert = self.client.table("invoice_items").insert(line_item_records).execute()
        if not line_insert.data:
            raise RuntimeError("Failed to insert demo invoice line items")

        # Build lookup map keyed by (invoice_id, description, unit_price, quantity)
        line_lookup: Dict[Tuple[str, str, str, str], List[str]] = {}
        for record in line_insert.data:
            key = (
                record["invoice_id"],
                record["description"],
                str(record["unit_price"]),
                str(record["quantity"]),
            )
            line_lookup.setdefault(key, []).append(record["id"])

        # Use the lookup to resolve each seed key to the inserted row id.
        for spec in invoice_specs:
            for item in spec["line_items"]:
                invoice_id = invoice_id_map[spec["invoice_number"]]
                lookup_key = (
                    invoice_id,
                    item["description"],
                    str(float(item["unit_price"])),
                    str(float(item["quantity"])),
                )
                matches = line_lookup.get(lookup_key)
                if not matches:
                    raise RuntimeError(
                        f"Unable to resolve demo invoice item for {item['seed_key']}"
                    )
                seed_key_lookup[item["seed_key"]] = matches.pop()

        metadata = {
            "invoice_ids": list(invoice_id_map.values()),
            "invoice_numbers": list(invoice_id_map.keys()),
        }
        return metadata, seed_key_lookup

    def _build_invoice_spec(
        self,
        invoice_number: str,
        vendor: str,
        invoice_date: date,
        line_items: List[Dict],
    ) -> Dict:
        return {
            "invoice_number": invoice_number,
            "vendor": vendor,
            "invoice_date": invoice_date,
            "line_items": line_items,
        }

    @staticmethod
    def _line_item(
        seed_key: str,
        description: str,
        quantity: float,
        unit_price: Decimal,
        pack_size: str,
        category: Optional[str] = None,
    ) -> Dict:
        extended_price = (Decimal(str(quantity)) * unit_price).quantize(Decimal("0.01"))
        return {
            "seed_key": seed_key,
            "description": description,
            "quantity": quantity,
            "unit_price": unit_price,
            "extended_price": extended_price,
            "pack_size": pack_size,
            "category": category,
            "item_number": "",
        }

    # ------------------------------------------------------------------#
    # Menu seeding
    # ------------------------------------------------------------------#
    def _insert_menu(self, user_id: str, account_id: str, invoice_item_lookup: Dict[str, str]) -> Dict[str, object]:
        now_iso = datetime.utcnow().isoformat()
        menu_record = {
            "user_id": user_id,
            "restaurant_name": "Demo Bistro",
            "menu_version": 1,
            "file_url": "https://restaurantiq.us/demo/menu.pdf",
            "status": "active",
            "parse_metadata": {
                "source": "demo_seed",
                "model_used": "demo_seed",
                "parse_time_seconds": 0,
            },
            "created_at": now_iso,
            "updated_at": now_iso,
        }

        menu_result = self.client.table("restaurant_menus").insert(menu_record).execute()
        if not menu_result.data:
            raise RuntimeError("Failed to insert demo menu")
        menu_id = menu_result.data[0]["id"]

        categories = [
            ("Signature Plates", 0),
            ("Shareables", 1),
            ("Greens", 2),
        ]

        category_ids: Dict[str, str] = {}
        for name, order in categories:
            category_result = (
                self.client.table("menu_categories")
                .insert(
                    {
                        "menu_id": menu_id,
                        "category_name": name,
                        "display_order": order,
                        "created_at": now_iso,
                    }
                )
                .execute()
            )
            if not category_result.data:
                raise RuntimeError(f"Failed to insert demo menu category {name}")
            category_ids[name] = category_result.data[0]["id"]

        # Menu items with pricing
        menu_items_spec = [
            {
                "category": "Signature Plates",
                "item_name": "Signature AI Burger",
                "description": "Gemini-crisped brioche bun, 8oz premium beef, roasted garlic aioli, baby kale.",
                "price": 18.00,
                "seed_key": "burger",
                "ingredients": [
                    ("ground_beef_perf_latest", 0.5, "lb"),
                    ("brioche_buns", 1, "ea"),
                    ("garlic_aioli", 1.5, "oz"),
                    ("kale_low", 0.1, "lb"),
                ],
            },
            {
                "category": "Shareables",
                "item_name": "Truffle Parmesan Fries",
                "description": "Shoestring potatoes, black truffle oil, shaved parmesan, truffle salt.",
                "price": 9.00,
                "seed_key": "fries",
                "ingredients": [
                    ("fries", 0.6, "lb"),
                    ("truffle_oil", 0.5, "oz"),
                    ("parmesan_wheel", 0.2, "oz"),
                    ("truffle_salt", 0.1, "oz"),
                ],
            },
            {
                "category": "Greens",
                "item_name": "Superfood Kale Salad",
                "description": "Fresh kale, sweet potato crisps, parmesan, citrus vinaigrette.",
                "price": 14.00,
                "seed_key": "kale",
                "ingredients": [
                    ("kale_low", 0.25, "lb"),
                    ("sweet_potatoes", 0.2, "lb"),
                    ("parmesan_wheel", 0.15, "oz"),
                ],
            },
        ]

        for item_spec in menu_items_spec:
            category_id = category_ids[item_spec["category"]]
            item_result = (
                self.client.table("menu_items")
                .insert(
                    {
                        "menu_id": menu_id,
                        "category_id": category_id,
                        "item_name": item_spec["item_name"],
                        "description": item_spec["description"],
                        "display_order": 0,
                        "created_at": now_iso,
                        "updated_at": now_iso,
                        "notes": "demo_seed",
                    }
                )
                .execute()
            )
            if not item_result.data:
                raise RuntimeError(f"Failed to insert demo menu item {item_spec['item_name']}")
            menu_item_id = item_result.data[0]["id"]

            price_result = (
                self.client.table("menu_item_prices")
                .insert(
                    {
                        "menu_item_id": menu_item_id,
                        "size_label": None,
                        "price": item_spec["price"],
                        "created_at": now_iso,
                    }
                )
                .execute()
            )
            if not price_result.data:
                raise RuntimeError(f"Failed to insert price for demo item {item_spec['item_name']}")
            menu_price_id = price_result.data[0]["id"]

            ingredient_records = []
            for seed_key, quantity, unit in item_spec["ingredients"]:
                invoice_item_id = invoice_item_lookup.get(seed_key)
                if not invoice_item_id:
                    logger.warning("Missing invoice item for seed key %s; skipping", seed_key)
                    continue
                ingredient_records.append(
                    {
                        "menu_item_id": menu_item_id,
                        "menu_item_price_id": menu_price_id,
                        "invoice_item_id": invoice_item_id,
                        "quantity_per_serving": quantity,
                        "unit_of_measure": unit,
                        "notes": "demo_seed",
                        "created_at": now_iso,
                        "updated_at": now_iso,
                    }
                )

            if ingredient_records:
                ingredient_result = (
                    self.client.table("menu_item_ingredients").insert(ingredient_records).execute()
                )
                if not ingredient_result.data:
                    raise RuntimeError(f"Failed to insert ingredients for demo item {item_spec['item_name']}")

        return {"menu_id": menu_id}

    # ------------------------------------------------------------------#
    # Cache helpers
    # ------------------------------------------------------------------#
    def _warm_caches(self, user_id: str) -> None:
        try:
            warm_dashboard_cache(user_id)
            warm_price_analytics_cache(user_id)
        except Exception as exc:  # pylint: disable=broad-except
            logger.warning("Unable to warm caches for %s: %s", user_id, exc)

    def _clear_caches(self, user_id: str) -> None:
        keys = [
            dashboard_monthly_key(user_id),
            dashboard_vendor_key(user_id, 90),
            dashboard_category_key(user_id, 30),
            dashboard_weekly_key(user_id, 8),
            price_dashboard_key(user_id, 90),
            price_savings_key(user_id, 5.0, 90),
            price_anomalies_key(user_id, 20.0, 90),
        ]
        for key in keys:
            cache.delete(key)
        cache.delete_pattern(f"cogs:recipe:{user_id}:*")


# Shared singleton instance to avoid repeated Supabase client creation
demo_seed_service = DemoSeedService()

