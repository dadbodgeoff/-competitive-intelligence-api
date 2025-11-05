# Design System Components

Restaurant-specific components built according to the brand specification.

## Components

### InsightCard

Displays competitive insights with confidence-based styling and expandable details.

**Props:**
- `title` - Insight title
- `description` - Insight description
- `type` - 'opportunity' | 'threat' | 'watch'
- `confidence` - 'high' | 'medium' | 'low'
- `proofQuote` - Evidence quote (optional)
- `competitorName` - Source competitor (optional)
- `mentionCount` - Number of mentions (optional)

**Usage:**
```tsx
import { InsightCard } from '@/design-system/components';

<InsightCard
  title="Strong Pizza Quality"
  description="Customers consistently praise the quality of ingredients"
  type="opportunity"
  confidence="high"
  proofQuote="Best pizza in the neighborhood!"
  competitorName="Joe's Pizza"
  mentionCount={15}
/>
```

**Features:**
- Confidence-based border colors and glows
- Type-based gradient backgrounds
- Expandable evidence section
- Animated transitions
- Click to expand/collapse

---

### CompetitorCard

Displays competitor information with rating, reviews, and distance.

**Props:**
- `name` - Restaurant name
- `rating` - Star rating (0-5)
- `reviewCount` - Number of reviews
- `distance` - Distance in miles
- `address` - Full address
- `onViewDetails` - Callback for view details button (optional)

**Usage:**
```tsx
import { CompetitorCard } from '@/design-system/components';

<CompetitorCard
  name="Joe's Pizza"
  rating={4.7}
  reviewCount={1234}
  distance={0.5}
  address="123 Main St, New York, NY"
  onViewDetails={() => console.log('View details')}
/>
```

**Features:**
- Rating-based color coding
- Distance formatting (miles/feet)
- Hover lift effect
- Optional view details button
- Responsive layout

---

### AnalysisProgress

Shows real-time analysis progress with steps and timing.

**Props:**
- `steps` - Array of progress steps
- `totalDuration` - Total duration in seconds (optional)

**Step Object:**
- `label` - Step description
- `status` - 'pending' | 'active' | 'complete'
- `duration` - Step duration in seconds (optional)

**Usage:**
```tsx
import { AnalysisProgress } from '@/design-system/components';

<AnalysisProgress
  steps={[
    { label: 'Fetching reviews...', status: 'complete', duration: 2.3 },
    { label: 'Analyzing sentiment...', status: 'active' },
    { label: 'Generating insights...', status: 'pending' },
  ]}
  totalDuration={5.7}
/>
```

**Features:**
- Real-time progress bar
- Step status indicators (checkmark, spinner, pending)
- Monospace font for technical feel
- Duration tracking
- Animated transitions

---

### TierSelector

Displays subscription tiers with features and pricing.

**Props:**
- `tiers` - Array of tier objects
- `selectedTierId` - Currently selected tier ID (optional)
- `onSelect` - Callback when tier is selected

**Tier Object:**
- `id` - Unique identifier
- `name` - Tier name
- `price` - Price in dollars
- `badge` - Badge text (e.g., "RECOMMENDED") (optional)
- `features` - Array of feature objects
- `recommended` - Whether tier is recommended (optional)

**Feature Object:**
- `label` - Feature description
- `included` - Whether feature is included

**Usage:**
```tsx
import { TierSelector } from '@/design-system/components';

<TierSelector
  tiers={[
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: [
        { label: '5 competitors', included: true },
        { label: '10 insights', included: true },
        { label: 'Basic analysis', included: true },
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 49,
      badge: 'RECOMMENDED',
      recommended: true,
      features: [
        { label: '20 competitors', included: true },
        { label: 'Unlimited insights', included: true },
        { label: 'Advanced analysis', included: true },
      ],
    },
  ]}
  selectedTierId="premium"
  onSelect={(id) => console.log('Selected:', id)}
/>
```

**Features:**
- Responsive grid layout
- Selected state with checkmark
- Recommended badge
- Hover effects
- Feature inclusion indicators
- Gradient accents

---

### SentimentIndicator

Displays sentiment with icon and optional count.

**Props:**
- `sentiment` - 'positive' | 'neutral' | 'negative'
- `label` - Custom label (optional)
- `count` - Number of items with this sentiment (optional)
- `size` - 'sm' | 'md' | 'lg' (default: 'md')

**Usage:**
```tsx
import { SentimentIndicator } from '@/design-system/components';

<SentimentIndicator sentiment="positive" count={42} />
<SentimentIndicator sentiment="neutral" size="sm" />
<SentimentIndicator sentiment="negative" label="Poor Service" />
```

**Features:**
- Color-coded by sentiment
- Icon indicators (thumbs up/down, minus)
- Optional count display
- Three size variants
- Rounded pill design

---

### FilterPanel

Displays filterable options organized by sections.

**Props:**
- `sections` - Array of filter sections
- `onOptionToggle` - Callback when option is toggled
- `onClearAll` - Callback for clear all button (optional)
- `onApply` - Callback for apply button (optional)

**Section Object:**
- `id` - Section identifier
- `label` - Section label
- `options` - Array of filter options

**Option Object:**
- `id` - Option identifier
- `label` - Option label
- `count` - Number of items (optional)
- `checked` - Whether option is checked

**Usage:**
```tsx
import { FilterPanel } from '@/design-system/components';

<FilterPanel
  sections={[
    {
      id: 'type',
      label: 'Insight Type',
      options: [
        { id: 'opportunity', label: 'Opportunities', count: 12, checked: true },
        { id: 'threat', label: 'Threats', count: 5, checked: false },
        { id: 'watch', label: 'Watch', count: 8, checked: false },
      ],
    },
    {
      id: 'confidence',
      label: 'Confidence',
      options: [
        { id: 'high', label: 'High', count: 15, checked: false },
        { id: 'medium', label: 'Medium', count: 7, checked: false },
        { id: 'low', label: 'Low', count: 3, checked: false },
      ],
    },
  ]}
  onOptionToggle={(sectionId, optionId) => console.log('Toggle:', sectionId, optionId)}
  onClearAll={() => console.log('Clear all')}
  onApply={() => console.log('Apply filters')}
/>
```

**Features:**
- Multiple filter sections
- Checkbox selection
- Item counts
- Active filter badge
- Clear all and apply actions
- Hover effects

---

### ComparisonWidget

Displays side-by-side comparison of two restaurants.

**Props:**
- `restaurants` - Tuple of two restaurant objects

**Restaurant Object:**
- `name` - Restaurant name
- `avatar` - Avatar text/emoji (optional)
- `metrics` - Array of metric objects

**Metric Object:**
- `label` - Metric name
- `value` - Metric value
- `trend` - 'up' | 'down' (optional)
- `trendValue` - Trend percentage/value (optional)

**Usage:**
```tsx
import { ComparisonWidget } from '@/design-system/components';

<ComparisonWidget
  restaurants={[
    {
      name: "Your Restaurant",
      avatar: "🍕",
      metrics: [
        { label: "Rating", value: "4.5", trend: "up", trendValue: "+0.2" },
        { label: "Reviews", value: "1,234", trend: "up", trendValue: "+15%" },
        { label: "Avg Price", value: "$25", trend: "down", trendValue: "-5%" },
      ],
    },
    {
      name: "Competitor",
      avatar: "🍝",
      metrics: [
        { label: "Rating", value: "4.3", trend: "down", trendValue: "-0.1" },
        { label: "Reviews", value: "987", trend: "up", trendValue: "+8%" },
        { label: "Avg Price", value: "$30", trend: "up", trendValue: "+10%" },
      ],
    },
  ]}
/>
```

**Features:**
- Side-by-side layout
- Avatar display
- Trend indicators with icons
- Color-coded trends (green up, red down)
- Responsive grid

---

## Styling

All components use:
- Dark mode colors from design tokens
- Emerald/Cyan accent colors
- Consistent spacing and typography
- Smooth transitions and animations
- Hover effects and interactions
- Accessible focus states

## Customization

All components accept a `className` prop for additional styling:

```tsx
<InsightCard
  {...props}
  className="shadow-2xl border-2"
/>
```

Use the `cn` utility to merge classes properly:

```tsx
import { cn } from '@/design-system';

<InsightCard
  {...props}
  className={cn('custom-class', isActive && 'active-class')}
/>
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:
- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Color contrast ratios
- Semantic HTML

## TypeScript

All components are fully typed with exported interfaces:

```tsx
import type { InsightCardProps, TierSelectorProps } from '@/design-system/components';
```
