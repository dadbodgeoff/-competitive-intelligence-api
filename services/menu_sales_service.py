"""
Menu Sales Service
Handles recording daily menu item sales with COGS snapshots and reporting.
"""
import logging
import os
from collections import defaultdict
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Optional, Tuple

from dotenv import load_dotenv
from supabase import Client, create_client

from services.menu_recipe_service import MenuRecipeService

load_dotenv()
logger = logging.getLogger(__name__)


class MenuSalesService:
    """
    Record and report menu item daily sales.

    Responsibilities:
    - Validate menu ownership before writes
    - Snapshot per-serving COGS and menu price at time of entry
    - Provide aggregated spend summaries for reporting
    """

    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")

        self.client: Client = create_client(supabase_url, supabase_key)
        self.recipe_service = MenuRecipeService(self.client)

    # ------------------------------------------------------------------
    # Write path
    # ------------------------------------------------------------------
    async def upsert_daily_sales(
        self,
        *,
        user_id: str,
        sale_date: date,
        entries: List[Dict],
    ) -> Dict:
        """
        Record (or update) daily sales entries.

        Args:
            user_id: Authenticated user ID
            sale_date: Calendar date being recorded
            entries: List of dict entries with keys:
                - menu_item_id (str)
                - menu_item_price_id (str | None)
                - quantity_sold (Decimal-compatible)
                - metadata (optional dict)

        Returns:
            Dict with summary totals and per-entry snapshots.
        """
        if not entries:
            return {
                "records": [],
                "summary": {
                    "total_quantity": 0.0,
                    "total_cogs": 0.0,
                    "total_revenue": 0.0,
                    "total_gross_profit": 0.0,
                },
            }

        menu_item_ids = {entry["menu_item_id"] for entry in entries}
        price_ids = {
            entry["menu_item_price_id"]
            for entry in entries
            if entry.get("menu_item_price_id")
        }

        # Step 1: Validate menu ownership
        menu_items_result = (
            self.client.table("menu_items")
            .select("id, menu_id, item_name")
            .in_("id", list(menu_item_ids))
            .execute()
        )
        if len(menu_items_result.data or []) != len(menu_item_ids):
            raise ValueError("One or more menu items could not be found")

        menu_items_map = {item["id"]: item for item in menu_items_result.data}
        menu_ids = {item["menu_id"] for item in menu_items_map.values()}

        ownership_result = (
            self.client.table("restaurant_menus")
            .select("id")
            .in_("id", list(menu_ids))
            .eq("user_id", user_id)
            .execute()
        )
        if len(ownership_result.data or []) != len(menu_ids):
            raise ValueError("Unauthorized to record sales for one or more menu items")

        # Step 2: Validate menu item price variants (if provided)
        price_map: Dict[str, Dict] = {}
        if price_ids:
            price_rows = (
                self.client.table("menu_item_prices")
                .select("id, menu_item_id, price, size_label")
                .in_("id", list(price_ids))
                .execute()
            )
            if len(price_rows.data or []) != len(price_ids):
                raise ValueError("One or more menu item prices could not be found")

            for row in price_rows.data:
                price_map[row["id"]] = row

            for entry in entries:
                price_id = entry.get("menu_item_price_id")
                if not price_id:
                    continue
                price_row = price_map[price_id]
                if price_row["menu_item_id"] != entry["menu_item_id"]:
                    raise ValueError(
                        "Menu item price does not belong to the specified menu item"
                    )

        # Step 3: Load recipe snapshots for COGS
        recipes = await self.recipe_service.get_recipes_batch(
            list(menu_item_ids), user_id
        )

        # Step 4: Fetch existing rows for this date to support updates
        existing_map: Dict[Tuple[str, Optional[str]], str] = {}
        existing_query = (
            self.client.table("menu_item_daily_sales")
            .select("id, menu_item_id, menu_item_price_id")
            .eq("user_id", user_id)
            .eq("sale_date", sale_date.isoformat())
        )
        if menu_item_ids:
            existing_query = existing_query.in_("menu_item_id", list(menu_item_ids))
        existing_rows = existing_query.execute()
        for row in existing_rows.data or []:
            key = (row["menu_item_id"], row.get("menu_item_price_id"))
            existing_map[key] = row["id"]

        # Step 5: Insert/update rows
        saved_records: List[Dict] = []
        total_quantity = Decimal("0")
        total_cogs = Decimal("0")
        total_revenue = Decimal("0")

        for entry in entries:
            menu_item_id = entry["menu_item_id"]
            price_id = entry.get("menu_item_price_id")
            quantity = Decimal(str(entry["quantity_sold"]))
            metadata = entry.get("metadata")

            recipe = recipes.get(menu_item_id)
            unit_cogs = (
                Decimal(str(recipe["total_cogs"]))
                if recipe and recipe.get("total_cogs") is not None
                else None
            )

            # Determine unit menu price (prefer explicit price id)
            unit_price: Optional[Decimal] = None
            size_label: Optional[str] = None
            if price_id and price_id in price_map:
                unit_price = Decimal(str(price_map[price_id]["price"]))
                size_label = price_map[price_id].get("size_label")
            elif recipe:
                prices = recipe.get("menu_item", {}).get("prices") or []
                if prices:
                    unit_price = Decimal(str(prices[0].get("price") or 0))
                    size_label = prices[0].get("size_label")

            total_cogs_snapshot = (
                (unit_cogs or Decimal("0")) * quantity if unit_cogs is not None else None
            )
            total_revenue_snapshot = (
                (unit_price or Decimal("0")) * quantity
                if unit_price is not None
                else None
            )
            gross_profit_snapshot = (
                total_revenue_snapshot - total_cogs_snapshot
                if (
                    total_revenue_snapshot is not None
                    and total_cogs_snapshot is not None
                )
                else None
            )

            payload = {
                "user_id": user_id,
                "menu_item_id": menu_item_id,
                "menu_item_price_id": price_id,
                "sale_date": sale_date.isoformat(),
                "quantity_sold": float(quantity),
                "unit_cogs_snapshot": float(unit_cogs)
                if unit_cogs is not None
                else None,
                "unit_menu_price_snapshot": float(unit_price)
                if unit_price is not None
                else None,
                "total_cogs_snapshot": float(total_cogs_snapshot)
                if total_cogs_snapshot is not None
                else None,
                "total_revenue_snapshot": float(total_revenue_snapshot)
                if total_revenue_snapshot is not None
                else None,
                "gross_profit_snapshot": float(gross_profit_snapshot)
                if gross_profit_snapshot is not None
                else None,
                "metadata": metadata,
                "updated_at": datetime.utcnow().isoformat(),
            }

            key = (menu_item_id, price_id)
            existing_id = existing_map.get(key)
            if existing_id:
                self.client.table("menu_item_daily_sales").update(payload).eq(
                    "id", existing_id
                ).execute()
                record_id = existing_id
            else:
                payload["created_at"] = datetime.utcnow().isoformat()
                insert_result = (
                    self.client.table("menu_item_daily_sales").insert(payload).execute()
                )
                record_id = insert_result.data[0]["id"]
                existing_map[key] = record_id

            saved_record = {
                "id": record_id,
                "menu_item_id": menu_item_id,
                "menu_item_name": menu_items_map[menu_item_id]["item_name"],
                "menu_item_price_id": price_id,
                "size_label": size_label,
                "quantity_sold": float(quantity),
                "unit_cogs_snapshot": payload["unit_cogs_snapshot"],
                "unit_menu_price_snapshot": payload["unit_menu_price_snapshot"],
                "total_cogs_snapshot": payload["total_cogs_snapshot"],
                "total_revenue_snapshot": payload["total_revenue_snapshot"],
                "gross_profit_snapshot": payload["gross_profit_snapshot"],
            }
            saved_records.append(saved_record)

            total_quantity += quantity
            if total_cogs_snapshot is not None:
                total_cogs += total_cogs_snapshot
            if total_revenue_snapshot is not None:
                total_revenue += total_revenue_snapshot

        summary = {
            "total_quantity": float(total_quantity),
            "total_cogs": float(total_cogs),
            "total_revenue": float(total_revenue),
            "total_gross_profit": float(total_revenue - total_cogs),
        }

        return {"records": saved_records, "summary": summary}

    # ------------------------------------------------------------------
    # Read paths
    # ------------------------------------------------------------------
    async def get_daily_sales(
        self, *, user_id: str, sale_date: date
    ) -> Dict:
        """
        Retrieve all sales entries for a specific date.
        """
        result = (
            self.client.table("menu_item_daily_sales")
            .select(
                "id, menu_item_id, menu_item_price_id, quantity_sold, "
                "unit_cogs_snapshot, unit_menu_price_snapshot, "
                "total_cogs_snapshot, total_revenue_snapshot, "
                "gross_profit_snapshot, metadata"
            )
            .eq("user_id", user_id)
            .eq("sale_date", sale_date.isoformat())
            .execute()
        )

        rows = result.data or []
        if not rows:
            return {"entries": []}

        menu_item_ids = {row["menu_item_id"] for row in rows}
        price_ids = {
            row["menu_item_price_id"]
            for row in rows
            if row.get("menu_item_price_id")
        }

        menu_items = (
            self.client.table("menu_items")
            .select("id, item_name, menu_id, category_id")
            .in_("id", list(menu_item_ids))
            .execute()
        )
        menu_item_map = {item["id"]: item for item in menu_items.data or []}

        categories_map: Dict[str, str] = {}
        category_ids = {
            item["category_id"]
            for item in menu_items.data or []
            if item.get("category_id")
        }
        if category_ids:
            categories = (
                self.client.table("menu_categories")
                .select("id, category_name")
                .in_("id", list(category_ids))
                .execute()
            )
            categories_map = {
                cat["id"]: cat["category_name"] for cat in categories.data or []
            }

        prices_map: Dict[str, Dict] = {}
        if price_ids:
            prices = (
                self.client.table("menu_item_prices")
                .select("id, size_label, price")
                .in_("id", list(price_ids))
                .execute()
            )
            prices_map = {price["id"]: price for price in prices.data or []}

        entries = []
        for row in rows:
            item_meta = menu_item_map.get(row["menu_item_id"], {})
            price_meta = (
                prices_map.get(row["menu_item_price_id"])
                if row.get("menu_item_price_id")
                else None
            )
            entries.append(
                {
                    "id": row["id"],
                    "menu_item_id": row["menu_item_id"],
                    "menu_item_name": item_meta.get("item_name"),
                    "category_name": categories_map.get(item_meta.get("category_id")),
                    "menu_item_price_id": row.get("menu_item_price_id"),
                    "size_label": price_meta.get("size_label") if price_meta else None,
                    "quantity_sold": row["quantity_sold"],
                    "unit_cogs_snapshot": row["unit_cogs_snapshot"],
                    "unit_menu_price_snapshot": row["unit_menu_price_snapshot"],
                    "total_cogs_snapshot": row["total_cogs_snapshot"],
                    "total_revenue_snapshot": row["total_revenue_snapshot"],
                    "gross_profit_snapshot": row["gross_profit_snapshot"],
                    "metadata": row.get("metadata"),
                }
            )

        return {"entries": entries}

    async def get_summary(
        self,
        *,
        user_id: str,
        start_date: Optional[date],
        end_date: Optional[date],
    ) -> Dict:
        """
        Aggregate spend summaries between start and end dates (inclusive).
        """
        if end_date and start_date and end_date < start_date:
            raise ValueError("end_date must be greater than or equal to start_date")

        if not end_date:
            end_date = date.today()
        if not start_date:
            start_date = end_date - timedelta(days=13)  # default to last 14 days

        query = (
            self.client.table("menu_item_daily_sales")
            .select(
                "sale_date, menu_item_id, menu_item_price_id, quantity_sold, "
                "total_cogs_snapshot, total_revenue_snapshot, gross_profit_snapshot"
            )
            .eq("user_id", user_id)
            .gte("sale_date", start_date.isoformat())
            .lte("sale_date", end_date.isoformat())
        )

        result = query.execute()
        rows = result.data or []

        if not rows:
            return {
                "totals": {
                    "total_quantity": 0.0,
                    "total_cogs": 0.0,
                    "total_revenue": 0.0,
                    "total_gross_profit": 0.0,
                },
                "by_date": [],
                "top_items": [],
            }

        by_date: Dict[str, Dict[str, Decimal]] = defaultdict(
            lambda: {
                "total_quantity": Decimal("0"),
                "total_cogs": Decimal("0"),
                "total_revenue": Decimal("0"),
                "total_gross_profit": Decimal("0"),
            }
        )
        by_item: Dict[str, Dict[str, Decimal]] = defaultdict(
            lambda: {
                "menu_item_id": None,
                "total_quantity": Decimal("0"),
                "total_cogs": Decimal("0"),
                "total_revenue": Decimal("0"),
                "total_gross_profit": Decimal("0"),
            }
        )

        for row in rows:
            sale_date_str = row["sale_date"]
            item_id = row["menu_item_id"]

            quantity = Decimal(str(row.get("quantity_sold") or 0))
            total_cogs = Decimal(str(row.get("total_cogs_snapshot") or 0))
            total_revenue = Decimal(str(row.get("total_revenue_snapshot") or 0))
            gross_profit = Decimal(str(row.get("gross_profit_snapshot") or 0))

            # Aggregate by date
            agg_date = by_date[sale_date_str]
            agg_date["total_quantity"] += quantity
            agg_date["total_cogs"] += total_cogs
            agg_date["total_revenue"] += total_revenue
            agg_date["total_gross_profit"] += gross_profit

            # Aggregate by item
            agg_item = by_item[item_id]
            agg_item["menu_item_id"] = item_id
            agg_item["total_quantity"] += quantity
            agg_item["total_cogs"] += total_cogs
            agg_item["total_revenue"] += total_revenue
            agg_item["total_gross_profit"] += gross_profit

        menu_item_ids = list(by_item.keys())
        menu_item_map: Dict[str, Dict] = {}
        if menu_item_ids:
            items_result = (
                self.client.table("menu_items")
                .select("id, item_name")
                .in_("id", menu_item_ids)
                .execute()
            )
            menu_item_map = {item["id"]: item for item in items_result.data or []}

        by_date_list = [
            {
                "sale_date": sale_date_str,
                "total_quantity": float(metrics["total_quantity"]),
                "total_cogs": float(metrics["total_cogs"]),
                "total_revenue": float(metrics["total_revenue"]),
                "total_gross_profit": float(metrics["total_gross_profit"]),
            }
            for sale_date_str, metrics in sorted(by_date.items())
        ]

        top_items = sorted(
            [
                {
                    "menu_item_id": item_id,
                    "menu_item_name": menu_item_map.get(item_id, {}).get(
                        "item_name", "Unknown Item"
                    ),
                    "total_quantity": float(metrics["total_quantity"]),
                    "total_cogs": float(metrics["total_cogs"]),
                    "total_revenue": float(metrics["total_revenue"]),
                    "total_gross_profit": float(metrics["total_gross_profit"]),
                }
                for item_id, metrics in by_item.items()
            ],
            key=lambda item: item["total_cogs"],
            reverse=True,
        )[:10]

        totals = {
            "total_quantity": float(
                sum(metrics["total_quantity"] for metrics in by_item.values())
            ),
            "total_cogs": float(
                sum(metrics["total_cogs"] for metrics in by_item.values())
            ),
            "total_revenue": float(
                sum(metrics["total_revenue"] for metrics in by_item.values())
            ),
            "total_gross_profit": float(
                sum(metrics["total_gross_profit"] for metrics in by_item.values())
            ),
        }

        return {"totals": totals, "by_date": by_date_list, "top_items": top_items}


