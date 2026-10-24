# Prompts that shaped the project

How the app was built with Claude Code, in the order things happened. The requests were written in Montenegrin; they are paraphrased here in English. Each entry says what was asked and what came out of it.

## 1. Setup and research

| Request | Result |
|---|---|
| Create a project folder for the virtual exhibitions of the National Library of Montenegro with `frontend` and `backend` folders. | Monorepo skeleton. |
| Connect to my Slack for the exercise instructions. | The Slack workspace was empty, so the instructions came from the workshop slides and the colleagues' repos instead. |
| Look at this PDF to see roughly how the exhibitions should look, but build a more modern and advanced version with more templates. Do not build anything yet. | The reference deck was read; ideas for a modernized version were listed. |
| Here are the workshop slides and four example repos. Study them, follow the structure, folders, agent instructions and token efficiency, then make a plan and ask me what is unclear. | A plan (`PLAN.md`) and a list of questions. |

## 2. Decisions

- Bilingual: Montenegrin (Latin script) and English.
- Working alone; frontend first, backend next week.
- Templates: timeline and gallery, plus map, slider and something new such as 3D, but not a copy of the original portal.
- Visual identity and sample content taken from nb-cg.me and dlib.me.
- Roles: visitor, curator and admin.
- Start from the workshop starter repo.

## 3. Build

| Request | Result |
|---|---|
| Continue with the full build in one pass: design tokens, i18n, mock API, viewers, roles, studio and admin. | Starter copied, design tokens, i18n, mock entities and API, five viewers, auth with roles, curator studio, admin queue, favorites. |
| The menu is a bit dry: add an About card and a video gallery. Improve the visual design and use real images from the internet. | About, Collections and Video pages; real freely licensed images and videos from Wikimedia Commons; a hero, stats and animations. |
| Add the nb-cg.me logo somewhere suitable, then make it larger and more visible. | Logo in the header and footer on a light plate, with an accessible name. |
| Make the fonts and menus a shade more modern, but keep a historical touch. | Fraunces and Inter, a gold sliding underline, a double gold rule under the header and ornament dividers. |
| The links to the collections do not work. | The `njegos.dlib.me` certificate has expired (not our bug); the link now points to a working page. |

## 4. Quality and process

| Request | Result |
|---|---|
| Is everything done according to the workshop rules? | A real audit: colors in components, data in routes, files over 300 lines, a native select, one hardcoded string, a `div` with `onClick`, spacing off the scale. |
| Fix everything, but be careful not to break anything. | Fixed in small commits, each checked with typecheck, lint, build and a browser test. |
| What process rules can you do here? | The `/check` routine over all 16 screens at 375 px and 1440 px, accessibility and contrast checks. It found that stats showed 0 while loading. |
| Look at the screenshots and fix what is wrong. | The header wrapped for staff accounts; it now fits and switches to a hamburger below 1280 px. |

## 5. Delivery

README with screenshots, backend plan, repo description and topics, a release, `SPEC.md` and this file.

## Lessons

- Ask for a **plan first**, then build in small steps and commit after each.
- Ask for an **audit against the rules** before the final push; it finds things you did not ask about.
- **Look at the result in the browser** at 375 px and 1440 px. Screenshots found layout bugs that automated checks missed.
- Keep prompts specific: name the files or screens, and say what "done" looks like.
