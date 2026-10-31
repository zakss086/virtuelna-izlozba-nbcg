# Virtuelne izložbe Nacionalne biblioteke Crne Gore

[English version](README.md)

Dvojezična (crnogorski latinica / engleski) platforma na kojoj kustosi od digitalizovane građe prave interaktivne izložbe, a posjetioci ih razgledaju. Inspirisana portalima virtuelnih izložbi nacionalnih biblioteka, sa savremenim izgledom i bogatijim načinima prikaza. Vizuelni identitet je preuzet sa [nb-cg.me](https://nb-cg.me), a veza je i sa digitalnom bibliotekom [dlib.me](https://dlib.me).

> Stanje: u ovom repozitorijumu su **frontend** (AI-DEV 2026, Radionica 3) i **backend** (Radionica 4: FastAPI, baza, prijava, uloge provjerene na serveru). Frontend radi na probnim podacima (`pnpm dev`) ili na backendu (`pnpm dev:api`). Ugovor između njih opisan je u [`docs/entities.md`](docs/entities.md).

> **Napomena:** ovo je samostalan, edukativni demo projekat nastao na radionici. **Nije** zvanični sajt Nacionalne biblioteke Crne Gore, niti je povezan sa njom ili odobren od nje. Naziv i logo biblioteke koriste se samo radi ilustracije, tekstovi su ilustrativni, a probne slike i video zapisi su sa Wikimedia Commons.

![Početna stranica](docs/screenshots/home-desktop.png)

## Šta sajt nudi

- **Osam načina prikaza izložbi**: vremenska traka, galerija sa uvećanjem, priča na mapi, slider „prije i poslije“, **3D sala** po kojoj se može šetati, **knjiga čije se stranice listaju**, **3D karusel** i **kartoteka**.
- **Video galerija** u obliku filmske trake i video zapisi unutar izložbi. Kustos dodaje video u uređivaču: fajl ili samo link sa YouTubea ili Vimeoa, koji se učitava tek kad posjetilac pritisne „Pusti“ (bez tuđih kolačića prije toga).
- **Interaktivna mapa**: biblioteke Crne Gore (sa fotografijama gdje postoji slobodna) i mjesta iz izložbi na jednoj mapi, uokvirenoj na državu, na mirnoj podlozi. Svaka vrsta biblioteke (nacionalna, univerzitetska, narodna, specijalna) ima svoju ikonu i legendu; pretraga koja ne pravi razliku među dijakriticima, filter po vrsti, slojevi, „najbliža biblioteka“ sa udaljenošću do svake biblioteke i listom poređanom po njoj, „Uputi me“ i „Kopiraj link“ na svakoj kartici, a klik bilo gdje na karticu bira je na mapi. **Vremenski klizač** pokazuje mjesta iz izložbi kako se priča odvija (može da se pusti sam), a mjesto otvara **numerisanu rutu** svoje izložbe. Na telefonu se lista i mapa smjenjuju. Izvori: statistika COBISS.CG, OpenStreetMap i Wikimedia Commons.
- **Demo asistent** za posjetioce: odgovara na pitanja o izložbama, objektima, bibliotekama i korišćenju sajta. To je simulacija: ne poziva nikakav AI servis, već pretražuje sadržaj sajta i spremna uputstva, pa ne troši resurse.
- **Provjera izložbe** za kustose u uređivaču: lista provjera (prevod, sažetak, oznake, sekcije, tekstovi, mjesta za mapu, hronologija za vremensku traku) i prijedlozi oznaka, takođe po jednostavnim pravilima.
- **Ozbiljnija stranica izložbe**: kustoski uvod, podaci o izložbi, gotov citat, prebacivanje između svih osam načina prikaza (kustos ga može isključiti za pojedinu izložbu), cio ekran, katalog za štampu (PDF), slične izložbe i prozor objekta sa zumiranjem, dodatnim podacima (signatura, jezik, materijal, dimenzije) i dugmetom za preuzimanje tamo gdje licenca dozvoljava.
- **Bez naloga za posjetioce, dvije uloge osoblja**: posjetioci razgledaju izložbe i čuvaju omiljene u pregledaču; kustosi prave i šalju izložbe na objavu; administratori ih objavljuju i upravljaju nalozima.
- Dvojezičan sadržaj, svijetla i tamna tema, sačuvane izložbe, prilagođen prikaz od 375 do 1440 px.
- **Biblioteke na mapi i zbirke su podaci, ne kod**: administrator ih dodaje, uređuje i briše (Administracija), svaku biblioteku sa podacima, slobodnom fotografijom i autorom i mjestom oznake.
- **Biblioteka medija**: kustosi otpremaju slike i video zapise sa autorom i licencom (Studio -> Biblioteka medija) i biraju sliku objekta u uređivaču izložbe; vrsta fajla se provjerava iz samog fajla, a veličina je ograničena.
- **Uređivanje sadržaja sajta (CMS)**: administrator uređuje 62 teksta (stranice, opisi načina prikaza, uputstva i podnožje) na oba jezika (Administracija -> Uredi sadržaj sajta); posjetioci izmjenu vide odmah, a „Vrati zadano“ vraća početni tekst.
- **Upravljanje nalozima**: administrator pravi nalog osoblja (ime, e-pošta, uloga, prva lozinka), mijenja ulogu, isključuje i uključuje nalog i postavlja novu lozinku (Administracija -> Korisnici). Isključen nalog je odmah zaključan, a administrator ne može sebi da promijeni ulogu ni da isključi svoj nalog.
- **Istorija izmjena**: svako pravljenje, izmjena i brisanje izložbi (sa svakim pomjeranjem statusa), tekstova sajta, biblioteka, zbirki, naloga i otpremljenih fajlova zapisuje se sa tim ko je i kada uradio (Administracija -> Istorija izmjena). Lozinke se nikad ne upisuju.
- **Pregledi pri dijeljenju i pretraga**: podijeljen link prikazuje naslov, sliku i opis izložbe na Facebooku, Viberu i LinkedInu; server služi i `sitemap.xml`, `robots.txt` i strukturirane podatke (schema.org).
- **Brzo učitavanje**: svaka stranica se učitava po potrebi (glavni paket je smanjen sa 895 kB na oko 100 kB komprimovano), a 3D sala i mapa se učitavaju tek kad se otvore.
- Pristupačnost: semantički HTML, oznake na poljima, vidljiv fokus, kontrast iznad 4.5:1.
- Jasne poruke korisniku: prikaz učitavanja, dugme „Pokušaj ponovo“ pri grešci, potvrda ili upozorenje za svaku radnju, potvrda prije brisanja i obavještenje kad se prekine veza.

| Vremenska traka | Priča na mapi | 3D sala |
|---|---|---|
| ![Vremenska traka](docs/screenshots/timeline-desktop.png) | ![Priča na mapi](docs/screenshots/map-desktop.png) | ![3D sala](docs/screenshots/room-3d-desktop.png) |

| Galerija | Slider „prije i poslije“ | Katalog |
|---|---|---|
| ![Galerija](docs/screenshots/gallery-desktop.png) | ![Slider](docs/screenshots/slider-desktop.png) | ![Katalog](docs/screenshots/catalog-desktop.png) |

| Listanje knjige | 3D karusel | Kartoteka |
|---|---|---|
| ![Knjiga](docs/screenshots/book-desktop.png) | ![Karusel](docs/screenshots/carousel-desktop.png) | ![Kartoteka](docs/screenshots/cards-desktop.png) |

| Stranica izložbe (uvod, citat, prebacivanje prikaza) |
|---|
| ![Stranica izložbe](docs/screenshots/exhibition-intro-desktop.png) |

| Studio za kustosa (uređivač) | Administracija | Telefon (375 px) |
|---|---|---|
| ![Uređivač](docs/screenshots/editor-desktop.png) | ![Administracija](docs/screenshots/admin-desktop.png) | ![Početna na telefonu](docs/screenshots/home-mobile.png) |

| Interaktivna mapa | Demo asistent | Provjera izložbe |
|---|---|---|
| ![Interaktivna mapa](docs/screenshots/interactive-map-desktop.png) | ![Asistent](docs/screenshots/assistant-desktop.png) | ![Provjera izložbe](docs/screenshots/editor-check-desktop.png) |

| Video galerija (filmska traka) |
|---|
| ![Video galerija](docs/screenshots/videos-desktop.jpg) |

## Kontekst radionice

Napravljeno za **AI-DEV 2026, Radionica 3: Frontend u AI eri (od HTML-a do React aplikacije)**, održanu 17. oktobra 2026. u Coinis Hubu (Jovan Popović, Anja Pješivac, Stevan Čakić). Program je sufinansiran iz Fonda za inovacije Crne Gore.

**Zadatak:** napraviti frontend sopstvene aplikacije na probnim podacima uz Claude Code: 2 do 3 povezana entiteta, početna, lista sa filterom, stranica sa detaljima, forma za pravljenje i izmjenu i prijava, prilagođeno za 375 i 1440 px, uz `docs/entities.md` za backend.

**Urađeno:** sve navedeno, uz osam načina prikaza izložbi, 3D salu, video galeriju, dvojezični interfejs i dvije uloge osoblja. Backend iz Radionice 4 je u folderu `backend/` (vidi [`backend/README.md`](backend/README.md)).

## Pokretanje

Potrebni su Node 22+ i pnpm.

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm typecheck && pnpm lint && pnpm build
```

### Sa backendom

Potrebni su Python 3.13 i Poetry (detalji u [`backend/README.md`](backend/README.md)).

```bash
cd backend && poetry install && poetry run migrate && poetry run seed && poetry run start   # http://localhost:8000/docs
pnpm dev:api      # u drugom terminalu: isti sajt, ali podaci i prijava dolaze iz API-ja
```

Provjere backenda (`cd backend`): `poetry run lint`, `poetry run typecheck`, `poetry run test` (172 testa) i `poetry run alembic check`. Na svaki push GitHub Actions pokreće provjere backenda i `typecheck`, `lint` i `build` frontenda (`.github/workflows/ci.yml`).

### Demo nalozi (lozinka `demo1234`)

| Uloga | E-pošta | Šta može |
|---|---|---|
| Kustos | marko@nb-cg.me, nikola@nb-cg.me | pravljenje, izmjena i brisanje sopstvenih izložbi, slanje na objavu |
| Administrator | jelena@nb-cg.me | sve navedeno, plus objava ili vraćanje izložbi, upravljanje nalozima, uređivanje tekstova sajta, biblioteka i zbirki, pregled istorije izmjena |

Uz `pnpm dev` podaci su u memoriji i vraćaju se na početno stanje pri osvježavanju stranice; uz `pnpm dev:api` čuvaju se u bazi backenda (`backend/data/app.db`). Jezik, tema i sačuvane izložbe uvijek se čuvaju u pregledaču.

## Šta koja uloga može

| Uloga | Ekrani i radnje |
|---|---|
| **Posjetilac** (bez naloga) | Početna, katalog sa pretragom i filterima, čitači izložbi, detalji objekata, video galerija, zbirke, O nama; čuvanje izložbi; promjena jezika i teme |
| **Kustos** | Sve što i posjetilac, plus **Studio**: pravljenje izložbe na dva jezika, sekcije i objekti, izbor načina prikaza, čuvanje nacrta, slanje na objavu, izmjena i brisanje sopstvenih izložbi |
| **Administrator** | Sve što i kustos, plus **Administracija**: red izložbi na čekanju (objavi ili vrati u nacrt), izmjena svake izložbe, upravljanje nalozima, tekstovi sajta, biblioteke i zbirke, istorija izmjena |

Potpuna lista ekrana sa kriterijumima „gotovo je kad“ nalazi se u [`SPEC.md`](SPEC.md) (na engleskom).

## Ekrani

| Ruta | Ekran |
|---|---|
| `/` | Početna: hero, istaknuta izložba, najnovije, načini prikaza, video zapisi, zbirke |
| `/exhibitions` | Katalog sa pretragom i filterom po načinu prikaza (čuvaju se u adresi) |
| `/exhibitions/:slug` | Čitač izložbe (način prikaza određuje raspored) i video zapisi |
| `/collections`, `/map`, `/videos`, `/about` | Zbirke, interaktivna mapa, video galerija, O nama |
| `/favorites`, `/sign-in`, `/profile` | Sačuvano (pamti se u pregledaču), prijava (vodi na stranicu za tvoju ulogu), profil |
| `/studio`, `/studio/new`, `/studio/:id/edit` | Pregled i uređivač izložbi (kustos, admin) |
| `/studio/media` | Biblioteka medija: otpremanje slika i video zapisa sa autorom i licencom (kustos, admin) |
| `/admin` | Red za objavu i nalozi: pravljenje, promjena uloge, uključivanje i isključivanje, nova lozinka (admin) |
| `/admin/content`, `/admin/libraries`, `/admin/collections`, `/admin/history` | Uređivanje tekstova sajta, biblioteka na mapi i zbirki, i pregled istorije izmjena (admin) |

## Struktura projekta

```
frontend/src/
  app/            ruter, provajderi, raspored, tanki fajlovi ruta (samo sklapaju funkcionalnosti)
  features/
    exhibitions/  tipovi, api/ (probni podaci + hookovi), components/ (kartice, čitači, uređivač)
    collections/  zbirke digitalne biblioteke
    libraries/    biblioteke Crne Gore za interaktivnu mapu: mapa, legenda, vremenski klizač, kartice
    content/      tekstovi sajta koje administrator uređuje (CMS)
    media/        biblioteka medija: otpremanje i izbor slika i video zapisa
    audit/        istorija izmjena (admin)
    assistant/    demo asistent: spremna uputstva i logika odgovora (bez AI servisa)
    auth/         probna prijava, uloge, korisnici
    favorites/    sačuvane izložbe
    about/        sadržaj stranice O nama
  components/     dijeljeni UI (shadcn/ui, slika, reveal, ornament...)
  lib/            i18n, tekstovi (me, en), tema, paleta, mock-db
backend/app/      po jedan folder za svaki domen: auth, users, exhibitions, content, media, libraries, collections, audit, seo
docs/
  entities.md     entiteti i ugovor API-ja koji dijele frontend i backend
  screenshots/    slike korišćene u ovom README-u
.claude/          pravila, komande, agenti, skillovi i hookovi za AI agenta (frontend i backend)
.github/          CI: provjere backenda i frontenda na svaki push
```

Pravila koja provjerava `pnpm lint`: funkcionalnost nikad ne uvozi drugu funkcionalnost, dijeljeni kod ne uvozi funkcionalnosti, a podaci se čitaju samo kroz hookove koji pozivaju `api/` folder te funkcionalnosti.

## Gdje u kodu

Rute i uloge: `frontend/src/app/router.tsx`. Podaci (probni, zamjenjuje ih backend): `frontend/src/features/exhibitions/api/exhibitions-api.ts` i `use-exhibitions.ts`. Osam načina prikaza: `frontend/src/features/exhibitions/components/viewers/`. Boje i teme: `frontend/src/index.css`. Tekstovi na oba jezika: `frontend/src/lib/messages-me.ts` i `messages-en.ts`. Ugovor sa backendom: `docs/entities.md`.

## Tehnologije

React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, React Router, TanStack Query, React Hook Form + Zod, react-three-fiber (3D sala), Leaflet (mapa). Fontovi: Fraunces i Inter.

## Kako je rađeno

Projekat prati tok rada radionice sa Claude Code agentom:

- [`CLAUDE.md`](CLAUDE.md) i [`frontend/CLAUDE.md`](frontend/CLAUDE.md): tehnologije, komande, struktura i lista „gotovo je kad“.
- [`frontend/DESIGN.md`](frontend/DESIGN.md): ton, boje (tokeni u `src/index.css`), fontovi i lista šta izbjegavati.
- [`.claude/rules`](.claude/rules): pravila po putanjama za komponente, podatke, funkcionalnosti, stilove i i18n.
- [`.claude/commands`](.claude/commands) (`/check`, `/new-feature`, `/new-page`, a za backend `/brief`, `/new-entity`, `/review-changes`, `/api-check`), agenti za provjeru (`ui-reviewer`, `api-reviewer`, `contract-keeper`, `migration-reviewer`, `security-reviewer`), skillovi (`design-system`, `backend-patterns`, `check-n1`, `test-endpoint`) i hookovi koji blokiraju destruktivne naredbe i izmjene tajni, lock fajlova i već commitovanih migracija, formatiraju svaki izmijenjeni fajl i pokreću Python provjere kad agent završi.
- [`backend/.claude`](backend/.claude): odluke backenda (ADR), pravila i zapis čestih grešaka.
- [`SPEC.md`](SPEC.md): specifikacija proizvoda (uloge, ekrani, „gotovo je kad“, van obima) i [`PLAN.md`](PLAN.md): plan i etape.
- [`PROMPTS.md`](PROMPTS.md): ključni zahtjevi koji su oblikovali projekat i zaključci.

Svaka izmjena provjerena je komandama `typecheck`, `lint` i `build`, a ekrani pregledani na 375 i 1440 px. Dokumentacija i kod su na engleskom, a tekst u aplikaciji je dvojezičan.

## Šta slijedi

API pokriva izložbe, prijavu, upravljanje nalozima, uređivanje sadržaja sajta, medije, biblioteke, zbirke, istoriju izmjena i stranice za pretraživače. Otvoreno je još:

- **Izlazak u javnost**: produkciono postavljanje (Docker, nginx sa zaštitnim zaglavljima i keširanjem), ograničenje pokušaja prijave, uklanjanje demo naloga i prebacivanje slika i fontova na sopstveni storage biblioteke.
- **Metapodaci za agregatore** (Europeana i slični): standardne oznake prava umjesto slobodnog teksta i izvoz metapodataka.
- **Jezik u adresi** (`/me/...`, `/en/...`), da pretraživači vide obje verzije.
- **Radno vrijeme** biblioteka na mapi i automatski testovi za frontend.

## Sadržaj i licence

Tekstovi su ilustrativni. Probne slike i video zapisi su sa [Wikimedia Commons](https://commons.wikimedia.org) pod slobodnim licencama (CC BY, CC BY-SA, javno dobro); autor i licenca prikazani su uz svaki objekat. Naziv i logo Nacionalne biblioteke preuzeti su sa nb-cg.me isključivo radi ilustracije u ovom edukativnom demou; projekat nije zvaničan i nije povezan sa bibliotekom.
