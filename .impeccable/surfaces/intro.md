# Intro surface contract

Scope: the local opening/loading state in `components/preloader.tsx`, `components/three/intro-scene.tsx`, and `app/globals.css`, handing off to the existing keyboard hero in `components/hero.tsx`. The user requested “An immersive visual moment with more deliberate choreography.” This records the resulting implementation; it does not establish a new portfolio identity or claim user approval of every implementation detail.

**Experience mode:** an immersive opening scene with an authored arrival, settled composition, and departure. Readiness and font gates support the choreography without an indefinite load.

**Thesis:** introduce Erik through two sculptural E/H keycaps, carrying the existing keyboard hero's material language into a deliberate opening moment.

**Own world:** inherit ink (`#0a0a0a`), paper (`#f4f4f1`), signal yellow (`#ffd60a`), Outfit display type, and the hero's StudioEnv lighting. Actual Three.js rounded, tapered keycaps carry ink E/H glyphs: E is paper and H is yellow. The ink backdrop and supporting lower-left “Erik Hein.” title frame the objects; the period uses signal yellow. This is an intro-specific composition within the incumbent world.

**Story:** the keys emerge from opposite sides and depth, turning into place over 1.8 seconds with ease-out quartic arrival and a 260ms stagger. They settle into a diagonal composition on portrait screens and a side-by-side composition on desktop, with a subtle 0.045-unit float. The supporting title rises for 1 second after a 900ms delay from mount. On dismissal, keys accelerate toward the camera and outward over 950ms; the backdrop fades over 0.8 seconds after a 0.15-second delay while the existing keyboard hero begins.

**First viewport and form:** the keys dominate, with name, caption (“Product engineer”, “San Francisco, CA”), anchored below. The title uses Outfit 600, `-0.04em` tracking, `1.1` line-height, and `clamp(3rem, 6vw, 6rem)` sizing; at widths up to 600px its size is `clamp(3rem, 13vw, 4rem)`. The scene reserves 100px below on desktop and 210px on mobile. Below a width/height ratio of 0.8, portrait framing uses camera z=11.5 rather than desktop z=8.8; field of view is 35 degrees. Short desktop viewports shift the scene right and reduce title size.

**Timing and handoff:** the normal beat lasts 3.4 seconds from scene readiness, then waits for fonts if needed. A hard 5.5-second deadline from mount covers slow fonts and an unavailable renderer. Dismissal marks the preloader ready, starts the hero handoff, and releases loading scroll lock when the exit completes. Preserve existing audio preference handling.

**Access and escape:** the named modal intro keeps the decorative Canvas hidden from accessibility APIs and exposes the title as text. There is no visible skip control. Escape dismisses; Tab focuses the intro container while the overlay is active, without taking focus on arrival. If the intro holds focus on dismissal, move focus to `main` without scrolling. Reduced motion skips Canvas and title animation, uses a 150ms minimum / 500ms hard deadline, and fades the overlay out over 150ms with no delay.

**Resilience and resources:** SceneBoundary falls back to the supporting title on a rendering error and signals readiness. Canvas device pixel ratio is bounded to 1–1.75. Key geometry and glyph textures are disposed on unmount.

**Review hook:** `?intro` holds the scene until Escape only in development. Production always follows the automatic deadline.

Validation of the original redesign: TypeScript and lint passed; keyboard dismissal, automatic dismissal, and scroll release were checked at runtime. Desktop (1280×720) and mobile (390×844) visual review found no material visual defect. The visible skip control was subsequently removed at the user’s request; Escape and automatic dismissal remain. Missing global design documentation is a pre-existing gap; this local contract does not establish a new global system.
