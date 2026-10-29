# Virtual Exhibitions NBCG: Design

## Product
Virtual exhibitions built from the collections of the National Library of Montenegro (nb-cg.me, dlib.me).

## Users
Students, researchers, teachers and culture enthusiasts, 15-65, mostly on phones; curators who work at a desk.

## Tone
Dignified, editorial, warm. A modern museum website, not a library catalog.

## Visuals
- Colors (tokens in `src/index.css`, taken from nb-cg.me): warm white background, ink `primary`, gold `accent` for highlights and active states, `gold` token for gold text on light backgrounds (contrast safe). Dark mode is available and toggled in the header; default is light. Text on dark `bg-ink` surfaces (header, hero, footer, covers) uses the `on-ink` token, which stays light in both themes; `primary-foreground` is only for text on `bg-primary` (it turns dark in dark mode).
- Fonts: Fraunces for headings (`font-heading`, a soft serif with a historic feel), Inter for body and menus. No other fonts. Menus use small uppercase letter-spaced labels with a gold sliding underline; section titles use the `Ornament` divider (hairline, diamond, tail); the header ends in a thin double gold rule.
- Shape: small radius (`rounded-lg` max), thin borders, light shadows only on hover.
- Imagery: large, full-bleed covers and objects; dark ink backdrops behind artifacts so images pop. Offline placeholder art is generated in `src/lib/art.ts` until real digitized images arrive.
- Icons: `lucide-react` only.
- Motion: subtle (fade, slow zoom on hover). Respect `prefers-reduced-motion` for any new animation.

## Templates
1. Timeline: sticky media on the left, scroll-driven chapters on the right (stacked on mobile).
2. Gallery: masonry columns, lightbox with metadata and keyboard navigation.
3. Map story: Leaflet map with numbered stops and a route line, chapter list beside it.
4. Slider: horizontal snap slides with a before/after compare handle.
5. 3D room: react-three-fiber hall with framed objects; orbit controls; click opens the metadata dialog.

## Avoid
- Gradients without purpose, emoji instead of icons, generic "Welcome to..." hero text.
- Hex, rgb or hsl values in components. The only exceptions live in plain `.ts` files: `src/lib/scene-palette.ts` (3D room and map route, because three.js and Leaflet cannot read CSS tokens) and `src/lib/art.ts` (generated placeholder images).
- Cyrillic script; hardcoded UI strings.

## Feedback to the user
- Loading: skeletons with `aria-busy` and an accessible label; the map and 3D hall show one while their code loads.
- Errors: `ErrorNotice` (`components/error-notice.tsx`) with a "Try again" button on every list and page that fetches data.
- Actions (save, submit, publish, return to draft, delete): a toast from `lib/toast.ts` shown by `Toaster`, success or error, announced to screen readers. Deleting asks first in a dialog (`alert-dialog`), never with `window.confirm`.
- Connection: `OfflineBanner` appears under the header when the browser goes offline.
- Tone: short, polite sentences that say what happened and what to do next; no codes or technical terms.

## Historic-modern details
The look is a modern layout (Inter, clean cards, plenty of space) with a few manuscript-inspired touches. Keep them few and quiet.
- **Logo plate** (`components/brand-logo.tsx`): the library logo sits on a light plate with a thin gold inner frame, so it stays readable on the dark header and footer. The logo file is small (167 x 83 px), so it is never shown much larger than its natural size.
- **Braid band** (`components/braid-divider.tsx`): two crossing waves, echoing the interlace of medieval Montenegrin manuscripts. Used above the footer.
- **Hero**: a thin gold inner frame with corner brackets, and a caption with progress diamonds for the current slide.
- **Passepartout** (`.passepartout` in `index.css`): a gold frame appears inside card images on hover or focus.
- **Cinnabar** (`--cinnabar`, manuscript red): only for tiny details, such as the initial of the About text and the diamond of the section ornament. Never for text blocks or buttons.
- **Paper grain**: a faint noise on the page background, grey at low opacity so it works in both themes.
