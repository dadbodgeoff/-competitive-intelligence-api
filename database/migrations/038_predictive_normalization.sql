-- ============================================================================
-- MIGRATION 038: Predictive Ordering Normalization Layer
-- ----------------------------------------------------------------------------
-- Adds canonical ingredient tables, price history, invoice item logging,
-- and upgrades existing predictive ordering tables to reference the canonical
-- identifiers instead of free-form text slugs.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Canonical ingredients
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS normalized_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    canonical_name TEXT NOT NULL,
    plural_name TEXT,
    category TEXT,
    subcategory TEXT,
    default_unit TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, canonical_name)
);

ALTER TABLE normalized_ingredients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage normalized ingredients" ON normalized_ingredients;
CREATE POLICY "Users manage normalized ingredients" ON normalized_ingredients
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages normalized ingredients" ON normalized_ingredients;
CREATE POLICY "Service role manages normalized ingredients" ON normalized_ingredients
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS ingredient_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    normalized_ingredient_id UUID NOT NULL REFERENCES normalized_ingredients(id) ON DELETE CASCADE,
    invoice_item_id UUID UNIQUE REFERENCES invoice_items(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    source_pack TEXT,
    vendor_name TEXT,
    confidence NUMERIC(5,4),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingredient_mappings_user_normalized
    ON ingredient_mappings(user_id, normalized_ingredient_id);

ALTER TABLE ingredient_mappings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage ingredient mappings" ON ingredient_mappings;
CREATE POLICY "Users manage ingredient mappings" ON ingredient_mappings
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages ingredient mappings" ON ingredient_mappings;
CREATE POLICY "Service role manages ingredient mappings" ON ingredient_mappings
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- Price history derived from invoice items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingredient_price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    normalized_ingredient_id UUID NOT NULL REFERENCES normalized_ingredients(id) ON DELETE CASCADE,
    invoice_item_id UUID NOT NULL UNIQUE REFERENCES invoice_items(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    invoice_date DATE NOT NULL,
    base_quantity NUMERIC(18,6),
    base_unit TEXT,
    unit_price NUMERIC(18,6),
    extended_price NUMERIC(18,6),
    pack_description TEXT,
    vendor_name TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_user_normalized
    ON ingredient_price_history(user_id, normalized_ingredient_id, invoice_date);

ALTER TABLE ingredient_price_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read ingredient price history" ON ingredient_price_history;
CREATE POLICY "Users read ingredient price history" ON ingredient_price_history
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages ingredient price history" ON ingredient_price_history;
CREATE POLICY "Service role manages ingredient price history" ON ingredient_price_history
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- Immutable invoice item audit log
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice_item_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_item_id UUID NOT NULL REFERENCES invoice_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_item_logs_item
    ON invoice_item_logs(invoice_item_id, created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_item_logs_user_time
    ON invoice_item_logs(user_id, created_at DESC);

ALTER TABLE invoice_item_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view invoice item logs" ON invoice_item_logs;
CREATE POLICY "Users can view invoice item logs" ON invoice_item_logs
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can insert invoice item logs" ON invoice_item_logs;
CREATE POLICY "Service role can insert invoice item logs" ON invoice_item_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage invoice item logs" ON invoice_item_logs;
CREATE POLICY "Service role can manage invoice item logs" ON invoice_item_logs
    USING (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- Upgrade predictive ordering tables to reference normalized ingredients
-- ----------------------------------------------------------------------------
ALTER TABLE inventory_item_facts
    ADD COLUMN IF NOT EXISTS normalized_ingredient_id UUID;

ALTER TABLE inventory_item_features
    ADD COLUMN IF NOT EXISTS normalized_ingredient_id UUID;

ALTER TABLE inventory_item_forecasts
    ADD COLUMN IF NOT EXISTS normalized_ingredient_id UUID;

ALTER TABLE inventory_forecast_accuracy
    ADD COLUMN IF NOT EXISTS normalized_ingredient_id UUID;

-- ----------------------------------------------------------------------------
-- Seed canonical ingredients from existing normalization slugs
-- ----------------------------------------------------------------------------
WITH distinct_items AS (
    SELECT DISTINCT f.user_id, f.normalized_item_id
    FROM inventory_item_facts f
    WHERE f.normalized_item_id IS NOT NULL
),
inserted AS (
    INSERT INTO normalized_ingredients (id, user_id, canonical_name)
    SELECT uuid_generate_v4(), d.user_id, d.normalized_item_id
    FROM distinct_items d
    ON CONFLICT (user_id, canonical_name) DO NOTHING
    RETURNING id, user_id, canonical_name
)
SELECT 1;

-- Ensure every slug has a canonical row (handles users without facts yet)
WITH missing AS (
    SELECT DISTINCT f.user_id, f.normalized_item_id
    FROM inventory_item_facts f
    LEFT JOIN normalized_ingredients ni
        ON ni.user_id = f.user_id AND ni.canonical_name = f.normalized_item_id
    WHERE f.normalized_item_id IS NOT NULL AND ni.id IS NULL
),
created_missing AS (
    INSERT INTO normalized_ingredients (id, user_id, canonical_name)
    SELECT uuid_generate_v4(), m.user_id, m.normalized_item_id
    FROM missing m
    ON CONFLICT (user_id, canonical_name) DO NOTHING
    RETURNING 1
)
SELECT 1;

-- ----------------------------------------------------------------------------
-- Backfill normalized_ingredient_id columns
-- ----------------------------------------------------------------------------
UPDATE inventory_item_facts f
SET normalized_ingredient_id = ni.id
FROM normalized_ingredients ni
WHERE ni.user_id = f.user_id AND ni.canonical_name = f.normalized_item_id
  AND f.normalized_ingredient_id IS NULL;

UPDATE inventory_item_features f
SET normalized_ingredient_id = ni.id
FROM normalized_ingredients ni
WHERE ni.user_id = f.user_id AND ni.canonical_name = f.normalized_item_id
  AND f.normalized_ingredient_id IS NULL;

UPDATE inventory_item_forecasts fo
SET normalized_ingredient_id = ni.id
FROM normalized_ingredients ni
WHERE ni.user_id = fo.user_id AND ni.canonical_name = fo.normalized_item_id
  AND fo.normalized_ingredient_id IS NULL;

UPDATE inventory_forecast_accuracy fa
SET normalized_ingredient_id = ni.id
FROM normalized_ingredients ni
WHERE ni.user_id = fa.user_id AND ni.canonical_name = fa.normalized_item_id
  AND fa.normalized_ingredient_id IS NULL;

-- Enforce NOT NULL after backfill
ALTER TABLE inventory_item_facts
    ALTER COLUMN normalized_ingredient_id SET NOT NULL;

ALTER TABLE inventory_item_features
    ALTER COLUMN normalized_ingredient_id SET NOT NULL;

ALTER TABLE inventory_item_forecasts
    ALTER COLUMN normalized_ingredient_id SET NOT NULL;

ALTER TABLE inventory_forecast_accuracy
    ALTER COLUMN normalized_ingredient_id SET NOT NULL;

ALTER TABLE inventory_item_facts
    ADD CONSTRAINT inventory_item_facts_normalized_ingredient_fk
        FOREIGN KEY (normalized_ingredient_id) REFERENCES normalized_ingredients(id) ON DELETE CASCADE;

ALTER TABLE inventory_item_features
    ADD CONSTRAINT inventory_item_features_normalized_ingredient_fk
        FOREIGN KEY (normalized_ingredient_id) REFERENCES normalized_ingredients(id) ON DELETE CASCADE;

ALTER TABLE inventory_item_forecasts
    ADD CONSTRAINT inventory_item_forecasts_normalized_ingredient_fk
        FOREIGN KEY (normalized_ingredient_id) REFERENCES normalized_ingredients(id) ON DELETE CASCADE;

ALTER TABLE inventory_forecast_accuracy
    ADD CONSTRAINT inventory_forecast_accuracy_normalized_ingredient_fk
        FOREIGN KEY (normalized_ingredient_id) REFERENCES normalized_ingredients(id) ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- Replace indexes with UUID-based columns
-- ----------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_item_facts_user_item;
CREATE INDEX idx_item_facts_user_normalized
    ON inventory_item_facts(user_id, normalized_ingredient_id, delivery_date);

DROP INDEX IF EXISTS idx_item_features_user_item;
CREATE INDEX idx_item_features_user_normalized
    ON inventory_item_features(user_id, normalized_ingredient_id, feature_date);

DROP INDEX IF EXISTS idx_item_forecasts_user_item;
CREATE INDEX idx_item_forecasts_user_normalized
    ON inventory_item_forecasts(user_id, normalized_ingredient_id, forecast_date);

DROP INDEX IF EXISTS idx_forecast_accuracy_user_item;
CREATE INDEX idx_forecast_accuracy_user_normalized
    ON inventory_forecast_accuracy(user_id, normalized_ingredient_id, week_start);

-- ----------------------------------------------------------------------------
-- Populate mapping & price history from existing data
-- ----------------------------------------------------------------------------
INSERT INTO ingredient_mappings (
    id,
    user_id,
    normalized_ingredient_id,
    invoice_item_id,
    source_name,
    source_pack,
    vendor_name,
    confidence,
    metadata
)
SELECT
    uuid_generate_v4(),
    facts.user_id,
    facts.normalized_ingredient_id,
    facts.invoice_item_id,
    ii.description,
    ii.pack_size,
    inv.vendor_name,
    NULL,
    jsonb_build_object(
        'source_invoice_number', facts.source_invoice_number,
        'original_normalized_slug', facts.normalized_item_id
    )
FROM inventory_item_facts facts
JOIN invoice_items ii ON ii.id = facts.invoice_item_id
JOIN invoices inv ON inv.id = ii.invoice_id
LEFT JOIN ingredient_mappings existing ON existing.invoice_item_id = facts.invoice_item_id
WHERE existing.invoice_item_id IS NULL;

INSERT INTO ingredient_price_history (
    id,
    user_id,
    normalized_ingredient_id,
    invoice_item_id,
    invoice_id,
    invoice_date,
    base_quantity,
    base_unit,
    unit_price,
    extended_price,
    pack_description,
    vendor_name,
    metadata
)
SELECT
    uuid_generate_v4(),
    facts.user_id,
    facts.normalized_ingredient_id,
    facts.invoice_item_id,
    ii.invoice_id,
    inv.invoice_date,
    facts.base_quantity,
    facts.base_unit,
    ii.unit_price,
    ii.extended_price,
    facts.pack_description,
    inv.vendor_name,
    jsonb_build_object(
        'source_invoice_number', facts.source_invoice_number,
        'original_normalized_slug', facts.normalized_item_id
    )
FROM inventory_item_facts facts
JOIN invoice_items ii ON ii.id = facts.invoice_item_id
JOIN invoices inv ON inv.id = ii.invoice_id
LEFT JOIN ingredient_price_history iph ON iph.invoice_item_id = facts.invoice_item_id
WHERE iph.invoice_item_id IS NULL;

-- ----------------------------------------------------------------------------
-- Updated_at triggers for new tables
-- ----------------------------------------------------------------------------
CREATE TRIGGER update_normalized_ingredients_updated_at
    BEFORE UPDATE ON normalized_ingredients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredient_mappings_updated_at
    BEFORE UPDATE ON ingredient_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredient_price_history_updated_at
    BEFORE UPDATE ON ingredient_price_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Verification block
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    PERFORM 1 FROM normalized_ingredients LIMIT 1;
    PERFORM 1 FROM ingredient_mappings LIMIT 1;
    PERFORM 1 FROM ingredient_price_history LIMIT 1;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'inventory_item_facts'
                     AND column_name = 'normalized_ingredient_id') THEN
        RAISE EXCEPTION 'normalized_ingredient_id missing on inventory_item_facts';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'inventory_item_features'
                     AND column_name = 'normalized_ingredient_id') THEN
        RAISE EXCEPTION 'normalized_ingredient_id missing on inventory_item_features';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'inventory_item_forecasts'
                     AND column_name = 'normalized_ingredient_id') THEN
        RAISE EXCEPTION 'normalized_ingredient_id missing on inventory_item_forecasts';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'inventory_forecast_accuracy'
                     AND column_name = 'normalized_ingredient_id') THEN
        RAISE EXCEPTION 'normalized_ingredient_id missing on inventory_forecast_accuracy';
    END IF;
END $$;

-- ============================================================================
-- END MIGRATION 038
-- ============================================================================

