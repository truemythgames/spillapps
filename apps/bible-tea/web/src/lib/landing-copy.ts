import type { Locale } from "./i18n";

export type LandingId = "bff" | "adults" | "beginners" | "haven";

export interface LandingCopy {
  canonicalPath: string;
  esPath: string;
  campaign: string;
  featuredIds: string[];
  title: string;
  description: string;
  breadcrumb: string;
  h1: string;
  subtitle: string;
  storiesTitle: string;
  storiesSub: string;
  midTitle: string;
  midDesc: string;
  aboutTitle: string;
  about: string[];
  compare: { title: string; them: string; rows: { label: string; tea: string; them: string }[] } | null;
  disclaimer: string;
  faqs: { q: string; a: string }[];
  faqTitle: string;
  finalTitle: string;
  finalDesc: string;
  linkApp: string;
  linkStories: string;
  linkSleep: string;
}

const FEATURED = {
  bff: [
    "hosea-and-gomer",
    "the-witch-of-endor",
    "david-and-goliath",
    "jacob-and-esau",
    "the-good-samaritan",
    "walking-on-water",
    "gethsemane",
    "jonah-and-the-whale",
  ],
  adults: [
    "hosea-and-gomer",
    "the-witch-of-endor",
    "gethsemane",
    "the-rich-man-and-lazarus",
    "the-woman-at-the-well",
    "jacob-wrestles-god",
    "elijah-on-mount-carmel",
    "absaloms-rebellion",
  ],
  beginners: [
    "david-and-goliath",
    "jonah-and-the-whale",
    "the-good-samaritan",
    "walking-on-water",
    "jesus-stops-a-storm",
    "creation",
    "birth-of-jesus",
    "the-resurrection",
  ],
  haven: [
    "the-woman-at-the-well",
    "hosea-and-gomer",
    "john-the-baptists-last-words",
    "jacob-wrestles-god",
    "gethsemane",
    "jesus-stops-a-storm",
    "the-good-samaritan",
    "david-and-goliath",
  ],
} as const;

const EN: Record<LandingId, Omit<LandingCopy, "canonicalPath" | "esPath" | "campaign" | "featuredIds">> = {
  bff: {
    title: "Bible BFF Alternative — Audio Bible Stories | Bible Tea",
    description:
      "Looking for a Bible BFF alternative? Bible Tea is audio Bible stories in a friend’s voice — plus chat, prayer, and a verse widget. Not the Bible BFF app.",
    breadcrumb: "Bible BFF alternative",
    h1: "Bible BFF alternative",
    subtitle:
      "Bible BFF is a different app. If you wanted modern Bible stories that sound like a friend, not a pulpit — that’s Bible Tea. Pick a narrator and hit play.",
    storiesTitle: "Stories people open after they leave",
    storiesSub: "The messy ones. Hosea. Endor. David. A storm that goes still. Hear them in the app.",
    midTitle: "Hear the stories in the app",
    midDesc: "Download Bible Tea. Pick a story. About five minutes. Chat and a verse widget are in there too.",
    aboutTitle: "Bible Tea vs Bible BFF",
    about: [
      "Bible BFF is a different app. Bible Tea is the one that sounds like tea: short audio stories, then prayers, a verse of the day, a home-screen widget, and chat if you want to ask what it means.",
      "If you searched Bible BFF looking for that voice, download Bible Tea.",
    ],
    compare: {
      title: "Side by side",
      them: "Bible BFF",
      rows: [
        { label: "What it is", tea: "Audio Bible stories, told like tea", them: "Modern Bible stories + chat" },
        { label: "Voice", tea: "Storycast narration in the app", them: "Their own narrators" },
        { label: "Chat", tea: "In-app companion, after the story", them: "Chat is a lead feature" },
        { label: "Prayers", tea: "Guided prayers in the app", them: "Not their lead feature" },
        { label: "Verse of the day", tea: "A new verse every morning, on the site and in the app", them: "Check their listing" },
        { label: "Widget", tea: "Home screen and lock screen", them: "Not the reason people search it" },
        { label: "Languages", tea: "English and Spanish", them: "Check their store listing" },
      ],
    },
    disclaimer: "Bible BFF is a trademark of its owners. This page is about Bible Tea. We do not run, rank, or speak for their apps.",
    faqTitle: "Download Bible Tea",
    faqs: [
      {
        q: "Is this Bible BFF?",
        a: "No. This is Bible Tea — stories that sound like tea. Pick a narrator and download it.",
      },
      {
        q: "What’s in the app?",
        a: "Audio Bible stories, guided prayers, verse of the day, a home-screen widget, and chat. English and Spanish.",
      },
      {
        q: "Where do I get it?",
        a: "iPhone or Android. Tap the buttons on this page, pick a story, hit play.",
      },
    ],
    finalTitle: "If you wanted the Bible like tea",
    finalDesc: "Download Bible Tea. Pick a narrator. One story. Then you know.",
    linkApp: "Get the Bible app",
    linkStories: "All stories",
    linkSleep: "Stories for sleep",
  },
  adults: {
    title: "Bible Stories for Adults | Bible Tea",
    description:
      "Bible stories for adults — the real ones, not Sunday-school cuts. Short audio. Hosea, Endor, Gethsemane. Download Bible Tea and hear them.",
    breadcrumb: "Stories for adults",
    h1: "Bible stories for adults",
    subtitle:
      "Not the kids’ version. The real stories: the affair, the séance, the garden, the rich man who would not look down. About five minutes each.",
    storiesTitle: "Start with the ones they skip in class",
    storiesSub: "Hosea and Gomer. The witch of Endor. Gethsemane. Lazarus at the gate.",
    midTitle: "Hear them, don’t cartoon them",
    midDesc: "The audio is in Bible Tea. Download it. Play one. These are not bedtime-for-toddlers stories — unless you want that, then use the sleep page.",
    aboutTitle: "What “Bible stories for adults” means here",
    about: [
      "People search bible stories for adults because the internet is full of coloring-page retellings. The text is not a kids’ book. Hosea buys his wife back. Saul hires a medium. Jesus sweats blood. David’s son tries to take the throne.",
      "Bible Tea tells those stories as short audio — the plot, the people, the punch — without a lecture and without sanding off the edges. You can read a written retelling on the story pages. The voice is in the app.",
      "If you want the lights-out version, that is the sleep page. This page is for people who can handle the text as it is.",
    ],
    compare: null,
    disclaimer: "",
    faqTitle: "Adults, not a kids app",
    faqs: [
      {
        q: "Are these kids’ Bible stories?",
        a: "No. The stories are the biblical ones, told for people who want the plot, not a flannelgraph. Parents use the app. So do people who never went to Sunday school.",
      },
      {
        q: "What are the best Bible stories for adults?",
        a: "The ones the kids’ books skip: Hosea and Gomer, the witch of Endor, Gethsemane, the rich man and Lazarus, Absalom, the woman at the well. They are in Bible Tea as audio.",
      },
      {
        q: "Can I listen to Bible stories at night?",
        a: "Yes. Use Bible stories for sleep if you want the calm ones in bed. This page is the adult catalog — same app, different mood.",
      },
      {
        q: "Is this a replacement for reading the Bible?",
        a: "No. It is a way into the stories. Each episode is tied to the passage. Read the text after if you want the verses themselves.",
      },
      {
        q: "Is Bible Tea only in English?",
        a: "No. The stories are in English and Spanish. Switch language on the site or in the app.",
      },
    ],
    finalTitle: "Play one that is not for children",
    finalDesc: "Download Bible Tea. Hosea. Endor. The garden. Then decide.",
    linkApp: "Get the Bible app",
    linkStories: "All stories",
    linkSleep: "Stories for sleep",
  },
  beginners: {
    title: "Bible for Beginners — Start With the Stories | Bible Tea",
    description:
      "Bible for beginners: don’t start in Leviticus. Start with the stories — David, Jonah, the Good Samaritan — as short audio. Download Bible Tea.",
    breadcrumb: "Bible for beginners",
    h1: "Bible for beginners",
    subtitle:
      "You do not need a reading plan on day one. You need the stories: a giant, a fish, a Samaritan, a storm. Then the rest makes sense.",
    storiesTitle: "Start here, not in Leviticus",
    storiesSub: "David and Goliath. Jonah. The Good Samaritan. Jesus on the water. Creation. Easter.",
    midTitle: "Hear them before you pick a translation",
    midDesc: "Download Bible Tea. Five-minute stories. When you want the verses themselves, any readable translation works — NLT, NIV, a Spanish Reina-Valera. The stories come first.",
    aboutTitle: "How to start the Bible if you have never read it",
    about: [
      "“What Bible should a beginner read?” is the wrong first question. The first question is which story. Genesis 1. David and Goliath. Jonah. The Good Samaritan. The storm. Christmas. Easter. That is the spine. Law codes and genealogies can wait.",
      "Bible Tea is built for that order: short audio retellings, tied to the passage, in a voice that does not assume you already know the names. There is a companion in the app if you want to ask what it means. There is a verse widget when you want one line on your home screen.",
      "This is not a kids’ Beginner’s Bible picture book. It is the actual stories, told so a grown beginner can follow them.",
    ],
    compare: null,
    disclaimer: "",
    faqTitle: "If you are just starting",
    faqs: [
      {
        q: "What Bible should I read as a beginner?",
        a: "A readable one — NLT or NIV in English, Reina-Valera if you want Spanish. But start with the stories, not a cover-to-cover plan. Bible Tea tells those stories as audio so the book is not a wall of names.",
      },
      {
        q: "Where should a beginner start in the Bible?",
        a: "The Gospels (Mark is short), or the big narratives: Creation, David, Jonah, Jesus calming the storm, the Good Samaritan, the Resurrection. Those are on this site and in the app.",
      },
      {
        q: "Is this a Bible for kids?",
        a: "No. It is for people who never got the stories, or who got them only as children and want them back as adults.",
      },
      {
        q: "Do I need to know the Bible already?",
        a: "No. Each story names the people and the passage. You can listen cold.",
      },
      {
        q: "Is Bible Tea a translation?",
        a: "No. It is a retelling of the narrative, faithful to the passage. Read the verses in whatever translation you like after.",
      },
    ],
    finalTitle: "Start with one story",
    finalDesc: "Download Bible Tea. David. Jonah. The Samaritan. You will know more tonight than you did this morning.",
    linkApp: "Get the Bible app",
    linkStories: "All stories",
    linkSleep: "Stories for sleep",
  },
  haven: {
    title: "Haven Bible Chat Alternative | Bible Tea",
    description:
      "Looking for a Haven Bible Chat alternative? Bible Tea is stories first — short audio, then a companion chat, prayers, and a verse widget.",
    breadcrumb: "Haven alternative",
    h1: "Haven Bible Chat alternative",
    subtitle:
      "Haven is a Bible chat app. Bible Tea is a storycast that also chats. If you wanted the stories — and someone to ask after — that’s us.",
    storiesTitle: "Ask after you have heard the story",
    storiesSub: "The well. Hosea. John’s last words. Jacob wrestling. Then talk to the companion.",
    midTitle: "Stories first. Chat second.",
    midDesc: "Download Bible Tea. Play a story. Then ask what it means. Prayer and a daily verse widget are in the same app.",
    aboutTitle: "Bible Tea vs Haven",
    about: [
      "Haven is a different app. Bible Tea is stories first: short audio, then prayers, verse of the day, a home-screen widget, and chat if you want to ask what it means.",
      "If you searched Haven looking for the stories too, download Bible Tea.",
    ],
    compare: {
      title: "Side by side",
      them: "Haven",
      rows: [
        { label: "Lead feature", tea: "Audio Bible stories", them: "Bible chat" },
        { label: "Chat", tea: "Companion after the story", them: "Chat is the product" },
        { label: "Prayers", tea: "Guided prayers in the app", them: "Prayer inside chat" },
        { label: "Verse of the day", tea: "A new verse every morning, on the site and in the app", them: "Check their listing" },
        { label: "Widget", tea: "Home screen and lock screen", them: "Check their listing" },
        { label: "Languages", tea: "English and Spanish", them: "Check their listing" },
      ],
    },
    disclaimer: "Haven is a trademark of its owners. This page is about Bible Tea. We do not run or speak for Haven.",
    faqTitle: "Download Bible Tea",
    faqs: [
      {
        q: "Is this Haven?",
        a: "No. This is Bible Tea. Stories first, then chat, prayers, verse of the day, and a widget.",
      },
      {
        q: "What’s in the app?",
        a: "Audio Bible stories, guided prayers, verse of the day, a home-screen widget, and chat. English and Spanish.",
      },
      {
        q: "Where do I get it?",
        a: "iPhone or Android. Tap the buttons on this page, pick a story, hit play.",
      },
    ],
    finalTitle: "If you wanted the stories too",
    finalDesc: "Download Bible Tea. Hear one. Then ask.",
    linkApp: "Get the Bible app",
    linkStories: "All stories",
    linkSleep: "Stories for sleep",
  },
};

const ES: Record<LandingId, Omit<LandingCopy, "canonicalPath" | "esPath" | "campaign" | "featuredIds">> = {
  bff: {
    title: "Alternativa a Bible BFF — Historias en audio | Bible Tea",
    description:
      "¿Buscas una alternativa a Bible BFF? Bible Tea es historias bíblicas en audio, como té — más chat, oración y widget. No es la app Bible BFF.",
    breadcrumb: "Alternativa a Bible BFF",
    h1: "Alternativa a Bible BFF",
    subtitle:
      "Bible BFF es otra app. Si querías historias bíblicas modernas que suenan como té, no como un púlpito — eso es Bible Tea. Elige un narrador y dale play.",
    storiesTitle: "Las que abren cuando se van",
    storiesSub: "Las difíciles. Oseas. Endor. David. Una tormenta que se calla. Escúchalas en la app.",
    midTitle: "Escucha las historias en la app",
    midDesc: "Descarga Bible Tea. Elige una historia. Unos cinco minutos. También hay chat y un widget de versículo.",
    aboutTitle: "Bible Tea frente a Bible BFF",
    about: [
      "Bible BFF es otra app. Bible Tea es la que suena a té: historias en audio corto, oraciones, versículo del día, widget en la pantalla y chat si quieres preguntar.",
      "Si buscabas Bible BFF por esa voz, descarga Bible Tea.",
    ],
    compare: {
      title: "Lado a lado",
      them: "Bible BFF",
      rows: [
        { label: "Qué es", tea: "Historias bíblicas en audio, como té", them: "Historias modernas + chat" },
        { label: "Voz", tea: "Narración storycast en la app", them: "Sus propios narradores" },
        { label: "Chat", tea: "Compañero después de la historia", them: "El chat es la promesa" },
        { label: "Oraciones", tea: "Oraciones guiadas en la app", them: "No es lo que prometen primero" },
        { label: "Versículo del día", tea: "Uno nuevo cada mañana, en el sitio y en la app", them: "Mira su ficha" },
        { label: "Widget", tea: "Pantalla de inicio y bloqueo", them: "No es por lo que la buscan" },
        { label: "Idiomas", tea: "Inglés y español", them: "Mira su ficha de tienda" },
      ],
    },
    disclaimer: "Bible BFF es marca de sus dueños. Esta página es de Bible Tea. No operamos ni hablamos por sus apps.",
    faqTitle: "Descarga Bible Tea",
    faqs: [
      {
        q: "¿Esto es Bible BFF?",
        a: "No. Esto es Bible Tea — historias que suenan a té. Elige un narrador y descárgala.",
      },
      {
        q: "¿Qué hay en la app?",
        a: "Historias bíblicas en audio, oraciones guiadas, versículo del día, widget en la pantalla y chat. Inglés y español.",
      },
      {
        q: "¿Dónde la bajo?",
        a: "iPhone o Android. Toca los botones de esta página, elige una historia, dale play.",
      },
    ],
    finalTitle: "Si buscabas la Biblia como té",
    finalDesc: "Descarga Bible Tea. Elige un narrador. Una historia. Luego lo sabes.",
    linkApp: "Descarga la app",
    linkStories: "Todas las historias",
    linkSleep: "Historias para dormir",
  },
  adults: {
    title: "Historias bíblicas para adultos | Bible Tea",
    description:
      "Historias bíblicas para adultos — las de verdad, no recortes de escuela dominical. Audio corto. Oseas, Endor, Getsemaní. Descarga Bible Tea.",
    breadcrumb: "Historias para adultos",
    h1: "Historias bíblicas para adultos",
    subtitle:
      "No la versión para niños. Las historias de verdad: el affaire, el séance, el huerto, el rico que no miró hacia abajo. Unos cinco minutos.",
    storiesTitle: "Empieza por las que saltan en clase",
    storiesSub: "Oseas y Gomer. La bruja de Endor. Getsemaní. Lázaro a la puerta.",
    midTitle: "Óyelas. No las conviertas en dibujo.",
    midDesc: "El audio está en Bible Tea. Descárgala. Pon una. No son cuentos para toddlers — si quieres eso, usa la página para dormir.",
    aboutTitle: "Qué significa “para adultos” aquí",
    about: [
      "Quien busca historias bíblicas para adultos está cansado de versiones para colorear. El texto no es un libro infantil. Oseas compra de vuelta a su mujer. Saúl contrata a una médium. Jesús suda sangre. El hijo de David quiere el trono.",
      "Bible Tea cuenta esas historias en audio corto — la trama, la gente, el golpe — sin sermón y sin limar los bordes. En las páginas de cada historia hay un relato escrito. La voz está en la app.",
      "Si quieres la versión con la luz apagada, esa es la página para dormir. Esta es para quien aguanta el texto como es.",
    ],
    compare: null,
    disclaimer: "",
    faqTitle: "Adultos, no una app de niños",
    faqs: [
      {
        q: "¿Son historias bíblicas para niños?",
        a: "No. Son las historias de la Biblia, contadas para quien quiere la trama, no un flanelógrafo. Las usan padres. Y gente que nunca fue a la escuela dominical.",
      },
      {
        q: "¿Cuáles son las mejores historias bíblicas para adultos?",
        a: "Las que los libros infantiles saltan: Oseas y Gomer, la bruja de Endor, Getsemaní, el rico y Lázaro, Absalón, la mujer en el pozo. Están en Bible Tea en audio.",
      },
      {
        q: "¿Puedo escucharlas de noche?",
        a: "Sí. Usa historias bíblicas para dormir si quieres las calmadas en la cama. Esta página es el catálogo adulto — la misma app, otro ánimo.",
      },
      {
        q: "¿Esto reemplaza leer la Biblia?",
        a: "No. Es una entrada a las historias. Cada episodio está atado al pasaje. Lee el texto después si quieres los versículos.",
      },
      {
        q: "¿Bible Tea solo está en inglés?",
        a: "No. Las historias están en inglés y en español. Cambia el idioma en el sitio o en la app.",
      },
    ],
    finalTitle: "Pon una que no es para niños",
    finalDesc: "Descarga Bible Tea. Oseas. Endor. El huerto. Luego decides.",
    linkApp: "Descarga la app",
    linkStories: "Todas las historias",
    linkSleep: "Historias para dormir",
  },
  beginners: {
    title: "Biblia para principiantes — Empieza por las historias | Bible Tea",
    description:
      "Biblia para principiantes: no empieces en Levítico. Empieza por las historias — David, Jonás, el buen samaritano — en audio corto. Descarga Bible Tea.",
    breadcrumb: "Biblia para principiantes",
    h1: "Biblia para principiantes",
    subtitle:
      "No necesitas un plan de lectura el día uno. Necesitas las historias: un gigante, un pez, un samaritano, una tormenta. Luego lo demás encaja.",
    storiesTitle: "Empieza aquí, no en Levítico",
    storiesSub: "David y Goliat. Jonás. El buen samaritano. Jesús sobre el agua. La creación. Pascua.",
    midTitle: "Óyelas antes de elegir traducción",
    midDesc: "Descarga Bible Tea. Historias de cinco minutos. Cuando quieras los versículos, cualquier traducción legible sirve — NVI, NLT, Reina-Valera. Primero las historias.",
    aboutTitle: "Cómo empezar la Biblia si nunca la has leído",
    about: [
      "“¿Qué Biblia leo si empiezo?” es la segunda pregunta. La primera es qué historia. Génesis 1. David y Goliat. Jonás. El buen samaritano. La tormenta. Navidad. Pascua. Eso es el espinazo. Las leyes y las genealogías pueden esperar.",
      "Bible Tea está hecho en ese orden: relatos cortos en audio, atados al pasaje, con una voz que no supone que ya sabes los nombres. En la app hay un compañero si quieres preguntar qué significa. Hay un widget cuando quieres un versículo en la pantalla.",
      "Esto no es La Biblia del principiante para niños. Son las historias de verdad, contadas para que un adulto que empieza pueda seguirlas.",
    ],
    compare: null,
    disclaimer: "",
    faqTitle: "Si recién empiezas",
    faqs: [
      {
        q: "¿Qué Biblia debo leer si soy principiante?",
        a: "Una que se lea — NVI o NLT en inglés, Reina-Valera en español. Pero empieza por las historias, no por un plan de tapa a tapa. Bible Tea las cuenta en audio para que el libro no sea un muro de nombres.",
      },
      {
        q: "¿Por dónde empieza un principiante en la Biblia?",
        a: "Los Evangelios (Marcos es corto) o las narrativas grandes: la creación, David, Jonás, Jesús calma la tormenta, el buen samaritano, la resurrección. Están en este sitio y en la app.",
      },
      {
        q: "¿Esto es una Biblia para niños?",
        a: "No. Es para quien nunca tuvo las historias, o las tuvo solo de niño y las quiere de vuelta como adulto.",
      },
      {
        q: "¿Necesito saber la Biblia ya?",
        a: "No. Cada historia nombra a la gente y el pasaje. Puedes escucharla en frío.",
      },
      {
        q: "¿Bible Tea es una traducción?",
        a: "No. Es un relato de la narrativa, fiel al pasaje. Lee los versículos en la traducción que quieras después.",
      },
    ],
    finalTitle: "Empieza con una historia",
    finalDesc: "Descarga Bible Tea. David. Jonás. El samaritano. Esta noche sabrás más que esta mañana.",
    linkApp: "Descarga la app",
    linkStories: "Todas las historias",
    linkSleep: "Historias para dormir",
  },
  haven: {
    title: "Alternativa a Haven Bible Chat | Bible Tea",
    description:
      "¿Buscas una alternativa a Haven Bible Chat? Bible Tea es primero historias — audio corto, luego chat, oraciones y un widget de versículo.",
    breadcrumb: "Alternativa a Haven",
    h1: "Alternativa a Haven Bible Chat",
    subtitle:
      "Haven es una app de chat bíblico. Bible Tea es un storycast que también conversa. Si querías las historias — y a quién preguntarle después — somos nosotros.",
    storiesTitle: "Pregunta cuando ya oíste la historia",
    storiesSub: "El pozo. Oseas. Las últimas palabras de Juan. Jacob luchando. Luego habla con el compañero.",
    midTitle: "Primero la historia. Después el chat.",
    midDesc: "Descarga Bible Tea. Pon una historia. Luego pregunta qué significa. Oración y widget de versículo diario están en la misma app.",
    aboutTitle: "Bible Tea frente a Haven",
    about: [
      "Haven es otra app. Bible Tea es primero historias: audio corto, oraciones, versículo del día, widget en la pantalla y chat si quieres preguntar.",
      "Si buscabas Haven y también querías las historias, descarga Bible Tea.",
    ],
    compare: {
      title: "Lado a lado",
      them: "Haven",
      rows: [
        { label: "Lo primero", tea: "Historias bíblicas en audio", them: "Chat bíblico" },
        { label: "Chat", tea: "Compañero después de la historia", them: "El chat es el producto" },
        { label: "Oraciones", tea: "Oraciones guiadas en la app", them: "Oración dentro del chat" },
        { label: "Versículo del día", tea: "Uno nuevo cada mañana, en el sitio y en la app", them: "Mira su ficha" },
        { label: "Widget", tea: "Pantalla de inicio y bloqueo", them: "Mira su ficha" },
        { label: "Idiomas", tea: "Inglés y español", them: "Mira su ficha" },
      ],
    },
    disclaimer: "Haven es marca de sus dueños. Esta página es de Bible Tea. No operamos ni hablamos por Haven.",
    faqTitle: "Descarga Bible Tea",
    faqs: [
      {
        q: "¿Esto es Haven?",
        a: "No. Esto es Bible Tea. Primero las historias, luego chat, oraciones, versículo del día y widget.",
      },
      {
        q: "¿Qué hay en la app?",
        a: "Historias bíblicas en audio, oraciones guiadas, versículo del día, widget en la pantalla y chat. Inglés y español.",
      },
      {
        q: "¿Dónde la bajo?",
        a: "iPhone o Android. Toca los botones de esta página, elige una historia, dale play.",
      },
    ],
    finalTitle: "Si también querías las historias",
    finalDesc: "Descarga Bible Tea. Oye una. Luego pregunta.",
    linkApp: "Descarga la app",
    linkStories: "Todas las historias",
    linkSleep: "Historias para dormir",
  },
};

const META: Record<LandingId, Pick<LandingCopy, "canonicalPath" | "esPath" | "campaign"> & { featuredIds: readonly string[] }> = {
  bff: {
    canonicalPath: "/bible-bff-alternative",
    esPath: "/alternativa-bible-bff",
    campaign: "bff",
    featuredIds: FEATURED.bff,
  },
  adults: {
    canonicalPath: "/bible-stories-for-adults",
    esPath: "/historias-biblicas-para-adultos",
    campaign: "adults",
    featuredIds: FEATURED.adults,
  },
  beginners: {
    canonicalPath: "/bible-for-beginners",
    esPath: "/biblia-para-principiantes",
    campaign: "beginners",
    featuredIds: FEATURED.beginners,
  },
  haven: {
    canonicalPath: "/haven-bible-chat-alternative",
    esPath: "/alternativa-haven-bible-chat",
    campaign: "haven",
    featuredIds: FEATURED.haven,
  },
};

export function getLanding(id: LandingId, locale: Locale): LandingCopy {
  const meta = META[id];
  const copy = locale === "es" ? ES[id] : EN[id];
  return {
    ...copy,
    canonicalPath: meta.canonicalPath,
    esPath: meta.esPath,
    campaign: `${locale}-${meta.campaign}`,
    featuredIds: [...meta.featuredIds],
  };
}

export const LANDING_IDS = ["bff", "adults", "beginners", "haven"] as const satisfies LandingId[];
