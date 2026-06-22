---
name: Premium Fast-Casual Digital Menu
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#5b4137'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#8f7065'
  outline-variant: '#e4beb1'
  surface-tint: '#a73a00'
  primary: '#a73a00'
  on-primary: '#ffffff'
  primary-container: '#ff5c00'
  on-primary-container: '#521800'
  inverse-primary: '#ffb59a'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#929393'
  on-tertiary-container: '#2a2c2c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#802a00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  price-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style
The design system is engineered for high-frequency digital interactions in a dining environment. It balances "Premium" (sophisticated, clean, high-quality) with "Fast-Casual" (energetic, efficient, approachable). 

The visual style is **High-Contrast Modern**, utilizing a "dark mode" primary container strategy to make food photography pop, while maintaining a clean white background for text-heavy utility areas. The emotional goal is to stimulate appetite through warmth and provide a friction-free ordering experience for guests using QR codes. It avoids unnecessary decorative elements, focusing instead on physical cues like depth and soft geometry to guide the user's hand.

## Colors
The palette is dominated by **Vibrant Orange**, a color scientifically associated with hunger and energy. It is used exclusively for primary actions, price points, and active states. 

- **Primary (#FF5C00):** Used for "Add to Cart" buttons, category selection indicators, and call-to-actions.
- **Secondary (#121212):** A deep charcoal used for high-level headings and heavy-duty UI containers like the bottom navigation bar or cart summary.
- **Tertiary (#F9F9F9):** The primary background color to ensure the interface feels airy and hygienic.
- **Neutral (#717171):** Used for secondary text, descriptions, and inactive icons to maintain a clear visual hierarchy.

## Typography
The typography uses a duo of sans-serifs to distinguish between brand personality and utility. **Plus Jakarta Sans** provides a friendly, rounded geometric feel for headlines and brand-heavy elements. **Work Sans** provides a grounded, highly legible experience for descriptions and nutritional info.

Hierarchy is strictly enforced: prices are always bold and rendered in the primary brand color. Headlines use tight letter-spacing to appear impactful and modern, while body text uses standard spacing for maximum readability in low-light restaurant environments.

## Layout & Spacing
The design system uses a **Fluid Grid** optimized for mobile-first QR interactions. On mobile, content follows a single-column scroll with a persistent bottom-bar for the cart. On tablet/desktop, a 12-column grid is used, with a fixed category sidebar on the left and a cart preview on the right.

The "Safe Area" margin is set to 20px on mobile to ensure tap targets don't hit the bezel of modern smartphones. Spacing follows a 4px base unit, with 16px (md) being the standard spacing between related items and 40px (xl) used to separate major sections.

## Elevation & Depth
Depth is achieved through **Ambient Shadows** and tonal layering. This design system avoids harsh borders in favor of soft, diffused shadows that make food cards appear "lifted" and touchable.

- **Level 1 (Base):** The #F9F9F9 background.
- **Level 2 (Cards):** White surfaces with a 10% opacity charcoal shadow (0px 4px 20px).
- **Level 3 (Modals/Floating Actions):** White surfaces with a 15% opacity charcoal shadow (0px 10px 30px) and a subtle 1px inner stroke to maintain crispness.
- **Backdrop:** A 20px blur is applied to the background when a product detail modal is active to keep the focus entirely on the food imagery.

## Shapes
This design system utilizes **Rounded (2)** geometry. Standard UI elements (inputs, secondary buttons) use a 0.5rem radius. To emphasize the "premium/soft" vibe, primary containers and product cards use `rounded-2xl` (1.5rem / 24px) to mirror the shape of a modern smartphone and create an inviting, non-aggressive aesthetic.

## Components

### Buttons
- **Primary:** Full-width orange (#FF5C00) with white text, 24px height padding, and bold 16px labels. Use a subtle inner-glow on hover.
- **Add-to-Cart (Ghost):** A circular '+' button with an orange border and icon, placed at the bottom-right of product cards.

### Cards (Product)
- Feature a top-aligned image with a 1:1 aspect ratio.
- The card body contains the item name, a brief 2-line description, and the price at the bottom left.
- Use `rounded-2xl` for the entire card, with the top corners of the image masked to match.

### Category Chips
- Pill-shaped horizontally scrolling list.
- **Active state:** Secondary color (#121212) background with white text.
- **Inactive state:** Light gray (#E0E0E0) background with dark text.

### Inputs (Modifiers/Special Requests)
- Large text areas with a 0.5rem radius.
- Use a 1px border (#E0E0E0) that thickens and turns Primary Orange on focus.

### Order Summary Bar
- A persistent floating bar at the bottom of the screen.
- Uses a dark #121212 background with "View Cart" text and a total price counter. This creates high contrast against the light page content.