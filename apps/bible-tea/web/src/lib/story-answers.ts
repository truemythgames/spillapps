import type { Locale } from "./i18n";

/**
 * Direct-answer blocks for story pages that rank for question-type queries
 * in Google Search Console. Each answer is written featured-snippet style:
 * the question people actually search, answered in the first sentence,
 * ~40-60 words total. Rendered prominently under the story hero and
 * included as the first entry in the page's FAQPage structured data.
 */

export interface StoryAnswer {
  question: string;
  answer: string;
}

type LocalizedAnswer = Partial<Record<Locale, StoryAnswer>>;

export const STORY_ANSWERS: Record<string, LocalizedAnswer> = {
  "john-the-baptists-last-words": {
    en: {
      question: "What were John the Baptist's last words?",
      answer:
        "John the Baptist's last recorded words about Jesus were \"He must increase, but I must decrease\" (John 3:30). From prison, his final recorded question was sent through his disciples: \"Are you the one who is to come, or shall we look for another?\" (Matthew 11:3). He was beheaded by Herod Antipas shortly after.",
    },
    es: {
      question: "¿Cuáles fueron las últimas palabras de Juan el Bautista?",
      answer:
        "Las últimas palabras registradas de Juan el Bautista sobre Jesús fueron \"Es necesario que él crezca, pero que yo mengüe\" (Juan 3:30). Desde la cárcel, su última pregunta registrada la envió con sus discípulos: \"¿Eres tú aquel que había de venir, o esperaremos a otro?\" (Mateo 11:3). Poco después fue decapitado por Herodes Antipas.",
    },
  },
  "john-the-baptist-beheaded": {
    en: {
      question: "Why was John the Baptist killed?",
      answer:
        "John the Baptist was beheaded because he publicly condemned King Herod Antipas for marrying Herodias, his brother's wife (Mark 6:18). Herodias held a grudge, and when her daughter's dance pleased Herod at his birthday banquet, he promised her anything — and she asked for John's head on a platter.",
    },
    es: {
      question: "¿Por qué mataron a Juan el Bautista?",
      answer:
        "Juan el Bautista fue decapitado porque condenó públicamente al rey Herodes Antipas por casarse con Herodías, la esposa de su hermano (Marcos 6:18). Herodías le guardaba rencor, y cuando la danza de su hija agradó a Herodes en su banquete de cumpleaños, él le prometió cualquier cosa — y ella pidió la cabeza de Juan en un plato.",
    },
  },
  "peters-miracles": {
    en: {
      question: "What miracles did Peter perform?",
      answer:
        "Peter healed a man lame from birth at the temple's Beautiful Gate (Acts 3), healed the paralyzed Aeneas, raised Tabitha (Dorcas) from the dead in Joppa (Acts 9), and the sick were healed even by his shadow (Acts 5:15). An angel also freed him from prison twice.",
    },
    es: {
      question: "¿Qué milagros hizo el apóstol Pedro?",
      answer:
        "Pedro sanó a un cojo de nacimiento en la puerta Hermosa del templo (Hechos 3), sanó al paralítico Eneas, resucitó a Tabita (Dorcas) en Jope (Hechos 9), y los enfermos eran sanados hasta con su sombra (Hechos 5:15). Además, un ángel lo liberó de la cárcel dos veces.",
    },
  },
  "walking-on-water": {
    en: {
      question: "What does Jesus walking on water mean?",
      answer:
        "Jesus walking on water (Matthew 14:22-33) revealed his divine authority over creation — in the Old Testament, only God \"treads on the waves of the sea\" (Job 9:8). When Peter sank after taking his eyes off Jesus, the lesson became personal: faith holds you up, fear pulls you under.",
    },
    es: {
      question: "¿Qué significa que Jesús caminó sobre el agua?",
      answer:
        "Jesús caminando sobre el mar (Mateo 14:22-33) reveló su autoridad divina sobre la creación — en el Antiguo Testamento, solo Dios \"anda sobre las olas del mar\" (Job 9:8). Cuando Pedro se hundió al apartar los ojos de Jesús, la lección se volvió personal: la fe te sostiene, el miedo te hunde.",
    },
  },
  "flight-to-egypt": {
    en: {
      question: "Why did Mary and Joseph flee to Egypt?",
      answer:
        "An angel warned Joseph in a dream that King Herod intended to kill the child Jesus, so the family escaped to Egypt by night (Matthew 2:13). Herod then ordered the massacre of all boys under two in Bethlehem. They stayed in Egypt until Herod died, fulfilling the prophecy \"out of Egypt I called my son.\"",
    },
    es: {
      question: "¿Por qué huyeron María y José a Egipto?",
      answer:
        "Un ángel advirtió a José en un sueño que el rey Herodes quería matar al niño Jesús, así que la familia escapó a Egipto de noche (Mateo 2:13). Herodes entonces ordenó la matanza de todos los niños menores de dos años en Belén. Permanecieron en Egipto hasta la muerte de Herodes, cumpliendo la profecía \"de Egipto llamé a mi Hijo\".",
    },
  },
  "crossing-the-red-sea": {
    en: {
      question: "How did Moses part the Red Sea?",
      answer:
        "Moses didn't part the sea himself — God did. At God's command, Moses stretched out his staff over the water, and \"the LORD drove the sea back with a strong east wind all night and turned it into dry land\" (Exodus 14:21). Israel crossed between walls of water; Pharaoh's army drowned when the sea returned.",
    },
    es: {
      question: "¿Cómo partió Moisés el Mar Rojo?",
      answer:
        "Moisés no partió el mar por sí mismo — lo hizo Dios. Por orden de Dios, Moisés extendió su vara sobre las aguas, y \"el SEÑOR hizo retroceder el mar con un fuerte viento oriental toda aquella noche, y convirtió el mar en tierra seca\" (Éxodo 14:21). Israel cruzó entre murallas de agua; el ejército del faraón se ahogó cuando el mar regresó.",
    },
  },
  "zacchaeus-climbs-a-tree": {
    en: {
      question: "Why did Zacchaeus climb a tree?",
      answer:
        "Zacchaeus climbed a sycamore-fig tree because he was too short to see Jesus over the crowd in Jericho (Luke 19:3-4). As chief tax collector he was too hated for anyone to let him through. Jesus spotted him, called him down by name, and invited himself to Zacchaeus's house — a meal that transformed him.",
    },
    es: {
      question: "¿Por qué se subió Zaqueo a un árbol?",
      answer:
        "Zaqueo se subió a un sicómoro porque era demasiado bajo para ver a Jesús por encima de la multitud en Jericó (Lucas 19:3-4). Como jefe de los cobradores de impuestos, era demasiado odiado para que lo dejaran pasar. Jesús lo vio, lo llamó por su nombre y se invitó a su casa — una comida que lo transformó.",
    },
  },
  "the-rich-man-and-lazarus": {
    en: {
      question: "What is the story of the rich man and Lazarus about?",
      answer:
        "In Jesus's parable (Luke 16:19-31), a rich man ignores the beggar Lazarus at his gate; after death, Lazarus rests at Abraham's side while the rich man suffers in torment. The point: wealth is a stewardship, the afterlife reverses earthly injustice, and \"if they do not listen to Moses and the Prophets, they will not be convinced even if someone rises from the dead.\"",
    },
    es: {
      question: "¿De qué trata la historia del rico y Lázaro?",
      answer:
        "En la parábola de Jesús (Lucas 16:19-31), un hombre rico ignora al mendigo Lázaro a su puerta; tras la muerte, Lázaro descansa junto a Abraham mientras el rico sufre en el tormento. El punto: la riqueza es una mayordomía, la otra vida revierte la injusticia terrenal, y \"si no oyen a Moisés y a los profetas, tampoco se persuadirán aunque alguno se levantare de los muertos\".",
    },
  },
  "elijah-on-mount-carmel": {
    en: {
      question: "What happened on Mount Carmel with Elijah?",
      answer:
        "Elijah challenged 450 prophets of Baal to a public contest: each side would prepare a sacrifice, and the god who answered with fire was the true God (1 Kings 18). Baal's prophets cried out all day to silence. Elijah soaked his altar with water three times, prayed once — and fire fell from heaven, consuming everything.",
    },
    es: {
      question: "¿Qué pasó en el monte Carmelo con Elías?",
      answer:
        "Elías desafió a 450 profetas de Baal a un duelo público: cada lado prepararía un sacrificio, y el dios que respondiera con fuego sería el Dios verdadero (1 Reyes 18). Los profetas de Baal clamaron todo el día sin respuesta. Elías empapó su altar con agua tres veces, oró una vez — y cayó fuego del cielo que lo consumió todo.",
    },
  },
  "angel-visits-zechariah": {
    en: {
      question: "Why was Zechariah struck mute by the angel?",
      answer:
        "The angel Gabriel struck Zechariah mute because he doubted the announcement that his elderly wife Elizabeth would bear a son — John the Baptist (Luke 1:18-20). Gabriel said, \"you will be silent... because you did not believe my words.\" His speech returned nine months later, the moment he wrote \"His name is John.\"",
    },
    es: {
      question: "¿Por qué el ángel dejó mudo a Zacarías?",
      answer:
        "El ángel Gabriel dejó mudo a Zacarías porque dudó del anuncio de que su anciana esposa Elisabet daría a luz un hijo — Juan el Bautista (Lucas 1:18-20). Gabriel le dijo: \"quedarás mudo... por cuanto no creíste mis palabras\". Recuperó el habla nueve meses después, en el momento en que escribió \"Juan es su nombre\".",
    },
  },
  "simeon-and-anna": {
    en: {
      question: "Who were Simeon and Anna in the Bible?",
      answer:
        "Simeon and Anna were two elderly believers who recognized the infant Jesus as the Messiah when Mary and Joseph brought him to the temple (Luke 2:25-38). The Holy Spirit had promised Simeon he wouldn't die before seeing the Christ; Anna was an 84-year-old prophetess who never left the temple. Both had waited their whole lives.",
    },
    es: {
      question: "¿Quiénes fueron Simeón y Ana en la Biblia?",
      answer:
        "Simeón y Ana fueron dos ancianos creyentes que reconocieron al niño Jesús como el Mesías cuando María y José lo llevaron al templo (Lucas 2:25-38). El Espíritu Santo le había prometido a Simeón que no moriría sin ver al Cristo; Ana era una profetisa de 84 años que nunca se apartaba del templo. Ambos esperaron toda su vida.",
    },
  },
  "jacob-and-esau": {
    en: {
      question: "Why did Jacob steal Esau's blessing?",
      answer:
        "Jacob, urged by his mother Rebekah, disguised himself in Esau's clothes and goatskins to trick his blind father Isaac into giving him the firstborn blessing (Genesis 27). Esau had already sold Jacob his birthright for a bowl of stew. The deception forced Jacob to flee for twenty years — and God still worked through the mess.",
    },
    es: {
      question: "¿Por qué Jacob robó la bendición de Esaú?",
      answer:
        "Jacob, animado por su madre Rebeca, se disfrazó con la ropa de Esaú y pieles de cabrito para engañar a su padre ciego Isaac y recibir la bendición del primogénito (Génesis 27). Esaú ya le había vendido su primogenitura por un plato de guiso. El engaño obligó a Jacob a huir durante veinte años — y aun así Dios obró a través del desastre.",
    },
  },
  "the-centurions-faith": {
    en: {
      question: "What did the centurion say to Jesus?",
      answer:
        "The Roman centurion told Jesus, \"Lord, I am not worthy to have you come under my roof, but only say the word, and my servant will be healed\" (Matthew 8:8). Jesus marveled and said he had not found such great faith in all Israel. The servant was healed that very hour, at a distance.",
    },
    es: {
      question: "¿Qué le dijo el centurión a Jesús?",
      answer:
        "El centurión romano le dijo a Jesús: \"Señor, no soy digno de que entres bajo mi techo; solamente di la palabra, y mi criado sanará\" (Mateo 8:8). Jesús se maravilló y dijo que no había hallado fe tan grande en todo Israel. El criado fue sanado en esa misma hora, a distancia.",
    },
  },
  "feeding-4000": {
    en: {
      question: "What is the difference between the feeding of the 4,000 and the 5,000?",
      answer:
        "They are two separate miracles. Jesus fed 5,000 Jewish followers with five loaves and two fish near Bethsaida, with twelve baskets left over; later he fed 4,000 in the largely Gentile Decapolis with seven loaves and a few fish, with seven baskets left over (Mark 8:1-10). Jesus himself references both as distinct events (Mark 8:19-20).",
    },
    es: {
      question: "¿Cuál es la diferencia entre la alimentación de los 4.000 y los 5.000?",
      answer:
        "Son dos milagros distintos. Jesús alimentó a 5.000 seguidores judíos con cinco panes y dos peces cerca de Betsaida, sobrando doce cestas; después alimentó a 4.000 en la región mayormente gentil de Decápolis con siete panes y unos pocos peces, sobrando siete canastas (Marcos 8:1-10). Jesús mismo menciona ambos como eventos separados (Marcos 8:19-20).",
    },
  },
  "boy-jesus-at-the-temple": {
    en: {
      question: "Where was Jesus when he was 12 years old?",
      answer:
        "At age twelve, Jesus stayed behind in Jerusalem after Passover while his parents traveled a day before noticing (Luke 2:41-52). After three days of searching, they found him in the temple, sitting among the teachers, amazing everyone with his understanding. His reply: \"Did you not know I must be in my Father's house?\"",
    },
    es: {
      question: "¿Dónde estaba Jesús a los 12 años?",
      answer:
        "A los doce años, Jesús se quedó en Jerusalén después de la Pascua mientras sus padres viajaron un día entero sin notarlo (Lucas 2:41-52). Tras tres días de búsqueda, lo hallaron en el templo, sentado entre los maestros, asombrando a todos con su entendimiento. Su respuesta: \"¿No sabíais que en los negocios de mi Padre me es necesario estar?\"",
    },
  },
  "the-miraculous-catch": {
    en: {
      question: "What is the miraculous catch of fish?",
      answer:
        "After Simon Peter fished all night and caught nothing, Jesus told him to let down the nets once more — and the catch was so large the nets began to break and two boats nearly sank (Luke 5:1-11). Peter fell at Jesus's knees; Jesus answered, \"From now on you will catch men.\" Peter, James and John left everything and followed him.",
    },
    es: {
      question: "¿Qué es la pesca milagrosa?",
      answer:
        "Después de que Simón Pedro pescó toda la noche sin atrapar nada, Jesús le dijo que echara las redes una vez más — y la pesca fue tan grande que las redes se rompían y dos barcas casi se hundían (Lucas 5:1-11). Pedro cayó de rodillas ante Jesús; Jesús respondió: \"Desde ahora serás pescador de hombres\". Pedro, Jacobo y Juan lo dejaron todo y lo siguieron.",
    },
  },
  "absaloms-rebellion": {
    en: {
      question: "Why did Absalom rebel against David?",
      answer:
        "Absalom rebelled after David failed to punish Amnon for assaulting Absalom's sister Tamar — so Absalom killed Amnon himself, fled, and was never fully reconciled with his father (2 Samuel 13-15). He spent four years \"stealing the hearts\" of Israel at the city gate, then declared himself king in Hebron, forcing David to flee Jerusalem.",
    },
    es: {
      question: "¿Por qué se rebeló Absalón contra David?",
      answer:
        "Absalón se rebeló después de que David no castigó a Amnón por abusar de Tamar, hermana de Absalón — así que Absalón mismo mató a Amnón, huyó, y nunca se reconcilió plenamente con su padre (2 Samuel 13-15). Pasó cuatro años \"robando el corazón\" de Israel a la puerta de la ciudad, y luego se proclamó rey en Hebrón, obligando a David a huir de Jerusalén.",
    },
  },
  "gods-promise-to-david": {
    en: {
      question: "What was God's promise to David?",
      answer:
        "God promised David that his house, kingdom and throne would be established forever (2 Samuel 7:16) — known as the Davidic Covenant. David wanted to build God a temple; God flipped it, promising to build David a dynasty instead. The New Testament presents Jesus, \"the son of David,\" as the eternal king who fulfills it.",
    },
    es: {
      question: "¿Cuál fue la promesa de Dios a David?",
      answer:
        "Dios le prometió a David que su casa, su reino y su trono serían establecidos para siempre (2 Samuel 7:16) — el llamado Pacto Davídico. David quería construirle un templo a Dios; Dios le dio la vuelta y prometió construirle a David una dinastía. El Nuevo Testamento presenta a Jesús, \"el hijo de David\", como el rey eterno que la cumple.",
    },
  },
  "david-writes-psalm-23": {
    en: {
      question: "Who wrote Psalm 23 and why?",
      answer:
        "Psalm 23 — \"The LORD is my shepherd\" — was written by David, who spent his youth as a shepherd in Bethlehem before becoming Israel's king. Drawing on years of guarding sheep through predators and dark valleys, he flipped the image: in this psalm, David is the sheep and God is the shepherd who provides, guides and protects.",
    },
    es: {
      question: "¿Quién escribió el Salmo 23 y por qué?",
      answer:
        "El Salmo 23 — \"Jehová es mi pastor\" — fue escrito por David, quien pasó su juventud como pastor en Belén antes de ser rey de Israel. Basándose en años de proteger ovejas de depredadores y valles oscuros, invirtió la imagen: en este salmo, David es la oveja y Dios es el pastor que provee, guía y protege.",
    },
  },
  "the-golden-calf": {
    en: {
      question: "Why did the Israelites make the golden calf?",
      answer:
        "While Moses spent forty days on Mount Sinai, the people panicked at his absence and demanded Aaron make them \"gods who will go before us\" (Exodus 32:1). Aaron collected their gold earrings and cast a calf idol — likely echoing Egypt's bull worship. It broke the first two commandments they had just received, weeks earlier.",
    },
    es: {
      question: "¿Por qué el becerro de oro era un falso dios?",
      answer:
        "El becerro de oro fue un ídolo que Aarón fundió con los aretes del pueblo mientras Moisés pasaba cuarenta días en el monte Sinaí (Éxodo 32). Era un dios falso porque los israelitas lo fabricaron y lo adoraron diciendo \"estos son tus dioses, Israel\" — rompiendo los dos primeros mandamientos que acababan de recibir semanas antes.",
    },
  },
  "jesus-stops-a-storm": {
    en: {
      question: "What did Jesus say to calm the storm?",
      answer:
        "Jesus said \"Peace! Be still!\" — and the wind ceased and there was a great calm (Mark 4:39). He had been asleep on a cushion in the stern while the storm terrified experienced fishermen. His question afterward cut deeper than the storm: \"Why are you so afraid? Have you still no faith?\"",
    },
    es: {
      question: "¿Qué dijo Jesús para calmar la tormenta?",
      answer:
        "Jesús dijo \"¡Calla, enmudece!\" — y el viento cesó y se hizo grande bonanza (Marcos 4:39). Él dormía sobre un cabezal en la popa mientras la tormenta aterrorizaba a pescadores experimentados. Su pregunta posterior caló más hondo que la tormenta: \"¿Por qué estáis así amedrentados? ¿Cómo no tenéis fe?\"",
    },
  },
  "saul-meets-jesus": {
    en: {
      question: "What happened to Saul on the road to Damascus?",
      answer:
        "Saul, traveling to Damascus to arrest Christians, was blinded by a light from heaven and heard Jesus say, \"Saul, Saul, why are you persecuting me?\" (Acts 9:4). Blind for three days, he was healed when the disciple Ananias laid hands on him. Saul became Paul, the church's greatest missionary and author of much of the New Testament.",
    },
    es: {
      question: "¿Qué le pasó a Saulo en el camino a Damasco?",
      answer:
        "Saulo, que viajaba a Damasco para arrestar cristianos, fue cegado por una luz del cielo y oyó a Jesús decir: \"Saulo, Saulo, ¿por qué me persigues?\" (Hechos 9:4). Ciego durante tres días, fue sanado cuando el discípulo Ananías puso sus manos sobre él. Saulo se convirtió en Pablo, el mayor misionero de la iglesia y autor de gran parte del Nuevo Testamento.",
    },
  },
  "hosea-and-gomer": {
    en: {
      question: "Why did God tell Hosea to marry Gomer?",
      answer:
        "God commanded the prophet Hosea to marry Gomer, a woman who would be unfaithful, as a living picture of Israel's spiritual adultery against God (Hosea 1:2). When Gomer left, God told Hosea to buy her back and love her again — showing that God's covenant love pursues and redeems even those who abandon him.",
    },
    es: {
      question: "¿Por qué Dios le dijo a Oseas que se casara con Gomer?",
      answer:
        "Dios le ordenó al profeta Oseas casarse con Gomer, una mujer que le sería infiel, como imagen viva del adulterio espiritual de Israel contra Dios (Oseas 1:2). Cuando Gomer se fue, Dios le dijo a Oseas que la comprara de vuelta y la amara de nuevo — mostrando que el amor de pacto de Dios persigue y redime incluso a quienes lo abandonan.",
    },
  },
  "joseph-and-his-brothers": {
    en: {
      question: "Why did Joseph's brothers sell him into slavery?",
      answer:
        "Joseph's ten older brothers sold him to Midianite traders for twenty shekels of silver out of jealousy — their father Jacob openly favored him with the famous robe, and Joseph's dreams showed the family bowing to him (Genesis 37). Decades later, Joseph, by then ruler of Egypt, told them: \"You meant evil against me, but God meant it for good.\"",
    },
    es: {
      question: "¿Por qué los hermanos de José lo vendieron como esclavo?",
      answer:
        "Los diez hermanos mayores de José lo vendieron a mercaderes madianitas por veinte piezas de plata por celos — su padre Jacob lo favorecía abiertamente con la famosa túnica, y los sueños de José mostraban a la familia inclinándose ante él (Génesis 37). Décadas después, José, ya gobernador de Egipto, les dijo: \"Vosotros pensasteis mal contra mí, mas Dios lo encaminó a bien\".",
    },
  },
  "athens-the-unknown-god": {
    en: {
      question: "What is the altar to the unknown god in Acts 17?",
      answer:
        "In Athens, Paul found an altar inscribed \"To an unknown god\" — the Athenians' insurance policy against offending any deity they might have missed. Speaking at the Areopagus, Paul used it as his opening: \"What you worship as unknown, this I proclaim to you\" (Acts 17:23), introducing them to the God who made the world.",
    },
    es: {
      question: "¿Qué es el altar al dios no conocido de Hechos 17?",
      answer:
        "En Atenas, Pablo encontró un altar con la inscripción \"Al dios no conocido\" — la póliza de seguro de los atenienses para no ofender a ninguna deidad que se les hubiera escapado. Hablando en el Areópago, Pablo lo usó como su apertura: \"Al que vosotros adoráis sin conocerle, es a quien yo os anuncio\" (Hechos 17:23), presentándoles al Dios que hizo el mundo.",
    },
  },
  "the-witch-of-endor": {
    en: {
      question: "Who was the witch of Endor?",
      answer:
        "The witch (medium) of Endor was the spiritist King Saul consulted in disguise the night before his final battle, asking her to summon the dead prophet Samuel (1 Samuel 28) — even though Saul himself had banned mediums from Israel. Samuel's message: the kingdom was torn from Saul, and he and his sons would die the next day. They did.",
    },
    es: {
      question: "¿Quién fue la adivina de Endor?",
      answer:
        "La adivina de Endor fue la médium que el rey Saúl consultó disfrazado la noche antes de su última batalla, pidiéndole invocar al difunto profeta Samuel (1 Samuel 28) — aunque el propio Saúl había expulsado a los adivinos de Israel. El mensaje de Samuel: el reino le había sido quitado a Saúl, y él y sus hijos morirían al día siguiente. Y así fue.",
    },
  },
  "jacobs-ladder": {
    en: {
      question: "What does Jacob's ladder mean?",
      answer:
        "Jacob's ladder — a stairway from earth to heaven with angels ascending and descending (Genesis 28:12) — appeared in a dream as Jacob fled home alone, and it meant heaven was open and God was with him even as a fugitive. Jesus later applied the image to himself (John 1:51): he is the true connection between heaven and earth.",
    },
    es: {
      question: "¿Qué significa la escalera de Jacob?",
      answer:
        "La escalera de Jacob — una escalera de la tierra al cielo con ángeles subiendo y bajando (Génesis 28:12) — apareció en un sueño mientras Jacob huía solo de su casa, y significaba que el cielo estaba abierto y Dios estaba con él incluso siendo un fugitivo. Jesús después aplicó la imagen a sí mismo (Juan 1:51): él es la verdadera conexión entre el cielo y la tierra.",
    },
  },
  "the-fiery-furnace": {
    en: {
      question: "Who were Shadrach, Meshach and Abednego?",
      answer:
        "Shadrach, Meshach and Abednego were three Jewish exiles in Babylon who refused to bow to King Nebuchadnezzar's golden statue and were thrown into a furnace heated seven times hotter than usual (Daniel 3). They walked out unharmed — not even smelling of smoke — and the king saw a fourth figure in the flames \"like a son of the gods.\"",
    },
    es: {
      question: "¿Quiénes fueron Sadrac, Mesac y Abed-nego?",
      answer:
        "Sadrac, Mesac y Abed-nego fueron tres exiliados judíos en Babilonia que se negaron a inclinarse ante la estatua de oro del rey Nabucodonosor y fueron arrojados a un horno calentado siete veces más de lo normal (Daniel 3). Salieron ilesos — sin siquiera olor a humo — y el rey vio una cuarta figura entre las llamas \"semejante a hijo de los dioses\".",
    },
  },
  "elijah-fed-by-ravens": {
    en: {
      question: "Why did God feed Elijah with ravens?",
      answer:
        "After Elijah announced a drought to King Ahab, God hid him by the brook Cherith and commanded ravens to bring him bread and meat every morning and evening (1 Kings 17:4-6). The provision was deliberately unlikely — ravens were unclean birds and notorious scavengers — underlining that God can sustain his people through any means he chooses.",
    },
    es: {
      question: "¿Por qué Dios alimentó a Elías con cuervos?",
      answer:
        "Después de que Elías anunció la sequía al rey Acab, Dios lo escondió junto al arroyo de Querit y ordenó a los cuervos llevarle pan y carne cada mañana y cada tarde (1 Reyes 17:4-6). La provisión era deliberadamente improbable — los cuervos eran aves impuras y carroñeras — subrayando que Dios puede sostener a los suyos por el medio que él elija.",
    },
  },
  "eutychus-falls-out-a-window": {
    en: {
      question: "Who fell out of the window while Paul was preaching?",
      answer:
        "Eutychus, a young man in Troas, sank into a deep sleep as Paul's sermon stretched past midnight and fell from a third-story window, and was \"picked up dead\" (Acts 20:9). Paul went down, embraced him, and declared him alive. Then Paul went back upstairs and kept preaching until daybreak.",
    },
    es: {
      question: "¿Quién se cayó de la ventana mientras Pablo predicaba?",
      answer:
        "Eutico, un joven de Troas, cayó en un sueño profundo mientras el sermón de Pablo se extendía más allá de la medianoche y se precipitó desde un tercer piso, y \"fue levantado muerto\" (Hechos 20:9). Pablo bajó, lo abrazó y declaró que estaba vivo. Luego Pablo volvió a subir y siguió predicando hasta el alba.",
    },
  },
  "elijah-and-the-widow": {
    en: {
      question: "What miracle happened with Elijah and the widow of Zarephath?",
      answer:
        "During the drought, a starving widow in Zarephath shared her last handful of flour and oil with Elijah — and her jar of flour never ran out and her jug of oil never ran dry until the rains returned (1 Kings 17:8-16). When her son later died, Elijah stretched himself over the boy three times and God restored his life — the Bible's first recorded resurrection.",
    },
    es: {
      question: "¿Qué milagro ocurrió con Elías y la viuda de Sarepta?",
      answer:
        "Durante la sequía, una viuda hambrienta de Sarepta compartió su último puñado de harina y aceite con Elías — y su tinaja de harina no escaseó y su vasija de aceite no se agotó hasta que volvieron las lluvias (1 Reyes 17:8-16). Cuando su hijo murió después, Elías se tendió sobre el niño tres veces y Dios le devolvió la vida — la primera resurrección registrada en la Biblia.",
    },
  },
  "caleb-claims-his-mountain": {
    en: {
      question: "Who was Caleb and what mountain did he claim?",
      answer:
        "Caleb was one of the two faithful spies (with Joshua) who believed Israel could take Canaan. Forty-five years later, at age 85, he claimed the hill country of Hebron that Moses had promised him — the very region where the giant Anakim lived — saying, \"I am still as strong today as I was then... give me this mountain\" (Joshua 14:11-12).",
    },
    es: {
      question: "¿Quién fue Caleb y qué montaña reclamó?",
      answer:
        "Caleb fue uno de los dos espías fieles (junto con Josué) que creyeron que Israel podía conquistar Canaán. Cuarenta y cinco años después, a los 85 años, reclamó la región montañosa de Hebrón que Moisés le había prometido — la misma zona donde vivían los gigantes anaceos — diciendo: \"Todavía estoy tan fuerte como el día que Moisés me envió... dame, pues, ahora este monte\" (Josué 14:11-12).",
    },
  },
  "god-answers-job": {
    en: {
      question: "How did God answer Job?",
      answer:
        "God answered Job out of a whirlwind — not with explanations, but with questions: \"Where were you when I laid the foundations of the earth?\" (Job 38:4). Over four chapters God toured creation's wonders, never mentioning Job's suffering. Job's response: \"I had heard of you by the hearing of the ear, but now my eye sees you.\" God then restored him double.",
    },
    es: {
      question: "¿Cómo le respondió Dios a Job?",
      answer:
        "Dios le respondió a Job desde un torbellino — no con explicaciones, sino con preguntas: \"¿Dónde estabas tú cuando yo fundaba la tierra?\" (Job 38:4). Durante cuatro capítulos Dios recorrió las maravillas de la creación, sin mencionar nunca el sufrimiento de Job. La respuesta de Job: \"De oídas te había oído; mas ahora mis ojos te ven\". Dios entonces le restauró el doble.",
    },
  },
  "achans-hidden-sin": {
    en: {
      question: "What did Achan steal and what happened to him?",
      answer:
        "After Jericho fell, Achan secretly kept a beautiful Babylonian robe, 200 shekels of silver and a bar of gold — items God had devoted to destruction (Joshua 7). His hidden theft caused Israel's shocking defeat at Ai. Exposed by lot, Achan confessed, and he and his household were stoned in the Valley of Achor.",
    },
    es: {
      question: "¿Qué robó Acán y qué le sucedió?",
      answer:
        "Tras la caída de Jericó, Acán se quedó en secreto con un hermoso manto babilónico, 200 siclos de plata y un lingote de oro — cosas que Dios había consagrado a destrucción (Josué 7). Su robo oculto causó la sorprendente derrota de Israel en Hai. Descubierto por sorteo, Acán confesó, y él y su casa fueron apedreados en el valle de Acor.",
    },
  },
  "the-boy-with-a-demon": {
    en: {
      question: "What does \"I believe, help my unbelief\" mean?",
      answer:
        "It's the cry of a desperate father who brought his demon-possessed son to Jesus after the disciples failed to heal him (Mark 9:24). Jesus said, \"All things are possible for one who believes,\" and the father answered with raw honesty: \"I believe; help my unbelief!\" Jesus healed the boy — honoring imperfect, struggling faith.",
    },
    es: {
      question: "¿Qué significa \"creo, ayuda mi incredulidad\"?",
      answer:
        "Es el clamor de un padre desesperado que llevó a su hijo endemoniado a Jesús después de que los discípulos no pudieron sanarlo (Marcos 9:24). Jesús dijo: \"Al que cree todo le es posible\", y el padre respondió con honestidad cruda: \"¡Creo; ayuda mi incredulidad!\". Jesús sanó al niño — honrando una fe imperfecta y en lucha.",
    },
  },
  "jesus-before-pilate": {
    en: {
      question: "Why did Pilate hand Jesus over to be crucified?",
      answer:
        "Pilate found no guilt in Jesus and tried repeatedly to release him — sending him to Herod, offering the Passover pardon, having him flogged instead (Luke 23; John 19). But the crowd chose Barabbas, and the leaders warned, \"If you release this man, you are not Caesar's friend.\" Fearing a riot and Rome's displeasure, Pilate washed his hands and gave in.",
    },
    es: {
      question: "¿Por qué Pilato entregó a Jesús para ser crucificado?",
      answer:
        "Pilato no halló culpa en Jesús e intentó liberarlo repetidamente — enviándolo a Herodes, ofreciendo el indulto de la Pascua, mandándolo azotar en su lugar (Lucas 23; Juan 19). Pero la multitud eligió a Barrabás, y los líderes advirtieron: \"Si a este sueltas, no eres amigo de César\". Temiendo un motín y el disgusto de Roma, Pilato se lavó las manos y cedió.",
    },
  },
  "ruth-and-naomi": {
    en: {
      question: "What is the story of Ruth and Naomi?",
      answer:
        "Ruth, a Moabite widow, refused to abandon her widowed mother-in-law Naomi, vowing \"where you go I will go... your people shall be my people, and your God my God\" (Ruth 1:16). In Bethlehem, Ruth gleaned in the field of Boaz, who married her as kinsman-redeemer. Their son Obed became the grandfather of King David.",
    },
    es: {
      question: "¿Cuál es la historia de Rut y Noemí?",
      answer:
        "Rut, una viuda moabita, se negó a abandonar a su suegra viuda Noemí, jurando: \"a dondequiera que tú fueres, iré yo... tu pueblo será mi pueblo, y tu Dios mi Dios\" (Rut 1:16). En Belén, Rut espigó en el campo de Booz, quien se casó con ella como pariente redentor. Su hijo Obed fue el abuelo del rey David.",
    },
  },
  "the-good-samaritan": {
    en: {
      question: "What is the meaning of the Good Samaritan parable?",
      answer:
        "The parable (Luke 10:25-37) answers the question \"Who is my neighbor?\" A priest and a Levite pass by a beaten traveler; a Samaritan — the ethnic enemy of Jesus's audience — stops, treats his wounds, and pays for his care. The meaning: your neighbor is anyone in need, and love is proven by action, not affiliation. \"Go and do likewise.\"",
    },
    es: {
      question: "¿Cuál es el significado de la parábola del buen samaritano?",
      answer:
        "La parábola (Lucas 10:25-37) responde a la pregunta \"¿quién es mi prójimo?\". Un sacerdote y un levita pasan de largo junto a un viajero golpeado; un samaritano — el enemigo étnico de la audiencia de Jesús — se detiene, cura sus heridas y paga su cuidado. El significado: tu prójimo es cualquiera que necesite ayuda, y el amor se demuestra con acciones, no con afiliaciones. \"Ve, y haz tú lo mismo.\"",
    },
  },
  "wandering-the-desert": {
    en: {
      question: "Why did the Israelites wander in the desert for 40 years?",
      answer:
        "The forty years of wandering were the consequence of unbelief at the border of Canaan: ten of twelve spies convinced Israel the land was untakeable, and the people refused to enter (Numbers 14). God decreed one year of wandering for each day the spies had scouted — until the entire unbelieving generation, except Joshua and Caleb, died in the wilderness.",
    },
    es: {
      question: "¿Por qué los israelitas vagaron 40 años por el desierto?",
      answer:
        "Los cuarenta años de peregrinación fueron la consecuencia de la incredulidad a las puertas de Canaán: diez de los doce espías convencieron a Israel de que la tierra era inconquistable, y el pueblo se negó a entrar (Números 14). Dios decretó un año de peregrinación por cada día que los espías exploraron — hasta que toda la generación incrédula, excepto Josué y Caleb, murió en el desierto.",
    },
  },
  "lots-escape-gone-wrong": {
    en: {
      question: "Why did Lot's wife turn into a pillar of salt?",
      answer:
        "As angels rushed Lot's family out of Sodom, the command was explicit: \"Do not look back\" (Genesis 19:17). Lot's wife looked back at the burning city and became a pillar of salt — a judgment on her lingering attachment to the life being destroyed. Jesus made her a one-line warning: \"Remember Lot's wife\" (Luke 17:32).",
    },
    es: {
      question: "¿Por qué la esposa de Lot se convirtió en estatua de sal?",
      answer:
        "Mientras los ángeles sacaban a la familia de Lot de Sodoma, la orden fue explícita: \"No mires atrás\" (Génesis 19:17). La esposa de Lot miró atrás, hacia la ciudad en llamas, y se convirtió en estatua de sal — un juicio por su apego a la vida que estaba siendo destruida. Jesús la convirtió en advertencia de una sola línea: \"Acordaos de la mujer de Lot\" (Lucas 17:32).",
    },
  },
  "a-talking-donkey-and-a-hired-prophet": {
    en: {
      question: "Why did Balaam's donkey talk?",
      answer:
        "Balaam's donkey spoke because God opened its mouth after it saw what the prophet couldn't: the angel of the LORD blocking the road with a drawn sword (Numbers 22:23-31). The donkey swerved three times and was beaten each time before protesting out loud. Then God opened Balaam's eyes too — the hired prophet was blinder than his own animal.",
    },
    es: {
      question: "¿Por qué habló la burra de Balaam?",
      answer:
        "La burra de Balaam habló porque Dios abrió su boca después de que ella vio lo que el profeta no podía ver: el ángel del SEÑOR bloqueando el camino con una espada desenvainada (Números 22:23-31). La burra se desvió tres veces y fue golpeada cada vez antes de protestar en voz alta. Entonces Dios también abrió los ojos de Balaam — el profeta a sueldo estaba más ciego que su propio animal.",
    },
  },
};

export function storyAnswer(id: string, locale: Locale): StoryAnswer | undefined {
  return STORY_ANSWERS[id]?.[locale];
}
