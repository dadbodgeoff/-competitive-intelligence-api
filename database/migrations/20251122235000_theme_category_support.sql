-- ============================================================================
-- Migration: Add category metadata to creative themes
-- Created: 2025-11-22
-- ============================================================================

ALTER TABLE creative_prompt_themes
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'campaigns';

-- Social proof themes
UPDATE creative_prompt_themes
SET category = 'social-proof'
WHERE theme_slug IN (
    'kitchen_ticket_spike',
    'guest_check_leather',
    'neon_brick_quote',
    'tip_jar_sticky',
    'letter_board_announcement',
    'reserved_table_tent',
    'stapled_receipt',
    'soggy_coaster',
    'crayon_tablecloth',
    'sidewalk_chalk_masterpiece',
    'bakery_string_tag',
    'bathroom_mirror_selfie'
);

-- Hiring themes
UPDATE creative_prompt_themes
SET category = 'hiring'
WHERE theme_slug IN (
    'selvedge_apron_crew',
    'kitchen_pass_heatlamp',
    'empty_tap_handle',
    'espresso_grounds_spill',
    'knife_roll_invitation',
    'eighty_six_board'
);

-- Events & promotions themes
UPDATE creative_prompt_themes
SET category = 'events'
WHERE theme_slug IN (
    'gaffer_tape_setlist',
    'pigskin_showdown',
    'graphite_trivia_sheet',
    'spotlight_comedy_brick',
    'balloon_kids_free',
    'hot_sauce_challenge'
);

ALTER TABLE creative_prompt_themes
    ALTER COLUMN category SET NOT NULL;

-- ============================================================================
-- End of Migration
-- ============================================================================

