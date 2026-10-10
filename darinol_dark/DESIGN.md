---
name: Darinol Dark
colors:
  surface: '#151312'
  surface-dim: '#151312'
  surface-bright: '#3b3937'
  surface-container-lowest: '#100e0d'
  surface-container-low: '#1d1b1a'
  surface-container: '#211f1e'
  surface-container-high: '#2c2928'
  surface-container-highest: '#373433'
  on-surface: '#e7e1df'
  on-surface-variant: '#dfc0b5'
  inverse-surface: '#e7e1df'
  inverse-on-surface: '#32302f'
  outline: '#a78b81'
  outline-variant: '#58423a'
  surface-tint: '#ffb59a'
  primary: '#ffb59a'
  on-primary: '#5b1b00'
  primary-container: '#ff7a45'
  on-primary-container: '#672000'
  inverse-primary: '#a73a05'
  secondary: '#ccc5c2'
  on-secondary: '#33302e'
  secondary-container: '#4a4644'
  on-secondary-container: '#bab4b1'
  tertiary: '#ffb599'
  on-tertiary: '#542109'
  tertiary-container: '#dc8e6f'
  on-tertiary-container: '#5e2810'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#802900'
  secondary-fixed: '#e8e1de'
  secondary-fixed-dim: '#ccc5c2'
  on-secondary-fixed: '#1e1b19'
  on-secondary-fixed-variant: '#4a4644'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb599'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#71361d'
  background: '#151312'
  on-background: '#e7e1df'
  surface-variant: '#373433'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system is a sophisticated, high-end dark mode evolution of the brand. It shifts from a warm, airy aesthetic to a deep, immersive environment designed for focus and premium feel. The brand personality is professional yet energetic, utilizing a "Modern Corporate" style with "Glassmorphic" influences to prevent the dark theme from feeling flat or heavy.

The target audience consists of power users and professionals who prioritize legibility during extended usage. The UI evokes a sense of technical precision and warmth, achieved by mixing deep charcoal neutrals with subtle orange-tinted glows. Depth is created through layered surfaces rather than heavy shadows, ensuring a clean, streamlined experience.

## Colors

The palette is anchored by the **Coral Orange** primary, which serves as the high-visibility call-to-action color. To maintain sophistication in dark mode, the background uses a near-black, warm-toned charcoal (`#0f0e0d`) instead of pure black. This preserves the "warmth" requested while providing maximum contrast for content.

Secondary surfaces use muted warm grays to create a logical hierarchy. The tertiary color is a desaturated version of the primary, used for states like hover or secondary accents where the full vibrance of the coral might be too distracting. Text follows a strict hierarchy: a soft off-white for primary readability and a muted taupe-gray for metadata and secondary descriptions.

## Typography

The typography utilizes **Be Vietnam Pro** for its contemporary and friendly character, ensuring that the dark interface remains approachable. Headlines use tighter tracking and heavier weights to command attention, while body text uses a slightly increased line-height (1.6) to prevent eye strain on dark backgrounds.

For mobile, display sizes scale down aggressively to ensure no more than three words per line. Labels use a semi-bold weight and slight uppercase tracking to distinguish them from body text, serving as effective "signposts" in data-heavy layouts.

## Layout & Spacing

This design system employs a **Fluid Grid** model with a base-8 rhythm. On desktop, a 12-column grid is used with 24px gutters. On mobile, this collapses to a 4-column grid with 16px margins. 

The spacing philosophy prioritizes generous negative space to let the dark surfaces "breathe." Large vertical gaps (40px-64px) separate distinct content sections, while smaller increments (8px-12px) group related elements within cards. Elements should always align to the 8px grid to maintain visual mathematical rigor.

## Elevation & Depth

In this dark theme, depth is primarily conveyed through **Tonal Layers** rather than shadows. Higher elevation is represented by lighter surface colors. 
- **Level 0 (Base):** The darkest background color.
- **Level 1 (Cards/Containers):** A slightly lighter warm gray (`#1a1817`).
- **Level 2 (Modals/Popovers):** The lightest surface, paired with a subtle primary-tinted glow (10% opacity Coral shadow) to suggest it is floating closest to the user.

To enhance the premium feel, use **Low-contrast outlines** (1px solid at 10% white opacity) on cards to define their edges against the dark background. Subtle backdrop blurs (12px-20px) should be applied to navigation bars and floating menus to create a sense of translucency.

## Shapes

The shape language is **Rounded**, utilizing a 0.5rem (8px) base radius. This strikes a balance between professional geometry and friendly approachability. 
- Standard components (Buttons, Inputs, Cards) use 8px.
- Large containers and featured sections (Images) use 16px (rounded-lg).
- Elements that are meant to feel distinct or "tucked in" (Chips, Tags) may use the 24px (rounded-xl) variant to lean towards a pill-shape without becoming fully circular.

## Components

### Buttons
- **Primary:** Solid Coral Orange (`#ff7a45`) with White text. No shadow, flat fills only.
- **Secondary:** Outline-only with Coral Orange border and text. 
- **Ghost:** Transparent background with Coral text for low-priority actions.

### Inputs
Fields should use the "Sunken" surface color (`#0a0908`) with a 1px border that turns Coral Orange on focus. Placeholder text should be significantly muted (`#5c5753`).

### Cards
Cards are the primary organizational unit. They use the `surface_elevated` color. To ensure legibility, card headers should use a slightly higher font weight than the body content.

### Chips & Tags
Use low-saturation backgrounds (e.g., 10% Coral opacity) with full-saturation text for a "glass" tag effect that remains legible against the dark background.

### Lists
Separators between list items should be extremely subtle—use 5% white opacity lines. This provides enough structure without cluttering the dark UI with high-contrast lines.