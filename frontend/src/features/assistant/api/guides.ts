import type { Guide } from '../types'

// Ready-made answers about using the site. Only facts that are true for this app are written here.
export const guides: Guide[] = [
  {
    id: 'save',
    question: { me: 'Kako da sačuvam izložbu?', en: 'How do I save an exhibition?' },
    keywords: 'sačuvati sačuvam omiljene srce favoriti save favorite favourites heart bookmark',
    answer: {
      me: 'Kliknite na srce na kartici izložbe ili u čitaču. Sačuvane izložbe nalaze se na stranici „Sačuvano“ i pamte se u vašem pregledaču.',
      en: 'Click the heart on an exhibition card or in the viewer. Saved exhibitions are on the "Saved" page and are remembered in your browser.',
    },
    href: '/favorites',
  },
  {
    id: 'language',
    question: { me: 'Kako da promijenim jezik?', en: 'How do I change the language?' },
    keywords: 'jezik promijeniti engleski crnogorski prevod language english montenegrin translate',
    answer: {
      me: 'Jezik mijenjate dugmetom CG / EN u zaglavlju. Mijenja se i sadržaj izložbi, a stranica ostaje ista.',
      en: 'Change the language with the CG / EN switch in the header. The exhibition content changes too, and you stay on the same page.',
    },
  },
  {
    id: 'theme',
    question: { me: 'Kako da uključim tamnu temu?', en: 'How do I turn on the dark theme?' },
    keywords: 'tamna svijetla tema mod dark light theme mode night',
    answer: {
      me: 'Svijetlu i tamnu temu mijenjate ikonicom sunca ili mjeseca u zaglavlju.',
      en: 'Switch between the light and dark theme with the sun or moon icon in the header.',
    },
  },
  {
    id: 'sign-in',
    question: { me: 'Treba li mi nalog ili prijava?', en: 'Do I need an account or to sign in?' },
    keywords:
      'prijava prijaviti nalog lozinka demo posjetilac kustos administrator osoblje sign login account password staff visitor',
    answer: {
      me: 'Posjetiocima nalog nije potreban: izložbe možete razgledati i čuvati bez prijave. Prijava je za kustose i administratore. Za probu otvorite „Prijava osoblja“ i izaberite demo nalog (lozinka je demo1234).',
      en: 'Visitors do not need an account: you can browse and save exhibitions without signing in. Sign-in is for curators and administrators. To try it, open "Staff sign-in" and pick a demo account (the password is demo1234).',
    },
    href: '/sign-in',
  },
  {
    id: 'create',
    question: { me: 'Kako napraviti izložbu?', en: 'How do I create an exhibition?' },
    keywords: 'napraviti kreirati nova izložba kustos studio create make new exhibition curator',
    answer: {
      me: 'Prijavite se kao kustos, otvorite „Studio“ i izaberite „Nova izložba“. Unesite naslov i sažetak na oba jezika, izaberite način prikaza i dodajte sekcije. Možete sačuvati nacrt ili ga poslati na objavu.',
      en: 'Sign in as a curator, open "Studio" and choose "New exhibition". Enter the title and summary in both languages, pick a template and add sections. You can save a draft or submit it for publishing.',
    },
    href: '/studio',
  },
  {
    id: 'publish',
    question: { me: 'Ko objavljuje izložbe?', en: 'Who publishes exhibitions?' },
    keywords: 'objaviti objava administrator nacrt odobrenje publish approve admin draft pending',
    answer: {
      me: 'Kustos izložbu pošalje na objavu, a administrator je objavljuje ili vraća u nacrt. Tek objavljene izložbe vide svi posjetioci.',
      en: 'A curator submits an exhibition for publishing, and an administrator publishes it or returns it to draft. Only published exhibitions are visible to all visitors.',
    },
  },
  {
    id: 'templates',
    question: { me: 'Koji načini prikaza izložbi postoje?', en: 'Which exhibition templates are there?' },
    keywords:
      'načini prikaza predložak predlošci vremenska traka galerija mapa slider 3D sala knjiga listanje karusel templates timeline gallery book carousel',
    answer: {
      me: 'Sedam: vremenska traka, galerija sa uvećanjem, priča na mapi, slider „prije i poslije“, 3D sala po kojoj se može šetati, knjiga čije se stranice listaju i kružni karusel.',
      en: 'Seven: a timeline, a gallery with lightbox, a map story, a before/after slider, a walkable 3D hall, a page-turning book and a carousel.',
    },
    href: '/exhibitions',
  },
  {
    id: 'catalog',
    question: {
      me: 'Kako da preuzmem katalog ili citiram izložbu?',
      en: 'How do I download the catalogue or cite an exhibition?',
    },
    keywords: 'katalog pdf štampa citat citirati preuzmi catalogue print cite citation download',
    answer: {
      me: 'Na stranici izložbe pritisnite „Preuzmi katalog (PDF)“ i u prozoru za štampu izaberite „Sačuvaj kao PDF“. Gotov citat nalazite pod „Kako citirati“, uz dugme za kopiranje.',
      en: 'On the exhibition page press “Download catalogue (PDF)” and choose “Save as PDF” in the print window. A ready-made citation is under “How to cite”, with a copy button.',
    },
  },
  {
    id: 'room',
    question: { me: 'Kako da razgledam 3D salu?', en: 'How do I look around the 3D hall?' },
    keywords: '3D sala prostor virtuelna šetati room hall virtual walk look around',
    answer: {
      me: 'U 3D sali prevlačite mišem (ili prstom) da pogledate oko sebe, a klikom na okvir otvarate detalje objekta.',
      en: 'In the 3D hall, drag with the mouse (or your finger) to look around, and click a frame to open the details of the object.',
    },
  },
  {
    id: 'map',
    question: { me: 'Čemu služi interaktivna mapa?', en: 'What is the interactive map for?' },
    keywords: 'mapa interaktivna lokacija najbliža gdje map interactive location nearest where',
    answer: {
      me: 'Mapa prikazuje biblioteke Crne Gore i mjesta iz izložbi. Možete pretraživati po gradu, filtrirati po vrsti, vidjeti fotografije i kontakt i pronaći najbližu biblioteku.',
      en: 'The map shows the libraries of Montenegro and the places from exhibitions. You can search by town, filter by type, see photos and contact details and find the nearest library.',
    },
    href: '/map',
  },
  {
    id: 'about',
    question: {
      me: 'Gdje su kontakt i informacije o projektu?',
      en: 'Where are the contact and project details?',
    },
    keywords: 'kontakt o nama projekat informacije contact about project information',
    answer: {
      me: 'Pogledajte stranicu „O nama“. Zvanični sajt Nacionalne biblioteke je nb-cg.me.',
      en: 'See the "About" page. The official website of the National Library is nb-cg.me.',
    },
    href: '/about',
  },
  {
    id: 'licence',
    question: { me: 'Odakle su slike i video zapisi?', en: 'Where do the images and videos come from?' },
    keywords:
      'slike video licenca autor wikimedia commons prava images videos licence license author rights source',
    answer: {
      me: 'Slike i video zapisi su sa Wikimedia Commons pod slobodnim licencama. Autor i licenca prikazani su uz svaki objekat.',
      en: 'Images and videos are from Wikimedia Commons under free licences. The author and licence are shown with each object.',
    },
  },
  {
    id: 'videos',
    question: { me: 'Gdje mogu da gledam video zapise?', en: 'Where can I watch videos?' },
    keywords: 'video zapisi film gledati videos watch film',
    answer: {
      me: 'Svi video zapisi iz izložbi nalaze se u video galeriji, a svaki vodi do svoje izložbe.',
      en: 'All videos from the exhibitions are in the video gallery, and each one links back to its exhibition.',
    },
    href: '/videos',
  },
  {
    id: 'collections',
    question: { me: 'Šta su zbirke?', en: 'What are the collections?' },
    keywords: 'zbirke digitalna biblioteka dlib collections digital library',
    answer: {
      me: 'Zbirke su fondovi digitalne biblioteke dlib.me, od knjiga i periodike do karata i fotografija. Svaka zbirka vodi na dlib.me.',
      en: 'Collections are the holdings of the digital library dlib.me, from books and periodicals to maps and photographs. Each collection links to dlib.me.',
    },
    href: '/collections',
  },
  {
    id: 'official',
    question: { me: 'Da li je ovo zvanični sajt biblioteke?', en: 'Is this the official library website?' },
    keywords: 'zvaničan zvanični sajt nacionalna biblioteka official website demo',
    answer: {
      me: 'Ne. Ovo je edukativni demo projekat. Nije zvanični sajt Nacionalne biblioteke Crne Gore i nije povezan sa njom.',
      en: 'No. This is an educational demo project. It is not the official website of the National Library of Montenegro and is not affiliated with it.',
    },
  },
  {
    id: 'assistant',
    question: { me: 'Da li si ti vještačka inteligencija?', en: 'Are you an AI?' },
    keywords:
      'asistent bot ko si ti vještačka inteligencija ai assistant who are you artificial intelligence',
    answer: {
      me: 'Ne, ja sam demo asistent. Ne koristim vještačku inteligenciju: odgovaram pretragom sadržaja ovog sajta (izložbe, objekti, biblioteke, zbirke) i spremnim uputstvima.',
      en: 'No, I am a demo assistant. I do not use artificial intelligence: I answer by searching the content of this site (exhibitions, objects, libraries, collections) and ready-made guides.',
    },
  },
]
