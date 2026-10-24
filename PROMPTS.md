# Prompts and AI workflow

How the app was built with Claude Code (AI-DEV 2026, Workshop 3). The original requests were written in Montenegrin; they are paraphrased here in English. The log follows the order in which things happened and ends with what went wrong and what was learned.

Related documents: [`CLAUDE.md`](CLAUDE.md) (rules for the agent), [`SPEC.md`](SPEC.md) (product), [`PLAN.md`](PLAN.md) (milestones), [`docs/entities.md`](docs/entities.md) (data and API contract), [`frontend/DESIGN.md`](frontend/DESIGN.md) (design).

## At a glance

| | |
|---|---|
| Commits | 21, in two days (23 to 24 October 2026) |
| Source files | 96 TypeScript files in `frontend/src`, in 5 features (`exhibitions`, `auth`, `favorites`, `collections`, `about`) |
| Screens checked | 16, at 375 px and 1440 px |
| Screenshots in the README | 11 |
| Checks run after each change | `typecheck`, `lint` (including the feature boundary check), `build` |

## 1. Way of working

| Principle | How it was applied |
|---|---|
| Plan before code | The agent read the workshop material and wrote `PLAN.md` and a list of open questions before any code was written. |
| Rules in files, not in chat | Architecture, design and language rules live in `CLAUDE.md`, `frontend/CLAUDE.md`, `frontend/DESIGN.md` and `.claude/`, so every session starts from the same rules. |
| Small steps | One topic per request, one commit per step. |
| Verify every step | `pnpm typecheck`, `pnpm lint` and `pnpm build` after each change; changed screens opened in the browser at 375 px and 1440 px. |
| Audit before delivery | A review of the whole project against the workshop rules before the final push. |

## 2. Setup and research

| Request | Result |
|---|---|
| Create a project folder for the virtual exhibitions of the National Library of Montenegro, with `frontend` and `backend` folders. | Monorepo skeleton. |
| Connect to my Slack and read the instructions for this exercise. | The workspace had no instructions, so they were taken from the workshop slides and four example repositories instead. |
| Here is a PDF of an existing exhibition portal. Build a more modern and advanced version with more templates. Do not build anything yet, only look. | The reference was studied; a modernized concept with five templates was proposed. |
| Here are the slides and example repos. Study them, follow the structure, folders, agent instructions and token efficiency, make a plan, and ask what is unclear. | `PLAN.md` and a list of questions. |

### Decisions taken after the questions

- Bilingual: Montenegrin (Latin script) and English.
- Working alone; frontend first, backend in the next workshop.
- Templates: timeline and gallery, plus map, slider and something new such as 3D. The result must not copy the original portal.
- Visual identity from nb-cg.me, content from nb-cg.me and dlib.me.
- Roles: visitor, curator, admin.
- Start from the workshop starter repository.

## 3. Build

| Request | Result |
|---|---|
| Continue with the full build in one pass: design tokens, i18n, mock API, viewers, roles, studio and admin. | Starter copied; design tokens; i18n; mock entities and API; five viewers; auth with roles; curator studio; admin queue; favorites. |
| The menu is a bit dry. Add an About card and a video gallery, improve the visual design, and use real images from the internet. | About, Collections and Video pages; freely licensed images and videos from Wikimedia Commons; hero, stats, animations. |
| Add the nb-cg.me logo somewhere suitable, then make it larger and more visible. | Logo in header and footer on a light plate, with an accessible name. |
| Make the fonts and menus a shade more modern, but keep a historical touch. | Fraunces and Inter; gold sliding underline; double gold rule under the header; ornament dividers. |
| The links to the collections do not work. | The `njegos.dlib.me` certificate had expired (not a bug of ours); the link now points to a working page. |
| After sign-in, redirect to the right page and add a profile page. | Role-based landing page, greeting banner, `/profile` with name, role and saved exhibitions. |
| Use authentic images that match each topic, and show only books and documents in the hero. | Images replaced per topic with titles and licences; hero rotates three book and document scans. |

### Example of a complete prompt

This is the shape of a request that worked well: it names the screen, the behaviour and the "done" criterion.

> After signing in, the user should land on the page for their role: visitor on the home page, curator in the Studio, admin in Administration. Show a short greeting that disappears by itself. Add a `/profile` page for any signed-in user with name, e-mail, a short description of the role and the saved exhibitions. Keep the rules from `CLAUDE.md`: no feature imports another feature, texts in both languages. Done when typecheck, lint and build pass and all three roles were tried in the browser.

## 4. Quality and process

| Request | Result |
|---|---|
| Is everything done according to the workshop rules? | A real audit found: colors hardcoded in components, data fetched in routes, files over 300 lines, a native select, one hardcoded string, a `div` with `onClick`, spacing off the scale. |
| Fix everything, but be careful not to break anything. | Fixed in small commits, each checked with typecheck, lint, build and a browser test. |
| Which process rules from the workshop can you apply here? | The `/check` routine over all 16 screens at 375 px and 1440 px, plus accessibility and contrast checks. It found that stats showed 0 while loading. |
| Look at the screenshots and fix what is wrong. | The header wrapped for staff accounts; it now fits and switches to a hamburger below 1280 px. |
| The dark theme does not work well. Check text visibility and where it can go wrong, then propose what to do. | A contrast scan of 9 pages and the dark-mode screenshots found the real cause (see section 5), and a proposal with three options. |
| Fix it using option A. | A new `on-ink` token for light text on dark surfaces, applied in 8 files; re-scan found no low-contrast text. |
| Check the rest, and whether the visual identity is consistent everywhere. | Review of 14 screens in dark mode at 1440 and 375 px: the identity is consistent; faint form borders, a bright map and a drop-cap misalignment were listed. |
| Fix what is needed. Also: does the user get notices when something fails or loads slowly, and is the site built on modern design principles? | Audit of user feedback, then toasts for every action, an error notice with a retry button, an offline banner, a delete dialog instead of `window.confirm`, and polite bilingual messages. |

## 5. What the agent got wrong, and how it was fixed

Reviewing the result critically was part of the work. These are the real problems found and how each was resolved.

| Problem | Cause | Fix |
|---|---|---|
| 3D hall rendered black. | Space-separated `hsl()` colors are not accepted by the 3D library; picture frames sat behind the wall box. | Comma-separated colors in `lib/scene-palette.ts`; frames moved in front of the wall. |
| 3D pictures failed to load. | The Wikimedia redirect URL has no CORS headers, which WebGL textures require. | Direct thumbnail URLs for the hall, plus an error boundary per frame that falls back to a generated picture. |
| Header broke for staff accounts. | More items (Studio, Administration, name, sign-out) did not fit at 1280 to 1720 px. | Hamburger below 1280 px; header layout measured for 4 roles at 10 widths (40 of 40 combinations correct). |
| Stats showed 0 while loading. | The numbers were rendered before the data arrived. | A dash is shown until the data is loaded. |
| Some images did not match the topic. | A first pass picked images by search term. | Every image was checked against its caption and replaced where needed (for example a photo of another region labelled as Montenegro, and a 1918 masthead used for a 1873 event). |
| Dark theme: text invisible in the header, hero and footer. | The ink surfaces used `text-primary-foreground`, which is dark in dark mode (meant for gold buttons), so text was dark on dark (contrast about 1.1:1). | New `on-ink` token that stays light in both themes, used on every ink surface. |
| Users got no feedback when an action succeeded or failed. | Mutations had no callbacks, errors were a generic line without a retry button, and delete used the browser's `confirm`. | Toast store and `Toaster`, `ErrorNotice` with retry, `OfflineBanner`, and a styled confirmation dialog. |
| Faint borders on form fields (about 1.3:1). | The input border token was almost the page color. | `--input` raised to at least 3:1 against the page in both themes. |
| Component library generated a wrong import. | The shadcn CLI wrote `import { cn } from "cn"`, an unrelated npm package. | Import changed to `@/lib/utils`; the package was removed; `package.json` unchanged. |

## 6. Delivery

README (English and Montenegrin) with screenshots, backend plan, repository description and topics, a release, `SPEC.md`, `PLAN.md`, `docs/entities.md` and this file. The project is marked as an unofficial educational demo.

## 7. Lessons

- Ask for a **plan first**, then build in small steps and commit after each one.
- Put rules into files (`CLAUDE.md`, `DESIGN.md`) so they hold in every session and cost no extra tokens in chat.
- Ask for an **audit against the rules** before the final push; it finds things you did not ask about.
- **Look at the result in the browser** at 375 px and 1440 px. Screenshots found layout bugs that automated checks missed.
- Keep prompts specific: name the files or screens and say what "done" looks like.
- Treat the agent's output as a draft: check images, links and layout yourself, because they look right until they are opened.
