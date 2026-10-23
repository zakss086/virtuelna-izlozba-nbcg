# Virtuelne izložbe Nacionalne biblioteke Crne Gore

[English version](README.md)

Dvojezična (crnogorski latinica / engleski) platforma na kojoj kustosi od digitalizovane građe prave interaktivne izložbe, a posjetioci ih razgledaju. Inspirisana portalima virtuelnih izložbi nacionalnih biblioteka, sa savremenim izgledom i bogatijim predlošcima. Vizuelni identitet je preuzet sa [nb-cg.me](https://nb-cg.me), a veza je i sa digitalnom bibliotekom [dlib.me](https://dlib.me).

> Stanje: završen je **frontend** (AI-DEV 2026, Radionica 3) na probnim (mock) podacima. Backend slijedi u Radionici 4. Ugovor između njih opisan je u [`docs/entities.md`](docs/entities.md).

![Početna stranica](docs/screenshots/home-desktop.png)

## Šta sajt nudi

- **Pet predložaka izložbi**: vremenska traka, galerija sa uvećanjem, priča na mapi, slider „prije i poslije“ i **3D sala** po kojoj se može šetati.
- **Video galerija** i video zapisi unutar izložbi.
- **Tri uloge**: posjetilac, kustos (pravi i šalje izložbe) i administrator (objavljuje i upravlja korisnicima).
- Dvojezičan sadržaj, svijetla i tamna tema, sačuvane izložbe, prilagođen prikaz od 375 do 1440 px.
- Pristupačnost: semantički HTML, oznake na poljima, vidljiv fokus, kontrast iznad 4.5:1.

| Vremenska traka | Priča na mapi | 3D sala |
|---|---|---|
| ![Vremenska traka](docs/screenshots/timeline-desktop.png) | ![Priča na mapi](docs/screenshots/map-desktop.png) | ![3D sala](docs/screenshots/room-3d-desktop.png) |

## Pokretanje

Potrebni su Node 22+ i pnpm.

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

### Demo nalozi (lozinka `demo1234`)

| Uloga | E-pošta |
|---|---|
| Posjetilac | ana@visitor.me |
| Kustos | marko@nb-cg.me, nikola@nb-cg.me |
| Administrator | jelena@nb-cg.me |

Podaci su u memoriji i vraćaju se na početno stanje pri osvježavanju stranice. Jezik, tema, sačuvane izložbe i prijava čuvaju se u pregledaču.

## Šta koja uloga može

| Uloga | Ekrani i radnje |
|---|---|
| **Posjetilac** | Početna, katalog sa pretragom i filterima, čitači izložbi, detalji objekata, video galerija, zbirke, O nama; čuvanje izložbi; promjena jezika i teme |
| **Kustos** | Sve što i posjetilac, plus **Studio**: pravljenje izložbe na dva jezika, sekcije i objekti, izbor predloška, čuvanje nacrta, slanje na objavu, izmjena i brisanje sopstvenih izložbi |
| **Administrator** | Sve što i kustos, plus **Administracija**: red izložbi na čekanju (objavi ili vrati u nacrt), izmjena svake izložbe, lista korisnika |

Potpuna lista ekrana sa kriterijumima „gotovo je kad“ nalazi se u [`SPEC.md`](SPEC.md) (na engleskom).

## Ekrani

| Ruta | Ekran |
|---|---|
| `/` | Početna |
| `/exhibitions` | Katalog sa pretragom i filterom po predlošku |
| `/exhibitions/:slug` | Čitač izložbe i video zapisi |
| `/collections`, `/videos`, `/about` | Zbirke, video galerija, O nama |
| `/favorites`, `/sign-in`, `/profile` | Sačuvano, prijava (vodi na stranicu za tvoju ulogu), profil |
| `/studio`, `/studio/new`, `/studio/:id/edit` | Pregled i uređivač izložbi (kustos, admin) |
| `/admin` | Red za objavu i korisnici (admin) |

## Tehnologije

React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, React Router, TanStack Query, React Hook Form + Zod, react-three-fiber (3D sala), Leaflet (mapa).

## Kako je rađeno

Projekat prati tok rada radionice sa Claude Code agentom: `CLAUDE.md`, `frontend/DESIGN.md`, pravila u `.claude/`, `SPEC.md`, `PLAN.md` i `PROMPTS.md` (ključni zahtjevi i zaključci). Svaka izmjena provjerena je komandama `typecheck`, `lint` i `build`, a ekrani pregledani na 375 i 1440 px. Dokumentacija i kod su na engleskom, a tekst u aplikaciji je dvojezičan.

## Sljedeće: backend (Radionica 4)

Mock `api/` folderi zamjenjuju se pravim HTTP pozivima, uz bazu po `docs/entities.md`, pravu prijavu sa provjerom uloga na serveru i otpremanje slika i videa. Plan je u [`backend/README.md`](backend/README.md).

## Sadržaj i licence

Tekstovi su ilustrativni. Probne slike i video zapisi su sa [Wikimedia Commons](https://commons.wikimedia.org) pod slobodnim licencama (CC BY, CC BY-SA, javno dobro); autor i licenca prikazani su uz svaki objekat. Logo Nacionalne biblioteke preuzet je sa nb-cg.me za potrebe ovog demoa.
