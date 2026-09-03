import type { Locale } from "./i18n";

/**
 * Curated editorial content for high-opportunity playlist pages.
 * Playlists themselves come from the API at build time; this adds the
 * long-form intro + story-by-story guide that makes these pages real
 * landing pages instead of thin grids.
 *
 * Guide entries are keyed by story id — the heading, Bible reference and
 * link are pulled from the (localized) catalog at render time, so only
 * the prose lives here.
 */

export interface PlaylistGuideEntry {
  id: string;
  text: string;
}

export interface PlaylistEditorial {
  /** Paragraphs rendered under the hero, above the story grid. */
  intro: string[];
  /** H2 for the story-by-story guide section. */
  guideTitle: string;
  guide: PlaylistGuideEntry[];
}

type LocalizedEditorial = Partial<Record<Locale, PlaylistEditorial>>;

export const PLAYLIST_CONTENT: Record<string, LocalizedEditorial> = {
  "pl-love": {
    en: {
      intro: [
        "Who said the Bible isn't romantic? The love stories in the Bible have everything — arranged marriages that turn into real love, a man who works fourteen years for the woman he can't stop thinking about, a foreign widow whose loyalty rewrites a royal family tree. But Scripture's idea of love is bigger than romance: it's covenant love that keeps promises decades later, a father who sprints down the road to hug the son who wasted everything, and a Messiah who offers living water to the woman everyone else crossed the street to avoid.",
        "This collection gathers the greatest love stories in the Bible — romantic, familial, and divine — each retold as a short immersive audio episode. Same story you know from Scripture, told like your best friend spilling the tea. Listen in the Bible Tea app.",
      ],
      guideTitle: "Every love story in this collection, story by story",
      guide: [
        {
          id: "isaac-and-rebekah",
          text: "The Bible's first great romance starts with a servant, a prayer, and a stranger watering ten thirsty camels. Rebekah says yes to a man she's never met — and Genesis 24:67 gives us one of the oldest love lines ever written: \"he took Rebekah, and she became his wife, and he loved her.\"",
        },
        {
          id: "jacob-rachel-and-leah",
          text: "Jacob works seven years for Rachel's hand and it feels \"like only a few days because of his love for her.\" Then his father-in-law swaps the bride at the wedding, and Jacob signs up for seven more years. A love triangle, a deception, and a God who works through all of it.",
        },
        {
          id: "ruth-and-naomi",
          text: "The most quoted wedding verse in the Bible — \"where you go I will go\" — was actually said by a daughter-in-law to her mother-in-law. Ruth's loyal love leads her to Boaz, a redemption story, and a spot in the family line of King David and Jesus himself.",
        },
        {
          id: "gods-promise-to-david",
          text: "A different kind of love story: covenant love. David wants to build God a house; God flips it and promises to build David a \"house\" — a dynasty that will never end. Two thousand years later, that promise lands on a throne that's still occupied.",
        },
        {
          id: "the-good-samaritan",
          text: "When a lawyer asks \"who is my neighbor?\", Jesus answers with the most scandalous love story he could invent — the hated outsider who stops, bandages a stranger's wounds, and pays his hotel bill. Love, defined by what it does.",
        },
        {
          id: "the-prodigal-son",
          text: "A son demands his inheritance early — basically wishing his dad dead — burns through it, and crawls home rehearsing an apology. His father sees him from a long way off and runs. In the ancient world, dignified men did not run. This one did.",
        },
        {
          id: "the-woman-at-the-well",
          text: "Five husbands, one current situation, and a water jar she carries at noon to avoid the gossip. Jesus sees the whole record and offers her living water anyway. She becomes the first person he plainly tells \"I am the Messiah\" — and the town's first evangelist.",
        },
        {
          id: "lazarus-lives-again",
          text: "\"Jesus wept\" is the shortest verse in the Bible, and it happens at the tomb of a friend he's about to raise. Love that grieves with you first — and then calls you out of the grave by name.",
        },
        {
          id: "anointed-at-bethany",
          text: "Mary breaks a jar of perfume worth a year's wages and pours it over Jesus's feet, wiping them with her hair. The disciples call it a waste; Jesus calls it beautiful and says the story will be told wherever the gospel goes. He was right — here we are.",
        },
        {
          id: "kindness-to-mephibosheth",
          text: "Years after Jonathan's death, King David asks a dangerous question: \"Is there anyone left of Saul's house I can show kindness to?\" The answer is a disabled grandson hiding from the new regime. David gives him a permanent seat at the royal table. Love that keeps a promise made to a friend long gone.",
        },
      ],
    },
    es: {
      intro: [
        "¿Quién dijo que la Biblia no es romántica? Las historias de amor en la Biblia lo tienen todo: matrimonios arreglados que se convierten en amor verdadero, un hombre que trabaja catorce años por la mujer que ama, una viuda extranjera cuya lealtad reescribe un árbol genealógico real. Pero el amor en las Escrituras va más allá del romance: es amor de pacto que cumple promesas décadas después, un padre que corre por el camino para abrazar al hijo que lo malgastó todo, y un Mesías que ofrece agua viva a la mujer que todos evitaban.",
        "Esta colección reúne las historias de amor más grandes de la Biblia — románticas, familiares y divinas — cada una narrada como un episodio de audio inmersivo. La misma historia de las Escrituras, contada como si tu mejor amiga te estuviera contando el chisme. Escúchalas en la app de Bible Tea.",
      ],
      guideTitle: "Cada historia de amor de esta colección, una por una",
      guide: [
        {
          id: "isaac-and-rebekah",
          text: "El primer gran romance de la Biblia empieza con un siervo, una oración y una desconocida dando de beber a diez camellos sedientos. Rebeca dice que sí a un hombre que nunca ha visto — y Génesis 24:67 nos regala una de las frases de amor más antiguas jamás escritas: \"tomó a Rebeca por mujer, y la amó\".",
        },
        {
          id: "jacob-rachel-and-leah",
          text: "Jacob trabaja siete años por Raquel y le parecen \"como pocos días, porque la amaba\". Entonces su suegro cambia a la novia en la boda, y Jacob acepta trabajar siete años más. Un triángulo amoroso, un engaño, y un Dios que obra a través de todo.",
        },
        {
          id: "ruth-and-naomi",
          text: "El versículo más citado en las bodas — \"a dondequiera que tú fueres, iré yo\" — en realidad se lo dijo una nuera a su suegra. El amor leal de Rut la lleva hasta Booz, a una historia de redención, y a un lugar en la genealogía del rey David y del mismo Jesús.",
        },
        {
          id: "gods-promise-to-david",
          text: "Una historia de amor diferente: amor de pacto. David quiere construirle una casa a Dios; Dios le da la vuelta y promete construirle una \"casa\" a David — una dinastía que no terminará jamás. Dos mil años después, esa promesa se cumple en un trono que sigue ocupado.",
        },
        {
          id: "the-good-samaritan",
          text: "Cuando un intérprete de la ley pregunta \"¿quién es mi prójimo?\", Jesús responde con la historia de amor más escandalosa posible: el extranjero despreciado que se detiene, venda las heridas de un desconocido y paga su hospedaje. El amor, definido por lo que hace.",
        },
        {
          id: "the-prodigal-son",
          text: "Un hijo exige su herencia por adelantado — básicamente deseando la muerte de su padre — la derrocha, y vuelve a casa ensayando una disculpa. Su padre lo ve desde lejos y corre hacia él. En el mundo antiguo, los hombres dignos no corrían. Este sí.",
        },
        {
          id: "the-woman-at-the-well",
          text: "Cinco maridos, una situación actual, y un cántaro que carga al mediodía para evitar los chismes. Jesús conoce toda su historia y aun así le ofrece agua viva. Ella se convierte en la primera persona a quien él le dice claramente \"yo soy el Mesías\" — y en la primera evangelista del pueblo.",
        },
        {
          id: "lazarus-lives-again",
          text: "\"Jesús lloró\" es el versículo más corto de la Biblia, y sucede ante la tumba de un amigo al que está a punto de resucitar. Un amor que primero llora contigo — y luego te llama por tu nombre para sacarte de la tumba.",
        },
        {
          id: "anointed-at-bethany",
          text: "María rompe un frasco de perfume que vale el salario de un año y lo derrama sobre los pies de Jesús, secándolos con su cabello. Los discípulos lo llaman un desperdicio; Jesús lo llama algo hermoso y dice que esta historia se contará dondequiera que llegue el evangelio. Tenía razón — aquí estamos.",
        },
        {
          id: "kindness-to-mephibosheth",
          text: "Años después de la muerte de Jonatán, el rey David hace una pregunta peligrosa: \"¿Ha quedado alguien de la casa de Saúl a quien pueda mostrar bondad?\". La respuesta es un nieto con discapacidad escondido del nuevo régimen. David le da un asiento permanente en la mesa real. Un amor que cumple la promesa hecha a un amigo que ya no está.",
        },
      ],
    },
  },

  "pl-underdogs": {
    en: {
      intro: [
        "If the Bible has a favorite plot, it's this one: the person nobody bet on wins. A baby floating in a basket outlasts an empire. A shepherd kid drops a nine-foot champion with a sling. An orphan girl becomes queen and out-maneuvers a genocide. Scripture goes out of its way — over and over — to pick the youngest, the smallest, the foreign, the overlooked, and put them at the center of the story.",
        "These are the greatest underdog stories in the Bible, from Exodus to Acts, each retold as a short immersive audio episode with the drama fully intact. Listen in the Bible Tea app.",
      ],
      guideTitle: "The Bible's greatest underdogs, story by story",
      guide: [
        {
          id: "baby-moses",
          text: "Pharaoh decrees death for every Hebrew baby boy. One mother waterproofs a basket, and the empire's own princess ends up raising the child who will bring the empire down. The most powerful man on earth, defeated by a mom, a sister, and a basket.",
        },
        {
          id: "gideon-vs-the-midianites",
          text: "Gideon introduces himself as the weakest man in the weakest clan of Manasseh — and God calls him \"mighty warrior\" anyway. Then God trims his army from 32,000 to 300 men armed with torches and trumpets, just so nobody could mistake who won the battle.",
        },
        {
          id: "ruth-and-naomi",
          text: "A widowed foreigner gleaning leftover grain in a stranger's field is about as low on the social ladder as the ancient world gets. Ruth ends the book as the great-grandmother of King David — proof that loyalty outranks pedigree.",
        },
        {
          id: "david-and-goliath",
          text: "The original underdog story — so original that we still call every upset \"a David and Goliath story.\" A shepherd boy too small for the king's armor takes down a nine-foot professional soldier with a sling, a stone, and an unreasonable amount of confidence in God.",
        },
        {
          id: "esther-saves-her-people",
          text: "An orphaned Jewish girl in exile wins a beauty contest she never asked to enter, becomes queen of Persia, and then risks execution by walking into the throne room uninvited — to stop a genocide her own prime minister planned. \"For such a time as this.\"",
        },
        {
          id: "daniel-and-the-lions-den",
          text: "Daniel is an exile in his eighties whose rivals weaponize his own integrity against him — the only dirt they can find is that he prays. One night in a den of lions later, the king who sentenced him is writing decrees about Daniel's God.",
        },
        {
          id: "the-widows-son-lives-again",
          text: "A widow in Nain has just lost her only son — which in the ancient world meant losing her income, her protection, and her future. Jesus stops the funeral procession, touches the stretcher, and gives her son back. Nobody even asked him to.",
        },
        {
          id: "zacchaeus-climbs-a-tree",
          text: "Too short to see over the crowd and too hated to be let through it, the chief tax collector of Jericho climbs a tree like a kid. Of everyone in the crowd, Jesus picks him: \"Come down — I'm staying at your house today.\" Lunch changes everything.",
        },
        {
          id: "the-woman-at-the-well",
          text: "A Samaritan woman with five failed marriages, drawing water alone at noon to avoid everyone — and Jesus makes her the first evangelist in John's gospel. The town listens to the person it had written off.",
        },
        {
          id: "born-blind-now-sees",
          text: "A beggar blind from birth gets healed, then gets dragged before the religious court — and calmly out-argues the theologians. \"One thing I do know: I was blind, and now I see.\" The Pharisees throw him out; Jesus goes and finds him.",
        },
        {
          id: "saul-meets-jesus",
          text: "The church's most dangerous enemy is knocked off his feet on the road to Damascus by the very Jesus he's persecuting. The man carrying arrest warrants for Christians becomes the apostle who writes half the New Testament. The ultimate reversal.",
        },
        {
          id: "earthquake-at-philippi",
          text: "Paul and Silas are stripped, beaten, and locked in the deepest cell — so they hold a midnight worship service. The earthquake that follows opens every door, and by sunrise their jailer is asking how to be saved. Prisoners: 1, empire: 0.",
        },
      ],
    },
    es: {
      intro: [
        "Si la Biblia tiene una trama favorita, es esta: gana la persona por la que nadie apostaba. Un bebé flotando en una canasta sobrevive a un imperio. Un pastorcito derriba a un campeón de casi tres metros con una honda. Una huérfana se convierte en reina y desbarata un genocidio. Las Escrituras eligen una y otra vez al más joven, al más pequeño, al extranjero, al ignorado — y lo ponen en el centro de la historia.",
        "Estas son las mejores historias de los menospreciados de la Biblia, desde Éxodo hasta Hechos, cada una narrada como un episodio de audio inmersivo con todo el drama intacto. Escúchalas en la app de Bible Tea.",
      ],
      guideTitle: "Los grandes menospreciados de la Biblia, historia por historia",
      guide: [
        {
          id: "baby-moses",
          text: "El faraón decreta la muerte de todo niño hebreo. Una madre impermeabiliza una canasta, y la propia princesa del imperio termina criando al niño que derribará ese imperio. El hombre más poderoso de la tierra, derrotado por una mamá, una hermana y una canasta.",
        },
        {
          id: "gideon-vs-the-midianites",
          text: "Gedeón se presenta como el más débil de la familia más pobre de Manasés — y aun así Dios lo llama \"varón esforzado y valiente\". Luego Dios reduce su ejército de 32.000 a 300 hombres armados con antorchas y trompetas, para que nadie dudara de quién ganó la batalla.",
        },
        {
          id: "ruth-and-naomi",
          text: "Una viuda extranjera recogiendo espigas sobrantes en el campo de un desconocido está en lo más bajo de la escala social del mundo antiguo. Rut termina el libro como bisabuela del rey David — prueba de que la lealtad vale más que el linaje.",
        },
        {
          id: "david-and-goliath",
          text: "La historia original del menospreciado — tan original que todavía llamamos a cada sorpresa \"una historia de David y Goliat\". Un pastorcito al que le quedaba grande la armadura del rey derriba a un soldado profesional de casi tres metros con una honda, una piedra y una confianza en Dios fuera de toda lógica.",
        },
        {
          id: "esther-saves-her-people",
          text: "Una huérfana judía en el exilio gana un concurso de belleza en el que nunca pidió entrar, se convierte en reina de Persia, y luego arriesga la ejecución al entrar al salón del trono sin invitación — para detener el genocidio que planeó su propio primer ministro. \"Para esta hora has llegado al reino.\"",
        },
        {
          id: "daniel-and-the-lions-den",
          text: "Daniel es un exiliado de más de ochenta años cuyos rivales usan su propia integridad en su contra — lo único que encuentran para acusarlo es que ora. Una noche en el foso de los leones después, el rey que lo condenó está escribiendo decretos sobre el Dios de Daniel.",
        },
        {
          id: "the-widows-son-lives-again",
          text: "Una viuda de Naín acaba de perder a su único hijo — lo que en el mundo antiguo significaba perder su sustento, su protección y su futuro. Jesús detiene el cortejo fúnebre, toca el féretro y le devuelve a su hijo. Nadie se lo había pedido siquiera.",
        },
        {
          id: "zacchaeus-climbs-a-tree",
          text: "Demasiado bajo para ver por encima de la multitud y demasiado odiado para que lo dejaran pasar, el jefe de los cobradores de impuestos de Jericó se sube a un árbol como un niño. De toda la multitud, Jesús lo elige a él: \"Desciende, porque hoy me quedo en tu casa\". Un almuerzo lo cambia todo.",
        },
        {
          id: "the-woman-at-the-well",
          text: "Una samaritana con cinco matrimonios fallidos, sacando agua sola al mediodía para no cruzarse con nadie — y Jesús la convierte en la primera evangelista del evangelio de Juan. El pueblo escucha a la persona que había descartado.",
        },
        {
          id: "born-blind-now-sees",
          text: "Un mendigo ciego de nacimiento es sanado, luego arrastrado ante el tribunal religioso — y con toda calma les gana el debate a los teólogos. \"Una cosa sé: que habiendo yo sido ciego, ahora veo.\" Los fariseos lo expulsan; Jesús va y lo busca.",
        },
        {
          id: "saul-meets-jesus",
          text: "El enemigo más peligroso de la iglesia es derribado en el camino a Damasco por el mismo Jesús al que persigue. El hombre que llevaba órdenes de arresto contra los cristianos se convierte en el apóstol que escribe la mitad del Nuevo Testamento. El giro definitivo.",
        },
        {
          id: "earthquake-at-philippi",
          text: "A Pablo y Silas los azotan y los encierran en el calabozo más profundo — así que organizan un culto de adoración a medianoche. El terremoto que sigue abre todas las puertas, y al amanecer su carcelero está preguntando cómo ser salvo. Prisioneros: 1, imperio: 0.",
        },
      ],
    },
  },

  "pl-miracles": {
    en: {
      intro: [
        "From the first \"let there be light\" to tongues of fire at Pentecost, the miracles in the Bible aren't random magic tricks — they're signs, each one making a claim about who God is. The sea splits to free slaves. Bread falls from the sky in a desert. A wedding runs out of wine and gets a better vintage than it started with. A man four days dead walks out of his own tomb.",
        "This collection walks through the Bible's most famous miracles in order, Old Testament to New, each retold as a short immersive audio episode. Listen in the Bible Tea app.",
      ],
      guideTitle: "The miracles, in the order they happened",
      guide: [
        {
          id: "creation",
          text: "The first miracle is everything. Six days, spoken into being — light, sky, land, stars, life — ending with humanity made in God's own image and a day of rest to enjoy it all.",
        },
        {
          id: "crossing-the-red-sea",
          text: "Trapped between Pharaoh's chariots and the sea, two million ex-slaves watch the water stand up in walls. The most famous rescue in the Old Testament — and the moment Israel's story becomes an escape story.",
        },
        {
          id: "bread-from-heaven",
          text: "A nation in the wilderness with no food and no water gets both, daily, for forty years — manna with the morning dew and water pouring out of a rock. God as daily provider, on repeat.",
        },
        {
          id: "joshua-and-jericho",
          text: "The most fortified city in Canaan falls without a siege. Israel's entire battle plan: march in circles, blow trumpets, shout. The walls came down anyway — Hebrews 11 files it under faith.",
        },
        {
          id: "elijah-on-mount-carmel",
          text: "One prophet vs. 450 prophets of Baal in a public duel: whichever god answers with fire wins. Baal's team dances and shouts all day to silence. Elijah soaks his altar with water three times — and fire falls from heaven.",
        },
        {
          id: "water-to-wine",
          text: "Jesus's first recorded miracle is saving a wedding from social disaster. Six stone jars of water — about 150 gallons — become wine so good the caterer compliments the groom for saving the best for last.",
        },
        {
          id: "feeding-5000",
          text: "Five loaves, two fish, five thousand men plus women and children — and twelve baskets of leftovers. The only miracle recorded in all four gospels, which tells you how much it stunned everyone who saw it.",
        },
        {
          id: "walking-on-water",
          text: "In the middle of a night storm, the disciples see a figure walking on the waves and assume ghost. Peter gets out of the boat and briefly walks on water too — until he looks at the storm instead of Jesus. \"You of little faith, why did you doubt?\"",
        },
        {
          id: "jesus-stops-a-storm",
          text: "A storm violent enough to scare professional fishermen, and Jesus is asleep on a cushion. Three words — \"Peace, be still\" — and the sea goes flat. The disciples' question is the whole point: \"Who is this, that even the wind and waves obey him?\"",
        },
        {
          id: "the-widows-son-lives-again",
          text: "Jesus interrupts a funeral in Nain, moved by compassion for a widow burying her only son. He touches the stretcher — making himself ritually unclean — and tells the dead man to get up. He does.",
        },
        {
          id: "jairus-daughter-and-the-bleeding-woman",
          text: "Two miracles woven into one story: a woman healed of twelve years of bleeding just by touching Jesus's robe in a crowd, and a synagogue ruler's twelve-year-old daughter raised from her deathbed. \"Talitha koum — little girl, get up.\"",
        },
        {
          id: "born-blind-now-sees",
          text: "Mud, spit, and a wash in the pool of Siloam give a man born blind his first ever glimpse of the world. The healing takes one verse; the religious investigation it triggers takes the rest of the chapter.",
        },
        {
          id: "lazarus-lives-again",
          text: "Jesus deliberately arrives four days late — past the point where anyone believed recovery possible — then calls his friend out of the tomb by name. The miracle so undeniable it convinced the authorities Jesus had to die.",
        },
        {
          id: "the-resurrection",
          text: "The miracle everything else was building toward. The stone rolled away, the tomb empty, and the first witnesses — women, whose testimony ancient courts wouldn't even accept — sent to tell the world that death lost.",
        },
        {
          id: "pentecost",
          text: "A sound like rushing wind, tongues of fire, and a group of fishermen suddenly preaching in languages they never learned. Three thousand people join the church before lunch. The miracle that turned a scared huddle into a movement.",
        },
        {
          id: "the-beautiful-gate-miracle",
          text: "A man lame from birth asks Peter and John for spare change at the temple gate. \"Silver and gold I do not have — but what I have I give you.\" He goes in walking, leaping, and praising God, and the whole city has questions.",
        },
      ],
    },
    es: {
      intro: [
        "Desde el primer \"sea la luz\" hasta las lenguas de fuego en Pentecostés, los milagros de la Biblia no son trucos de magia al azar — son señales, y cada una dice algo sobre quién es Dios. El mar se parte para liberar esclavos. Cae pan del cielo en un desierto. Una boda se queda sin vino y recibe uno mejor del que tenía. Un hombre con cuatro días de muerto sale caminando de su propia tumba.",
        "Esta colección recorre los milagros más famosos de la Biblia en orden, del Antiguo al Nuevo Testamento, cada uno narrado como un episodio de audio inmersivo. Escúchalos en la app de Bible Tea.",
      ],
      guideTitle: "Los milagros, en el orden en que sucedieron",
      guide: [
        {
          id: "creation",
          text: "El primer milagro lo es todo. Seis días, hablados a la existencia — luz, cielo, tierra, estrellas, vida — terminando con la humanidad hecha a imagen de Dios y un día de descanso para disfrutarlo todo.",
        },
        {
          id: "crossing-the-red-sea",
          text: "Atrapados entre los carros del faraón y el mar, dos millones de ex esclavos ven el agua levantarse en murallas. El rescate más famoso del Antiguo Testamento — y el momento en que la historia de Israel se convierte en una historia de liberación.",
        },
        {
          id: "bread-from-heaven",
          text: "Una nación en el desierto sin comida ni agua recibe ambas, a diario, durante cuarenta años — maná con el rocío de la mañana y agua brotando de una roca. Dios como proveedor diario, en repetición.",
        },
        {
          id: "joshua-and-jericho",
          text: "La ciudad más fortificada de Canaán cae sin asedio. Todo el plan de batalla de Israel: marchar en círculos, tocar trompetas, gritar. Los muros cayeron de todos modos — Hebreos 11 lo archiva bajo fe.",
        },
        {
          id: "elijah-on-mount-carmel",
          text: "Un profeta contra 450 profetas de Baal en un duelo público: el dios que responda con fuego, gana. El equipo de Baal danza y grita todo el día ante el silencio. Elías empapa su altar con agua tres veces — y cae fuego del cielo.",
        },
        {
          id: "water-to-wine",
          text: "El primer milagro registrado de Jesús es salvar una boda del desastre social. Seis tinajas de piedra con agua — unos 600 litros — se convierten en un vino tan bueno que el encargado del banquete felicita al novio por guardar lo mejor para el final.",
        },
        {
          id: "feeding-5000",
          text: "Cinco panes, dos peces, cinco mil hombres más mujeres y niños — y doce cestas de sobras. El único milagro registrado en los cuatro evangelios, lo que te dice cuánto asombró a todos los que lo vieron.",
        },
        {
          id: "walking-on-water",
          text: "En medio de una tormenta nocturna, los discípulos ven una figura caminando sobre las olas y piensan que es un fantasma. Pedro sale de la barca y por un momento también camina sobre el agua — hasta que mira la tormenta en vez de a Jesús. \"Hombre de poca fe, ¿por qué dudaste?\"",
        },
        {
          id: "jesus-stops-a-storm",
          text: "Una tormenta lo bastante violenta para asustar a pescadores profesionales, y Jesús duerme sobre un cabezal. Tres palabras — \"Calla, enmudece\" — y el mar queda en calma. La pregunta de los discípulos es el punto central: \"¿Quién es este, que aun el viento y el mar le obedecen?\"",
        },
        {
          id: "the-widows-son-lives-again",
          text: "Jesús interrumpe un funeral en Naín, movido a compasión por una viuda que entierra a su único hijo. Toca el féretro — haciéndose ritualmente impuro — y le ordena al muerto levantarse. Y se levanta.",
        },
        {
          id: "jairus-daughter-and-the-bleeding-woman",
          text: "Dos milagros entretejidos en una sola historia: una mujer sanada de doce años de hemorragia con solo tocar el manto de Jesús entre la multitud, y la hija de doce años de un principal de la sinagoga levantada de su lecho de muerte. \"Talita cumi — niña, levántate.\"",
        },
        {
          id: "born-blind-now-sees",
          text: "Lodo, saliva y un lavado en el estanque de Siloé le dan a un hombre ciego de nacimiento su primer vistazo del mundo. La sanación toma un versículo; la investigación religiosa que desata ocupa el resto del capítulo.",
        },
        {
          id: "lazarus-lives-again",
          text: "Jesús llega deliberadamente cuatro días tarde — pasado el punto en que alguien creyera posible una recuperación — y entonces llama a su amigo por su nombre para que salga de la tumba. El milagro tan innegable que convenció a las autoridades de que Jesús debía morir.",
        },
        {
          id: "the-resurrection",
          text: "El milagro hacia el que apuntaba todo lo demás. La piedra removida, la tumba vacía, y las primeras testigos — mujeres, cuyo testimonio ni siquiera aceptaban los tribunales antiguos — enviadas a decirle al mundo que la muerte perdió.",
        },
        {
          id: "pentecost",
          text: "Un estruendo como de viento recio, lenguas de fuego, y un grupo de pescadores predicando de repente en idiomas que nunca aprendieron. Tres mil personas se unen a la iglesia antes del almuerzo. El milagro que convirtió a un grupo asustado en un movimiento.",
        },
        {
          id: "the-beautiful-gate-miracle",
          text: "Un hombre cojo de nacimiento les pide limosna a Pedro y Juan en la puerta del templo. \"No tengo plata ni oro — pero lo que tengo te doy.\" Entra caminando, saltando y alabando a Dios, y toda la ciudad se llena de preguntas.",
        },
      ],
    },
  },

  "pl-easter": {
    en: {
      intro: [
        "One week changed everything. Holy Week — from the palm branches of Sunday to the empty tomb and beyond — is the most documented, most dramatic stretch of the entire Bible: a rigged trial at midnight, a best friend's betrayal for thirty silver coins, a governor washing his hands of the whole thing, and a Sunday morning nobody saw coming.",
        "This collection tells the complete Easter story in chronological order, sixteen episodes from Palm Sunday to the Ascension, each retold as a short immersive audio episode. Listen in the Bible Tea app.",
      ],
      guideTitle: "Holy Week, day by day",
      guide: [
        {
          id: "palm-sunday",
          text: "Jesus enters Jerusalem on a donkey — a deliberate fulfillment of Zechariah's prophecy — while crowds wave palm branches and shout \"Hosanna!\" The same city will shout something very different by Friday.",
        },
        {
          id: "the-plot-against-jesus",
          text: "While Jesus teaches openly in the temple, the chief priests meet in private. The raising of Lazarus was the last straw — Caiaphas argues it's better for one man to die than for the nation to perish. The plan is set; they just need a way in.",
        },
        {
          id: "judas-makes-a-deal",
          text: "The way in is one of the twelve. Judas Iscariot goes to the chief priests and asks what they'll give him. The price: thirty pieces of silver — the Old Testament compensation price for a slave.",
        },
        {
          id: "the-last-supper",
          text: "A Passover meal where Jesus washes his disciples' feet, identifies his betrayer with a piece of bread, and reframes the bread and cup around his own body and blood. The meal the church has repeated ever since.",
        },
        {
          id: "gethsemane",
          text: "In an olive grove at night, Jesus prays in anguish so deep he sweats like drops of blood — \"take this cup from me; yet not my will, but yours.\" His three closest friends can't stay awake beside him.",
        },
        {
          id: "arrested-in-the-garden",
          text: "Judas arrives with an armed crowd and identifies Jesus with a kiss. Peter draws a sword and takes off a servant's ear; Jesus heals it — his last miracle before the cross — and goes willingly. The disciples scatter.",
        },
        {
          id: "before-the-sanhedrin",
          text: "A night trial before the high priest, stacked with false witnesses who can't keep their stories straight. Finally Caiaphas asks directly: are you the Messiah, the Son of God? Jesus answers — and they call it blasphemy.",
        },
        {
          id: "peters-three-denials",
          text: "While Jesus stands trial inside, Peter warms himself at a fire outside — and denies knowing him three times, just as Jesus predicted, the last time as the rooster crows. Luke adds the devastating detail: Jesus turned and looked at him.",
        },
        {
          id: "jesus-before-pilate",
          text: "The Roman governor finds no basis for a death sentence and tries every exit: send him to Herod, offer to release him, flog him instead. The crowd chooses Barabbas. Pilate washes his hands and hands Jesus over.",
        },
        {
          id: "the-crucifixion",
          text: "Golgotha. Darkness at noon, a criminal promised paradise, a mother given a new son, and a Roman centurion's verdict: \"Surely this man was the Son of God.\" The temple curtain tears from top to bottom.",
        },
        {
          id: "buried-in-a-borrowed-tomb",
          text: "Joseph of Arimathea — a secret disciple on the very council that condemned Jesus — goes public at the worst possible moment, asks Pilate for the body, and lays it in his own new tomb. A stone is rolled, a guard is posted.",
        },
        {
          id: "the-resurrection",
          text: "At dawn on the first day of the week, the women find the stone rolled away and the tomb empty. \"Why do you look for the living among the dead?\" The turning point of the entire Bible — and of history.",
        },
        {
          id: "the-road-to-emmaus",
          text: "Two heartbroken disciples walk seven miles with a stranger who explains the Scriptures so well their hearts burn — and only recognize Jesus when he breaks the bread. He vanishes; they run all seven miles back.",
        },
        {
          id: "doubting-thomas",
          text: "Thomas missed the first appearance and wants evidence: \"Unless I put my finger in the nail marks, I will not believe.\" A week later Jesus offers exactly that. Thomas answers with the highest confession in the gospels: \"My Lord and my God.\"",
        },
        {
          id: "the-great-commission",
          text: "On a mountain in Galilee, the risen Jesus gives eleven men a mission that outsizes them absurdly: make disciples of all nations. The plan's entire security is one promise — \"I am with you always, to the very end of the age.\"",
        },
        {
          id: "the-ascension",
          text: "Forty days after the resurrection, Jesus blesses his disciples and is taken up before their eyes. Two angels ask the perfectly reasonable question: why are you staring at the sky? There's work to do — and Pentecost is ten days away.",
        },
      ],
    },
    es: {
      intro: [
        "Una semana lo cambió todo. La Semana Santa — desde las palmas del domingo hasta la tumba vacía y más allá — es el tramo más documentado y más dramático de toda la Biblia: un juicio amañado a medianoche, la traición de un mejor amigo por treinta monedas de plata, un gobernador lavándose las manos, y un domingo por la mañana que nadie vio venir.",
        "Esta colección cuenta la historia completa de la Pascua en orden cronológico, dieciséis episodios desde el Domingo de Ramos hasta la Ascensión, cada uno narrado como un episodio de audio inmersivo. Escúchalos en la app de Bible Tea.",
      ],
      guideTitle: "La Semana Santa, día a día",
      guide: [
        {
          id: "palm-sunday",
          text: "Jesús entra en Jerusalén sobre un burro — cumpliendo deliberadamente la profecía de Zacarías — mientras las multitudes agitan palmas y gritan \"¡Hosanna!\". La misma ciudad gritará algo muy distinto el viernes.",
        },
        {
          id: "the-plot-against-jesus",
          text: "Mientras Jesús enseña abiertamente en el templo, los principales sacerdotes se reúnen en privado. La resurrección de Lázaro fue la gota que colmó el vaso — Caifás argumenta que conviene que un solo hombre muera y no que perezca la nación. El plan está hecho; solo necesitan una puerta de entrada.",
        },
        {
          id: "judas-makes-a-deal",
          text: "La puerta de entrada es uno de los doce. Judas Iscariote va a los principales sacerdotes y pregunta cuánto le darán. El precio: treinta piezas de plata — el precio de compensación por un esclavo según el Antiguo Testamento.",
        },
        {
          id: "the-last-supper",
          text: "Una cena de Pascua donde Jesús lava los pies de sus discípulos, señala a su traidor con un pedazo de pan, y redefine el pan y la copa en torno a su propio cuerpo y sangre. La cena que la iglesia ha repetido desde entonces.",
        },
        {
          id: "gethsemane",
          text: "En un olivar de noche, Jesús ora con una angustia tan profunda que su sudor cae como gotas de sangre — \"aparta de mí esta copa; pero no se haga mi voluntad, sino la tuya\". Sus tres amigos más cercanos no logran mantenerse despiertos.",
        },
        {
          id: "arrested-in-the-garden",
          text: "Judas llega con una turba armada e identifica a Jesús con un beso. Pedro saca una espada y le corta la oreja a un siervo; Jesús la sana — su último milagro antes de la cruz — y se entrega voluntariamente. Los discípulos huyen.",
        },
        {
          id: "before-the-sanhedrin",
          text: "Un juicio nocturno ante el sumo sacerdote, lleno de testigos falsos que no logran coordinar sus historias. Al final Caifás pregunta directamente: ¿eres tú el Mesías, el Hijo de Dios? Jesús responde — y lo llaman blasfemia.",
        },
        {
          id: "peters-three-denials",
          text: "Mientras Jesús es juzgado adentro, Pedro se calienta junto a una fogata afuera — y niega conocerlo tres veces, tal como Jesús lo predijo, la última justo cuando canta el gallo. Lucas añade el detalle devastador: Jesús se volvió y lo miró.",
        },
        {
          id: "jesus-before-pilate",
          text: "El gobernador romano no encuentra motivo para una sentencia de muerte e intenta todas las salidas: enviarlo a Herodes, ofrecer liberarlo, azotarlo en su lugar. La multitud elige a Barrabás. Pilato se lava las manos y entrega a Jesús.",
        },
        {
          id: "the-crucifixion",
          text: "El Gólgota. Oscuridad al mediodía, un criminal al que se le promete el paraíso, una madre que recibe un nuevo hijo, y el veredicto de un centurión romano: \"Verdaderamente este hombre era Hijo de Dios\". El velo del templo se rasga de arriba abajo.",
        },
        {
          id: "buried-in-a-borrowed-tomb",
          text: "José de Arimatea — discípulo secreto y miembro del mismo concilio que condenó a Jesús — se hace público en el peor momento posible, le pide el cuerpo a Pilato y lo coloca en su propia tumba nueva. Ruedan una piedra, ponen una guardia.",
        },
        {
          id: "the-resurrection",
          text: "Al amanecer del primer día de la semana, las mujeres encuentran la piedra removida y la tumba vacía. \"¿Por qué buscáis entre los muertos al que vive?\" El punto de inflexión de toda la Biblia — y de la historia.",
        },
        {
          id: "the-road-to-emmaus",
          text: "Dos discípulos desconsolados caminan once kilómetros con un desconocido que explica las Escrituras tan bien que sus corazones arden — y solo reconocen a Jesús cuando parte el pan. Él desaparece; ellos corren los once kilómetros de vuelta.",
        },
        {
          id: "doubting-thomas",
          text: "Tomás se perdió la primera aparición y quiere pruebas: \"Si no metiere mi dedo en el lugar de los clavos, no creeré\". Una semana después, Jesús le ofrece exactamente eso. Tomás responde con la confesión más alta de los evangelios: \"¡Señor mío, y Dios mío!\".",
        },
        {
          id: "the-great-commission",
          text: "En un monte de Galilea, Jesús resucitado les da a once hombres una misión absurdamente más grande que ellos: hacer discípulos a todas las naciones. Toda la garantía del plan es una promesa — \"yo estoy con vosotros todos los días, hasta el fin del mundo\".",
        },
        {
          id: "the-ascension",
          text: "Cuarenta días después de la resurrección, Jesús bendice a sus discípulos y es llevado arriba ante sus ojos. Dos ángeles hacen la pregunta más razonable: ¿por qué miran al cielo? Hay trabajo que hacer — y Pentecostés está a diez días.",
        },
      ],
    },
  },

  "pl-jesus": {
    en: {
      intro: [
        "The most influential life ever lived, told in order. From a birth announcement delivered to shepherds on a night shift, to a baptism that opened the sky, to parables that still shape how we talk about grace, to a cross, an empty tomb, and a cloud — this is the complete arc of the life of Jesus in eighteen episodes.",
        "Each story is retold as a short immersive audio episode — faithful to the gospels, zero stained-glass distance. Whether you're reading the gospels for the first time or the fiftieth, this is the story in one place, start to finish. Listen in the Bible Tea app.",
      ],
      guideTitle: "The life of Jesus, in order",
      guide: [
        {
          id: "birth-of-jesus",
          text: "A census, a full inn, a feeding trough for a crib — and an angel choir announcing the news first to shepherds, the least credentialed audience available. The King arrives with zero fanfare from anyone important.",
        },
        {
          id: "boy-jesus-at-the-temple",
          text: "The only story we have from Jesus's childhood: twelve years old, missing for three days, and finally found in the temple discussing theology with the teachers. \"Didn't you know I had to be in my Father's house?\"",
        },
        {
          id: "jesus-gets-baptized",
          text: "Jesus insists John baptize him — and as he comes up from the Jordan, the sky opens, the Spirit descends like a dove, and a voice says, \"This is my beloved Son.\" All three persons of the Trinity in one scene.",
        },
        {
          id: "40-days-in-the-desert",
          text: "Before the public ministry, a private war: forty days of fasting, then three temptations aimed straight at identity — if you are the Son of God... Jesus answers all three with Scripture, and the devil leaves to wait for a better moment.",
        },
        {
          id: "water-to-wine",
          text: "At a wedding in Cana, at his mother's nudging, Jesus turns roughly 150 gallons of water into the best wine of the night. John calls it the first of his signs — glory revealed at a party.",
        },
        {
          id: "picking-the-twelve",
          text: "After a full night of prayer, Jesus chooses his twelve: fishermen, a tax collector, a zealot — political enemies now sharing a payroll. Not a scholar or aristocrat among them. These are the men who will carry the message to the world.",
        },
        {
          id: "the-good-samaritan",
          text: "Asked to define \"neighbor,\" Jesus tells a story where the religious professionals walk past a dying man and the hero is a Samaritan — the ethnic enemy his audience loved to hate. \"Go and do likewise\" still stings.",
        },
        {
          id: "the-prodigal-son",
          text: "The most famous short story ever told: a son who wishes his father dead, a famine, a pig farm, and a father who runs to embrace him before the apology is even finished. The older brother's resentment is aimed straight at the Pharisees listening.",
        },
        {
          id: "feeding-5000",
          text: "Jesus tries to take a grieving day off; a crowd of thousands follows him anyway. He has compassion, teaches until evening, and turns one kid's packed lunch into dinner for everyone — with twelve baskets left over.",
        },
        {
          id: "walking-on-water",
          text: "The disciples fight a headwind all night until Jesus comes to them walking on the sea. Peter's brief water-walk and sudden sink earn the gentlest rebuke: \"Why did you doubt?\" The boat lands; the men worship.",
        },
        {
          id: "the-transfiguration",
          text: "On a mountain, Jesus's face shines like the sun and his clothes turn dazzling white; Moses and Elijah appear beside him. Peter offers to build tents — then the cloud speaks: \"This is my Son. Listen to him.\"",
        },
        {
          id: "lazarus-lives-again",
          text: "The climactic sign of John's gospel: Jesus weeps at the tomb of his friend, then commands, \"Lazarus, come out!\" — and a man four days dead does. It's this miracle that finalizes the plot to kill him.",
        },
        {
          id: "palm-sunday",
          text: "The final week begins: Jesus rides into Jerusalem on a donkey as crowds carpet the road with cloaks and palm branches, shouting \"Hosanna to the Son of David!\" The Pharisees tell him to silence them; he says the stones would cry out.",
        },
        {
          id: "the-last-supper",
          text: "The night before the cross: feet washed, a betrayer identified, bread broken — \"this is my body\" — and a cup shared: \"this is my blood of the covenant, poured out for many.\"",
        },
        {
          id: "gethsemane",
          text: "The rawest scene in the gospels: Jesus face-down in an olive grove, sweating blood, asking if there's any other way — and choosing the Father's will anyway while his friends sleep through it.",
        },
        {
          id: "the-crucifixion",
          text: "Between two criminals, under a mocking sign that tells the truth — \"King of the Jews\" — Jesus forgives his executioners, promises paradise to a thief, and declares \"It is finished.\" Darkness covers the land; the temple curtain rips.",
        },
        {
          id: "the-resurrection",
          text: "Three days later the tomb is empty and everything Jesus said reads differently. He appears to the women, to Peter, to the Twelve, to five hundred at once — not a ghost story, but breakfast on a beach and hands you can touch.",
        },
        {
          id: "the-ascension",
          text: "The story's last scene on earth: a blessing, a cloud, and a promise of power from on high. Jesus takes his seat at the right hand of the Father — and ten days later, the Spirit turns his followers into the church.",
        },
      ],
    },
    es: {
      intro: [
        "La vida más influyente jamás vivida, contada en orden. Desde un anuncio de nacimiento entregado a pastores en turno de noche, pasando por un bautismo que abrió el cielo, parábolas que todavía definen cómo hablamos de la gracia, hasta una cruz, una tumba vacía y una nube — este es el arco completo de la vida de Jesús en dieciocho episodios.",
        "Cada historia está narrada como un episodio de audio inmersivo — fiel a los evangelios, sin distancia de vitral. Ya sea que leas los evangelios por primera vez o por quincuagésima, esta es la historia completa en un solo lugar, de principio a fin. Escúchala en la app de Bible Tea.",
      ],
      guideTitle: "La vida de Jesús, en orden",
      guide: [
        {
          id: "birth-of-jesus",
          text: "Un censo, una posada llena, un pesebre por cuna — y un coro de ángeles anunciando la noticia primero a unos pastores, la audiencia con menos credenciales disponible. El Rey llega sin fanfarria de nadie importante.",
        },
        {
          id: "boy-jesus-at-the-temple",
          text: "La única historia que tenemos de la niñez de Jesús: doce años, perdido durante tres días, y finalmente hallado en el templo discutiendo teología con los maestros. \"¿No sabíais que en los negocios de mi Padre me es necesario estar?\"",
        },
        {
          id: "jesus-gets-baptized",
          text: "Jesús insiste en que Juan lo bautice — y al salir del Jordán, el cielo se abre, el Espíritu desciende como paloma, y una voz dice: \"Este es mi Hijo amado\". Las tres personas de la Trinidad en una sola escena.",
        },
        {
          id: "40-days-in-the-desert",
          text: "Antes del ministerio público, una guerra privada: cuarenta días de ayuno, luego tres tentaciones dirigidas directo a la identidad — si eres Hijo de Dios... Jesús responde las tres con las Escrituras, y el diablo se aparta a esperar un mejor momento.",
        },
        {
          id: "water-to-wine",
          text: "En una boda en Caná, a instancias de su madre, Jesús convierte unos 600 litros de agua en el mejor vino de la noche. Juan lo llama la primera de sus señales — la gloria revelada en una fiesta.",
        },
        {
          id: "picking-the-twelve",
          text: "Después de una noche entera de oración, Jesús elige a sus doce: pescadores, un cobrador de impuestos, un zelote — enemigos políticos ahora en el mismo equipo. Ni un erudito ni un aristócrata entre ellos. Estos son los hombres que llevarán el mensaje al mundo.",
        },
        {
          id: "the-good-samaritan",
          text: "Cuando le piden definir \"prójimo\", Jesús cuenta una historia donde los profesionales religiosos pasan de largo junto a un moribundo y el héroe es un samaritano — el enemigo étnico que su audiencia amaba odiar. \"Ve, y haz tú lo mismo\" todavía incomoda.",
        },
        {
          id: "the-prodigal-son",
          text: "El cuento corto más famoso jamás contado: un hijo que desea la muerte de su padre, una hambruna, una granja de cerdos, y un padre que corre a abrazarlo antes de que termine la disculpa. El resentimiento del hermano mayor apunta directo a los fariseos que escuchan.",
        },
        {
          id: "feeding-5000",
          text: "Jesús intenta tomarse un día de duelo; una multitud de miles lo sigue de todos modos. Él tiene compasión, enseña hasta la tarde, y convierte el almuerzo de un niño en cena para todos — con doce cestas de sobra.",
        },
        {
          id: "walking-on-water",
          text: "Los discípulos luchan contra el viento toda la noche hasta que Jesús viene a ellos caminando sobre el mar. La breve caminata de Pedro sobre el agua y su hundimiento repentino reciben el reproche más tierno: \"¿Por qué dudaste?\". La barca llega; los hombres adoran.",
        },
        {
          id: "the-transfiguration",
          text: "En un monte, el rostro de Jesús resplandece como el sol y sus vestidos se vuelven blancos como la luz; Moisés y Elías aparecen junto a él. Pedro ofrece hacer enramadas — entonces la nube habla: \"Este es mi Hijo amado. A él oíd\".",
        },
        {
          id: "lazarus-lives-again",
          text: "La señal culminante del evangelio de Juan: Jesús llora ante la tumba de su amigo, y luego ordena: \"¡Lázaro, ven fuera!\" — y un hombre con cuatro días de muerto obedece. Es este milagro el que sella el complot para matarlo.",
        },
        {
          id: "palm-sunday",
          text: "Comienza la última semana: Jesús entra en Jerusalén sobre un burro mientras las multitudes alfombran el camino con mantos y palmas, gritando \"¡Hosanna al Hijo de David!\". Los fariseos le piden que los calle; él dice que las piedras clamarían.",
        },
        {
          id: "the-last-supper",
          text: "La noche antes de la cruz: pies lavados, un traidor señalado, pan partido — \"esto es mi cuerpo\" — y una copa compartida: \"esto es mi sangre del pacto, que por muchos es derramada\".",
        },
        {
          id: "gethsemane",
          text: "La escena más cruda de los evangelios: Jesús postrado en un olivar, sudando sangre, preguntando si hay otro camino — y eligiendo la voluntad del Padre de todos modos mientras sus amigos duermen.",
        },
        {
          id: "the-crucifixion",
          text: "Entre dos criminales, bajo un letrero burlón que dice la verdad — \"Rey de los judíos\" — Jesús perdona a sus verdugos, le promete el paraíso a un ladrón, y declara \"Consumado es\". Las tinieblas cubren la tierra; el velo del templo se rasga.",
        },
        {
          id: "the-resurrection",
          text: "Tres días después la tumba está vacía y todo lo que Jesús dijo se lee distinto. Se aparece a las mujeres, a Pedro, a los Doce, a quinientos a la vez — no es una historia de fantasmas, sino un desayuno en la playa y manos que se pueden tocar.",
        },
        {
          id: "the-ascension",
          text: "La última escena de la historia en la tierra: una bendición, una nube, y la promesa de poder desde lo alto. Jesús toma su lugar a la diestra del Padre — y diez días después, el Espíritu convierte a sus seguidores en la iglesia.",
        },
      ],
    },
  },
};

export function playlistContent(
  id: string,
  locale: Locale
): PlaylistEditorial | undefined {
  return PLAYLIST_CONTENT[id]?.[locale];
}

/** Named couples shown above the fold on the love-stories playlist. */
export const LOVE_COUPLES: Record<Locale, { id: string; label: string }[]> = {
  en: [
    { id: "isaac-and-rebekah", label: "Isaac & Rebekah" },
    { id: "jacob-rachel-and-leah", label: "Jacob & Rachel" },
    { id: "ruth-and-naomi", label: "Ruth & Boaz" },
    { id: "the-prodigal-son", label: "The Prodigal Son" },
    { id: "the-woman-at-the-well", label: "The Woman at the Well" },
    { id: "hosea-and-gomer", label: "Hosea & Gomer" },
  ],
  es: [
    { id: "isaac-and-rebekah", label: "Isaac y Rebeca" },
    { id: "jacob-rachel-and-leah", label: "Jacob y Raquel" },
    { id: "ruth-and-naomi", label: "Rut y Booz" },
    { id: "the-prodigal-son", label: "El hijo pródigo" },
    { id: "the-woman-at-the-well", label: "La samaritana" },
    { id: "hosea-and-gomer", label: "Oseas y Gomer" },
  ],
};
