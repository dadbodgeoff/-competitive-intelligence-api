#!/usr/bin/env python3
"""
One-time script to backfill ordering data for existing users.
This processes all existing invoice data through the ordering pipeline.
"""
from database.supabase_client import get_supabase_service_client
from services.ordering.tasks import (
    enqueue_delivery_pattern_detection,
    enqueue_feature_refresh,
    enqueue_forecast_generation,
    enqueue_normalization_job,
    warm_forecast_cache,
)


def main():
    client = get_supabase_service_client()

    invoice_accounts = client.table("invoices").select("user_id").execute()
    user_ids = sorted({row["user_id"] for row in invoice_accounts.data or [] if row.get("user_id")})

    if not user_ids:
        print("No users with invoices found; nothing to backfill.")
        return

    print(f"Found {len(user_ids)} users with historical invoices. Backfilling...")

    for idx, user_id in enumerate(user_ids, start=1):
        print(f"\n[{idx}/{len(user_ids)}] User {user_id}:")
        try:
            print("  • Normalizing invoice items...")
            enqueue_normalization_job(user_id)

            print("  • Refreshing feature + usage metrics...")
            enqueue_feature_refresh(user_id)

            print("  • Detecting delivery patterns...")
            enqueue_delivery_pattern_detection(user_id)

            print("  • Generating forecasts...")
            enqueue_forecast_generation(user_id)

            print("  • Warming forecast cache...")
            warm_forecast_cache(user_id)

            print("  ✅ Completed ordering backfill")
        except Exception as exc:  # pylint: disable=broad-except
            print(f"  ❌ Failed ordering backfill: {exc}")


if __name__ == "__main__":
    main()
