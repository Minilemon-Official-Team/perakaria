# Design System Inspired by BLOOM

## 1. Visual Theme & Atmosphere

BLOOM's design system embodies sophisticated minimalism with a dramatic, luxury aesthetic. The visual identity centers on deep, near-black backgrounds that create an intimate, premium environment—evoking the cinematic production work at the brand's core. Strategic use of golden accents (`#FFC700`) punctuates the darkness, drawing attention to key actions and moments of discovery. Typography is bold and commanding, with generous whitespace allowing content to breathe. The overall mood is refined, intentional, and European—anchored in Paris's creative heritage. This is a design system for brands that command attention through restraint rather than noise.

**Key Characteristics**
- Deep charcoal and near-black primary backgrounds (`#15161B`)
- Minimal color palette with golden accent highlights
- Bold, geometric sans-serif typography at commanding scale
- Clean borders and zero border radius for sharp, modern edges
- Generous spacing and whitespace for luxury positioning
- High contrast for readability against dark backgrounds
- No decorative shadows; clean elevation through color and space

## 2. Color Palette & Roles

### Primary
- **Night** (`#15161B`): Primary background for all surfaces and containers; dominates the visual hierarchy
- **Black** (`#000000`): Deepest neutral for text and structural elements; maximum contrast

### Accent Colors
- **Gold** (`#FFC700`): Warning and highlight accent; draws focus to interactive moments and key content; used sparingly for impact
- **Electric Blue** (`#3B82F6`): Secondary accent for specific interactions; reserved for premium call-to-actions

### Interactive
- **Slate** (`#D3D8E1`): Primary text color on dark backgrounds; high contrast, readable; used for body copy, links, and secondary UI
- **White** (`#FFFFFF`): Maximum contrast for prominent headlines and critical text

### Neutral Scale
- **Off-Black** (`#000000`): Darkest neutral tier for overlays and dense UI
- **Translucent Black** (`rgba(0, 0, 0, 0.95)`): Button fills with near-solid opacity; slight transparency for depth
- **Translucent Black 40%** (`rgba(0, 0, 0, 0.4)`): Card overlays and semi-transparent surfaces; maintains readability
- **Transparent** (`rgba(0, 0, 0, 0)`): Default for ghost buttons and borderless text elements

### Surface & Borders
- **Slate** (`#D3D8E1`): Border definitions and subtle dividers; creates structure without visual weight

### Semantic / Status
- **Gold** (`#FFC700`): Warning, alerts, and emphasis states (157 instances in design)
- **Red** (`#FF0000`): Error and danger states; critical user feedback

## 3. Typography Rules

### Font Family
- **Primary:** PP Neue Montreal (PPNeueMontreal) — geometric, modern sans-serif with strong personality
- **Fallback stack:** `'PP Neue Montreal', 'PPNeueMontreal', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / H1 | PP Neue Montreal | 100px | 700 | 80px | 0px | Hero headlines; maximum visual impact |
| Body Large | PP Neue Montreal | 15px | 400 | 15px | 0px | Descriptive text; secondary content |
| Body Standard | PP Neue Montreal | 12px | 400 | 15px | 0px | Form inputs; body copy; default text |
| Button / Label | PP Neue Montreal | 12px | 700 | 14.4px | 0px | Interactive labels; button text |
| Link / Navigation | PP Neue Montreal | 10px | 400 | 13px | 0px | Inline links; navigation items; captions |
| Metadata / Caption | PP Neue Montreal | 10px | 400 | 13px | 0px | Fine print; secondary labels |

### Principles
- **Bold hierarchy:** Use weight contrast (700 vs 400) to establish visual priority; avoid mid-weight compromises
- **Generous line heights:** All line heights equal or exceed font size; creates breathing room in dark environments
- **Minimal letter spacing:** Rely on font geometry; no artificial expansion except in rare display contexts
- **Size discipline:** Six distinct sizes only; prevents scale chaos and ensures consistent composition
- **Dark-background optimization:** Slate (`#D3D8E1`) chosen for legibility on `#15161B` with 11:1+ contrast ratio

## 4. Component Stylings

### Buttons

#### Primary Solid Button
- **Background:** `#15161B`
- **Text Color:** `#FFFFFF`
- **Padding:** `6px 10px 4px 10px`
- **Font Size:** `12px`
- **Font Weight:** `400`
- **Line Height:** `14.4px`
- **Border:** `0px none`
- **Border Radius:** `0px`
- **Hover State:** Background opacity increases to `rgba(21, 22, 27, 1)`; text remains white
- **Active State:** Text color shifts to `#D3D8E1`

#### Secondary / Ghost Button
- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#D3D8E1`
- **Padding:** `0px 0px 0px 0px`
- **Font Size:** `10px`
- **Font Weight:** `400`
- **Line Height:** `13px`
- **Border:** `0px solid #D3D8E1`
- **Border Radius:** `0px`
- **Hover State:** Text color shifts to `#FFFFFF`; background remains transparent
- **Active State:** Text color remains `#D3D8E1`

#### Navigation / Menu Button
- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#D3D8E1`
- **Padding:** `20px 20px 0px 0px`
- **Font Size:** `14px`
- **Font Weight:** `700`
- **Line Height:** `14px`
- **Border:** `0px none`
- **Border Radius:** `0px`
- **Hover State:** Text color shifts to `#FFC700` for accent emphasis
- **Active State:** Text color remains `#D3D8E1`

### Cards & Containers

#### Media Card (Full Width)
- **Background:** `rgba(0, 0, 0, 0)` (transparent; displays media)
- **Text Color:** `#D3D8E1`
- **Padding:** `0px 0px 0px 0px`
- **Width:** `100%`
- **Height:** Auto / aspect-ratio maintained
- **Border:** `0px solid #D3D8E1`
- **Border Radius:** `0px`
- **Box Shadow:** `none`
- **Hover State:** Opacity overlay increases to `0.5`

#### Overlay Card (Semi-Transparent)
- **Background:** `rgba(0, 0, 0, 0.4)`
- **Text Color:** `#D3D8E1`
- **Padding:** `0px 0px 0px 0px`
- **Border:** `0px solid #D3D8E1`
- **Border Radius:** `0px`
- **Box Shadow:** `none`
- **Use:** Content layered over media; maintains readability through translucency

#### Content Container
- **Background:** `#15161B`
- **Text Color:** `#D3D8E1`
- **Padding:** `20px` to `112px` (context-dependent; see Spacing System)
- **Border:** `0px none`
- **Border Radius:** `0px`
- **Box Shadow:** `none`

### Inputs & Forms

#### Text Input
- **Background:** `rgba(0, 0, 0, 0)` (transparent with underline border)
- **Text Color:** `#D3D8E1`
- **Placeholder Color:** `rgba(211, 216, 225, 0.6)`
- **Padding:** `0px 0px 0px 0px`
- **Font Size:** `12px`
- **Font Weight:** `400`
- **Line Height:** `15px`
- **Border:** `0px solid #D3D8E1` (bottom border only; 1px recommended)
- **Border Radius:** `0px`
- **Focus State:** Border color shifts to `#FFC700`; text color becomes `#FFFFFF`
- **Active State:** Background remains transparent; text color `#D3D8E1`

#### Search Input
- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#D3D8E1`
- **Padding:** `0px 0px 0px 0px`
- **Font Size:** `12px`
- **Font Weight:** `400`
- **Line Height:** `15px`
- **Border:** `0px solid #D3D8E1`
- **Border Radius:** `0px`
- **Focus State:** Border color shifts to `#FFC700`

### Navigation

#### Top Navigation Bar
- **Background:** `#15161B`
- **Text Color:** `#D3D8E1`
- **Padding:** `20px 20px 20px 20px`
- **Border:** `0px none`
- **Border Radius:** `0px`
- **Box Shadow:** `none`
- **Link Hover:** Text color shifts to `#FFC700`

#### Footer Navigation
- **Background:** `#15161B`
- **Text Color:** `#D3D8E1`
- **Padding:** `20px 20px 20px 20px`
- **Font Size:** `10px`
- **Font Weight:** `400`
- **Line Height:** `13px`
- **Link Hover:** Text color shifts to `#FFFFFF`

### Links

#### Standard Link
- **Text Color:** `#D3D8E1`
- **Font Size:** `10px`
- **Font Weight:** `400`
- **Line Height:** `13px`
- **Decoration:** None (underline on hover)
- **Hover State:** Text color shifts to `#FFC700`; underline appears
- **Active State:** Text color `#D3D8E1`; underline remains

#### Navigation Link
- **Text Color:** `#D3D8E1`
- **Font Size:** `10px`
- **Font Weight:** `400`
- **Line Height:** `13px`
- **Decoration:** None
- **Hover State:** Text color shifts to `#FFC700`

## 5. Layout Principles

### Spacing System
- **Base Unit:** `4px`
- **Scale:** Multiples of 4px and 8px increments
  - `4px` — Micro gaps between tightly grouped elements
  - `8px` — Minimum spacing between related items
  - `16px` — Standard element-to-element spacing
  - `20px` — Padding for contained text; small section gutters
  - `24px` — Spacing between UI groups
  - `32px` — Spacing between major sections
  - `52px` — Mid-level vertical spacing
  - `72px` — Large padding for hero sections
  - `76px` — Vertical spacing between content blocks
  - `80px` — Major section separation
  - `100px` — Hero section top/bottom margins
  - `112px` — Maximum padding for full-width sections

**Usage Context:**
- **Micro (`4px–8px`):** Form fields, icon spacing, tight component layouts
- **Standard (`16px–24px`):** Cards, button groups, navigation spacing
- **Section (`32px–52px`):** Between content blocks and major UI regions
- **Hero (`72px–112px`):** Hero headlines, full-screen sections

### Grid & Container
- **Max Width:** `1400px` for content containers; allows breathing room on ultra-wide screens
- **Breakpoint Container:** Adjust max-width at responsive breakpoints (see Section 8)
- **Column Strategy:** Flexible grid system; rely on flex layout rather than rigid column counts
- **Gutter:** `20px` to `32px` depending on section context
- **Section Patterns:** Full-width sections with centered content containers; alternating light/dark backgrounds not applicable (always dark primary)

### Whitespace Philosophy
- **Generous:** BLOOM prioritizes clarity over density; use whitespace as a design element
- **Hierarchy Driver:** Large whitespace around heroes and key content; tighter spacing around secondary UI
- **Breathing Room:** Minimum `20px` padding around text blocks; minimum `16px` between interactive elements
- **Dark-Background Adjustment:** Whitespace appears more prominent against `#15161B`; use this to create visual rest

### Border Radius Scale
- **No Border Radius:** `0px` — All components use sharp corners; consistent with modern, editorial aesthetic
- **Exception:** Rare hover/focus state overlays may use subtle radius if motion design requires, but default is `0px`

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Surface 0 (Base) | `#15161B` solid background; no shadow | Primary container; page background |
| Surface 1 (Overlay) | `rgba(0, 0, 0, 0.4)` semi-transparent overlay | Cards over media; modal backgrounds |
| Surface 2 (Accent) | `rgba(0, 0, 0, 0.95)` near-solid overlay | Button fills; heavy overlays |
| Elevation 1 | `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5)` | Floating buttons; modals (optional) |
| Elevation 2 | `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6)` | Popovers; dropdowns (optional) |

**Depth Philosophy:**
BLOOM's design system avoids traditional drop shadows in favor of color-based elevation. Opacity shifts and background color changes create depth without visual noise. When shadows are used, they must be subtle and employ dark tones (`rgba(0, 0, 0, 0.5–0.6)`) that don't disrupt the dark aesthetic. Most UI components exist on a flat plane; depth is implied through spatial hierarchy, whitespace, and typography scale rather than shadow effects.

## 7. Do's and Don'ts

### Do
- Use `#D3D8E1` for all body text and links on dark backgrounds; ensures 11:1+ contrast
- Apply `#FFC700` sparingly for warning states, alerts, and key interactive moments; use as an accent, not background
- Maintain `0px` border radius on all components; sharp corners reinforce the editorial, modern aesthetic
- Create visual hierarchy through typography weight (700 vs 400) and size scale; avoid artificial styling tricks
- Preserve generous whitespace around hero content and key messages; let the dark background breathe
- Use full-width sections with centered content containers for responsive flexibility
- Test all text color combinations against `#15161B` for minimum 11:1 WCAG AA contrast
- Stack elements vertically with consistent spacing from the Spacing System scale

### Don't
- Use low-contrast color combinations (e.g., `#D3D8E1` on light gray backgrounds)
- Add decorative shadows or glows; maintain flat, graphic aesthetic
- Mix font families; PPNeueMontreal is the singular system font
- Create buttons with intermediate opacity values; use full opacity or full transparency
- Introduce rounded corners on standard components; reserve `0px` radius as system default
- Crowd the layout; whitespace is a design feature, not wasted space
- Use color to communicate information without supporting text or icons; ensure redundancy
- Apply multiple accent colors simultaneously; gold (`#FFC700`) is primary, blue (`#3B82F6`) is reserved
- Decrease font sizes below the documented hierarchy; maintain minimum `10px` for captions and fine print

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | 320px – 640px | Stack all sections vertically; reduce padding to `20px`; reduce heading size to `48px`; single-column layout |
| Tablet | 641px – 1024px | Two-column grids where applicable; padding increases to `40px`; heading size `72px`; flexible card widths |
| Desktop | 1025px – 1400px | Full multi-column layouts; max content width `1400px`; padding `52px–72px`; heading size `100px` |
| Ultra-Wide | 1401px+ | Centered container at max `1400px`; equal margins on both sides; no forced full-width layouts |

### Touch Targets
- **Minimum height:** `44px` for buttons and clickable elements
- **Minimum width:** `44px` for icon buttons
- **Spacing between targets:** `8px` minimum to prevent accidental taps
- **Link padding:** `12px` vertical, `16px` horizontal for comfortable finger interaction
- **Font size on mobile:** Maintain minimum `12px` for readability on small screens

### Collapsing Strategy
- **Hero sections:** Heading size reduces from `100px` (desktop) to `72px` (tablet) to `48px` (mobile); maintain line height relationships
- **Spacing:** Vertical margins collapse from `100px` (desktop) to `52px` (tablet) to `32px` (mobile)
- **Navigation:** Horizontal nav converts to hamburger menu on tablet/mobile; full-width stacked on mobile
- **Cards:** Full-width cards on mobile; two-column on tablet; maintain three-column on desktop only if content warrants
- **Padding:** Containers reduce from `112px` (desktop hero) to `72px` (tablet) to `20px` (mobile)
- **Grid gaps:** Reduce from `32px` (desktop) to `20px` (tablet) to `12px` (mobile)

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA / Gold Accent:** Gold (`#FFC700`) — Use for warning states, key interactions, highlights
- **Primary Background:** Night (`#15161B`) — All page and container backgrounds
- **Primary Text:** Slate (`#D3D8E1`) — Body copy, navigation, links
- **Secondary Text:** White (`#FFFFFF`) — Headlines, high-contrast emphasis
- **Error / Danger:** Red (`#FF0000`) — Critical user feedback and alerts
- **Button Fill:** Black (`rgba(0, 0, 0, 0.95)`) — Solid CTA buttons and overlays
- **Semi-Transparent Overlay:** `rgba(0, 0, 0, 0.4)` — Cards and content over media
- **Ghost / Transparent:** `rgba(0, 0, 0, 0)` — Borderless buttons and transparent sections

### Iteration Guide

1. **Always use PPNeueMontreal font** — No alternatives; this is the singular system typeface with fallback to system sans-serif
2. **Maintain sharp corners** — Border radius is `0px` across all components; no exceptions for standard UI
3. **Dark background is mandatory** — `#15161B` is the primary background; all text must contrast against this color
4. **Typography weights are binary** — Use either `400` (regular) or `700` (bold); no intermediate weights
5. **Spacing follows the 4px grid** — All margin, padding, and gap values must be multiples of `4px` from the documented scale
6. **Gold is an accent only** — `#FFC700` highlights warnings and key moments; never use as primary background or large fill
7. **Contrast is non-negotiable** — Minimum `11:1` ratio for body text; test all color combinations against dark backgrounds
8. **Whitespace creates hierarchy** — Use generous spacing (`32px–112px`) to isolate important content; density signals secondary information
9. **Ghost buttons are transparent** — Use `rgba(0, 0, 0, 0)` background; text color is `#D3D8E1` with `#FFC700` hover state
10. **Responsive breakpoints are three tiers** — Mobile (`320px–640px`), Tablet (`641px–1024px`), Desktop (`1025px+`); adjust spacing and font sizes accordingly
11. **No decorative shadows** — Elevation is achieved through opacity (`rgba(0, 0, 0, 0.4–0.95)`) and color, not shadow effects
12. **Input states use gold on focus** — Border color shifts from `#D3D8E1` to `#FFC700`; maintains visual feedback without jarring changes