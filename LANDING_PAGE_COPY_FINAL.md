# Landing Page Copy - Option 3 (Pain Points)

## Pre-Hero Section (Pain Teaser)

### Option 1: Rotating Text Carousel (Animated)
**[Rotating through these, 2 seconds each]**

"25 minutes per invoice..."  
"3 hours updating spreadsheets..."  
"Finding out prices changed 3 months too late..."  
"Competitor changed their menu and customers noticed first..."  
"Where did I save that file again?..."

---

### Option 2: Quick Stats Grid (3 boxes side-by-side)

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   25 MINUTES        │  │   3 MONTHS          │  │   4 HOURS           │
│   Per invoice       │  │   To notice price   │  │   Stalking          │
│   typing by hand    │  │   increases         │  │   competitors       │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

### Option 3: Scrolling Ticker (Like stock ticker)

**[Scrolling left to right across top of page]**

"Invoice entry: 25 min • Menu costing: 3 hours • Competitor research: 4 hours • Price tracking: manual • Reports: where's that file? • Vendor raised prices: found out too late •"

---

### Option 4: Problem Badges (Floating above hero)

```
[📄 25 min/invoice]  [📊 3 hrs on spreadsheets]  [🔍 4 hrs competitor research]
        [⏰ Too late on price changes]  [❓ Where's that file?]
```

---

## Hero Section

### Main Headline
# We Know You're Tired of This Sh*t

### Sub-headline
What if I told you I could save you at minimum an hour a week?

(Drinks are on me if that's all you save.)

### CTA Button
**Start Free - No Credit Card**

---

## The Problem Section (Above the Fold)

### The Daily Grind We All Endure:

**❌ Invoice arrives**  
→ 25 minutes of data entry hell  
→ Typos, wrong units, missing items  
→ Do it again next week

**❌ Vendor raises prices**  
→ We find out 3 months later  
→ When we're already bleeding margin  
→ Too late to adjust menu prices

**❌ Competitor changes their menu**  
→ We hear about it from customers  
→ "Why don't you have what they have?"  
→ Scramble to research for 4 hours

**❌ Need to update menu costs**  
→ Open that cursed spreadsheet  
→ 3 hours of manual calculations  
→ Still not sure if the numbers are right

**❌ Want to see the actual numbers**  
→ Where did we save that file?  
→ Is this data even current?  
→ Build another report from scratch

---

## The Solution Section

### The RestaurantIQ Way:

**✅ Invoice arrives**  
→ Snap photo with your phone  
→ AI reads it in 60 seconds  
→ Done. Next.

**✅ Vendor raises prices**  
→ Alert hits your phone instantly  
→ See exactly what changed  
→ Adjust before it hurts

**✅ Competitor changes menu**  
→ You know in 2.5 minutes  
→ See their prices, items, gaps  
→ Make informed decisions

**✅ Need to update menu costs**  
→ Already done automatically  
→ Real-time COGS on every item  
→ Always accurate

**✅ Want to see your numbers**  
→ One dashboard, always current  
→ Trends, alerts, insights  
→ Make decisions, not spreadsheets

---

## The Numbers Section

### Here's What We Get Back:

| Stop Wasting Time On | Get This Back | Do This Instead |
|---------------------|---------------|-----------------|
| Typing invoices by hand | **6 hours/week** | Train your team |
| Updating menu costs | **3 hours/week** | Perfect new recipes |
| Stalking competitors | **4 hours/week** | Talk to customers |
| Tracking price changes | **2 hours/week** | Run your business |
| Building reports | **2 hours/week** | Go home on time |

### **Total: 17 hours back every week**
That's 884 hours per year. Over a full month of your life.

---

## Features Section (Keep It Real)

### What Actually Works:

**📸 Invoice Processing That Doesn't Suck**
- Snap photo, AI does the rest
- 60 seconds vs 25 minutes
- Handles weird formats, bad scans, all of it
- Catches duplicates automatically

**💰 Menu Costing That Updates Itself**
- Link recipes to ingredients once
- Costs update as prices change
- See real COGS on every item
- No more spreadsheet hell

**🎯 Competitor Intel in 2 Minutes**
- AI finds and analyzes competitors
- See their menu, prices, reviews
- Spot gaps and opportunities
- Know what customers are comparing you to

**🚨 Price Alerts That Actually Help**
- Get notified when prices spike
- See trends before they hurt
- Track your most-ordered items
- Make decisions with data, not guesses

**📊 One Dashboard for Everything**
- All your numbers, one place
- Real-time, always current
- No more hunting for files
- Actually useful insights

---

## Social Proof Section

**SKIP THIS - No customers yet**

When you get customers, add testimonials here.

---

## Pricing Section

### Start Free. Upgrade When You're Ready.

**Free Tier**
- 5 invoices/month
- 1 menu upload
- Basic competitor analysis
- All core features
- No credit card required

**Premium - $49/month**
- Unlimited invoices
- Unlimited menus
- Advanced competitor intel
- Priority support
- Cancel anytime

**Try it free. See if it works. Upgrade if you want.**

---

## FAQ Section (Collapsible Accordion - shadcn)

### Use shadcn Accordion Component

**Component:** `import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"`

**Implementation:**
```tsx
<Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is this actually free?</AccordionTrigger>
    <AccordionContent>
      Yes. Free tier is real. No credit card, no tricks. If you need more, upgrade.
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-2">
    <AccordionTrigger>How accurate is the invoice scanning?</AccordionTrigger>
    <AccordionContent>
      Really good. Not perfect. You review before saving. Takes 60 seconds instead of 25 minutes.
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-3">
    <AccordionTrigger>Will this work with my vendors?</AccordionTrigger>
    <AccordionContent>
      Probably. We handle Sysco, US Foods, local distributors, weird formats. If it's a PDF or photo, we can read it.
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-4">
    <AccordionTrigger>Do I have to change how I work?</AccordionTrigger>
    <AccordionContent>
      Nope. Upload invoices, link recipes, done. It works around you.
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-5">
    <AccordionTrigger>What if I hate it?</AccordionTrigger>
    <AccordionContent>
      Delete your account. No hard feelings. We're not for everyone.
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-6">
    <AccordionTrigger>How long to set up?</AccordionTrigger>
    <AccordionContent>
      10 minutes to upload your first invoice. 30 minutes to link your menu recipes. Then it just works.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

**Styling Notes:**
- Accordion collapses by default (doesn't add page length)
- Only one item open at a time (`type="single"`)
- Use glass card styling to match your design: `bg-white/5 backdrop-blur-md border border-white/10`
- Questions stay visible, answers hidden until clicked

---

## Final CTA Section

### Stop Managing Spreadsheets. Start Managing Your Restaurant.

**17 hours back every week.**  
Spend it on what actually matters.

**[Start Free - No Credit Card Required]**

Free tier. No tricks. Cancel anytime.

---

## Footer Trust Signals

✓ Bank-level security  
✓ Your data stays yours  
✓ Cancel anytime  
✓ Real support from real people  
✓ Built by restaurant people, for restaurant people

---

## Alternative Headlines (A/B Test These)

1. "We Know You're Tired of This Sh*t" (Main)
2. "Stop Managing Spreadsheets. Start Managing Your Restaurant."
3. "17 Hours Back Every Week. Here's How."
4. "Restaurant Management That Doesn't Suck"
5. "Your Vendors Are Overcharging You. Here's Proof."

---

## Copy Notes:

**Tone:** Direct, honest, slightly irreverent  
**Voice:** Like a friend who gets it  
**Pain points:** Lead with frustration, solve with relief  
**Proof:** Real numbers, real benefits  
**Trust:** No BS, no tricks, no pressure

**Key Principle:** Don't sell features. Sell freedom from the grind.

---

## DEMO SECTION (Already Exists in Your Build)

### Current Interactive Demo
You already have a great animated invoice upload demo that shows:
- "Reading PDF..."
- "Extracted 47 items"
- "Auto-corrected 3 math errors"
- "Matched to your inventory"
- "Ready to review - saved 25 min of typing"

**Keep this!** It's perfect proof of the 60-second claim.

### Where to Add New Copy Elements

1. **Pre-Hero Pain Teaser** → Add ABOVE the hero headline (before "Stop Overpaying")
2. **"We Know You're Tired" Headline** → Replace current "Stop Overpaying" or add as alternative
3. **Time Savings Table** → Already exists in your "Proof" section (keep it!)
4. **Features Section** → Already exists with expandable cards (keep it!)
5. **Social Proof** → Add testimonials section after features
6. **FAQ** → Add before final CTA

---

## RECOMMENDED PRE-HERO APPROACH:

**Best Option: Animated Rotating Text (Option 1)**

Why it works:
- Builds tension as they read
- Each line is a "oh yeah, I do that" moment
- By the time they hit the headline, they're already bought in
- Clean, not cluttered
- Works on mobile

**Implementation:**
- Large, bold text (48px+)
- Fades in/out smoothly
- Gray text that gets darker with each rotation
- Final rotation holds for 3 seconds before headline appears
- Or just show all 5 stacked if animation is too complex

**Alternative if you want static: Option 2 (Stats Grid)**
- Shows scale of the problem immediately
- Numbers are shocking
- Clean, scannable
- Leads perfectly into "We Know You're Tired of This Sh*t"
