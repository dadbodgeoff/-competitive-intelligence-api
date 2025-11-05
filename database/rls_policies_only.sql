-- ============================================================================
-- RLS POLICIES EXPORT
-- Exported from DEV: db.syxquxgynoinzwhwkosa.supabase.co
-- Total Policies: 94
-- ============================================================================

-- IMPORTANT: Run this AFTER tables are created and RLS is enabled

-- Policies for analyses
CREATE POLICY "Users can create own analyses" ON public.analyses
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can delete their own analyses" ON public.analyses
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert their own analyses" ON public.analyses
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update their own analyses" ON public.analyses
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own analyses" ON public.analyses
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own analyses" ON public.analyses
  USING ((auth.uid() = user_id));

-- Policies for analysis_status_log
CREATE POLICY "Users can view their analysis status logs" ON public.analysis_status_log
  USING ((analysis_id IN ( SELECT analyses.id
   FROM analyses
  WHERE (analyses.user_id = auth.uid()))));

-- Policies for competitor_businesses
CREATE POLICY "Users can delete own competitor businesses" ON public.competitor_businesses
  USING ((EXISTS ( SELECT 1
   FROM competitor_menu_analyses
  WHERE ((competitor_menu_analyses.id = competitor_businesses.analysis_id) AND (competitor_menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can insert own competitor businesses" ON public.competitor_businesses
  WITH CHECK ((EXISTS ( SELECT 1
   FROM competitor_menu_analyses
  WHERE ((competitor_menu_analyses.id = competitor_businesses.analysis_id) AND (competitor_menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can update own competitor businesses" ON public.competitor_businesses
  USING ((EXISTS ( SELECT 1
   FROM competitor_menu_analyses
  WHERE ((competitor_menu_analyses.id = competitor_businesses.analysis_id) AND (competitor_menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can view own competitor businesses" ON public.competitor_businesses
  USING ((EXISTS ( SELECT 1
   FROM competitor_menu_analyses
  WHERE ((competitor_menu_analyses.id = competitor_businesses.analysis_id) AND (competitor_menu_analyses.user_id = auth.uid())))));

-- Policies for competitor_menu_analyses
CREATE POLICY "Users can delete own analyses" ON public.competitor_menu_analyses
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own analyses" ON public.competitor_menu_analyses
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update own analyses" ON public.competitor_menu_analyses
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own analyses" ON public.competitor_menu_analyses
  USING ((auth.uid() = user_id));

-- Policies for competitor_menu_items
CREATE POLICY "Users can delete own competitor items" ON public.competitor_menu_items
  USING ((EXISTS ( SELECT 1
   FROM (competitor_menu_snapshots
     JOIN competitor_menu_analyses ON ((competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id)))
  WHERE ((competitor_menu_snapshots.id = competitor_menu_items.snapshot_id) AND (competitor_menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can insert own competitor items" ON public.competitor_menu_items
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (competitor_menu_snapshots
     JOIN competitor_menu_analyses ON ((competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id)))
  WHERE ((competitor_menu_snapshots.id = competitor_menu_items.snapshot_id) AND (competitor_menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can update own competitor items" ON public.competitor_menu_items
  USING ((EXISTS ( SELECT 1
   FROM (competitor_menu_snapshots
     JOIN competitor_menu_analyses ON ((competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id)))
  WHERE ((competitor_menu_snapshots.id = competitor_menu_items.snapshot_id) AND (competitor_menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can view own competitor items" ON public.competitor_menu_items
  USING ((EXISTS ( SELECT 1
   FROM (competitor_menu_snapshots
     JOIN competitor_menu_analyses ON ((competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id)))
  WHERE ((competitor_menu_snapshots.id = competitor_menu_items.snapshot_id) AND (competitor_menu_analyses.user_id = auth.uid())))));

-- Policies for competitor_menu_snapshots
CREATE POLICY "Users can delete own snapshots" ON public.competitor_menu_snapshots
  USING ((EXISTS ( SELECT 1
   FROM competitor_menu_analyses
  WHERE ((competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id) AND (competitor_menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can insert own snapshots" ON public.competitor_menu_snapshots
  WITH CHECK ((EXISTS ( SELECT 1
   FROM competitor_menu_analyses
  WHERE ((competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id) AND (competitor_menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can update own snapshots" ON public.competitor_menu_snapshots
  USING ((EXISTS ( SELECT 1
   FROM competitor_menu_analyses
  WHERE ((competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id) AND (competitor_menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can view own snapshots" ON public.competitor_menu_snapshots
  USING ((EXISTS ( SELECT 1
   FROM competitor_menu_analyses
  WHERE ((competitor_menu_analyses.id = competitor_menu_snapshots.analysis_id) AND (competitor_menu_analyses.user_id = auth.uid())))));

-- Policies for competitor_menus
CREATE POLICY "Service can manage competitor menus" ON public.competitor_menus
  USING ((auth.role() = 'service_role'::text));
CREATE POLICY "Users can view competitor menus" ON public.competitor_menus
  USING (true);

-- Policies for excluded_competitors
CREATE POLICY "Users can manage their excluded competitors" ON public.excluded_competitors
  USING ((auth.uid() = user_id));

-- Policies for insights
CREATE POLICY "Users can view own insights" ON public.insights
  USING ((EXISTS ( SELECT 1
   FROM analyses
  WHERE ((analyses.id = insights.analysis_id) AND (analyses.user_id = auth.uid())))));

-- Policies for inventory_alerts
CREATE POLICY "alerts_user_policy" ON public.inventory_alerts
  USING ((auth.uid() = user_id));

-- Policies for inventory_items
CREATE POLICY "inventory_items_user_policy" ON public.inventory_items
  USING ((auth.uid() = user_id));

-- Policies for inventory_transactions
CREATE POLICY "transactions_user_policy" ON public.inventory_transactions
  USING ((auth.uid() = user_id));

-- Policies for invoice_items
CREATE POLICY "Users can delete own invoice items" ON public.invoice_items
  USING ((EXISTS ( SELECT 1
   FROM invoices
  WHERE ((invoices.id = invoice_items.invoice_id) AND (invoices.user_id = auth.uid())))));
CREATE POLICY "Users can insert own invoice items" ON public.invoice_items
  WITH CHECK ((EXISTS ( SELECT 1
   FROM invoices
  WHERE ((invoices.id = invoice_items.invoice_id) AND (invoices.user_id = auth.uid())))));
CREATE POLICY "Users can update own invoice items" ON public.invoice_items
  USING ((EXISTS ( SELECT 1
   FROM invoices
  WHERE ((invoices.id = invoice_items.invoice_id) AND (invoices.user_id = auth.uid())))));
CREATE POLICY "Users can view own invoice items" ON public.invoice_items
  USING ((EXISTS ( SELECT 1
   FROM invoices
  WHERE ((invoices.id = invoice_items.invoice_id) AND (invoices.user_id = auth.uid())))));

-- Policies for invoice_parse_logs
CREATE POLICY "Users can insert own parse logs" ON public.invoice_parse_logs
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view own parse logs" ON public.invoice_parse_logs
  USING ((auth.uid() = user_id));

-- Policies for invoices
CREATE POLICY "Users can delete own invoices" ON public.invoices
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own invoices" ON public.invoices
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update own invoices" ON public.invoices
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own invoices" ON public.invoices
  USING ((auth.uid() = user_id));

-- Policies for menu_analyses
CREATE POLICY "Users can create own menu analyses" ON public.menu_analyses
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update own menu analyses" ON public.menu_analyses
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own menu analyses" ON public.menu_analyses
  USING ((auth.uid() = user_id));

-- Policies for menu_categories
CREATE POLICY "Users can delete own categories" ON public.menu_categories
  USING ((EXISTS ( SELECT 1
   FROM restaurant_menus
  WHERE ((restaurant_menus.id = menu_categories.menu_id) AND (restaurant_menus.user_id = auth.uid())))));
CREATE POLICY "Users can insert own categories" ON public.menu_categories
  WITH CHECK ((EXISTS ( SELECT 1
   FROM restaurant_menus
  WHERE ((restaurant_menus.id = menu_categories.menu_id) AND (restaurant_menus.user_id = auth.uid())))));
CREATE POLICY "Users can update own categories" ON public.menu_categories
  USING ((EXISTS ( SELECT 1
   FROM restaurant_menus
  WHERE ((restaurant_menus.id = menu_categories.menu_id) AND (restaurant_menus.user_id = auth.uid())))));
CREATE POLICY "Users can view own categories" ON public.menu_categories
  USING ((EXISTS ( SELECT 1
   FROM restaurant_menus
  WHERE ((restaurant_menus.id = menu_categories.menu_id) AND (restaurant_menus.user_id = auth.uid())))));

-- Policies for menu_comparison_insights
CREATE POLICY "Users can delete own insights" ON public.menu_comparison_insights
  USING ((EXISTS ( SELECT 1
   FROM competitor_menu_analyses
  WHERE ((competitor_menu_analyses.id = menu_comparison_insights.analysis_id) AND (competitor_menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can insert own insights" ON public.menu_comparison_insights
  WITH CHECK ((EXISTS ( SELECT 1
   FROM competitor_menu_analyses
  WHERE ((competitor_menu_analyses.id = menu_comparison_insights.analysis_id) AND (competitor_menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can update own insights" ON public.menu_comparison_insights
  USING ((EXISTS ( SELECT 1
   FROM competitor_menu_analyses
  WHERE ((competitor_menu_analyses.id = menu_comparison_insights.analysis_id) AND (competitor_menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can view own insights" ON public.menu_comparison_insights
  USING ((EXISTS ( SELECT 1
   FROM competitor_menu_analyses
  WHERE ((competitor_menu_analyses.id = menu_comparison_insights.analysis_id) AND (competitor_menu_analyses.user_id = auth.uid())))));

-- Policies for menu_insights
CREATE POLICY "Users can create menu insights for own analyses" ON public.menu_insights
  WITH CHECK ((EXISTS ( SELECT 1
   FROM menu_analyses
  WHERE ((menu_analyses.id = menu_insights.menu_analysis_id) AND (menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can view own menu insights" ON public.menu_insights
  USING ((EXISTS ( SELECT 1
   FROM menu_analyses
  WHERE ((menu_analyses.id = menu_insights.menu_analysis_id) AND (menu_analyses.user_id = auth.uid())))));

-- Policies for menu_item_ingredients
CREATE POLICY "Users can delete own menu ingredients" ON public.menu_item_ingredients
  USING ((EXISTS ( SELECT 1
   FROM (menu_items
     JOIN restaurant_menus ON ((restaurant_menus.id = menu_items.menu_id)))
  WHERE ((menu_items.id = menu_item_ingredients.menu_item_id) AND (restaurant_menus.user_id = auth.uid())))));
CREATE POLICY "Users can insert own menu ingredients" ON public.menu_item_ingredients
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (menu_items
     JOIN restaurant_menus ON ((restaurant_menus.id = menu_items.menu_id)))
  WHERE ((menu_items.id = menu_item_ingredients.menu_item_id) AND (restaurant_menus.user_id = auth.uid())))));
CREATE POLICY "Users can update own menu ingredients" ON public.menu_item_ingredients
  USING ((EXISTS ( SELECT 1
   FROM (menu_items
     JOIN restaurant_menus ON ((restaurant_menus.id = menu_items.menu_id)))
  WHERE ((menu_items.id = menu_item_ingredients.menu_item_id) AND (restaurant_menus.user_id = auth.uid())))));
CREATE POLICY "Users can view own menu ingredients" ON public.menu_item_ingredients
  USING ((EXISTS ( SELECT 1
   FROM (menu_items
     JOIN restaurant_menus ON ((restaurant_menus.id = menu_items.menu_id)))
  WHERE ((menu_items.id = menu_item_ingredients.menu_item_id) AND (restaurant_menus.user_id = auth.uid())))));

-- Policies for menu_item_matches
CREATE POLICY "Users can create menu item matches for own analyses" ON public.menu_item_matches
  WITH CHECK ((EXISTS ( SELECT 1
   FROM menu_analyses
  WHERE ((menu_analyses.id = menu_item_matches.menu_analysis_id) AND (menu_analyses.user_id = auth.uid())))));
CREATE POLICY "Users can view own menu item matches" ON public.menu_item_matches
  USING ((EXISTS ( SELECT 1
   FROM menu_analyses
  WHERE ((menu_analyses.id = menu_item_matches.menu_analysis_id) AND (menu_analyses.user_id = auth.uid())))));

-- Policies for menu_item_prices
CREATE POLICY "Users can delete own prices" ON public.menu_item_prices
  USING ((EXISTS ( SELECT 1
   FROM (menu_items
     JOIN restaurant_menus ON ((restaurant_menus.id = menu_items.menu_id)))
  WHERE ((menu_items.id = menu_item_prices.menu_item_id) AND (restaurant_menus.user_id = auth.uid())))));
CREATE POLICY "Users can insert own prices" ON public.menu_item_prices
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (menu_items
     JOIN restaurant_menus ON ((restaurant_menus.id = menu_items.menu_id)))
  WHERE ((menu_items.id = menu_item_prices.menu_item_id) AND (restaurant_menus.user_id = auth.uid())))));
CREATE POLICY "Users can update own prices" ON public.menu_item_prices
  USING ((EXISTS ( SELECT 1
   FROM (menu_items
     JOIN restaurant_menus ON ((restaurant_menus.id = menu_items.menu_id)))
  WHERE ((menu_items.id = menu_item_prices.menu_item_id) AND (restaurant_menus.user_id = auth.uid())))));
CREATE POLICY "Users can view own prices" ON public.menu_item_prices
  USING ((EXISTS ( SELECT 1
   FROM (menu_items
     JOIN restaurant_menus ON ((restaurant_menus.id = menu_items.menu_id)))
  WHERE ((menu_items.id = menu_item_prices.menu_item_id) AND (restaurant_menus.user_id = auth.uid())))));

-- Policies for menu_items
CREATE POLICY "Users can delete own items" ON public.menu_items
  USING ((EXISTS ( SELECT 1
   FROM restaurant_menus
  WHERE ((restaurant_menus.id = menu_items.menu_id) AND (restaurant_menus.user_id = auth.uid())))));
CREATE POLICY "Users can insert own items" ON public.menu_items
  WITH CHECK ((EXISTS ( SELECT 1
   FROM restaurant_menus
  WHERE ((restaurant_menus.id = menu_items.menu_id) AND (restaurant_menus.user_id = auth.uid())))));
CREATE POLICY "Users can update own items" ON public.menu_items
  USING ((EXISTS ( SELECT 1
   FROM restaurant_menus
  WHERE ((restaurant_menus.id = menu_items.menu_id) AND (restaurant_menus.user_id = auth.uid())))));
CREATE POLICY "Users can view own items" ON public.menu_items
  USING ((EXISTS ( SELECT 1
   FROM restaurant_menus
  WHERE ((restaurant_menus.id = menu_items.menu_id) AND (restaurant_menus.user_id = auth.uid())))));

-- Policies for price_history
CREATE POLICY "price_history_user_policy" ON public.price_history
  USING ((auth.uid() = user_id));

-- Policies for processed_events
CREATE POLICY "processed_events_user_policy" ON public.processed_events
  USING ((auth.uid() = user_id));

-- Policies for restaurant_menus
CREATE POLICY "Users can delete own menus" ON public.restaurant_menus
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own menus" ON public.restaurant_menus
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update own menus" ON public.restaurant_menus
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own menus" ON public.restaurant_menus
  USING ((auth.uid() = user_id));

-- Policies for restaurants
CREATE POLICY "Users can manage own restaurants" ON public.restaurants
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own restaurants" ON public.restaurants
  USING ((auth.uid() = user_id));

-- Policies for reviews
CREATE POLICY "Users can view reviews from their analyses" ON public.reviews
  USING (((competitor_id)::text IN ( SELECT ac.competitor_id
   FROM (analysis_competitors ac
     JOIN analyses a ON ((ac.analysis_id = a.id)))
  WHERE (a.user_id = auth.uid()))));

-- Policies for reviews_archive_metadata
CREATE POLICY "Users can view reviews archive for their competitors" ON public.reviews_archive_metadata
  USING (((competitor_id)::text IN ( SELECT ac.competitor_id
   FROM (analysis_competitors ac
     JOIN analyses a ON ((ac.analysis_id = a.id)))
  WHERE (a.user_id = auth.uid()))));

-- Policies for saved_menu_comparisons
CREATE POLICY "Users can delete own saved comparisons" ON public.saved_menu_comparisons
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own saved comparisons" ON public.saved_menu_comparisons
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update own saved comparisons" ON public.saved_menu_comparisons
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own saved comparisons" ON public.saved_menu_comparisons
  USING ((auth.uid() = user_id));

-- Policies for seen_competitors
CREATE POLICY "Users can manage their seen competitors" ON public.seen_competitors
  USING ((auth.uid() = user_id));

-- Policies for streaming_events
CREATE POLICY "Users can view own streaming events" ON public.streaming_events
  USING ((EXISTS ( SELECT 1
   FROM analyses
  WHERE ((analyses.id = streaming_events.analysis_id) AND (analyses.user_id = auth.uid())))));

-- Policies for subscription_history
CREATE POLICY "Users can view own subscription history" ON public.subscription_history
  USING ((auth.uid() = user_id));

-- Policies for subscription_metadata
CREATE POLICY "Users can view own subscription metadata" ON public.subscription_metadata
  USING ((auth.uid() = user_id));

-- Policies for user_inventory_preferences
CREATE POLICY "preferences_user_policy" ON public.user_inventory_preferences
  USING ((auth.uid() = user_id));
CREATE POLICY "user_preferences_policy" ON public.user_inventory_preferences
  USING ((auth.uid() = user_id));

-- Policies for users
CREATE POLICY "Users can insert their own record" ON public.users
  WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update own profile" ON public.users
  USING ((auth.uid() = id));
CREATE POLICY "Users can update their own record" ON public.users
  USING ((auth.uid() = id));
CREATE POLICY "Users can view own profile" ON public.users
  USING ((auth.uid() = id));
CREATE POLICY "Users can view their own record" ON public.users
  USING ((auth.uid() = id));

-- Policies for vendor_item_mappings
CREATE POLICY "vendor_mappings_user_policy" ON public.vendor_item_mappings
  USING ((auth.uid() = user_id));

-- Policies for vendors
CREATE POLICY "vendors_user_policy" ON public.vendors
  USING ((auth.uid() = user_id));
