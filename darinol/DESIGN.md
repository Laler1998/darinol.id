---
name: Darinol
colors:
  surface: '#fff8f6'
  surface-dim: '#ecd5ce'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ec'
  surface-container: '#ffe9e3'
  surface-container-high: '#fae3dc'
  surface-container-highest: '#f5ded6'
  on-surface: '#251915'
  on-surface-variant: '#58423a'
  inverse-surface: '#3b2d29'
  inverse-on-surface: '#ffede7'
  outline: '#8b7168'
  outline-variant: '#dfc0b5'
  surface-tint: '#a73a05'
  primary: '#a73a05'
  on-primary: '#ffffff'
  primary-container: '#ff7a45'
  on-primary-container: '#672000'
  inverse-primary: '#ffb59a'
  secondary: '#8a4f38'
  on-secondary: '#ffffff'
  secondary-container: '#ffb195'
  on-secondary-container: '#7a412c'
  tertiary: '#006972'
  on-tertiary: '#ffffff'
  tertiary-container: '#00b2c2'
  on-tertiary-container: '#003f45'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#802900'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ffb59a'
  on-secondary-fixed: '#370e01'
  on-secondary-fixed-variant: '#6e3823'
  tertiary-fixed: '#8ff1ff'
  tertiary-fixed-dim: '#4fd8e9'
  on-tertiary-fixed: '#001f23'
  on-tertiary-fixed-variant: '#004f56'
  background: '#fff8f6'
  on-background: '#251915'
  surface-variant: '#f5ded6'
typography:
  display-lg:
    fontFamily: Poppins
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '500'
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
    lineHeight: '1.5'
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 800px
  gutter: 1.5rem
  section-gap: 4rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style
The design system focuses on an **Editorial Minimalist** aesthetic, tailored for the modern creator. The goal is to move away from the "instrument cluster" feel of traditional SaaS dashboards toward a focused, conversational, and premium experience. 

The interface evokes a sense of calm and clarity through heavy use of whitespace, centered content containers, and a warm, organic color palette. It draws inspiration from modern AI interfaces, prioritizing a single-stream workflow over complex multi-pane navigation. The tone is professional yet approachable, emphasizing speed and "flow state" productivity.

## Colors
The palette is grounded in the "Paper" background (`#F4F2EE`), which provides a softer, more premium feel than pure white. 

- **Primary (Coral Orange):** Used sparingly for calls to action, active states, and brand moments.
- **Neutral Stack:** Text relies on a deep charcoal for high legibility, while secondary text and borders use warm grays to maintain the editorial softness.
- **Functional:** Success states use a vibrant green, but should be styled with low-opacity backgrounds to remain cohesive with the warm theme.

## Typography
The typographic scale emphasizes hierarchy and breathing room. **Poppins** provides a geometric, friendly structure for headings, while **Be Vietnam Pro** offers exceptional legibility for body copy and UI labels. 

Large display type should be used for empty states and welcome screens to drive the editorial feel. Body text is slightly oversized (18px for primary content) to ensure a comfortable reading experience similar to a high-end blog or publishing platform.

## Layout & Spacing
This design system rejects the traditional sidebar-and-top-bar layout. Instead, it utilizes a **Centered Single-Column** model. 

- **The Focus Column:** All primary content is contained within a max-width of 800px, centered horizontally. This reduces eye strain and mimics the interface of modern writing and AI tools.
- **Margins:** On mobile, a minimum margin of 20px is maintained. On desktop, the layout breathes with significant lateral whitespace.
- **Vertical Rhythm:** Large vertical gaps (64px+) separate major sections to prevent visual clutter and signal content shifts.

## Elevation & Depth
Depth is created through subtle **Tonal Layering** and **Ambient Shadows**. 

- **Surface Tiers:** The background is `#F4F2EE`. Primary cards and surfaces are pure white (`#FFFFFF`) to pop against the off-white base.
- **Shadows:** Use extremely soft, low-opacity shadows (e.g., `0 4px 20px rgba(26, 26, 26, 0.04)`). There should be no harsh outlines; depth should feel organic, like paper resting on a desk.
- **Interactions:** On hover, cards may lift slightly (increasing shadow spread) or gain a subtle 1px border in the primary color at low opacity.

## Shapes
The shape language is welcoming and soft. 
- **Cards:** Use a base radius of 16px (`rounded-lg`) to 24px (`rounded-xl`) to maintain the "modern dashboard" feel. 
- **Buttons:** Follow the card logic or use fully pill-shaped profiles for primary actions.
- **Inputs:** Maintain a consistent 12px radius to balance the softness of the cards without feeling juvenile.

## Components
- **Buttons:** Primary buttons are Solid Coral (`#FF7A45`) with white text. Secondary buttons are Ghost-style with a subtle border or a light gray fill that matches the background tier.
- **Cards:** White background, 24px padding, 16px-24px corner radius. No heavy borders; use the ambient shadow for definition.
- **Input Fields:** Large, clean fields with 16px vertical padding. Focus states should transition the border color to Primary with a soft glow (box-shadow).
- **Navigation:** Replaced by a floating "Action Bar" at the bottom or a very minimal top-center breadcrumb.
- **Chips:** Small, rounded pill shapes used for tags or status. Use high-transparency versions of the primary/success colors (e.g., Coral at 10% opacity with Solid Coral text).
- **Lists:** Clean, borderless rows with generous vertical padding (16px+). Use subtle dividers only when necessary for high-density data.