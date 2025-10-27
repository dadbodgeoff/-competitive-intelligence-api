# API Routes Documentation

## Analysis API Structure

### Primary Analysis Routes (`/api/v1/analysis`)
**File:** `api/routes/tier_analysis.py`
**Purpose:** Modern tier-based analysis system supporting both free and premium tiers

**Endpoints:**
- `POST /api/v1/analysis/run` - Create new analysis (supports tier parameter)
- `GET /api/v1/analysis/{analysis_id}` - Get analysis results
- `GET /api/v1/analysis/{analysis_id}/status` - Get analysis status
- `GET /api/v1/analysis/tiers/comparison` - Get tier comparison info
- `POST /api/v1/analysis/tiers/estimate-cost` - Estimate analysis cost

**Features:**
- ✅ Free tier support (3 competitors, basic insights)
- ✅ Premium tier support (5+ competitors, advanced insights)
- ✅ Enhanced prompts and analysis
- ✅ Proper tier field handling
- ✅ Cost estimation
- ✅ Service orchestration

### Legacy Analysis Routes (`/api/v1/legacy/analysis`)
**File:** `api/routes/analysis.py`
**Purpose:** Original analysis system (deprecated, kept for backward compatibility)

**Endpoints:**
- `POST /api/v1/legacy/analysis/run` - Create analysis (legacy)
- `GET /api/v1/legacy/analysis/{analysis_id}` - Get analysis results (legacy)
- `GET /api/v1/legacy/analysis/{analysis_id}/status` - Get analysis status (legacy)

**Status:** 
- ⚠️ **DEPRECATED** - Use primary analysis routes instead
- 🔧 **MAINTENANCE MODE** - Only critical bug fixes
- 📅 **REMOVAL PLANNED** - Will be removed in future version

## Migration Guide

### For Frontend Applications:
- **Current:** Use `/api/v1/analysis/*` endpoints (tier-based system)
- **Legacy:** Avoid `/api/v1/legacy/analysis/*` unless absolutely necessary

### For New Development:
- Always use the primary analysis routes (`/api/v1/analysis`)
- Include `tier` parameter in analysis requests
- Handle tier-specific responses and features

### For Existing Integrations:
- Legacy routes will continue to work at `/api/v1/legacy/analysis`
- Plan migration to primary routes for enhanced features
- Test thoroughly when migrating

## Key Differences

| Feature | Primary Routes | Legacy Routes |
|---------|---------------|---------------|
| Tier Support | ✅ Free & Premium | ❌ Single tier only |
| Enhanced Prompts | ✅ Yes | ❌ Basic prompts |
| Cost Estimation | ✅ Yes | ❌ No |
| Service Orchestration | ✅ Yes | ❌ Basic service |
| Tier Field in Response | ✅ Yes | ✅ Fixed (added) |
| Future Development | ✅ Active | ❌ Deprecated |

## Testing

The E2E tests use the primary analysis routes (`/api/v1/analysis`) and validate:
- ✅ Free tier analysis creation
- ✅ Status polling
- ✅ Results retrieval with tier information
- ✅ Frontend route accessibility

## Troubleshooting

### Common Issues:
1. **Missing tier field error** - Fixed in both route files
2. **Route conflicts** - Resolved by separating prefixes
3. **Duplicate functionality** - Use primary routes for new development

### Debug Tips:
- Check which route file is handling your request
- Verify the correct prefix is being used
- Ensure tier field is included in responses