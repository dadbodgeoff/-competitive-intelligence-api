# Landing Page Live Demo Module

A self-contained creative generation demo for the landing page with IP-based rate limiting, policy consent, and account creation prompts.

## Features

- **No Authentication Required**: Works without login for preview
- **IP Rate Limiting**: 3 generations per hour per IP address
- **Policy Consent**: Users must accept Terms & Privacy Policy
- **Preview Only**: Shows generated image but requires account for download/save
- **Account Creation CTA**: Prompts users to sign up after seeing preview
- **Separation of Concerns**: Fully modular and can be wired into any landing page

## Components

### `CreativeLiveDemo`
Main demo component with template selection, prompt input, and generation flow.

### `PolicyConsentModal`
Modal for accepting Terms of Service and Privacy Policy before generation.

### `DemoPreviewModal`
Shows generated image preview with call-to-action for account creation.

## API Endpoints

### Backend Routes (`api/routes/nano_banana_demo.py`)

- `GET /api/v1/nano-banana/demo/templates` - Get available templates (public)
- `POST /api/v1/nano-banana/demo/generate` - Start generation (IP rate limited)
- `GET /api/v1/nano-banana/demo/jobs/{session_id}/stream` - Stream progress (SSE)
- `GET /api/v1/nano-banana/demo/jobs/{session_id}` - Get job status

## Usage

### In Your Landing Page

```tsx
import { CreativeLiveDemo } from '@/features/landing-demo';

export const LandingPage = () => {
  return (
    <div>
      {/* Your other landing page content */}
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Try It Live
          </h2>
          <CreativeLiveDemo />
        </div>
      </section>
      
      {/* More content */}
    </div>
  );
};
```

## Rate Limiting

- **3 generations per hour** per IP address
- Tracked in-memory (resets on server restart)
- Returns 429 status with retry_after_seconds when limit exceeded
- Encourages account creation for unlimited access

## Policy Consent

Users must accept:
- Terms of Service (version tracked)
- Privacy Policy (version tracked)
- Consent timestamp recorded

Stored in guest session for audit trail.

## Flow

1. User selects template and enters prompt
2. Clicks "Generate" → Policy consent modal appears (first time)
3. User accepts policies
4. Generation starts with progress bar
5. Preview modal shows generated image
6. User prompted to create account for download/save
7. Clicking "Create Account" or "Sign In" navigates to respective pages

## Security

- IP-based rate limiting prevents abuse
- No authentication tokens exposed
- Guest sessions stored temporarily
- Policy consent tracked for compliance
- Preview-only mode (no download without auth)

## Customization

### Adjust Rate Limits

Edit `api/routes/nano_banana_demo.py`:

```python
DEMO_RATE_LIMIT_WINDOW = 3600  # 1 hour
DEMO_MAX_REQUESTS_PER_IP = 3   # 3 generations
```

### Change Policy Versions

Edit `frontend/src/features/landing-demo/components/PolicyConsentModal.tsx`:

```typescript
const TERMS_VERSION = '1.0';
const PRIVACY_VERSION = '1.0';
```

### Customize Templates

The demo fetches templates from the database. To show specific templates:

```python
# In api/routes/nano_banana_demo.py
result = supabase.table("creative_templates").select(
    "id, name, preview_url"
).eq("is_active", True).eq("is_featured", True).limit(8).execute()
```

## Integration Checklist

- [x] Backend routes created (`api/routes/nano_banana_demo.py`)
- [x] Routes added to main API (`api/main.py`)
- [x] Frontend components created
- [x] API client created
- [x] Types defined
- [ ] Wire into landing page
- [ ] Test IP rate limiting
- [ ] Test policy consent flow
- [ ] Test preview and account creation CTA
- [ ] Deploy and verify

## Next Steps

1. Import `CreativeLiveDemo` into your landing page
2. Test the complete flow
3. Adjust styling to match your brand
4. Monitor rate limiting effectiveness
5. Track conversion from demo to signup
