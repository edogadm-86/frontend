---
name: Puppy Blue High-Fidelity
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#434656'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#747688'
  outline-variant: '#c4c5d9'
  surface-tint: '#124af0'
  primary: '#0040e0'
  on-primary: '#ffffff'
  primary-container: '#2e5bff'
  on-primary-container: '#efefff'
  inverse-primary: '#b8c3ff'
  secondary: '#632ce5'
  on-secondary: '#ffffff'
  secondary-container: '#7c4dff'
  on-secondary-container: '#fcf6ff'
  tertiary: '#006325'
  on-tertiary: '#ffffff'
  tertiary-container: '#007f32'
  on-tertiary-container: '#c7ffc7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c3ff'
  on-primary-fixed: '#001356'
  on-primary-fixed-variant: '#0035be'
  secondary-fixed: '#e8deff'
  secondary-fixed-dim: '#cdbdff'
  on-secondary-fixed: '#20005f'
  on-secondary-fixed-variant: '#4f00d0'
  tertiary-fixed: '#69ff87'
  tertiary-fixed-dim: '#3ce36a'
  on-tertiary-fixed: '#002108'
  on-tertiary-fixed-variant: '#00531e'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  video-timestamp:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
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
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system balances premium professionalism with a warm, encouraging personality tailored for high-end pet training and care. The aesthetic is **Modern/Corporate** but softened with organic influences to feel approachable. It evokes a sense of trust, mastery, and joy.

The visual direction uses generous whitespace and a refined "soft-touch" interface. It avoids the clinical feel of traditional SaaS by incorporating subtle gradients and fluid transitions, ensuring the user feels supported throughout the training journey. The target audience includes dedicated pet owners who value precision, clarity, and a sophisticated user experience.

## Colors
The palette is rooted in "Puppy Blue," a vibrant and dependable primary hue. This is supported by specific functional colors designed for the training context:

- **Primary (Puppy Blue):** Used for main actions, navigation, and brand presence.
- **Secondary (Focus Purple):** Reserved for deep-work states, focus modes, and advanced training modules to signal a shift in cognitive load.
- **Tertiary (Success Green):** A high-vibrancy green used exclusively for positive reinforcement, completed milestones, and "good boy" feedback loops.
- **Neutrals:** A range of cool grays that maintain the "Blue" heritage, ensuring the interface feels cohesive even in low-information areas.

The `color_mode` is light by default to maintain an airy, optimistic feel, utilizing a soft blue-tinted background (`#F8FAFF`) to reduce eye strain compared to pure white.

## Typography
The system uses a dual-font strategy to balance character with readability. **Plus Jakarta Sans** provides a friendly, geometric personality for headlines, featuring soft curves that feel modern and welcoming. 

**Be Vietnam Pro** is used for all functional and body text. Its contemporary proportions and slightly wider stance ensure high legibility during active training sessions where the user might be viewing the screen from a distance. 

For the video player, a specialized `video-timestamp` style is used with slightly increased letter spacing to ensure digits remain clear against moving backgrounds.

## Layout & Spacing
The layout follows a 12-column fluid grid for desktop and a 4-column grid for mobile. The spacing rhythm is strictly based on an 8px base unit to maintain mathematical harmony.

- **Desktop:** Large 64px side margins to focus the content in the center, creating a premium "gallery" feel.
- **Training Layouts:** Use a "Focus Layout" where the video player or primary instruction occupies 8 columns, with 4 columns reserved for progress tracking and notes.
- **Video Controls:** Elements within the video player use a tighter `sm` (12px) spacing to keep controls grouped and accessible without obscuring the content.

## Elevation & Depth
Depth is created through **Tonal Layers** and **Ambient Shadows**. Instead of harsh black shadows, this design system uses tinted shadows that pull color from the Primary Blue or Neutral palettes.

- **Level 1 (Surface):** Default background.
- **Level 2 (Cards):** 1px subtle border (`#E2E8F0`) with a very soft, diffused shadow (0px 4px 20px rgba(46, 91, 255, 0.06)).
- **Level 3 (Modals/Overlays):** Stronger elevation with a 15% opacity blur background (Glassmorphism) to keep the context of the training session visible beneath the overlay.
- **Video Player:** The player container uses a deep inner-glow on hover to highlight interactive zones, and controls use a subtle backdrop filter (blur 8px) to remain legible over any video content.

## Shapes
The shape language is consistently **Rounded** (Level 2). This eliminates "sharpness" from the UI, reinforcing the friendly brand personality. 

- **Standard Buttons:** 0.5rem (8px) radius.
- **Progress Bars:** Fully pill-shaped (rounded-xl) to feel fluid and continuous.
- **Video Player Container:** 1rem (16px) radius to frame the content as a premium object.
- **Checkboxes:** Small 4px radius to balance the geometric precision with the overall soft aesthetic.

## Components
- **Primary Buttons:** High-contrast Puppy Blue with white text. On hover, a subtle scale-up (1.02x) adds a tactile, "squishy" feel.
- **Training Progress Bars:** A dual-track system. The container is a light neutral blue; the progress fill uses a gradient from Focus Purple to Success Green as the user nears 100%.
- **Video Player UI:** 
    - **Play/Pause:** Large, centered icon with a glassmorphic circular backing.
    - **Scrub Bar:** 4px height normally, expanding to 8px on hover. The "buffered" section is 20% opacity white, and the "played" section is Primary Blue.
    - **Timestamp Chips:** Small, semi-transparent dark chips with `video-timestamp` typography.
- **Focus Chips:** Used for tagging exercises. They use the Focus Purple palette with a 10% opacity background and 100% opacity text.
- **Success Cards:** Triggered at the end of a module. Features a large Success Green checkmark and a subtle confetti-style background pattern in the brand colors.
- **Input Fields:** Clean, with a 2px Puppy Blue border appearing only on focus, accompanied by a soft blue outer glow.