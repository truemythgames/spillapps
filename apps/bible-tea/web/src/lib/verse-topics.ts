import type { Locale } from "./i18n";

export interface TopicVerse {
  ref: string;
  esRef: string;
  en: string;
  es: string;
  note: { en: string; es: string };
}

export interface VerseTopic {
  slug: string;
  esSlug: string;
  label: { en: string; es: string };
  h1: { en: string; es: string };
  title: { en: string; es: string };
  description: { en: string; es: string };
  intro: { en: string; es: string };
  prayerSlug: string;
  prayerCta: { en: string; es: string };
  storySlug: string;
  storyCta: { en: string; es: string };
  verses: TopicVerse[];
}

export const VERSE_TOPICS: VerseTopic[] = [
  {
    slug: "strength",
    esSlug: "fortaleza",
    label: { en: "Strength", es: "Fortaleza" },
    h1: { en: "Bible Verses About Strength", es: "Versículos de fortaleza" },
    title: { en: "Bible Verses About Strength | Bible Tea", es: "Versículos de fortaleza | Bible Tea" },
    description: {
      en: "Bible verses about strength and courage when you are tired. Read them here, then pray and hear the story behind them on Bible Tea.",
      es: "Versículos de fortaleza y valor cuando estás cansado. Léelos aquí, ora y escucha la historia detrás en Bible Tea.",
    },
    intro: {
      en: "These are the verses people reach for when the week is heavier than their arms. Strength in scripture is not hype. It is God staying in the room after you have nothing left to prove.",
      es: "Estos son los versículos que se buscan cuando la semana pesa más que los brazos. La fortaleza en la Escritura no es un grito. Es Dios que se queda en la habitación cuando ya no te queda nada que demostrar.",
    },
    prayerSlug: "facing-giants",
    prayerCta: { en: "Prayer for Strength", es: "Oración para la fortaleza" },
    storySlug: "david-and-goliath",
    storyCta: { en: "David and Goliath", es: "David y Goliat" },
    verses: [
      { ref: "Isaiah 40:31", esRef: "Isaías 40:31", en: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles.", es: "Los que esperan en el Señor renovarán sus fuerzas; levantarán alas como las águilas.", note: { en: "Strength here is a wait, not a grind. Hope is the thing that grows the wings.", es: "La fuerza aquí es una espera, no un esfuerzo. La esperanza es lo que crece las alas." } },
      { ref: "Philippians 4:13", esRef: "Filipenses 4:13", en: "I can do all things through Christ who strengthens me.", es: "Todo lo puedo en Cristo que me fortalece.", note: { en: "Paul wrote this from need, not from a trophy stage. The strength is borrowed.", es: "Pablo lo escribió desde la necesidad, no desde un podio. La fuerza se pide prestada." } },
      { ref: "Joshua 1:9", esRef: "Josué 1:9", en: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", es: "Sé fuerte y valiente. No temas ni desmayes, porque el Señor tu Dios estará contigo dondequiera que vayas.", note: { en: "Courage is commanded because the presence is promised. You do not invent either one.", es: "El valor se manda porque la presencia está prometida. Tú no inventas ninguna de las dos." } },
      { ref: "Nehemiah 8:10", esRef: "Nehemías 8:10", en: "The joy of the Lord is your strength.", es: "El gozo del Señor es vuestra fortaleza.", note: { en: "Joy is not a mood you fake. It is fuel God hands you when the wall is only half built.", es: "El gozo no es un ánimo fingido. Es el combustible que Dios te da cuando el muro va a medias." } },
      { ref: "Isaiah 40:29", esRef: "Isaías 40:29", en: "He gives strength to the weary and increases the power of the weak.", es: "Él da esfuerzo al cansado y multiplica las fuerzas al que no tiene ningunas.", note: { en: "The audience is the tired, not the impressive. That is the whole point.", es: "El público es el cansado, no el impresionante. Ese es el punto." } },
      { ref: "Psalm 46:1", esRef: "Salmo 46:1", en: "God is our refuge and strength, an ever-present help in trouble.", es: "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.", note: { en: "Refuge first, then strength. You hide before you stand back up.", es: "Primero el amparo, luego la fuerza. Te escondes antes de volver a levantarte." } },
      { ref: "2 Corinthians 12:9", esRef: "2 Corintios 12:9", en: "My grace is sufficient for you, for my power is made perfect in weakness.", es: "Te basta mi gracia, porque mi poder se perfecciona en la debilidad.", note: { en: "The weak place is not the delay. It is the opening.", es: "El lugar débil no es la demora. Es la abertura." } },
      { ref: "Ephesians 6:10", esRef: "Efesios 6:10", en: "Be strong in the Lord and in His mighty power.", es: "Fortalézcanse en el Señor y en el poder de Su fuerza.", note: { en: "The verb is passive on purpose. You are strengthened. You do not flex your way there.", es: "El verbo es pasivo a propósito. Eres fortalecido. No llegas flexionando." } },
    ],
  },
  {
    slug: "love",
    esSlug: "amor",
    label: { en: "Love", es: "Amor" },
    h1: { en: "Bible Verses About Love", es: "Versículos de amor" },
    title: { en: "Bible Verses About Love | Bible Tea", es: "Versículos de amor | Bible Tea" },
    description: {
      en: "Bible verses about love — patient, kind, and not a performance. Read 1 Corinthians 13 and more, then hear the stories on Bible Tea.",
      es: "Versículos de amor: paciente, bondadoso, no un espectáculo. Lee 1 Corintios 13 y más, luego escucha las historias en Bible Tea.",
    },
    intro: {
      en: "Love in the Bible stays when it costs something. These are the verses people reach for when a relationship is sweet — or when it is barely standing.",
      es: "El amor en la Biblia se queda cuando cuesta. Estos son los versículos que se buscan cuando una relación es dulce — o cuando apenas se sostiene.",
    },
    prayerSlug: "marriage",
    prayerCta: { en: "Prayer for Your Marriage", es: "Oración para el matrimonio" },
    storySlug: "hosea-and-gomer",
    storyCta: { en: "Hosea and Gomer", es: "Oseas y Gomer" },
    verses: [
      { ref: "1 Corinthians 13:4", esRef: "1 Corintios 13:4", en: "Love is patient, love is kind. It does not envy, it does not boast.", es: "El amor es paciente, es bondadoso. El amor no es envidioso ni jactancioso.", note: { en: "Paul defines love by what it refuses to do. Patience is the first word on purpose.", es: "Pablo define el amor por lo que se niega a hacer. La paciencia es la primera palabra a propósito." } },
      { ref: "1 John 4:8", esRef: "1 Juan 4:8", en: "Whoever does not love does not know God, because God is love.", es: "El que no ama no ha conocido a Dios, porque Dios es amor.", note: { en: "Love is not a hobby God enjoys. It is who He is.", es: "El amor no es un pasatiempo de Dios. Es quien Él es." } },
      { ref: "John 3:16", esRef: "Juan 3:16", en: "For God so loved the world that He gave His only Son, that whoever believes in Him shall not perish but have eternal life.", es: "Porque de tal manera amó Dios al mundo, que ha dado a Su Hijo unigénito, para que todo aquel que en Él cree no se pierda, mas tenga vida eterna.", note: { en: "The measure of the love is the cost. He did not send a speech. He sent a Son.", es: "La medida del amor es el costo. No envió un discurso. Envió a un Hijo." } },
      { ref: "1 John 4:19", esRef: "1 Juan 4:19", en: "We love because He first loved us.", es: "Nosotros le amamos a Él, porque Él nos amó primero.", note: { en: "You are not the source. You are the echo.", es: "Tú no eres la fuente. Eres el eco." } },
      { ref: "Romans 5:8", esRef: "Romanos 5:8", en: "God demonstrates His own love for us in this: while we were still sinners, Christ died for us.", es: "Dios muestra Su amor para con nosotros, en que siendo aún pecadores, Cristo murió por nosotros.", note: { en: "He did not wait for you to become easy to love.", es: "No esperó a que fueras fácil de amar." } },
      { ref: "John 13:34", esRef: "Juan 13:34", en: "A new command I give you: love one another. As I have loved you, so you must love one another.", es: "Un mandamiento nuevo os doy: que os améis unos a otros; como yo os he amado.", note: { en: "The standard is not how they treated you. It is how He treated you.", es: "La medida no es cómo te trataron. Es cómo te trató Él." } },
      { ref: "1 Peter 4:8", esRef: "1 Pedro 4:8", en: "Above all, love each other deeply, because love covers over a multitude of sins.", es: "Sobre todo, ámense unos a otros profundamente, porque el amor cubre multitud de pecados.", note: { en: "Cover does not mean pretend. It means you stop keeping the receipt.", es: "Cubrir no es fingir. Es dejar de guardar el recibo." } },
      { ref: "Jeremiah 31:3", esRef: "Jeremías 31:3", en: "I have loved you with an everlasting love.", es: "Con amor eterno te he amado.", note: { en: "Everlasting means it did not start with your good week.", es: "Eterno significa que no empezó con tu buena semana." } },
    ],
  },
  {
    slug: "healing",
    esSlug: "sanidad",
    label: { en: "Healing", es: "Sanidad" },
    h1: { en: "Bible Verses About Healing", es: "Versículos de sanidad" },
    title: { en: "Bible Verses About Healing | Bible Tea", es: "Versículos de sanidad | Bible Tea" },
    description: {
      en: "Bible verses about healing for a body or a heart that is not well. Read them, then pray for healing on Bible Tea.",
      es: "Versículos de sanidad para un cuerpo o un corazón que no está bien. Léelos y luego ora por sanidad en Bible Tea.",
    },
    intro: {
      en: "Scripture does not treat sickness as a small inconvenience. It also does not pretend every fever ends in a miracle by Friday. These verses hold both the asking and the waiting.",
      es: "La Escritura no trata la enfermedad como un percance menor. Tampoco finge que cada fiebre termina en milagro el viernes. Estos versículos sostienen el pedido y la espera.",
    },
    prayerSlug: "physical-healing",
    prayerCta: { en: "Prayer for Healing", es: "Oración para la sanidad" },
    storySlug: "healing-at-the-pool",
    storyCta: { en: "Healing at the pool", es: "Sanidad en el estanque" },
    verses: [
      { ref: "Psalm 103:3", esRef: "Salmo 103:3", en: "He forgives all your sins and heals all your diseases.", es: "Él es quien perdona todas tus iniquidades, el que sana todas tus dolencias.", note: { en: "Forgiveness and healing sit in the same sentence. The whole person is in view.", es: "El perdón y la sanidad van en la misma frase. Se mira a la persona entera." } },
      { ref: "Jeremiah 17:14", esRef: "Jeremías 17:14", en: "Heal me, Lord, and I will be healed; save me and I will be saved, for You are the one I praise.", es: "Sáname, Señor, y seré sano; sálvame y seré salvo, porque Tú eres mi alabanza.", note: { en: "This is a prayer, not a slogan. Healing starts as a sentence you say out loud.", es: "Esto es una oración, no un lema. La sanidad empieza como una frase dicha en voz alta." } },
      { ref: "James 5:15", esRef: "Santiago 5:15", en: "The prayer offered in faith will make the sick person well; the Lord will raise them up.", es: "La oración de fe salvará al enfermo, y el Señor lo levantará.", note: { en: "James puts healing in a room with other people, not in a private pep talk.", es: "Santiago pone la sanidad en una habitación con otras personas, no en un ánimo privado." } },
      { ref: "Psalm 147:3", esRef: "Salmo 147:3", en: "He heals the brokenhearted and binds up their wounds.", es: "Él sana a los quebrantados de corazón y venda sus heridas.", note: { en: "Some wounds never show on a scan. He still calls them wounds.", es: "Algunas heridas no salen en un examen. Él igual las llama heridas." } },
      { ref: "Isaiah 53:5", esRef: "Isaías 53:5", en: "By His wounds we are healed.", es: "Por Su llaga fuimos nosotros curados.", note: { en: "The healer pays first. That is the strange math of the cross.", es: "El sanador paga primero. Esa es la matemática extraña de la cruz." } },
      { ref: "Matthew 11:28", esRef: "Mateo 11:28", en: "Come to me, all you who are weary and burdened, and I will give you rest.", es: "Vengan a mí todos los que están cansados y agobiados, y yo les daré descanso.", note: { en: "Rest is a kind of healing too. Sometimes it is the first kind you can receive.", es: "El descanso también es una sanidad. A veces es la primera que puedes recibir." } },
      { ref: "Exodus 15:26", esRef: "Éxodo 15:26", en: "I am the Lord, who heals you.", es: "Yo soy el Señor tu sanador.", note: { en: "He names Himself by the work. Healer is not a side job.", es: "Se nombra por la obra. Sanador no es un trabajo extra." } },
      { ref: "3 John 1:2", esRef: "3 Juan 1:2", en: "I pray that you may enjoy good health and that all may go well with you.", es: "Oro para que seas prosperado en todas las cosas y que tengas salud.", note: { en: "The early church thought it was normal to ask God for a well body.", es: "La iglesia primitiva pensaba que era normal pedirle a Dios un cuerpo sano." } },
    ],
  },
  {
    slug: "anxiety",
    esSlug: "ansiedad",
    label: { en: "Anxiety", es: "Ansiedad" },
    h1: { en: "Bible Verses for Anxiety", es: "Versículos para la ansiedad" },
    title: { en: "Bible Verses for Anxiety | Bible Tea", es: "Versículos para la ansiedad | Bible Tea" },
    description: {
      en: "Bible verses for anxiety when your mind will not sit down. Philippians 4, 1 Peter 5, and a prayer you can actually say.",
      es: "Versículos para la ansiedad cuando la mente no se sienta. Filipenses 4, 1 Pedro 5, y una oración que sí puedes decir.",
    },
    intro: {
      en: "Anxiety is not a lack of faith with a worse branding. Scripture talks to the racing mind without shaming it. These verses give the mind somewhere to put the weight.",
      es: "La ansiedad no es falta de fe con peor nombre. La Escritura habla a la mente acelerada sin avergonzarla. Estos versículos le dan a la mente un lugar donde dejar el peso.",
    },
    prayerSlug: "anxious-thoughts",
    prayerCta: { en: "Prayer for Anxiety", es: "Oración para la ansiedad" },
    storySlug: "elijah-runs-from-jezebel",
    storyCta: { en: "Elijah runs from Jezebel", es: "Elías huye de Jezabel" },
    verses: [
      { ref: "Philippians 4:6", esRef: "Filipenses 4:6", en: "Do not be anxious about anything, but in every situation, by prayer and petition, present your requests to God.", es: "No se inquieten por nada; más bien, en toda ocasión, con oración y ruego, presenten sus peticiones a Dios.", note: { en: "The opposite of anxiety here is not chill. It is asking.", es: "Lo contrario de la ansiedad aquí no es la calma. Es pedir." } },
      { ref: "1 Peter 5:7", esRef: "1 Pedro 5:7", en: "Cast all your anxiety on Him because He cares for you.", es: "Echando toda su ansiedad sobre Él, porque Él tiene cuidado de ustedes.", note: { en: "Cast is a verb with a direction. Off you. Onto Him. Because He wants it.", es: "Echar es un verbo con dirección. Fuera de ti. Sobre Él. Porque Él lo quiere." } },
      { ref: "Matthew 6:34", esRef: "Mateo 6:34", en: "Do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.", es: "No se angustien por el mañana, el cual tendrá sus propios afanes. Cada día tiene su propio mal.", note: { en: "Jesus does not deny the trouble. He just will not let tomorrow steal today.", es: "Jesús no niega el mal. Solo no deja que el mañana robe el hoy." } },
      { ref: "Psalm 94:19", esRef: "Salmo 94:19", en: "When anxiety was great within me, Your consolation brought me joy.", es: "En la multitud de mis pensamientos dentro de mí, Tus consolaciones alegraban mi alma.", note: { en: "The psalm admits the volume of the thoughts. Then it names the comfort.", es: "El salmo admite el volumen de los pensamientos. Luego nombra el consuelo." } },
      { ref: "John 14:27", esRef: "Juan 14:27", en: "Peace I leave with you; my peace I give you. Do not let your hearts be troubled and do not be afraid.", es: "La paz les dejo, mi paz les doy. No se turbe su corazón ni tenga miedo.", note: { en: "This peace is a gift, not a personality type.", es: "Esta paz es un regalo, no un tipo de personalidad." } },
      { ref: "Psalm 55:22", esRef: "Salmo 55:22", en: "Cast your cares on the Lord and He will sustain you.", es: "Echa sobre el Señor tu carga, y Él te sustentará.", note: { en: "Sustain is slower than fix. He keeps you standing while the thing is still there.", es: "Sustentar es más lento que arreglar. Él te mantiene en pie mientras la cosa sigue ahí." } },
      { ref: "Isaiah 41:10", esRef: "Isaías 41:10", en: "Do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.", es: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios. Te fortaleceré y te ayudaré.", note: { en: "The reason not to fear is a person in the room, not a feeling you manufactured.", es: "La razón para no temer es una persona en la habitación, no un sentimiento que fabricaste." } },
      { ref: "Psalm 46:10", esRef: "Salmo 46:10", en: "Be still, and know that I am God.", es: "Quédense quietos y reconozcan que yo soy Dios.", note: { en: "Stillness is how you remember who is actually in charge of the night.", es: "La quietud es cómo recuerdas quién manda de verdad en la noche." } },
    ],
  },
  {
    slug: "encouragement",
    esSlug: "animo",
    label: { en: "Encouragement", es: "Ánimo" },
    h1: { en: "Encouraging Bible Verses", es: "Versículos de ánimo" },
    title: { en: "Encouraging Bible Verses | Bible Tea", es: "Versículos de ánimo | Bible Tea" },
    description: {
      en: "Encouraging Bible verses for a day that already feels lost. Short scripture that talks you back onto your feet.",
      es: "Versículos de ánimo para un día que ya se siente perdido. Escritura corta que te vuelve a poner de pie.",
    },
    intro: {
      en: "Encouragement in the Bible is not a compliment. It is someone telling the truth about God when you cannot remember it. These are the verses that do that work.",
      es: "El ánimo en la Biblia no es un cumplido. Es alguien diciendo la verdad sobre Dios cuando tú no la recuerdas. Estos versículos hacen ese trabajo.",
    },
    prayerSlug: "endurance",
    prayerCta: { en: "Prayer for Endurance", es: "Oración para la perseverancia" },
    storySlug: "finish-the-race",
    storyCta: { en: "Finish the race", es: "Termina la carrera" },
    verses: [
      { ref: "Joshua 1:9", esRef: "Josué 1:9", en: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", es: "Sé fuerte y valiente. No temas ni desmayes, porque el Señor tu Dios estará contigo dondequiera que vayas.", note: { en: "Discouraged is named out loud. God does not skip that word.", es: "El desmayo se nombra en voz alta. Dios no se salta esa palabra." } },
      { ref: "Romans 8:28", esRef: "Romanos 8:28", en: "And we know that in all things God works for the good of those who love Him.", es: "Sabemos que Dios hace que todas las cosas cooperen para el bien de los que le aman.", note: { en: "All things is not the same as all things were good. He works in them.", es: "Todas las cosas no es lo mismo que todas fueron buenas. Él trabaja en ellas." } },
      { ref: "Jeremiah 29:11", esRef: "Jeremías 29:11", en: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.", es: "Porque yo sé los planes que tengo para ustedes, dice el Señor, planes de bienestar y no de calamidad.", note: { en: "Spoken to people in exile, not people on a mountain. The plan includes the wait.", es: "Dicho a gente en el exilio, no en una montaña. El plan incluye la espera." } },
      { ref: "Philippians 1:6", esRef: "Filipenses 1:6", en: "He who began a good work in you will carry it on to completion.", es: "El que comenzó en ustedes la buena obra la perfeccionará hasta el día de Jesucristo.", note: { en: "You are mid-sentence. He finishes things He starts.", es: "Estás a mitad de frase. Él termina lo que empieza." } },
      { ref: "Psalm 27:1", esRef: "Salmo 27:1", en: "The Lord is my light and my salvation — whom shall I fear?", es: "El Señor es mi luz y mi salvación, ¿a quién temeré?", note: { en: "The question is rhetorical because the light is already on.", es: "La pregunta es retórica porque la luz ya está encendida." } },
      { ref: "Romans 8:31", esRef: "Romanos 8:31", en: "If God is for us, who can be against us?", es: "Si Dios es por nosotros, ¿quién contra nosotros?", note: { en: "For us is the whole argument. Everything else is smaller.", es: "Por nosotros es todo el argumento. Todo lo demás es más chico." } },
      { ref: "Lamentations 3:23", esRef: "Lamentaciones 3:23", en: "His mercies are new every morning; great is Your faithfulness.", es: "Nuevas son cada mañana; grande es Tu fidelidad.", note: { en: "Yesterday used up yesterday's mercy. This morning got its own.", es: "Ayer usó la misericordia de ayer. Esta mañana trajo la suya." } },
      { ref: "Hebrews 13:5", esRef: "Hebreos 13:5", en: "I will never leave you nor forsake you.", es: "Nunca te dejaré ni te desampararé.", note: { en: "Never is a long word. It covers the hour you are in.", es: "Nunca es una palabra larga. Cubre la hora en la que estás." } },
    ],
  },
  {
    slug: "protection",
    esSlug: "proteccion",
    label: { en: "Protection", es: "Protección" },
    h1: { en: "Bible Verses About Protection", es: "Versículos de protección" },
    title: { en: "Bible Verses About Protection | Bible Tea", es: "Versículos de protección | Bible Tea" },
    description: {
      en: "Bible verses about protection — Psalm 91, the name of the Lord as a tower, and a night prayer when you cannot sleep.",
      es: "Versículos de protección: Salmo 91, el nombre del Señor como torre, y una oración de noche cuando no puedes dormir.",
    },
    intro: {
      en: "Protection in scripture is not a lucky charm. It is a God who covers people who are actually afraid of the dark. These verses are the ones you say before the house goes quiet.",
      es: "La protección en la Escritura no es un amuleto. Es un Dios que cubre a gente que de verdad le tiene miedo a la oscuridad. Estos son los versículos que se dicen antes de que la casa se calle.",
    },
    prayerSlug: "protection-through-night",
    prayerCta: { en: "Prayer for Protection", es: "Oración para la protección" },
    storySlug: "psalm-91-gods-protection",
    storyCta: { en: "Psalm 91", es: "Salmo 91" },
    verses: [
      { ref: "Psalm 91:1", esRef: "Salmo 91:1", en: "Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty.", es: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.", note: { en: "Shelter is a place you stay, not a verse you quote once.", es: "El abrigo es un lugar donde te quedas, no un versículo que citas una vez." } },
      { ref: "Psalm 91:11", esRef: "Salmo 91:11", en: "He will command His angels concerning you to guard you in all your ways.", es: "Pues a Sus ángeles mandará acerca de ti, que te guarden en todos tus caminos.", note: { en: "Guard is an assigned job. You are not walking unwatched.", es: "Guardar es un trabajo asignado. No caminas sin vigilancia." } },
      { ref: "Proverbs 18:10", esRef: "Proverbios 18:10", en: "The name of the Lord is a fortified tower; the righteous run to it and are safe.", es: "Torre fuerte es el nombre del Señor; a él corre el justo y se siente seguro.", note: { en: "You run. The tower does not come to you while you keep scrolling.", es: "Tú corres. La torre no viene a ti mientras sigues deslizando la pantalla." } },
      { ref: "Isaiah 54:17", esRef: "Isaías 54:17", en: "No weapon forged against you will prevail.", es: "Ninguna arma forjada contra ti prosperará.", note: { en: "Forged means someone meant it. Prevail means it still loses.", es: "Forjada significa que alguien lo quiso. Prosperará significa que igual pierde." } },
      { ref: "Psalm 121:7", esRef: "Salmo 121:7", en: "The Lord will keep you from all harm — He will watch over your life.", es: "El Señor te preservará de todo mal; Él preservará tu alma.", note: { en: "Watch over is the long shift. He does not clock out at midnight.", es: "Preservar es el turno largo. Él no sale a medianoche." } },
      { ref: "2 Thessalonians 3:3", esRef: "2 Tesalonicenses 3:3", en: "The Lord is faithful, and He will strengthen you and protect you from the evil one.", es: "Fiel es el Señor, que os afirmará y guardará del mal.", note: { en: "Faithful is why the protection holds. Not your alertness.", es: "Fiel es la razón por la que la protección se sostiene. No tu alerta." } },
      { ref: "Psalm 27:1", esRef: "Salmo 27:1", en: "The Lord is my light and my salvation — whom shall I fear?", es: "El Señor es mi luz y mi salvación, ¿a quién temeré?", note: { en: "Light first. Fear looks smaller when the room is lit.", es: "Primero la luz. El miedo se ve más chico con la habitación iluminada." } },
      { ref: "Zephaniah 3:17", esRef: "Sofonías 3:17", en: "The Lord your God is with you, the Mighty Warrior who saves.", es: "El Señor tu Dios está en medio de ti como guerrero victorioso.", note: { en: "Warrior is not a metaphor for your grit. It is who showed up.", es: "Guerrero no es una metáfora de tu temple. Es quién llegó." } },
    ],
  },
  {
    slug: "peace",
    esSlug: "paz",
    label: { en: "Peace", es: "Paz" },
    h1: { en: "Bible Verses About Peace", es: "Versículos de paz" },
    title: { en: "Bible Verses About Peace | Bible Tea", es: "Versículos de paz | Bible Tea" },
    description: {
      en: "Bible verses about peace that is not the same as a quiet house. John 14, Philippians 4, and a prayer for the storm.",
      es: "Versículos de paz que no son lo mismo que una casa en silencio. Juan 14, Filipenses 4, y una oración para la tormenta.",
    },
    intro: {
      en: "Biblical peace can sit in a boat that is still taking on water. It is Christ in the middle, not a life with no weather. These verses name that kind of calm.",
      es: "La paz bíblica puede sentarse en un bote que sigue haciendo agua. Es Cristo en el medio, no una vida sin clima. Estos versículos nombran esa calma.",
    },
    prayerSlug: "peace-in-chaos",
    prayerCta: { en: "Prayer for Peace", es: "Oración para la paz" },
    storySlug: "jesus-stops-a-storm",
    storyCta: { en: "Jesus stops a storm", es: "Jesús detiene una tormenta" },
    verses: [
      { ref: "John 14:27", esRef: "Juan 14:27", en: "Peace I leave with you; my peace I give you. I do not give to you as the world gives.", es: "La paz les dejo, mi paz les doy. Yo no se la doy como el mundo la da.", note: { en: "World-peace ends when the news refreshes. His does not.", es: "La paz del mundo se acaba cuando se actualiza la noticia. La de Él no." } },
      { ref: "Philippians 4:7", esRef: "Filipenses 4:7", en: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.", es: "Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.", note: { en: "Guard is a military word. Peace stands at the door of the mind.", es: "Guardar es una palabra militar. La paz se para en la puerta de la mente." } },
      { ref: "Isaiah 26:3", esRef: "Isaías 26:3", en: "You will keep in perfect peace those whose minds are steadfast, because they trust in You.", es: "Tú guardarás en completa paz a aquel cuyo pensamiento en Ti persevera, porque en Ti ha confiado.", note: { en: "Steadfast is a mind that keeps coming back, not a mind that never wanders.", es: "Firme es una mente que vuelve, no una que nunca se distrae." } },
      { ref: "Psalm 46:10", esRef: "Salmo 46:10", en: "Be still, and know that I am God.", es: "Quédense quietos y reconozcan que yo soy Dios.", note: { en: "Still is how you stop arguing with a God who already has the last word.", es: "Quieto es cómo dejas de discutir con un Dios que ya tiene la última palabra." } },
      { ref: "Colossians 3:15", esRef: "Colosenses 3:15", en: "Let the peace of Christ rule in your hearts.", es: "Y la paz de Cristo gobierne en sus corazones.", note: { en: "Rule means it gets to break up the fight inside you.", es: "Gobernar significa que puede separar la pelea que llevas dentro." } },
      { ref: "Numbers 6:24-26", esRef: "Números 6:24-26", en: "The Lord bless you and keep you; the Lord make His face shine on you and be gracious to you; the Lord turn His face toward you and give you peace.", es: "El Señor te bendiga y te guarde; el Señor haga resplandecer Su rostro sobre ti y tenga de ti misericordia; el Señor alce sobre ti Su rostro y ponga en ti paz.", note: { en: "Peace is the last word of the oldest blessing. It is where the face of God lands.", es: "La paz es la última palabra de la bendición más antigua. Es donde aterriza el rostro de Dios." } },
      { ref: "John 16:33", esRef: "Juan 16:33", en: "In this world you will have trouble. But take heart! I have overcome the world.", es: "En el mundo tendréis aflicción; pero confiad, yo he vencido al mundo.", note: { en: "Trouble is promised. Overcome is promised louder.", es: "La aflicción está prometida. Vencido se promete más alto." } },
      { ref: "Romans 15:13", esRef: "Romanos 15:13", en: "May the God of hope fill you with all joy and peace as you trust in Him.", es: "Y el Dios de esperanza os llene de todo gozo y paz en el creer.", note: { en: "Peace is filled in, not clenched. Trust is how the room makes space.", es: "La paz se llena, no se aprieta. La confianza es cómo la habitación hace lugar." } },
    ],
  },
  {
    slug: "faith",
    esSlug: "fe",
    label: { en: "Faith", es: "Fe" },
    h1: { en: "Bible Verses About Faith", es: "Versículos de fe" },
    title: { en: "Bible Verses About Faith | Bible Tea", es: "Versículos de fe | Bible Tea" },
    description: {
      en: "Bible verses about faith — Hebrews 11, mustard-seed trust, and a prayer when God's timing is late.",
      es: "Versículos de fe: Hebreos 11, la fe como semilla de mostaza, y una oración cuando el tiempo de Dios llega tarde.",
    },
    intro: {
      en: "Faith in the Bible is not a personality. It is taking the next step on a word God already said. These verses are for the day you cannot see the landing.",
      es: "La fe en la Biblia no es una personalidad. Es dar el siguiente paso sobre una palabra que Dios ya dijo. Estos versículos son para el día en que no ves dónde aterrizas.",
    },
    prayerSlug: "trusting-gods-timing",
    prayerCta: { en: "Prayer for Trusting God's Timing", es: "Oración para confiar en el tiempo de Dios" },
    storySlug: "abrahams-call",
    storyCta: { en: "Abraham's call", es: "El llamado de Abraham" },
    verses: [
      { ref: "Hebrews 11:1", esRef: "Hebreos 11:1", en: "Faith is confidence in what we hope for and assurance about what we do not see.", es: "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.", note: { en: "Unseen is the setting, not the failure. Faith is how you stand there.", es: "Lo no visto es el escenario, no el fracaso. La fe es cómo te paras ahí." } },
      { ref: "Proverbs 3:5", esRef: "Proverbios 3:5", en: "Trust in the Lord with all your heart and lean not on your own understanding.", es: "Confía en el Señor con todo tu corazón, y no te apoyes en tu propia prudencia.", note: { en: "Leaning on your own understanding is the default. This verse tells you to take the weight off that beam.", es: "Apoyarte en tu prudencia es lo normal. Este versículo te dice que quites el peso de esa viga." } },
      { ref: "Matthew 17:20", esRef: "Mateo 17:20", en: "If you have faith as small as a mustard seed, you can say to this mountain, 'Move,' and it will move.", es: "Si tuvierais fe como un grano de mostaza, diríais a este monte: Pásate de aquí allá, y se pasará.", note: { en: "Small is enough. God never asked you to bring a forest.", es: "Lo pequeño alcanza. Dios nunca te pidió que trajeras un bosque." } },
      { ref: "Romans 10:17", esRef: "Romanos 10:17", en: "Faith comes from hearing, and hearing through the word of Christ.", es: "Así que la fe es por el oír, y el oír, por la palabra de Dios.", note: { en: "Faith is fed. It is not a mood you starve and then blame.", es: "La fe se alimenta. No es un ánimo que haces ayunar y luego culpas." } },
      { ref: "Mark 9:24", esRef: "Marcos 9:24", en: "I do believe; help my unbelief.", es: "Creo; ayuda mi incredulidad.", note: { en: "Both sentences are allowed in the same breath. That is still faith.", es: "Las dos frases caben en el mismo aliento. Eso sigue siendo fe." } },
      { ref: "2 Corinthians 5:7", esRef: "2 Corintios 5:7", en: "For we live by faith, not by sight.", es: "Porque por fe andamos, no por vista.", note: { en: "Sight will come later. Walking is the assignment now.", es: "La vista llega después. Caminar es la tarea ahora." } },
      { ref: "Galatians 2:20", esRef: "Gálatas 2:20", en: "I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live, I live by faith in the Son of God.", es: "Con Cristo estoy juntamente crucificado, y ya no vivo yo, mas vive Cristo en mí. Lo que ahora vivo, lo vivo en la fe del Hijo de Dios.", note: { en: "Faith is how a dead man walks. The life is His.", es: "La fe es cómo camina un muerto. La vida es de Él." } },
      { ref: "Hebrews 11:6", esRef: "Hebreos 11:6", en: "Without faith it is impossible to please God.", es: "Sin fe es imposible agradar a Dios.", note: { en: "He is not impressed by your control. He is pleased by your trust.", es: "No le impresiona tu control. Le agrada tu confianza." } },
    ],
  },
  {
    slug: "forgiveness",
    esSlug: "perdon",
    label: { en: "Forgiveness", es: "Perdón" },
    h1: { en: "Bible Verses About Forgiveness", es: "Versículos de perdón" },
    title: { en: "Bible Verses About Forgiveness | Bible Tea", es: "Versículos de perdón | Bible Tea" },
    description: {
      en: "Bible verses about forgiveness when you cannot drop it — or cannot believe you were dropped. Then a prayer to say it out loud.",
      es: "Versículos de perdón cuando no puedes soltarlo — o no puedes creer que a ti te soltaron. Luego una oración para decirlo en voz alta.",
    },
    intro: {
      en: "Forgiveness in scripture is never cheap. It costs the person who was wronged, and it cost God first. These verses will not rush you. They will tell you the truth about the debt.",
      es: "El perdón en la Escritura nunca es barato. Le cuesta a quien fue herido, y primero le costó a Dios. Estos versículos no te apuran. Te dicen la verdad de la deuda.",
    },
    prayerSlug: "asking-forgiveness",
    prayerCta: { en: "Prayer for Forgiveness", es: "Oración para el perdón" },
    storySlug: "the-prodigal-son",
    storyCta: { en: "The prodigal son", es: "El hijo pródigo" },
    verses: [
      { ref: "1 John 1:9", esRef: "1 Juan 1:9", en: "If we confess our sins, He is faithful and just and will forgive us our sins and purify us from all unrighteousness.", es: "Si confesamos nuestros pecados, Él es fiel y justo para perdonar nuestros pecados y limpiarnos de toda maldad.", note: { en: "Faithful and just — not moody. Confession meets a character, not a coin flip.", es: "Fiel y justo — no de humor variable. La confesión encuentra un carácter, no una moneda al aire." } },
      { ref: "Ephesians 4:32", esRef: "Efesios 4:32", en: "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.", es: "Sed benignos unos con otros, misericordiosos, perdonándoos unos a otros, como Dios también os perdonó a vosotros en Cristo.", note: { en: "The measure is how you were forgiven, not how sorry they sound.", es: "La medida es cómo te perdonaron a ti, no cuán arrepentidos suenan." } },
      { ref: "Colossians 3:13", esRef: "Colosenses 3:13", en: "Bear with each other and forgive one another if any of you has a grievance against someone.", es: "Sopórtense unos a otros, y perdónense unos a otros si alguno tuviere queja contra otro.", note: { en: "Grievance is assumed. The church was never a room without complaints.", es: "La queja se da por hecha. La iglesia nunca fue un cuarto sin reclamos." } },
      { ref: "Matthew 6:14", esRef: "Mateo 6:14", en: "If you forgive other people when they sin against you, your heavenly Father will also forgive you.", es: "Si perdonáis a los hombres sus ofensas, os perdonará también a vosotros vuestro Padre celestial.", note: { en: "Jesus ties the two directions together. Open hands both ways.", es: "Jesús ata las dos direcciones. Manos abiertas hacia los dos lados." } },
      { ref: "Psalm 103:12", esRef: "Salmo 103:12", en: "As far as the east is from the west, so far has He removed our transgressions from us.", es: "Cuanto está lejos el oriente del occidente, hizo alejar de nosotros nuestras rebeliones.", note: { en: "East and west do not meet. That is how far He moved it.", es: "Oriente y occidente no se encuentran. Así de lejos lo movió." } },
      { ref: "Micah 7:18", esRef: "Miqueas 7:18", en: "Who is a God like You, who pardons sin and forgives the transgression of the remnant of His inheritance?", es: "¿Qué Dios como Tú, que perdonas la maldad y olvidas el pecado del remanente de Su heredad?", note: { en: "The prophet is stunned. Forgiveness is not ordinary, even for God.", es: "El profeta está asombrado. El perdón no es ordinario, ni siquiera en Dios." } },
      { ref: "Luke 23:34", esRef: "Lucas 23:34", en: "Father, forgive them, for they do not know what they are doing.", es: "Padre, perdónalos, porque no saben lo que hacen.", note: { en: "He said it while they were still doing it. That is the ceiling.", es: "Lo dijo mientras todavía lo hacían. Ese es el techo." } },
      { ref: "Isaiah 1:18", esRef: "Isaías 1:18", en: "Though your sins are like scarlet, they shall be as white as snow.", es: "Si vuestros pecados fueren como la grana, como la nieve serán emblanquecidos.", note: { en: "Scarlet does not fade on its own. He does the whitening.", es: "La grana no se destiñe sola. Él hace el blanqueo." } },
    ],
  },
  {
    slug: "friendship",
    esSlug: "amistad",
    label: { en: "Friendship", es: "Amistad" },
    h1: { en: "Bible Verses About Friendship", es: "Versículos de amistad" },
    title: { en: "Bible Verses About Friendship | Bible Tea", es: "Versículos de amistad | Bible Tea" },
    description: {
      en: "Bible verses about friendship — David and Jonathan, a friend closer than a brother, and a prayer when you feel alone.",
      es: "Versículos de amistad: David y Jonatán, un amigo más unido que un hermano, y una oración cuando te sientes solo.",
    },
    intro: {
      en: "The Bible is not shy about how rare a real friend is. These verses honor the ones who stay, and they sit with you if you do not have one yet.",
      es: "La Biblia no es tímida sobre lo rara que es una amistad de verdad. Estos versículos honran a los que se quedan, y se sientan contigo si todavía no tienes uno.",
    },
    prayerSlug: "lonely",
    prayerCta: { en: "A prayer when you feel alone", es: "Oración para cuando te sientes solo" },
    storySlug: "david-and-jonathan",
    storyCta: { en: "David and Jonathan", es: "David y Jonatán" },
    verses: [
      { ref: "Proverbs 18:24", esRef: "Proverbios 18:24", en: "One who has unreliable friends soon comes to ruin, but there is a friend who sticks closer than a brother.", es: "El hombre que tiene amigos ha de mostrarse amigo; y amigo hay más unido que un hermano.", note: { en: "Closer than a brother is a high bar. Scripture thinks that friend exists.", es: "Más unido que un hermano es un listón alto. La Escritura cree que ese amigo existe." } },
      { ref: "Proverbs 17:17", esRef: "Proverbios 17:17", en: "A friend loves at all times, and a brother is born for a time of adversity.", es: "En todo tiempo ama el amigo, y es como un hermano en tiempo de angustia.", note: { en: "All times includes the ugly ones. That is the test.", es: "En todo tiempo incluye los feos. Esa es la prueba." } },
      { ref: "Ecclesiastes 4:9-10", esRef: "Eclesiastés 4:9-10", en: "Two are better than one… If either of them falls down, one can help the other up.", es: "Mejores son dos que uno… porque si cayeren, el uno levantará a su compañero.", note: { en: "The point of the second person is the fall, not the photo.", es: "El punto de la segunda persona es la caída, no la foto." } },
      { ref: "John 15:13", esRef: "Juan 15:13", en: "Greater love has no one than this: to lay down one's life for one's friends.", es: "Nadie tiene mayor amor que este, que uno ponga su vida por sus amigos.", note: { en: "Jesus is describing Himself. Friendship is the word He chose.", es: "Jesús se está describiendo. Amistad es la palabra que eligió." } },
      { ref: "Proverbs 27:17", esRef: "Proverbios 27:17", en: "As iron sharpens iron, so one person sharpens another.", es: "Hierro con hierro se aguza; y así el hombre aguza el rostro de su amigo.", note: { en: "Sharpening makes noise and heat. A real friend will not only soothe you.", es: "Afilar hace ruido y calor. Un amigo de verdad no solo te consuela." } },
      { ref: "Proverbs 27:6", esRef: "Proverbios 27:6", en: "Wounds from a friend can be trusted, but an enemy multiplies kisses.", es: "Fieles son las heridas del que ama, pero engañosos los besos del que aborrece.", note: { en: "The hard sentence from someone who stays is a gift. Flattery is not.", es: "La frase dura de quien se queda es un regalo. La lisonja no." } },
      { ref: "1 Thessalonians 5:11", esRef: "1 Tesalonicenses 5:11", en: "Therefore encourage one another and build each other up.", es: "Por tanto, animaos unos a otros y edificaos unos a otros.", note: { en: "Encouragement is a job the church shares, not a talent some people have.", es: "El ánimo es un trabajo que la iglesia comparte, no un talento de algunos." } },
      { ref: "Ruth 1:16", esRef: "Rut 1:16", en: "Where you go I will go, and where you stay I will stay.", es: "Donde tú fueres, iré yo, y donde vivieres, viviré.", note: { en: "Ruth said it to Naomi. Loyalty can look like this and still be holy.", es: "Rut se lo dijo a Noemí. La lealtad puede verse así y seguir siendo santa." } },
    ],
  },
  {
    slug: "grief",
    esSlug: "duelo",
    label: { en: "Grief", es: "Duelo" },
    h1: { en: "Bible Verses for Grief", es: "Versículos para el duelo" },
    title: { en: "Bible Verses for Grief | Bible Tea", es: "Versículos para el duelo | Bible Tea" },
    description: {
      en: "Bible verses for grief and the death of a loved one. Scripture that sits with you, plus a prayer when the chair is empty.",
      es: "Versículos para el duelo y la muerte de un ser querido. Escritura que se sienta contigo, y una oración cuando la silla está vacía.",
    },
    intro: {
      en: "The Bible does not rush a funeral. It gives you psalms that sound like sobbing, and a God who stays near the crushed. These verses will not tidy the loss. They will tell you He is in it.",
      es: "La Biblia no apura un funeral. Te da salmos que suenan a llanto, y un Dios que se queda cerca de los quebrantados. Estos versículos no ordenan la pérdida. Te dicen que Él está en ella.",
    },
    prayerSlug: "lost-someone",
    prayerCta: { en: "Prayer when you've lost someone", es: "Oración para cuando has perdido a alguien" },
    storySlug: "ruth-and-naomi",
    storyCta: { en: "Ruth and Naomi", es: "Rut y Noemí" },
    verses: [
      { ref: "Psalm 34:18", esRef: "Salmo 34:18", en: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", es: "Cercano está el Señor a los quebrantados de corazón, y salva a los contritos de espíritu.", note: { en: "Close is the first comfort. Not an explanation.", es: "Cercano es el primer consuelo. No una explicación." } },
      { ref: "Matthew 5:4", esRef: "Mateo 5:4", en: "Blessed are those who mourn, for they will be comforted.", es: "Bienaventurados los que lloran, porque ellos recibirán consolación.", note: { en: "Mourning is called blessed. You are not failing by crying.", es: "El llanto es llamado bienaventurado. No fallas por llorar." } },
      { ref: "Psalm 147:3", esRef: "Salmo 147:3", en: "He heals the brokenhearted and binds up their wounds.", es: "Él sana a los quebrantados de corazón y venda sus heridas.", note: { en: "Binds up is slow work. Bandages, not a speech.", es: "Vendar es un trabajo lento. Vendajes, no un discurso." } },
      { ref: "Revelation 21:4", esRef: "Apocalipsis 21:4", en: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain.", es: "Enjugará Dios toda lágrima de los ojos de ellos; y ya no habrá muerte, ni más llanto, ni clamor, ni dolor.", note: { en: "Every tear is a promise with a date. Not yet. Still promised.", es: "Toda lágrima es una promesa con fecha. Todavía no. Igual prometida." } },
      { ref: "John 11:35", esRef: "Juan 11:35", en: "Jesus wept.", es: "Jesús lloró.", note: { en: "Two words. The man who would raise Lazarus still cried first.", es: "Dos palabras. El hombre que iba a levantar a Lázaro igual lloró primero." } },
      { ref: "Psalm 23:4", esRef: "Salmo 23:4", en: "Even though I walk through the valley of the shadow of death, I will fear no evil, for You are with me.", es: "Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque Tú estarás conmigo.", note: { en: "Through, not around. And with me is the only reason the fear loses.", es: "Por, no alrededor. Y conmigo es la única razón por la que el miedo pierde." } },
      { ref: "2 Corinthians 1:3-4", esRef: "2 Corintios 1:3-4", en: "The God of all comfort… comforts us in all our troubles, so that we can comfort those in any trouble.", es: "El Dios de toda consolación… nos consuela en todas nuestras tribulaciones, para que podamos consolar a los que están en cualquier aflicción.", note: { en: "Comfort is received, then handed on. You are not wasting the pain.", es: "El consuelo se recibe y luego se pasa. No estás desperdiciando el dolor." } },
      { ref: "Isaiah 41:10", esRef: "Isaías 41:10", en: "Do not fear, for I am with you; I will strengthen you and help you; I will uphold you with my righteous right hand.", es: "No temas, porque yo estoy contigo; te fortaleceré y te ayudaré; te sustentaré con la diestra de Mi justicia.", note: { en: "Uphold is for when your own legs will not. His hand does the holding.", es: "Sustentar es para cuando tus piernas no pueden. Su mano hace el sostén." } },
    ],
  },
];

export function getVerseTopics(): VerseTopic[] {
  return VERSE_TOPICS;
}

export function getVerseTopic(slug: string): VerseTopic | undefined {
  return VERSE_TOPICS.find((t) => t.slug === slug || t.esSlug === slug);
}

export function topicCopy<K extends "h1" | "title" | "description" | "intro" | "prayerCta" | "storyCta" | "label">(
  topic: VerseTopic,
  key: K,
  locale: Locale,
): string {
  return topic[key][locale];
}

export function verseText(verse: TopicVerse, locale: Locale): string {
  return locale === "es" ? verse.es : verse.en;
}

export function verseRef(verse: TopicVerse, locale: Locale): string {
  return locale === "es" ? verse.esRef : verse.ref;
}

export const ES_VERSE_PATHS: Record<string, string> = Object.fromEntries([
  ["/verses", "/versiculos"],
  ...VERSE_TOPICS.map((t) => [`/verses/${t.slug}`, `/versiculos/${t.esSlug}`] as const),
]);
