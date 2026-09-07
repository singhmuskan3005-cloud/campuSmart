---
name: CampusMart AI
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f1'
  surface-container: '#efedeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2e0'
  on-surface: '#1b1c1b'
  on-surface-variant: '#434843'
  inverse-surface: '#30302f'
  inverse-on-surface: '#f2f0ee'
  outline: '#747873'
  outline-variant: '#c3c8c1'
  surface-tint: '#536255'
  primary: '#536255'
  on-primary: '#ffffff'
  primary-container: '#a7b8a8'
  on-primary-container: '#3a493d'
  inverse-primary: '#bacbbb'
  secondary: '#715a4b'
  on-secondary: '#ffffff'
  secondary-container: '#fcdcc9'
  on-secondary-container: '#776051'
  tertiary: '#53606e'
  on-tertiary: '#ffffff'
  tertiary-container: '#a8b5c6'
  on-tertiary-container: '#3a4755'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e7d6'
  primary-fixed-dim: '#bacbbb'
  on-primary-fixed: '#101f14'
  on-primary-fixed-variant: '#3b4a3e'
  secondary-fixed: '#fcdcc9'
  secondary-fixed-dim: '#dfc1ae'
  on-secondary-fixed: '#28180c'
  on-secondary-fixed-variant: '#574235'
  tertiary-fixed: '#d7e4f5'
  tertiary-fixed-dim: '#bbc8d9'
  on-tertiary-fixed: '#101d29'
  on-tertiary-fixed-variant: '#3b4856'
  background: '#fbf9f6'
  on-background: '#1b1c1b'
  surface-variant: '#e4e2e0'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  button-text:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  xxl: 80px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is built on an **Editorial Minimalism** aesthetic tailored for a sophisticated student demographic. It moves away from the typical high-energy, high-saturation "marketplace" tropes in favor of a calm, curated, and trustworthy environment. 

The personality is intellectual yet approachable, utilizing a "Modern Museum" approach to digital commerce. It evokes the feeling of a high-end campus boutique rather than a chaotic digital bazaar. By blending soft pastel tones with sharp, expressive serif typography, the interface prioritizes clarity and aesthetic pleasure, fostering a sense of community and premium quality.

Key stylistic pillars include:
- **Spaciousness:** Generous negative space to reduce cognitive load.
- **Subtlety:** Soft color transitions and low-impact shadows.
- **Editorial Polish:** High-contrast typography pairings that feel like a contemporary magazine.

## Colors

The palette is anchored by a warm ivory background, providing a softer, more organic feel than pure white. 

- **Primary (Sage):** Used for primary actions, success states, and subtle branding elements.
- **Secondary (Dusty Peach):** Used for highlighting special offers or student-curated collections.
- **Tertiary (Powder Blue):** Reserved for informational cues and technical "AI" features.
- **Text (Warm Charcoal):** Ensures high legibility while maintaining the soft editorial feel by avoiding the harshness of true black.
- **Accents:** Blush and Lavender are utilized for category tagging (e.g., Books, Electronics) to create a soft visual taxonomy.

Colors should be applied with low saturation. Backgrounds of containers should often use a 50% opacity of the pastel tones against the ivory base to create "washes" of color.

## Typography

This design system uses a high-contrast typographic pairing to establish its editorial character. 

- **Playfair Display** is used for all headlines and "hero" moments. It should be typeset with tight letter spacing in large formats to emphasize its elegant serifs.
- **Inter** provides a clean, functional counterpoint for body copy and UI elements. Its neutrality ensures that the marketplace remains easy to navigate and highly legible at small sizes.
- **Label Caps** should be used for pre-headers or category labels above main headings to create a clear hierarchy.

Avoid bold weights for body copy; use Medium (500) or Semi-Bold (600) sparingly for emphasis to maintain the light, airy aesthetic.

## Layout & Spacing

The layout follows a **Fluid Editorial Grid**. While the content is contained within a 12-column structure on desktop, the distribution of elements should feel asymmetrical and curated.

- **Grid:** 12-column (desktop), 8-column (tablet), 4-column (mobile).
- **Rhythm:** Use `xxl` spacing (80px+) between major sections to allow the design to "breathe."
- **Alignment:** Mix center-aligned typography for hero sections with left-aligned grids for product listings.
- **Safe Areas:** Maintain generous margins (40px) on desktop to prevent the UI from feeling cramped against the browser edges.

## Elevation & Depth

To maintain the "soft" feel, this design system avoids heavy drop shadows and high-contrast stacking.

- **Tonal Layers:** Elevation is primarily communicated through subtle shifts in background color (e.g., an Ivory card on a slightly darker #F5F2EB page background).
- **Soft Shadows:** When necessary for functional depth (like a floating action button or active card), use an "Ambient Glow": 0px 4px 20px rgba(51, 51, 51, 0.05).
- **Hairline Borders:** Use thin, 1px borders in `neutral_border` (#E5E1D8) to define sections without adding visual weight.
- **Glassmorphism:** Use for navigation bars and modal overlays. A `backdrop-filter: blur(10px)` combined with a 70% opaque `background_base` creates a sophisticated, modern tech layer.

## Shapes

The shape language is "Soft Professional." We avoid the "bubbly" look of hyper-rounded corners to maintain an editorial feel.

- **Standard Corners:** 4px (Soft) for buttons, input fields, and small UI components.
- **Cards:** Use `rounded-lg` (8px) for product cards and containers to provide a gentle but structured frame.
- **Images:** Use `rounded-lg` for all product photography to soften the overall grid.
- **Buttons:** Rectangular with a 4px radius, emphasizing the "modern/tech" side of the brand rather than a "pill" shape which can feel too casual.

## Components

### Buttons
- **Primary:** Solid `primary_color` (Sage) with `neutral_text`. No shadows, 4px corner radius.
- **Secondary:** Transparent background with a 1px `neutral_border`.
- **Text Link:** Underlined Inter Semi-bold, using a 2px offset to maintain the editorial look.

### Cards
- Background: Pure white (#FFFFFF) or a very light tint of the category color.
- Border: 1px `neutral_border`.
- Padding: `lg` (24px) to ensure content doesn't touch the edges.

### Input Fields
- Background: `background_base` (Ivory).
- Border: 1px solid `neutral_border`, changing to `primary_color` (Sage) on focus.
- Typography: Use `body-md` for user input.

### Chips & Tags
- Style: Pill-shaped with a 50% opacity background of the accent colors (Blush, Lavender, etc.).
- Text: `label-caps` for a structured, professional appearance.

### Product Listings
- Images should feature a consistent aspect ratio (preferably 4:5 for an editorial feel).
- Product titles use `headline-sm` (Playfair Display) to differentiate from the utility-driven price and seller info.