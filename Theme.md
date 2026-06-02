---
name: SafeDrive Pulse
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bdc8ce'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#879298'
  outline-variant: '#3e484d'
  surface-tint: '#6cd3f7'
  primary: '#6cd3f7'
  on-primary: '#003543'
  primary-container: '#269dbe'
  on-primary-container: '#002e3b'
  inverse-primary: '#006780'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#ffb873'
  on-tertiary: '#4b2800'
  tertiary-container: '#c98031'
  on-tertiary-container: '#412200'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b7eaff'
  primary-fixed-dim: '#6cd3f7'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e61'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#ffb873'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3b00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
  safety-green: '#22C55E'
  safety-amber: '#F59E0B'
  safety-red: '#EF4444'
  surface-light: '#F8FAFC'
  surface-dark: '#1E293B'
  text-primary-dark: '#F1F5F9'
  text-secondary-dark: '#94A3B8'
typography:
  display-score:
    fontFamily: Hanken Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
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
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  display-score-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 1.25rem
  stack-gap-sm: 0.5rem
  stack-gap-md: 1rem
  stack-gap-lg: 1.5rem
  grid-gutter: 1rem
---

## Brand & Style

The design system is rooted in the "SafeDrive Pulse" philosophy: a fusion of **Modern Corporate** reliability and **Fitness-Tracker** vitality. It prioritizes psychological safety and high-velocity data processing, ensuring the UI feels like a supportive coach rather than a digital enforcement officer.

The aesthetic utilizes a **Minimalist-Data** approach. It leans heavily on generous whitespace (or "darkspace" in dark mode) and high-contrast typography to ensure glanceability—a critical requirement for in-car environments. Surfaces are treated with subtle depth to create a structured, organized feel that evokes trust. The emotional response should be one of calm focus, clarity, and continuous improvement.

## Colors

The palette is optimized for dual-mode high performance, with **Dark Mode** designated as the primary experience to reduce eye strain and cabin glare during night driving. 

- **Primary (Teal/Cyan):** Used for primary actions, active states, and progress indicators. It represents the "Path" and stability.
- **Secondary (Indigo):** Reserved exclusively for AI-generated insights and coaching feedback to distinguish machine intelligence from raw sensor data.
- **Semantic Safety Scale:** A strict Green-Amber-Red system is applied to scores and events. These colors must maintain high saturation to remain legible against both Slate-900 and White backgrounds.
- **Neutrality:** We use a Slate-based scale rather than pure grey to maintain a "cool," tech-forward atmosphere that feels premium and integrated with modern vehicle interiors.

## Typography

Typography is the primary vehicle for "glanceability." 

1.  **Hanken Grotesk** is used for headlines and scores. Its sharp, contemporary geometry provides a professional and technical feel.
2.  **Inter** handles all body copy and secondary data, chosen for its exceptional legibility at small sizes and high-stress environments.
3.  **JetBrains Mono** is introduced for labels and technical event metadata (e.g., timestamps, G-force metrics). The monospaced nature emphasizes the "sensor data" aspect of the app.

**Key Rule:** Large numerical displays (scores, timers) should use the `display-score` token to ensure they can be read from arm's length while the phone is mounted on a dashboard.

## Layout & Spacing

This design system utilizes a **Fluid Grid** with a 4-column structure for mobile. 

- **Safety Margins:** A standard 20px (1.25rem) margin is enforced on all screens to ensure touch targets for "Start/End Drive" are not too close to the bezel.
- **Vertical Rhythm:** A strict 8px base unit drives all spacing. 
- **Active State Layout:** During an active drive, the layout shifts to a "Focus Mode" where padding increases to 32px to isolate the most critical information (Time and Score) from secondary distractions.

## Elevation & Depth

To maintain a "Fitness Tracker" vibe, we avoid heavy, muddy shadows. 

- **Tonal Layering:** Depth is primarily communicated through surface color shifts. In Dark Mode, the base is `#0F172A`, and elevated cards are `#1E293B`.
- **Glow Effects:** Critical safety elements (like a perfect 100 score) utilize a subtle outer glow using the Primary or Green color at 20% opacity to simulate a "live" digital dashboard.
- **Glassmorphism:** Used sparingly on the bottom navigation bar and "Active Drive" overlays to maintain context of the background while focusing on the foreground action. A backdrop blur of 12px is recommended.

## Shapes

The shape language is **Rounded**, favoring 16px (`1rem`) corners for all primary containers and cards. 

This softness counteracts the "industrial" nature of driving data, making the feedback feel more approachable and less like a citation. Progress bars and primary action buttons should use the "Pill" (fully rounded) style to distinguish them as interactive elements versus informational cards.

## Components

- **Primary Buttons:** High-contrast pill shapes. In "Active Drive" mode, buttons must be at least 64px in height to ensure ease of interaction while the vehicle is stationary.
- **Score Gauges:** Circular rings with a stroke weight of 8px. The color of the stroke must map to the semantic safety scale (Green/Amber/Red).
- **Event Timeline:** Vertical line with 24x24px icons. Each icon is encased in a circle with a background color corresponding to the event severity.
- **AI Coaching Cards:** These feature a subtle gradient border using the Secondary Indigo color to visually signpost "Intelligence."
- **Data Chips:** Small, semi-transparent badges used for metadata like "Harsh Braking" or "Night Drive." Use `label-caps` typography within these.
- **Status Indicators:** A pulsating dot icon is used during active drives to provide immediate visual confirmation that sensors are polling data.