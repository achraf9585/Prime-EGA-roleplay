# UI/UX Pro Max - Complete Design Intelligence Reference

UI/UX Pro Max is a comprehensive design skill containing 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 technology stacks.

## Core Purpose

This skill activates when tasks involve "UI structure, visual design decisions, interaction patterns, or user experience quality control." It covers web and mobile applications using React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS.

## When to Use

**Must invoke for:** designing new pages, creating UI components, selecting color schemes and typography, reviewing UI code for UX/accessibility/consistency, implementing navigation and animations, making product-level design decisions, improving interface quality and usability.

**Recommended for:** unclear unprofessional UI appearance, usability feedback, pre-launch optimization, cross-platform alignment, and design system building.

**Skip when:** working on pure backend logic, API/database design, unrelated performance optimization, infrastructure work, or non-visual automation.

## Ten Priority Categories

The framework organizes guidance by impact level: **Accessibility (CRITICAL)**, **Touch & Interaction (CRITICAL)**, **Performance (HIGH)**, **Style Selection (HIGH)**, **Layout & Responsive (HIGH)**, **Typography & Color (MEDIUM)**, **Animation (MEDIUM)**, **Forms & Feedback (MEDIUM)**, **Navigation Patterns (HIGH)**, and **Charts & Data (LOW)**.

## Quick Reference Highlights

**Accessibility essentials:** "Minimum 4.5:1 ratio for normal text"; visible focus rings; descriptive alt text; aria-labels for icon-only buttons; full keyboard support; sequential heading hierarchy; respect reduced-motion preferences.

**Touch requirements:** "Min 44×44pt" touch targets; 8px+ spacing between targets; loading feedback on buttons; clear error messages near problem fields; avoid hover-only interactions.

**Performance priorities:** WebP/AVIF image formats; lazy loading non-critical assets; reserve space to prevent layout shift; virtualize lists with 50+ items; maintain under ~16ms per-frame work.

**Style discipline:** Match style to product type; maintain consistency across pages; use SVG icons (not emojis); select palettes from product/industry context; align shadows/blur with chosen aesthetic.

**Layout fundamentals:** Include viewport meta tag; design mobile-first; use systematic breakpoints; minimum 16px body text on mobile; no horizontal scroll; consistent spacing scale; fixed element offsets; readable line length (35–60 chars mobile, 60–75 chars desktop).

**Typography:** 1.5–1.75 line-height for body text; 65–75 character line limit; matching font personalities; consistent type scale; semantic color tokens instead of raw hex values; dark mode uses desaturated variants, not inverted colors.

**Animation principles:** Keep durations 150–300ms for micro-interactions; use transform/opacity only (avoid animating width/height); provide loading indicators when exceeding 300ms; ensure animations express cause-effect relationships; respect reduced-motion settings.

**Forms & Feedback:** Visible labels per input (not placeholder-only); errors displayed below related fields; loading then success/error states on submit; required field indicators; helpful empty states; toasts auto-dismiss in 3–5 seconds; confirm destructive actions.

**Navigation best practices:** Bottom navigation limited to 5 items with labels; drawers for secondary navigation; predictable back behavior preserving scroll/state; deep-linking for all key screens; clear active state highlighting; maximum nesting depth.

**Data visualization:** Match chart type to data structure; use accessible color palettes avoiding red/green-only pairs; provide table alternatives for accessibility; show legends; include tooltips on interact; support keyboard navigation; responsive charts on small screens; meaningful empty states.

## Implementation Workflow

1. **Analyze requirements:** Extract product type, target audience, style keywords, technology stack
2. **Generate design system:** Use `--design-system` flag to receive comprehensive recommendations with reasoning rules
3. **Supplement with detailed searches:** Query specific domains (color, typography, ux, chart, stack) as needed
4. **Apply stack guidelines:** Get implementation-specific best practices for chosen technology
5. **Verify pre-delivery checklist:** Confirm visual quality, interaction feedback, light/dark mode contrast, layout compliance, and accessibility requirements before shipping

## Common Professional Standards

Avoid emojis as structural icons; use consistent vector icon families; apply platform-native interaction semantics; respect safe areas; maintain 8dp spacing rhythm; provide clear pressed-state feedback within 80–150ms; test both light and dark mode contrast independently; verify touch targets meet minimum sizes; support reduced-motion and dynamic text scaling; ensure disabled states are non-interactive and visually clear.
