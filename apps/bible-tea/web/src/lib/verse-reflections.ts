import type { Locale } from "./i18n";

export interface VerseReflection {
  body: string;
  question: string;
  related: { href: string; label: string };
}

const BOOK_CONTEXT: Record<string, { en: string; es: string }> = {
  Genesis: {
    en: "Genesis is the Bible's opening act — God making a world, then staying in it when people break it.",
    es: "Génesis es el primer acto de la Biblia: Dios crea un mundo y se queda cuando la gente lo rompe.",
  },
  Exodus: {
    en: "Exodus is the rescue story — a people trapped, a God who shows up, and a path through water that should have drowned them.",
    es: "Éxodo es la historia del rescate: un pueblo atrapado, un Dios que aparece y un camino por el agua que debió ahogarlos.",
  },
  Leviticus: {
    en: "Leviticus is about how a holy God lives among messy people — not as a lecture, as a way of life.",
    es: "Levítico trata de cómo un Dios santo vive entre gente imperfecta: no como un sermón, sino como una forma de vivir.",
  },
  Numbers: {
    en: "Numbers follows Israel through the wilderness — the long stretch between promise and arrival, when faith gets tired.",
    es: "Números sigue a Israel por el desierto: el tramo largo entre la promesa y la llegada, cuando la fe se cansa.",
  },
  Deuteronomy: {
    en: "Deuteronomy is Moses' last speech — choose life, remember who brought you out, and don't forget when things get easy.",
    es: "Deuteronomio es el último discurso de Moisés: elige la vida, recuerda quién te sacó y no olvides cuando todo se ponga fácil.",
  },
  Joshua: {
    en: "Joshua is the book where the promise finally has an address — land, courage, and the God who goes first.",
    es: "Josué es el libro donde la promesa por fin tiene dirección: tierra, valor y el Dios que va delante.",
  },
  Judges: {
    en: "Judges is the cycle nobody wanted: forget God, collapse, cry out, get rescued, repeat.",
    es: "Jueces es el ciclo que nadie pidió: olvidar a Dios, caer, clamar, ser rescatado, repetir.",
  },
  Ruth: {
    en: "Ruth is a short book with a long loyalty — two widows, a harvest field, and a love story that lands in Jesus' family tree.",
    es: "Rut es un libro corto con una lealtad larga: dos viudas, un campo de cosecha y una historia de amor que termina en el árbol familiar de Jesús.",
  },
  "1 Samuel": {
    en: "1 Samuel is the rise of kings — a rejected judge, a failed king, and a shepherd God keeps choosing.",
    es: "1 Samuel es el surgimiento de los reyes: un juez rechazado, un rey que falla y un pastor al que Dios sigue eligiendo.",
  },
  "2 Samuel": {
    en: "2 Samuel is David's throne and David's wreckage — glory, family collapse, and a God who doesn't walk away.",
    es: "2 Samuel es el trono de David y su ruina: gloria, una familia que se rompe y un Dios que no se va.",
  },
  "1 Kings": {
    en: "1 Kings opens with Solomon's wisdom and closes with a nation splitting — prophets lighting fires while kings lose the plot.",
    es: "1 Reyes abre con la sabiduría de Salomón y cierra con una nación partida: profetas encendiendo fuego mientras los reyes pierden el rumbo.",
  },
  "2 Kings": {
    en: "2 Kings is the long fall — good kings, bad kings, and a people carried into exile who still hear from God.",
    es: "2 Reyes es la caída larga: reyes buenos, reyes malos y un pueblo llevado al exilio que aún oye a Dios.",
  },
  "1 Chronicles": {
    en: "1 Chronicles retells the story for people coming home — same God, same promises, a chance to start again.",
    es: "1 Crónicas vuelve a contar la historia para los que regresan: el mismo Dios, las mismas promesas, una oportunidad de empezar de nuevo.",
  },
  "2 Chronicles": {
    en: "2 Chronicles watches the temple rise and fall — worship at the center, and what happens when it isn't.",
    es: "2 Crónicas ve el templo levantarse y caer: la adoración en el centro, y lo que pasa cuando no lo está.",
  },
  Ezra: {
    en: "Ezra is the rebuild — not just walls, but a people learning how to belong to God again.",
    es: "Esdras es la reconstrucción: no solo muros, sino un pueblo que aprende de nuevo a pertenecer a Dios.",
  },
  Nehemiah: {
    en: "Nehemiah is the wall-builder who prays with a trowel in his hand — courage that looks like ordinary work.",
    es: "Nehemías es el que reconstruye el muro orando con la paleta en la mano: valor que se ve como trabajo cotidiano.",
  },
  Esther: {
    en: "Esther never names God, and you still feel Him — a queen, a plot, and courage that shows up late but on time.",
    es: "Ester no nombra a Dios y aun así se le siente: una reina, un complot y un valor que llega tarde, pero a tiempo.",
  },
  Job: {
    en: "Job is the book that lets you ask the hard question out loud — and then answers from a whirlwind, not a slogan.",
    es: "Job es el libro que te deja hacer la pregunta difícil en voz alta, y responde desde un torbellino, no con un eslogan.",
  },
  Psalms: {
    en: "The Psalms are the Bible's prayer book — joy, rage, fear, and worship written for days that don't go as planned.",
    es: "Los Salmos son el libro de oraciones de la Biblia: gozo, rabia, miedo y alabanza para los días que no salen como uno quiere.",
  },
  Psalm: {
    en: "The Psalms are the Bible's prayer book — joy, rage, fear, and worship written for days that don't go as planned.",
    es: "Los Salmos son el libro de oraciones de la Biblia: gozo, rabia, miedo y alabanza para los días que no salen como uno quiere.",
  },
  Proverbs: {
    en: "Proverbs is street-level wisdom — how to speak, work, wait, and not wreck your life on a Tuesday.",
    es: "Proverbios es sabiduría de calle: cómo hablar, trabajar, esperar y no arruinar tu vida un martes.",
  },
  Ecclesiastes: {
    en: "Ecclesiastes stares at success and still asks what lasts — a rare honest book about meaning.",
    es: "Eclesiastés mira el éxito y aun así pregunta qué permanece: un libro honesto sobre el sentido.",
  },
  "Song of Solomon": {
    en: "Song of Solomon is love without apology — desire, loyalty, and a God who invented both.",
    es: "Cantares es amor sin disculpas: deseo, lealtad y un Dios que inventó las dos cosas.",
  },
  Isaiah: {
    en: "Isaiah holds judgment in one hand and hope in the other — a holy God who still says, 'Come back.'",
    es: "Isaías sostiene el juicio en una mano y la esperanza en la otra: un Dios santo que aún dice «vuelve».",
  },
  Jeremiah: {
    en: "Jeremiah is the weeping prophet — telling the truth nobody wanted, then staying when the city burned.",
    es: "Jeremías es el profeta llorón: dice la verdad que nadie quería y se queda cuando la ciudad arde.",
  },
  Lamentations: {
    en: "Lamentations sits in the rubble and still says mercies are new in the morning — grief that refuses to lie.",
    es: "Lamentaciones se sienta entre los escombros y aún dice que las misericordias son nuevas cada mañana: un duelo que no miente.",
  },
  Ezekiel: {
    en: "Ezekiel is visions and dry bones — God showing up in exile, where nobody expected a future.",
    es: "Ezequiel es visiones y huesos secos: Dios aparece en el exilio, donde nadie esperaba un futuro.",
  },
  Daniel: {
    en: "Daniel is faith under an empire — lions, furnaces, and a God who doesn't clock out at sundown.",
    es: "Daniel es fe bajo un imperio: leones, hornos y un Dios que no cierra al atardecer.",
  },
  Hosea: {
    en: "Hosea is the heartbreak book — a prophet told to love someone who keeps leaving, because that's how God loves.",
    es: "Oseas es el libro del desgarro: un profeta a quien le piden amar a quien se va, porque así ama Dios.",
  },
  Joel: {
    en: "Joel starts with a locust plague and ends with the Spirit poured out — ruin that becomes a turning.",
    es: "Joel empieza con una plaga de langostas y termina con el Espíritu derramado: una ruina que se vuelve giro.",
  },
  Amos: {
    en: "Amos is the farmer-prophet who won't let worship cover injustice — God cares who gets crushed.",
    es: "Amós es el profeta campesino que no deja que la adoración tape la injusticia: a Dios le importa quién queda aplastado.",
  },
  Obadiah: {
    en: "Obadiah is a short warning to a proud neighbor — God notices when you kick someone who is already down.",
    es: "Abdías es una advertencia corta a un vecino soberbio: Dios nota cuando pateas a quien ya está en el suelo.",
  },
  Jonah: {
    en: "Jonah is the prophet who ran, got swallowed, and still sulked when God was kind — mercy that offends the insider.",
    es: "Jonás es el profeta que huyó, fue tragado y aun así se enojó cuando Dios fue bueno: una misericordia que ofende al de adentro.",
  },
  Micah: {
    en: "Micah boils the whole law down to three moves: do justice, love mercy, walk humbly.",
    es: "Miqueas resume toda la ley en tres pasos: hacer justicia, amar misericordia, caminar humildemente.",
  },
  Nahum: {
    en: "Nahum is the fall of a violent empire — God is slow to anger, and He is not soft on cruelty.",
    es: "Nahúm es la caída de un imperio violento: Dios es lento para la ira, y no es blando con la crueldad.",
  },
  Habakkuk: {
    en: "Habakkuk argues with God and ends in a song — faith that waits when the fig tree has no fruit.",
    es: "Habacuc discute con Dios y termina en un cántico: fe que espera cuando la higuera no da fruto.",
  },
  Zephaniah: {
    en: "Zephaniah warns of a coming day, then says God is in your midst, singing over you — judgment and joy in the same book.",
    es: "Sofonías advierte de un día que viene y luego dice que Dios está en medio de ti, cantando sobre ti: juicio y gozo en el mismo libro.",
  },
  Haggai: {
    en: "Haggai tells a tired people to finish the house — not because God needs a building, because they need a center.",
    es: "Hageo le dice a un pueblo cansado que termine la casa: no porque Dios necesite un edificio, sino porque ellos necesitan un centro.",
  },
  Zechariah: {
    en: "Zechariah is night visions and a coming King — 'not by might, nor by power, but by my Spirit.'",
    es: "Zacarías es visiones nocturnas y un Rey que viene: «no con ejército, ni con fuerza, sino con mi Espíritu».",
  },
  Malachi: {
    en: "Malachi is the last Old Testament word — stop giving God leftovers, because He hasn't given you leftovers.",
    es: "Malaquías es la última palabra del Antiguo Testamento: deja de darle a Dios las sobras, porque Él no te ha dado sobras.",
  },
  Matthew: {
    en: "Matthew writes Jesus as the promised King — sermons on a hillside, storms that sit down, and a cross that looks like losing.",
    es: "Mateo presenta a Jesús como el Rey prometido: sermones en un cerro, tormentas que se sientan y una cruz que parece derrota.",
  },
  Mark: {
    en: "Mark moves fast — Jesus on the move, demons out, and a question hanging: who is this man?",
    es: "Marcos va rápido: Jesús en movimiento, demonios fuera y una pregunta en el aire: ¿quién es este hombre?",
  },
  Luke: {
    en: "Luke is the outsider's gospel — shepherds, Samaritans, women, and a Savior who notices the ones everyone else walks past.",
    es: "Lucas es el evangelio del de afuera: pastores, samaritanos, mujeres y un Salvador que nota a los que los demás pasan de largo.",
  },
  John: {
    en: "John slows down on who Jesus is — light, bread, shepherd, life — and why believing Him changes everything.",
    es: "Juan se detiene en quién es Jesús: luz, pan, pastor, vida, y por qué creer en Él lo cambia todo.",
  },
  Acts: {
    en: "Acts is the church catching fire — ordinary people, impossible doors, and a Spirit who doesn't stay in the upper room.",
    es: "Hechos es la iglesia encendiéndose: gente ordinaria, puertas imposibles y un Espíritu que no se queda en el aposento alto.",
  },
  Romans: {
    en: "Romans is Paul laying the whole gospel on the table — sin, grace, and a love that nothing gets to cancel.",
    es: "Romanos es Pablo poniendo todo el evangelio sobre la mesa: pecado, gracia y un amor que nada puede cancelar.",
  },
  "1 Corinthians": {
    en: "1 Corinthians is a gifted, messy church getting told that love is the thing that actually lasts.",
    es: "1 Corintios es una iglesia talentosa y desordenada a la que le dicen que el amor es lo que de verdad permanece.",
  },
  "2 Corinthians": {
    en: "2 Corinthians is Paul weak on purpose — grace sufficient, power showing up in the cracked places.",
    es: "2 Corintios es Pablo débil a propósito: gracia que basta, poder que aparece en las grietas.",
  },
  Galatians: {
    en: "Galatians is freedom with a spine — you are not earning this, so stop putting the chains back on.",
    es: "Gálatas es libertad con carácter: esto no se gana, así que deja de volver a ponerte las cadenas.",
  },
  Ephesians: {
    en: "Ephesians zooms out — you were dead, now you're family, so walk like someone heaven already claimed.",
    es: "Efesios abre el plano: estabas muerto, ahora eres familia, así que camina como alguien que el cielo ya reclamó.",
  },
  Philippians: {
    en: "Philippians is joy from a jail cell — contentment that isn't pretending the chains aren't there.",
    es: "Filipenses es gozo desde una celda: contentamiento que no finge que las cadenas no están.",
  },
  Colossians: {
    en: "Colossians puts Jesus at the center of everything — work, words, and the quiet parts of Tuesday.",
    es: "Colosenses pone a Jesús en el centro de todo: el trabajo, las palabras y lo callado de un martes.",
  },
  "1 Thessalonians": {
    en: "1 Thessalonians is a young church learning to wait well — hope that works while it watches the sky.",
    es: "1 Tesalonicenses es una iglesia joven aprendiendo a esperar bien: esperanza que trabaja mientras mira al cielo.",
  },
  "2 Thessalonians": {
    en: "2 Thessalonians steadies people who thought the end had already started — stay faithful, keep working.",
    es: "2 Tesalonicenses afirma a quienes creían que el fin ya había empezado: sé fiel, sigue trabajando.",
  },
  "1 Timothy": {
    en: "1 Timothy is Paul coaching a young leader — guard the truth, and don't let anyone despise your youth.",
    es: "1 Timoteo es Pablo formando a un líder joven: guarda la verdad y que nadie menosprecie tu juventud.",
  },
  "2 Timothy": {
    en: "2 Timothy is Paul's last letter — finish the race, keep the faith, the Lord stood with me.",
    es: "2 Timoteo es la última carta de Pablo: termina la carrera, guarda la fe, el Señor estuvo a mi lado.",
  },
  Titus: {
    en: "Titus is grace that trains you — not a license to drift, a reason to live clean.",
    es: "Tito es gracia que te entrena: no una licencia para irte a la deriva, sino una razón para vivir limpio.",
  },
  Philemon: {
    en: "Philemon is a one-page letter about a runaway — welcome him as a brother, not a debt.",
    es: "Filemón es una carta de una página sobre un fugitivo: recíbelo como hermano, no como deuda.",
  },
  Hebrews: {
    en: "Hebrews says Jesus is the better priest — He knows weakness from the inside, and He isn't leaving.",
    es: "Hebreos dice que Jesús es el mejor sacerdote: conoce la debilidad desde adentro, y no se va.",
  },
  James: {
    en: "James will not let faith stay theoretical — hear the word, then do it, before you fool yourself.",
    es: "Santiago no deja que la fe se quede en teoría: oye la palabra y luego hazla, antes de engañarte.",
  },
  "1 Peter": {
    en: "1 Peter writes to people under pressure — cast the anxiety, stay awake, you are not abandoned.",
    es: "1 Pedro escribe a gente bajo presión: echa la ansiedad, mantente despierto, no estás abandonado.",
  },
  "2 Peter": {
    en: "2 Peter is a last warning to grow — grace and knowledge, not a faith that sits still and spoils.",
    es: "2 Pedro es una última advertencia a crecer: gracia y conocimiento, no una fe que se queda quieta y se echa a perder.",
  },
  "1 John": {
    en: "1 John keeps circling the same fire — God is love, and the people who know Him start to look like it.",
    es: "1 Juan da vueltas alrededor del mismo fuego: Dios es amor, y los que lo conocen empiezan a parecerse a eso.",
  },
  "2 John": {
    en: "2 John is a short note to stay in the truth — love that doesn't wander off the path.",
    es: "2 Juan es una nota corta para quedarse en la verdad: amor que no se sale del camino.",
  },
  "3 John": {
    en: "3 John praises people who help the travelers — hospitality as a form of gospel.",
    es: "3 Juan alaba a quienes ayudan a los que viajan: la hospitalidad como una forma de evangelio.",
  },
  Jude: {
    en: "Jude is a short, sharp call to contend for the faith — mercy for the doubting, fire for the fake.",
    es: "Judas es un llamado corto y firme a contender por la fe: misericordia para el que duda, fuego para lo falso.",
  },
  Revelation: {
    en: "Revelation is not a puzzle first — it is a promise that the Lamb wins, and every tear gets wiped.",
    es: "Apocalipsis no es primero un acertijo: es la promesa de que el Cordero gana y se enjuga toda lágrima.",
  },
};

const RELATED: Record<string, { slug: string; en: string; es: string }> = {
  Genesis: { slug: "creation", en: "The Creation story", es: "La historia de la Creación" },
  Exodus: { slug: "crossing-the-red-sea", en: "Crossing the Red Sea", es: "El cruce del Mar Rojo" },
  Numbers: { slug: "wandering-the-desert", en: "Why Israel wandered 40 years", es: "Por qué Israel vagó 40 años" },
  Deuteronomy: { slug: "choose-life-or-death", en: "Choose life or death", es: "Elige la vida o la muerte" },
  Joshua: { slug: "caleb-claims-his-mountain", en: "Caleb claims his mountain", es: "Caleb reclama su tierra" },
  Judges: { slug: "gideon-vs-the-midianites", en: "Gideon vs the Midianites", es: "Gedeón contra Madián" },
  Ruth: { slug: "ruth-and-naomi", en: "Ruth and Naomi", es: "Rut y Noemí" },
  "1 Samuel": { slug: "david-and-goliath", en: "David and Goliath", es: "David y Goliat" },
  "2 Samuel": { slug: "absaloms-rebellion", en: "Absalom's rebellion", es: "La rebelión de Absalón" },
  "1 Kings": { slug: "elijah-on-mount-carmel", en: "Elijah on Mount Carmel", es: "Elías en el monte Carmelo" },
  "2 Kings": { slug: "elijah-taken-to-heaven", en: "Elijah taken to heaven", es: "Elías llevado al cielo" },
  Esther: { slug: "esther-saves-her-people", en: "Esther saves her people", es: "Ester salva a su pueblo" },
  Job: { slug: "god-answers-job", en: "God answers Job", es: "Dios responde a Job" },
  Psalms: { slug: "david-writes-psalm-23", en: "The story behind Psalm 23", es: "La historia detrás del Salmo 23" },
  Psalm: { slug: "david-writes-psalm-23", en: "The story behind Psalm 23", es: "La historia detrás del Salmo 23" },
  Proverbs: { slug: "solomons-wisdom", en: "Solomon's wisdom", es: "La sabiduría de Salomón" },
  Isaiah: { slug: "isaiahs-call", en: "Isaiah's call", es: "El llamado de Isaías" },
  Jeremiah: { slug: "jeremiah-in-the-cistern", en: "Jeremiah in the cistern", es: "Jeremías en la cisterna" },
  Daniel: { slug: "daniel-and-the-lions-den", en: "Daniel and the lions' den", es: "Daniel en el foso de los leones" },
  Hosea: { slug: "hosea-and-gomer", en: "Hosea and Gomer", es: "Oseas y Gomer" },
  Jonah: { slug: "jonah-and-the-whale", en: "Jonah and the whale", es: "Jonás y la ballena" },
  Matthew: { slug: "walking-on-water", en: "Jesus walks on water", es: "Jesús camina sobre el agua" },
  Mark: { slug: "jesus-stops-a-storm", en: "Jesus calms the storm", es: "Jesús calma la tormenta" },
  Luke: { slug: "the-good-samaritan", en: "The Good Samaritan", es: "El buen samaritano" },
  John: { slug: "the-woman-at-the-well", en: "The woman at the well", es: "La mujer en el pozo" },
  Acts: { slug: "peters-miracles", en: "Peter's miracles", es: "Los milagros de Pedro" },
  Romans: { slug: "saul-meets-jesus", en: "Saul meets Jesus", es: "Saulo se encuentra con Jesús" },
  Hebrews: { slug: "the-centurions-faith", en: "The centurion's faith", es: "La fe del centurión" },
  James: { slug: "faith-without-works", en: "Faith without works", es: "Fe sin obras" },
  Revelation: { slug: "the-fall-of-babylon", en: "The fall of Babylon", es: "La caída de Babilonia" },
};

const THEMES: { test: RegExp; en: string; es: string; qEn: string; qEs: string }[] = [
  {
    test: /fear|afraid|dismayed|temas|miedo|desmay/i,
    en: "If something has you braced for impact, this verse does not ask you to pretend you are fine. It asks you to remember who is standing in the room with you.",
    es: "Si algo te tiene tenso esperando el golpe, este versículo no te pide que finjas que estás bien. Te pide que recuerdes quién está en la habitación contigo.",
    qEn: "What are you afraid of today — and what would change if you believed God was already in it?",
    qEs: "¿De qué tienes miedo hoy, y qué cambiaría si creyeras que Dios ya está en eso?",
  },
  {
    test: /love|loved|heart|amor|corazón|corazon/i,
    en: "Love in scripture is not a mood. It is a decision that stays when the feeling clocks out. Let this verse name the kind of love you actually need today.",
    es: "El amor en la Escritura no es un estado de ánimo. Es una decisión que se queda cuando el sentimiento se va. Deja que este versículo nombre el amor que de verdad necesitas hoy.",
    qEn: "Who needs that kind of love from you before the day is over?",
    qEs: "¿Quién necesita de ti ese tipo de amor antes de que se acabe el día?",
  },
  {
    test: /peace|anxious|anxiety|worry|rest|paz|ansied|inquiet|preocup/i,
    en: "Peace here is not a spa day. It is God holding your mind still while the inbox keeps moving. You can carry this verse into the next hard hour.",
    es: "La paz aquí no es un día de spa. Es Dios sosteniendo tu mente quieta mientras el buzón sigue llenándose. Puedes llevar este versículo a la próxima hora difícil.",
    qEn: "Where is your mind running — and what would it look like to hand that thought to God once, out loud?",
    qEs: "¿Adónde se te va la mente, y cómo sería entregarle ese pensamiento a Dios una vez, en voz alta?",
  },
  {
    test: /strong|strength|courage|fortalez|valiente|fuerza|poder/i,
    en: "Strength in this verse is not hype. It is God putting a spine in a tired person. You do not have to manufacture it before you take the next step.",
    es: "La fortaleza en este versículo no es euforia. Es Dios poniéndole columna a alguien cansado. No tienes que fabricarla antes de dar el siguiente paso.",
    qEn: "What is the one hard thing in front of you that this verse gives you permission to face?",
    qEs: "¿Cuál es la cosa difícil que tienes delante y que este versículo te da permiso de enfrentar?",
  },
  {
    test: /forgiv|mercy|grace|perdon|misericord|gracia/i,
    en: "Grace is God refusing to let your worst day be the last word. If you are stuck replaying a failure, this verse is an open door, not a lecture.",
    es: "La gracia es Dios negándose a que tu peor día sea la última palabra. Si estás atascado repitiendo un fracaso, este versículo es una puerta abierta, no un sermón.",
    qEn: "What do you need to put down today — a grudge, a shame, or both?",
    qEs: "¿Qué necesitas soltar hoy: un rencor, una vergüenza, o las dos cosas?",
  },
  {
    test: /hope|wait|trust|confí|confia|esperanz|espera/i,
    en: "Hope in the Bible is not optimism. It is tying your future to someone who has not broken a promise yet. Waiting counts as faith when you stay.",
    es: "La esperanza en la Biblia no es optimismo. Es atar tu futuro a alguien que todavía no ha roto una promesa. Esperar cuenta como fe cuando te quedas.",
    qEn: "What are you waiting on — and can you trust God with the timing you cannot control?",
    qEs: "¿Qué estás esperando, y puedes confiarle a Dios el tiempo que no controlas?",
  },
  {
    test: /light|dark|tiniebl|luz|oscur/i,
    en: "Light in scripture is not décor. It is God refusing to let the dark have the last say. Carry this verse into the part of the day that feels dim.",
    es: "La luz en la Escritura no es decoración. Es Dios negándose a que la oscuridad tenga la última palabra. Lleva este versículo a la parte del día que se siente opaca.",
    qEn: "Where do you need light today — a decision, a mood, or a relationship?",
    qEs: "¿Dónde necesitas luz hoy: una decisión, un ánimo o una relación?",
  },
  {
    test: /weak|empath|priest|compas|debilid|sumo sacerdote/i,
    en: "This is not a God who watches from a balcony. He knows the weight from the inside — the tired body, the private fear, the day you almost quit. You are not explaining yourself to someone who has never been human.",
    es: "Este no es un Dios que mira desde un balcón. Conoce el peso desde adentro: el cuerpo cansado, el miedo privado, el día en que casi te rindes. No le estás explicando nada a alguien que nunca ha sido humano.",
    qEn: "What weakness are you hiding today that this verse says Jesus already understands?",
    qEs: "¿Qué debilidad escondes hoy que este versículo dice que Jesús ya entiende?",
  },
];

const FALLBACK = {
  en: "Read it slowly. Not as a poster. As a sentence God is still willing to say to a real person on a real morning.",
  es: "Léelo despacio. No como un póster. Como una frase que Dios todavía está dispuesto a decirle a una persona real en una mañana real.",
  qEn: "What would it look like to live this verse for the next twelve hours — not the next twelve years?",
  qEs: "¿Cómo sería vivir este versículo las próximas doce horas, no los próximos doce años?",
};

function parseBook(enRef: string): string {
  const m = enRef.match(/^((?:\d\s)?[A-Za-z]+(?:\s[A-Za-z]+)?)\s+\d/);
  return m?.[1] ?? enRef;
}

function themeFor(text: string) {
  return THEMES.find((t) => t.test.test(text)) ?? null;
}

export function getVerseReflection(
  enVerse: { text: string; ref: string },
  localVerse: { text: string; ref: string },
  locale: Locale,
): VerseReflection {
  const book = parseBook(enVerse.ref);
  const ctx = BOOK_CONTEXT[book]?.[locale] ?? BOOK_CONTEXT[book]?.en ?? "";
  const theme = themeFor(`${enVerse.text} ${localVerse.text}`);
  const apply = theme
    ? locale === "es" ? theme.es : theme.en
    : locale === "es" ? FALLBACK.es : FALLBACK.en;
  const question = theme
    ? locale === "es" ? theme.qEs : theme.qEn
    : locale === "es" ? FALLBACK.qEs : FALLBACK.qEn;

  const relatedMeta = RELATED[book] ?? RELATED.Psalms;
  const href = locale === "es" ? `/es/stories/${relatedMeta.slug}/` : `/stories/${relatedMeta.slug}/`;
  const label = locale === "es" ? relatedMeta.es : relatedMeta.en;

  const quote = localVerse.text.replace(/\s+/g, " ").trim();
  const body =
    locale === "es"
      ? `El versículo del día de hoy es ${localVerse.ref}: «${quote}» ${ctx} ${apply} Quédate con esta frase un momento. Luego llévala en el widget gratis de Bible Tea, o escucha la historia detrás del pasaje como audio inmersivo.`
      : `Today's Bible verse of the day is ${localVerse.ref}: “${quote}” ${ctx} ${apply} Stay with this sentence a minute. Then put it on your home screen with the free Bible Tea widget, or hear the story behind the passage as immersive audio.`;

  return {
    body: body.replace(/\s+/g, " ").trim(),
    question,
    related: { href, label },
  };
}
