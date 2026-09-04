import type { Locale } from "./i18n";

/**
 * SEO helpers driven by Google Search Console data (last-28-days export,
 * Jul 2026). Two levers:
 *
 * 1. `localizeBibleRef` — most ES pages were rendering English book names
 *    ("Exodus 32") in titles while Spanish users search "Éxodo 32" or
 *    "1 reyes 17:8-24". Localizing the reference makes titles exact-match
 *    dozens of reference queries we already rank for.
 *
 * 2. `STORY_SEO` / `PLAYLIST_SEO` / `CHARACTER_SEO` / `PRAYER_SEO` —
 *    hand-written titles and meta descriptions for pages that rank on page 1
 *    with high impressions but ~0% CTR. Each override matches GSC queries.
 */

const BOOK_NAMES_ES: Record<string, string> = {
  Genesis: "Génesis",
  Exodus: "Éxodo",
  Leviticus: "Levítico",
  Numbers: "Números",
  Deuteronomy: "Deuteronomio",
  Joshua: "Josué",
  Judges: "Jueces",
  Ruth: "Rut",
  "1 Samuel": "1 Samuel",
  "2 Samuel": "2 Samuel",
  "1 Kings": "1 Reyes",
  "2 Kings": "2 Reyes",
  "1 Chronicles": "1 Crónicas",
  "2 Chronicles": "2 Crónicas",
  Ezra: "Esdras",
  Nehemiah: "Nehemías",
  Esther: "Ester",
  Job: "Job",
  Psalms: "Salmos",
  Psalm: "Salmo",
  Proverbs: "Proverbios",
  Ecclesiastes: "Eclesiastés",
  "Song of Songs": "Cantares",
  "Song of Solomon": "Cantares",
  Isaiah: "Isaías",
  Jeremiah: "Jeremías",
  Lamentations: "Lamentaciones",
  Ezekiel: "Ezequiel",
  Daniel: "Daniel",
  Hosea: "Oseas",
  Joel: "Joel",
  Amos: "Amós",
  Obadiah: "Abdías",
  Jonah: "Jonás",
  Micah: "Miqueas",
  Nahum: "Nahúm",
  Habakkuk: "Habacuc",
  Zephaniah: "Sofonías",
  Haggai: "Hageo",
  Zechariah: "Zacarías",
  Malachi: "Malaquías",
  Matthew: "Mateo",
  Mark: "Marcos",
  Luke: "Lucas",
  John: "Juan",
  Acts: "Hechos",
  Romans: "Romanos",
  "1 Corinthians": "1 Corintios",
  "2 Corinthians": "2 Corintios",
  Galatians: "Gálatas",
  Ephesians: "Efesios",
  Philippians: "Filipenses",
  Colossians: "Colosenses",
  "1 Thessalonians": "1 Tesalonicenses",
  "2 Thessalonians": "2 Tesalonicenses",
  "1 Timothy": "1 Timoteo",
  "2 Timothy": "2 Timoteo",
  Titus: "Tito",
  Philemon: "Filemón",
  Hebrews: "Hebreos",
  James: "Santiago",
  "1 Peter": "1 Pedro",
  "2 Peter": "2 Pedro",
  "1 John": "1 Juan",
  "2 John": "2 Juan",
  "3 John": "3 Juan",
  Jude: "Judas",
  Revelation: "Apocalipsis",
};

// Longest names first so "1 Kings" matches before "Kings"/"John" etc.
const BOOK_ENTRIES_ES = Object.entries(BOOK_NAMES_ES).sort(
  (a, b) => b[0].length - a[0].length
);

/** Translate Bible book names inside a reference string (e.g. "Exodus 32" → "Éxodo 32"). */
export function localizeBibleRef(ref: string, locale: Locale): string {
  if (locale !== "es" || !ref) return ref;
  let out = ref;
  for (const [en, es] of BOOK_ENTRIES_ES) {
    if (en === es) continue;
    out = out.replace(new RegExp(`(?<![A-Za-z])${en}(?![A-Za-z])`, "g"), es);
  }
  return out;
}

export interface SeoOverride {
  title?: string;
  description?: string;
}

type LocalizedSeo = Partial<Record<Locale, SeoOverride>>;

/**
 * Curated titles/descriptions for story pages with high impressions and
 * near-zero CTR in GSC. Keyed by story id (URL slug).
 */
export const STORY_SEO: Record<string, LocalizedSeo> = {
  "john-the-baptists-last-words": {
    en: {
      title: "What Were John the Baptist's Last Words? - Bible Tea",
      description:
        "What were John the Baptist's last words? \"He must increase, I must decrease\" (John 3:30). The story behind them — and how he died. Listen on Bible Tea.",
    },
    es: {
      title: "Las Últimas Palabras de Juan el Bautista — Juan 3:30 - Bible Tea",
      description:
        "¿Cuáles fueron las últimas palabras de Juan el Bautista? \"Es necesario que él crezca, y que yo mengüe\" (Juan 3:30). La historia completa, narrada.",
    },
  },
  "john-the-baptist-beheaded": {
    en: {
      title: "Why Was John the Baptist Killed? — Matthew 14:1-12 - Bible Tea",
      description:
        "Why was John the Baptist beheaded? A king's rash oath, a grudge, and a birthday party gone dark. How John the Baptist died — the full story, retold.",
    },
    es: {
      title: "¿Por Qué Mataron a Juan el Bautista? — Mateo 14:1-12 - Bible Tea",
      description:
        "¿Por qué fue decapitado Juan el Bautista? Un juramento imprudente, un rencor y una fiesta que terminó mal. La historia completa, narrada como nunca.",
    },
  },
  "peters-miracles": {
    en: {
      title: "What Miracles Did Peter Perform in the Bible? - Bible Tea",
      description:
        "What miracles did Peter perform? He heals paralyzed Aeneas in Lydda and raises Tabitha from the dead in Joppa. Every miracle of Peter — listen free.",
    },
    es: {
      title: "¿Qué milagros hizo Pedro en la Biblia? - Bible Tea",
      description:
        "¿Qué milagros hizo Pedro? Sana al paralítico Eneas en Lida y resucita a Tabita en Jope. Todos los milagros de Pedro, narrados como audio.",
    },
  },
  "walking-on-water": {
    en: {
      title: "Jesus Walks on Water — Full Story (Matthew 14:22-33) - Bible Tea",
      description:
        "Jesus walks on water in the middle of a storm — and Peter steps out to join him. Who walked on water with Jesus, what happened, and what it means.",
    },
    es: {
      title: "Jesús Camina sobre el Agua — Mateo 14:22-33 - Bible Tea",
      description:
        "Jesús camina sobre las aguas en medio de la tormenta — y Pedro sale a reunirse con él. Mateo 14:22-33, narrado como audio inmersivo.",
    },
  },
  "flight-to-egypt": {
    en: {
      title: "The Flight to Egypt — Why Jesus' Family Fled (Matthew 2) - Bible Tea",
      description:
        "An angel warns Joseph in a dream and the family escapes to Egypt by night while Herod hunts the child. The flight to Egypt story, retold as audio.",
    },
  },
  "zacchaeus-climbs-a-tree": {
    en: {
      title: "Who Climbed a Tree to See Jesus? Zacchaeus - Bible Tea",
      description:
        "Who climbed a tree to see Jesus? Zacchaeus — a short, rich tax collector who scaled a sycamore in Jericho (Luke 19:1-10). Jesus invited himself over. Listen on Bible Tea.",
    },
    es: {
      title: "¿Quién subió a un árbol para ver a Jesús? Zaqueo - Bible Tea",
      description:
        "¿Quién subió a un árbol para ver a Jesús? Zaqueo — un recaudador bajo y rico que trepó un sicómoro en Jericó (Lucas 19:1-10). Jesús se invitó a su casa.",
    },
  },
  "the-rich-man-and-lazarus": {
    en: {
      title: "The Rich Man & Lazarus — Luke 16:19-31 Explained - Bible Tea",
      description:
        "A rich man ignores the beggar at his gate. Both die — and everything flips. The rich man and Lazarus (Luke 16:19-31), its meaning, retold as audio.",
    },
    es: {
      title: "El Rico y Lázaro — Lucas 16:19-31 Explicado - Bible Tea",
      description:
        "Un hombre rico ignora al mendigo en su puerta. Ambos mueren — y todo cambia. La parábola del rico y Lázaro (Lucas 16:19-31) y su significado.",
    },
  },
  "elijah-on-mount-carmel": {
    en: {
      title: "What Happened on Mount Carmel? Elijah vs Baal - Bible Tea",
      description:
        "One prophet vs 450. Two altars, one challenge: the god who answers with fire wins. Elijah on Mount Carmel (1 Kings 18) — listen free on Bible Tea.",
    },
    es: {
      title: "Elías vs 450 Profetas de Baal — Fuego del Cielo - Bible Tea",
      description:
        "Un profeta contra 450. Dos altares, un desafío: el dios que responda con fuego gana. Elías en el monte Carmelo (1 Reyes 18), narrado.",
    },
  },
  "angel-visits-zechariah": {
    en: {
      title: "Why Was Zechariah Struck Mute? — Luke 1:5-25 - Bible Tea",
      description:
        "An angel promises old Zechariah a son — John the Baptist. He doubts, and God takes his voice for 9 months. The full story (Luke 1:5-25), free audio.",
    },
  },
  "simeon-and-anna": {
    en: {
      title: "Simeon & Anna in the Temple — Luke 2:22-40 Explained - Bible Tea",
      description:
        "Who were Simeon and Anna? Two elderly believers who waited their whole lives for the Messiah — and recognized him in a baby. Luke 2:22-40, retold.",
    },
  },
  "jacob-and-esau": {
    en: {
      title: "Jacob & Esau: The Bible's Twin Brothers (Genesis 25-27) - Bible Tea",
      description:
        "Were Jacob and Esau twins? Yes — sons of Isaac and Rebekah. A stolen blessing, a bowl of stew, and decades of family beef. The full story, retold.",
    },
    es: {
      title: "Jacob y Esaú: Los Gemelos de la Biblia (Génesis 25-27) - Bible Tea",
      description:
        "¿Eran gemelos Jacob y Esaú? Sí — hijos de Isaac y Rebeca. Una bendición robada, un plato de lentejas y décadas de rivalidad. La historia completa.",
    },
  },
  "the-centurions-faith": {
    en: {
      title: "The Centurion's Faith — Matthew 8:5-13 Explained - Bible Tea",
      description:
        "A Roman centurion tells Jesus: \"just say the word and my servant will be healed.\" Why Jesus called it the greatest faith in Israel. Retold as audio.",
    },
    es: {
      title: "La Fe del Centurión Romano — Mateo 8:5-13 Explicado - Bible Tea",
      description:
        "Un centurión romano le dice a Jesús: \"solo di la palabra y mi siervo sanará.\" Por qué Jesús la llamó la fe más grande de Israel. Narrado como audio.",
    },
  },
  "feeding-4000": {
    en: {
      title: "Jesus Feeds the 4,000 — Matthew 15:32-39 - Bible Tea",
      description:
        "The feeding of the 4,000: a few loaves, a few fish, thousands fed — and it's not the same story as the 5,000. Matthew 15:32-39, retold as audio.",
    },
    es: {
      title: "Jesús Alimenta a 4,000 — Mateo 15:32-39 - Bible Tea",
      description:
        "Jesús alimenta a 4,000 personas con unos panes y unos peces — y no es la misma historia de los 5,000. Mateo 15:32-39, narrado como audio inmersivo.",
    },
  },
  "boy-jesus-at-the-temple": {
    en: {
      title: "Jesus at Age 12 in the Temple — Luke 2:41-52 - Bible Tea",
      description:
        "Jesus at 12 goes missing for three days — his parents find him in the temple, schooling the teachers. Boy Jesus in the temple — free audio.",
    },
    es: {
      title: "El Niño Jesús en el Templo, a los 12 Años — Lucas 2:41-52 - Bible Tea",
      description:
        "Jesús a los 12 años desaparece por tres días — sus padres lo encuentran en el templo, asombrando a los maestros. Lucas 2:41-52 — audio en Bible Tea.",
    },
  },
  "solomon-builds-the-temple": {
    en: {
      title: "Solomon Builds the Temple — 1 Kings 5-8 Explained - Bible Tea",
      description:
        "7 years, 180,000 workers, and gold on everything. Solomon builds God's temple — then glory fills it. 1 Kings 5-8, retold as free audio.",
    },
  },
  "the-fish-with-a-coin": {
    en: {
      title: "The Fish with a Coin in Its Mouth — Matthew 17:24-27 - Bible Tea",
      description:
        "Jesus tells Peter to go catch a fish — the first one has a coin in its mouth to pay the tax. One of Jesus' strangest miracles. Listen on Bible Tea.",
    },
  },
  "absaloms-rebellion": {
    en: {
      title: "Absalom's Rebellion — Why He Turned on David - Bible Tea",
      description:
        "Who was Absalom? David's own son — who stole Israel's hearts and forced the king to flee. Why Absalom rebelled against David (2 Samuel 15-17), retold.",
    },
    es: {
      title: "La Rebelión de Absalón contra David — 2 Samuel 15-17 - Bible Tea",
      description:
        "¿Quién era Absalón en la Biblia? El propio hijo de David — que robó el corazón del pueblo y obligó al rey a huir. La rebelión de Absalón, narrada.",
    },
  },
  "gods-promise-to-david": {
    en: {
      title: "God's Promise to David — 2 Samuel 7 Explained - Bible Tea",
      description:
        "What did God promise David in 2 Samuel 7? A house, a kingdom, and a throne established forever. The covenant with David, retold as immersive audio.",
    },
  },
  "david-writes-psalm-23": {
    en: {
      title: "Who Wrote Psalm 23? The Story Behind David's Psalm - Bible Tea",
      description:
        "Who wrote Psalm 23 — and when? David, the shepherd-turned-king. The story behind \"The Lord is my shepherd,\" retold as immersive audio on Bible Tea.",
    },
  },
  "the-golden-calf": {
    en: {
      title: "The Golden Calf — The Idol at Sinai (Exodus 32) - Bible Tea",
      description:
        "Moses is gone 40 days and Israel melts its jewelry into a golden calf — a false god. The golden calf story (Exodus 32), retold as immersive audio.",
    },
    es: {
      title: "¿Qué es el becerro de oro en la Biblia? - Bible Tea",
      description:
        "¿Qué es el becerro de oro? Un ídolo: Moisés tardó 40 días y el pueblo fundió sus joyas para adorar un falso dios. Éxodo 32, narrado.",
    },
  },
  "saul-meets-jesus": {
    en: {
      title: "Saul Meets Jesus on the Road to Damascus — Acts 9 - Bible Tea",
      description:
        "A blinding light, a voice from heaven, and the church's worst enemy becomes its greatest apostle. Saul's conversion on the road to Damascus, retold.",
    },
  },
  "joseph-and-his-brothers": {
    en: {
      title: "Joseph & His Brothers — The Betrayal (Genesis 37) - Bible Tea",
      description:
        "Joseph's brothers fake his death and sell him for silver — all over a coat and some dreams. Joseph and his brothers (Genesis 37), retold as audio.",
    },
  },
  "athens-the-unknown-god": {
    en: {
      title: "The Unknown God in Athens — Acts 17:15-34 - Bible Tea",
      description:
        "Paul finds an altar \"to the unknown god\" in Athens — and tells them exactly who it is. Paul at the Areopagus (Acts 17:15-34), retold as audio.",
    },
    es: {
      title: "Al Dios Desconocido — Pablo en Atenas (Hechos 17) - Bible Tea",
      description:
        "Pablo encuentra en Atenas un altar \"al dios desconocido\" — y les dice exactamente quién es. Hechos 17:15-34, narrado como audio inmersivo.",
    },
  },
  "jacobs-ladder": {
    en: {
      title: "Jacob's Ladder — The Dream at Bethel (Genesis 28) - Bible Tea",
      description:
        "A fugitive falls asleep on a rock and dreams of a stairway to heaven with angels on it. Jacob's ladder (Genesis 28) and its meaning, retold as audio.",
    },
  },
  "the-fiery-furnace": {
    en: {
      title: "The Fiery Furnace — Shadrach, Meshach & Abednego - Bible Tea",
      description:
        "Three men refuse to bow, get thrown into a blazing furnace — and a fourth figure appears in the flames. Daniel 3, retold as immersive audio.",
    },
  },
  "elijah-fed-by-ravens": {
    es: {
      title: "Elías Alimentado por Cuervos — 1 Reyes 17:1-7 - Bible Tea",
      description:
        "¿Qué profeta fue alimentado por cuervos? Elías — escondido en el arroyo de Querit mientras los pájaros le traían pan y carne. 1 Reyes 17:1-7, narrado.",
    },
  },
  "eutychus-falls-out-a-window": {
    en: {
      title: "Eutychus Falls Out a Window — Acts 20:7-12 - Bible Tea",
      description:
        "Who fell out a window while Paul preached? Eutychus — he fell asleep, dropped from a third story, and Paul brought him back. Acts 20, retold as audio.",
    },
    es: {
      title: "¿Quién es Éutico? El que se cayó de la ventana - Bible Tea",
      description:
        "¿Cómo se llama el que se cayó de la ventana en la Biblia? Éutico — se durmió en el sermón de Pablo, cayó de un tercer piso y volvió a la vida.",
    },
  },
  "elijah-and-the-widow": {
    es: {
      title: "Elías y la Viuda de Sarepta — 1 Reyes 17:8-24 - Bible Tea",
      description:
        "Una viuda con su último puñado de harina, un profeta que pide pan, y un milagro que no se acaba. Elías y la viuda (1 Reyes 17:8-24), narrado.",
    },
  },
  "achans-hidden-sin": {
    es: {
      title: "El Pecado de Acán — Josué 7 - Bible Tea",
      description:
        "El pecado oculto de Acán: roba botín prohibido, lo esconde bajo su tienda, e Israel pierde la batalla. Josué 7, narrado como audio inmersivo.",
    },
  },
  "the-boy-with-a-demon": {
    es: {
      title: "El Niño con un Demonio — Mateo 17:14-21 - Bible Tea",
      description:
        "Los discípulos no pueden liberar a un niño poseído. Jesús lo hace al instante: \"esta clase solo sale con oración.\" Mateo 17:14-21, narrado.",
    },
  },
  "jesus-before-pilate": {
    es: {
      title: "Jesús Ante Pilato — El Juicio (Mateo 27:11-26) - Bible Tea",
      description:
        "Pilato no encuentra culpa en Jesús, pero la multitud grita por la crucifixión — y él se lava las manos. Jesús ante Pilato, narrado como audio.",
    },
  },
  "ruth-and-naomi": {
    es: {
      title: "Rut y Noemí — Historia Completa (Rut 1-4) - Bible Tea",
      description:
        "\"Donde tú vayas, yo iré.\" La historia de Rut y Noemí: lealtad, pérdida y un final que cambió la historia. Rut 1-4, narrado como audio inmersivo.",
    },
  },
  "the-good-samaritan": {
    en: {
      title: "The Good Samaritan — Luke 10:25-37 Explained - Bible Tea",
      description:
        "A man is beaten and left for dead. A priest and a Levite walk past. The despised outsider stops. The Good Samaritan parable (Luke 10:25-37) and what it means.",
    },
    es: {
      title: "El buen samaritano en la Biblia — Lucas 10 - Bible Tea",
      description:
        "¿Qué es el buen samaritano en la Biblia? Un hombre asaltado, religiosos que pasan de largo, y el forastero que se detiene. Lucas 10:25-37.",
    },
  },
  "a-talking-donkey-and-a-hired-prophet": {
    en: {
      title: "Which Bible Character Talked to a Donkey? - Bible Tea",
      description:
        "Which Bible character was spoken to by a donkey? Balaam — hired to curse Israel, until his donkey saw the angel he couldn't. Numbers 22, retold as audio.",
    },
    es: {
      title: "¿El burro que habló en la Biblia? - Bible Tea",
      description:
        "¿El burro que habló en la Biblia? Balaam — contratado para maldecir a Israel, hasta que su burra vio al ángel que él no veía. Números 22, narrado.",
    },
  },
  "jesus-stops-a-storm": {
    en: {
      title: "Jesus Calms the Storm — \"Peace, Be Still\" (Mark 4) - Bible Tea",
      description:
        "A storm hits, the disciples panic, and Jesus is asleep. He wakes and says \"Peace, be still.\" Jesus calms the storm (Mark 4:35-41) — free audio.",
    },
    es: {
      title: "Jesús Calma la Tormenta — Marcos 4:35-41 - Bible Tea",
      description:
        "Una tormenta, los discípulos en pánico, y Jesús dormido. Se despierta y dice: \"¡Calla, enmudece!\" Jesús calma la tormenta. Narrado como audio.",
    },
  },
  "wandering-the-desert": {
    en: {
      title: "Why Israel Wandered 40 Years in the Desert - Bible Tea",
      description:
        "Why did Israel wander 40 years in the wilderness? They didn't trust God at the edge of the promised land. Numbers 14–36, retold as immersive audio.",
    },
    es: {
      title: "40 Años Vagando por el Desierto — Números 14-36 - Bible Tea",
      description:
        "¿Por qué Israel vagó 40 años por el desierto? No confiaron en Dios en la frontera de la tierra prometida. Números 14-36, narrado como audio.",
    },
  },
  "lots-escape-gone-wrong": {
    en: {
      title: "Lot's Escape from Sodom — Genesis 19 - Bible Tea",
      description:
        "Lot flees Sodom, his wife looks back and becomes salt — and then it gets worse. Genesis 19:30-38, retold as immersive audio.",
    },
    es: {
      title: "La Huida de Lot de Sodoma — Génesis 19:30-38 - Bible Tea",
      description:
        "Lot sale de Sodoma, su esposa mira atrás y se convierte en sal — y luego todo empeora. Génesis 19:30-38, narrado como audio inmersivo.",
    },
  },
  "david-and-goliath": {
    en: {
      title: "David and Goliath — The Full Story (1 Samuel 17) - Bible Tea",
      description:
        "A shepherd boy, a giant, and one stone. How David defeated Goliath — the underdog story that still lands. 1 Samuel 17, retold as immersive audio.",
    },
    es: {
      title: "David y Goliat — Historia Completa (1 Samuel 17) - Bible Tea",
      description:
        "Un pastor, un gigante y una piedra. Cómo David venció a Goliat — la historia del menospreciado que todavía impacta. 1 Samuel 17, narrado como audio.",
    },
  },
  "jonah-and-the-whale": {
    en: {
      title: "Jonah and the Whale — The Full Story (Jonah 1-4) - Bible Tea",
      description:
        "A prophet runs from God, a storm hits, and a great fish swallows him. Jonah and the whale (Jonah 1–4) — what happened next, retold as audio.",
    },
    es: {
      title: "Jonás y la Ballena — Historia Completa (Jonás 1-4) - Bible Tea",
      description:
        "Un profeta huye de Dios, llega una tormenta y un gran pez se lo traga. Jonás y la ballena (Jonás 1–4) — qué pasó después, narrado como audio.",
    },
  },
  "jesus-flips-tables": {
    en: {
      title: "Jesus Flips the Tables — Cleansing the Temple - Bible Tea",
      description:
        "Jesus walks into the temple, makes a whip, and drives out the money changers. Why he flipped the tables — and what it meant. Retold as audio.",
    },
    es: {
      title: "Jesús Voltea las Mesas — Limpieza del Templo - Bible Tea",
      description:
        "Jesús entra al templo, hace un látigo y echa a los cambistas. Por qué volcó las mesas — y qué significó. Narrado como audio inmersivo.",
    },
  },
  "the-resurrection": {
    en: {
      title: "The Resurrection of Jesus — Easter Morning - Bible Tea",
      description:
        "The tomb is empty. The women arrive first. Death doesn't get the last word. The resurrection of Jesus, retold as immersive audio on Bible Tea.",
    },
    es: {
      title: "La Resurrección de Jesús — La Mañana de Pascua - Bible Tea",
      description:
        "La tumba está vacía. Las mujeres llegan primero. La muerte no tiene la última palabra. La resurrección de Jesús, narrada como audio inmersivo.",
    },
  },
  "elijah-runs-from-jezebel": {
    en: {
      title: "Elijah Runs from Jezebel — 1 Kings 19 - Bible Tea",
      description:
        "After Carmel, Elijah collapses. Jezebel wants him dead, and he runs into the wilderness. What God said to the exhausted prophet. 1 Kings 19, retold.",
    },
    es: {
      title: "Elías Huye de Jezabel — 1 Reyes 19 - Bible Tea",
      description:
        "Después del Carmelo, Elías se derrumba. Jezabel quiere matarlo y huye al desierto. Lo que Dios le dijo al profeta agotado. 1 Reyes 19, narrado.",
    },
  },
  "hosea-and-gomer": {
    en: {
      title: "Hosea & Gomer — The Bible's Most Heartbreaking Love Story - Bible Tea",
      description:
        "God tells Hosea to marry Gomer. She leaves — and he buys her back. The story of Hosea and Gomer (Hosea 1-3) and what it means. Listen on Bible Tea.",
    },
    es: {
      title: "Oseas y Gomer — La Historia de Amor Más Dolorosa - Bible Tea",
      description:
        "Dios le dice a Oseas que se case con Gomer. Ella se va — y él la vuelve a comprar. Oseas 1–3 y lo que significa, narrado como audio.",
    },
  },
  "the-miraculous-catch": {
    en: {
      title: "The Miraculous Catch of Fish — Luke 5:1-11 - Bible Tea",
      description:
        "Professional fishermen catch nothing all night. Jesus says try again — and the nets nearly break. The miraculous catch of fish, retold as audio.",
    },
    es: {
      title: "La Pesca Milagrosa — Lucas 5:1-11 - Bible Tea",
      description:
        "Pescadores profesionales no pescan nada en toda la noche. Jesús dice inténtenlo de nuevo — y las redes casi se rompen. Lucas 5:1-11, narrado.",
    },
  },
  "crossing-the-red-sea": {
    en: {
      title: "Crossing the Red Sea — The Full Story (Exodus 14) - Bible Tea",
      description:
        "Trapped between Pharaoh's army and the sea, Moses raises his staff — and the sea splits. The crossing of the Red Sea, retold as immersive audio.",
    },
    es: {
      title: "El Cruce del Mar Rojo — Éxodo 14 Completo - Bible Tea",
      description:
        "Atrapados entre el ejército de Faraón y el mar, Moisés alza su vara — y el mar se parte. El cruce del Mar Rojo, narrado como audio inmersivo.",
    },
  },
  "the-witch-of-endor": {
    en: {
      title: "The Witch of Endor — Saul's Séance (1 Samuel 28) - Bible Tea",
      description:
        "Desperate king Saul visits a medium to summon dead Samuel — and it works. The witch of Endor (1 Samuel 28), the Bible's eeriest story, retold.",
    },
    es: {
      title: "La Bruja de Endor — El Séance de Saúl (1 Samuel 28) - Bible Tea",
      description:
        "Saúl, desesperado, visita a una médium para invocar al Samuel muerto — y funciona. La bruja de Endor (1 Samuel 28), narrada como nunca.",
    },
  },
  "isaac-and-rebekah": {
    en: {
      title: "Isaac & Rebekah — The Bible's First Love Story (Genesis 24) - Bible Tea",
      description:
        "A servant, a prayer, camels at a well, and a woman who says yes. How Isaac and Rebekah met — the Bible's original love story. Listen on Bible Tea.",
    },
    es: {
      title: "Isaac y Rebeca — La Primera Historia de Amor (Génesis 24) - Bible Tea",
      description:
        "Un siervo, una oración, camellos en un pozo y una mujer que dice que sí. Cómo se conocieron Isaac y Rebeca. Génesis 24, narrado como audio.",
    },
  },
  "god-answers-job": {
    en: {
      title: "God Answers Job from the Whirlwind — Job 38-41 - Bible Tea",
      description:
        "Where did God answer Job from? A whirlwind: \"Where were you when I laid the earth's foundation?\" Job 38–41, retold as immersive audio.",
    },
    es: {
      title: "Dios Responde a Job desde el Torbellino — Job 38-41 - Bible Tea",
      description:
        "¿Desde dónde respondió Dios a Job? Desde un torbellino: \"¿Dónde estabas tú cuando yo fundaba la tierra?\" Job 38-41, narrado como audio inmersivo.",
    },
  },
  "caleb-claims-his-mountain": {
    en: {
      title: "Caleb Claims His Mountain — Joshua 14 - Bible Tea",
      description:
        "At 85, Caleb asks for the land with the giants still on it — and takes it. The story of Caleb (Joshua 14), retold as immersive audio.",
    },
    es: {
      title: "Caleb Reclama su Tierra — Josué 14 - Bible Tea",
      description:
        "A los 85 años, Caleb reclama su tierra: \"dame la montaña con los gigantes.\" Y la conquista. La historia de Caleb (Josué 14), narrada como audio.",
    },
  },
};

/** Curated titles/descriptions for playlist pages, keyed by playlist id. */
export const PLAYLIST_SEO: Record<string, LocalizedSeo> = {
  "pl-love": {
    en: {
      title: "Love Stories in the Bible — The Greatest Romances - Bible Tea",
      description:
        "The greatest love stories in the Bible — Isaac & Rebekah, Jacob & Rachel, Ruth, the Prodigal Son and more. A guide to each one, plus immersive audio.",
    },
    es: {
      title: "Historias de Amor en la Biblia — Los Grandes Romances - Bible Tea",
      description:
        "Las historias de amor más grandes de la Biblia — Isaac y Rebeca, Jacob y Raquel, Rut y más. Una guía de cada una, con audio inmersivo en Bible Tea.",
    },
  },
  "pl-underdogs": {
    en: {
      title: "Underdog Stories in the Bible — Nobody Saw It Coming - Bible Tea",
      description:
        "Underdogs in the Bible: David vs Goliath, Gideon's 300, Esther, Ruth and more. Nobody believed in them — they proved everyone wrong. A story-by-story guide.",
    },
    es: {
      title: "Los Menospreciados de la Biblia — Nadie Lo Vio Venir - Bible Tea",
      description:
        "Los grandes menospreciados de la Biblia: David contra Goliat, los 300 de Gedeón, Ester, Rut y más. Una guía historia por historia, con audio inmersivo.",
    },
  },
  "pl-women": {
    en: {
      title: "Women of the Bible — Their Stories, Retold - Bible Tea",
      description:
        "The fierce, faithful, fearless women of the Bible — Deborah, Ruth, Esther, Mary and more. Their stories retold as immersive audio on Bible Tea.",
    },
    es: {
      title: "Mujeres de la Biblia — Sus Historias, Narradas - Bible Tea",
      description:
        "Las historias de las mujeres de la Biblia — Débora, Rut, Ester, María y más. Fieles, valientes e imparables. Escúchalas como audio inmersivo.",
    },
  },
  "pl-miracles": {
    en: {
      title: "Miracles in the Bible — Every Wonder, Retold - Bible Tea",
      description:
        "Seas splitting, fire from heaven, the dead raised. A guide to the Bible's greatest miracles in order, each retold as immersive audio on Bible Tea.",
    },
    es: {
      title: "Milagros de la Biblia — Cada Prodigio, Narrado - Bible Tea",
      description:
        "Mares que se parten, fuego del cielo, muertos que resucitan. Una guía de los milagros más grandes de la Biblia en orden, con audio inmersivo.",
    },
  },
  "pl-easter": {
    en: {
      title: "The Easter Story — Holy Week Day by Day - Bible Tea",
      description:
        "The complete Easter story in order: Palm Sunday, the Last Supper, the trial, the crucifixion and the resurrection. 16 episodes of immersive audio.",
    },
    es: {
      title: "La Historia de la Pascua — Semana Santa Día a Día - Bible Tea",
      description:
        "La historia completa de la Semana Santa en orden: Domingo de Ramos, la Última Cena, el juicio, la crucifixión y la resurrección. 16 episodios en audio.",
    },
  },
  "pl-jesus": {
    en: {
      title: "The Life of Jesus — Every Story in Order - Bible Tea",
      description:
        "The complete life of Jesus in 18 stories, from the manger to the ascension — birth, baptism, miracles, parables, cross and resurrection. Listen on Bible Tea.",
    },
    es: {
      title: "La Vida de Jesús — Todas las Historias en Orden - Bible Tea",
      description:
        "La vida completa de Jesús en 18 historias, del pesebre a la ascensión — nacimiento, bautismo, milagros, parábolas, cruz y resurrección. Escucha en Bible Tea.",
    },
  },
};

export function storySeo(id: string, locale: Locale): SeoOverride {
  return STORY_SEO[id]?.[locale] ?? {};
}

export function playlistSeo(id: string, locale: Locale): SeoOverride {
  return PLAYLIST_SEO[id]?.[locale] ?? {};
}

/**
 * English character pages were ranking 30–65 for "who is X in the bible"
 * while Spanish "¿Quién fue X?" sat around 10. Question titles close the gap.
 */
export const CHARACTER_SEO: Record<string, LocalizedSeo> = {
  "ch-absalom": {
    en: {
      title: "Who Was Absalom in the Bible? — David's Son | Bible Tea",
      description:
        "Who was Absalom in the Bible? David's son who stole Israel's heart and rebelled. Why he turned on his father (2 Samuel 13–18), retold as audio.",
    },
    es: {
      title: "¿Quién era Absalón en la Biblia? — Hijo de David | Bible Tea",
      description:
        "¿Quién era Absalón en la Biblia? El hijo de David que robó el corazón de Israel y se rebeló. 2 Samuel 13–18, narrado como audio.",
    },
  },
  "ch-isaac": {
    en: {
      title: "Who Is Isaac in the Bible? — Son of the Promise | Bible Tea",
      description:
        "Who is Isaac in the Bible? Abraham and Sarah's promised son, Rebekah's husband, Jacob and Esau's father. His story, retold as immersive audio.",
    },
    es: {
      title: "¿Quién fue Isaac en la Biblia? — El hijo de la promesa | Bible Tea",
      description:
        "¿Quién es Isaac en la Biblia? El hijo prometido de Abraham y Sara, esposo de Rebeca, padre de Jacob y Esaú. Su historia, narrada como audio.",
    },
  },
  "ch-rachel": {
    en: {
      title: "Who Was Rachel in the Bible? — Jacob's Wife | Bible Tea",
      description:
        "Who was Rachel in the Bible? Jacob waited 14 years for her. Sister of Leah, mother of Joseph. Her story, retold as immersive audio.",
    },
    es: {
      title: "¿Quién era Raquel en la Biblia? — Esposa de Jacob | Bible Tea",
      description:
        "¿Quién era Raquel en la Biblia? Jacob esperó 14 años por ella. Hermana de Lea, madre de José. Su historia, narrada como audio inmersivo.",
    },
  },
  "ch-rebekah": {
    en: {
      title: "Who Was Rebekah in the Bible? — Isaac's Wife | Bible Tea",
      description:
        "Who was Rebekah in the Bible? The woman at the well who said yes — Isaac's wife, mother of Jacob and Esau. Genesis 24, retold as audio.",
    },
    es: {
      title: "¿Quién fue Rebeca en la Biblia? — Esposa de Isaac | Bible Tea",
      description:
        "¿Quién fue Rebeca en la Biblia? La mujer del pozo que dijo que sí: esposa de Isaac, madre de Jacob y Esaú. Génesis 24, narrado como audio.",
    },
  },
  "ch-caleb": {
    en: {
      title: "Who Was Caleb in the Bible? — Joshua 14 | Bible Tea",
      description:
        "Who was Caleb in the Bible? At 85 he asked for the mountain with the giants still on it. The story of Caleb, retold as immersive audio.",
    },
    es: {
      title: "¿Quién fue Caleb en la Biblia? — Josué 14 | Bible Tea",
      description:
        "¿Quién fue Caleb en la Biblia? A los 85 años pidió la montaña con los gigantes. La historia de Caleb, narrada como audio inmersivo.",
    },
  },
  "ch-sarah": {
    en: {
      title: "Who Was Sarah in the Bible? — Abraham's Wife | Bible Tea",
      description:
        "Who was Sarah in the Bible? She laughed at the promise, then held Isaac anyway. Abraham's wife, mother of the nation. Listen on Bible Tea.",
    },
    es: {
      title: "¿Quién fue Sara en la Biblia? — Esposa de Abraham | Bible Tea",
      description:
        "¿Quién era Sara en la Biblia? Se rió de la promesa y luego sostuvo a Isaac. Esposa de Abraham, madre de la nación. Escúchala en Bible Tea.",
    },
  },
  "ch-esther": {
    en: {
      title: "Who Is Esther in the Bible? — The Queen Who Risked It | Bible Tea",
      description:
        "Who was Esther in the Bible? An orphan who became queen and saved her people. Her story, retold as immersive audio on Bible Tea.",
    },
    es: {
      title: "¿Quién es Ester en la Biblia? — La reina que se arriesgó | Bible Tea",
      description:
        "¿Quién fue Ester en la Biblia? Una huérfana que llegó a reina y salvó a su pueblo. Su historia, narrada como audio inmersivo.",
    },
  },
  "ch-elijah": {
    en: {
      title: "Who Is Elijah in the Bible? — The Fire Prophet | Bible Tea",
      description:
        "Who is Elijah in the Bible? He called fire on Carmel, ran from Jezebel, and left in a whirlwind. Every Elijah story, retold as audio.",
    },
    es: {
      title: "¿Quién es Elías en la Biblia? — El profeta del fuego | Bible Tea",
      description:
        "¿Quién era Elías en la Biblia? Llamó fuego en el Carmelo, huyó de Jezabel y se fue en un torbellino. Todas sus historias, narradas.",
    },
  },
  "ch-solomon": {
    en: {
      title: "Who Is Solomon in the Bible? — Wisdom and the Temple | Bible Tea",
      description:
        "Who is Solomon in the Bible? David's son: the wisest king, the temple builder, and a downfall nobody saw coming. Listen on Bible Tea.",
    },
    es: {
      title: "¿Quién es Salomón en la Biblia? — Sabiduría y el templo | Bible Tea",
      description:
        "¿Quién fue Salomón en la Biblia? Hijo de David: el rey más sabio, el que construyó el templo, y una caída que nadie vio venir.",
    },
  },
  "ch-peter": {
    en: {
      title: "Who Was Peter in the Bible? — The Apostle's Story | Bible Tea",
      description:
        "Who was Peter in the Bible? Fisherman, denier, miracle-worker. Every story of the apostle Peter, retold as immersive audio on Bible Tea.",
    },
    es: {
      title: "¿Quién era Pedro en la Biblia? — La historia del apóstol | Bible Tea",
      description:
        "¿Quién fue Pedro en la Biblia? Pescador, el que negó, el que hizo milagros. Toda la historia del apóstol Pedro, narrada como audio.",
    },
  },
  "ch-lazarus": {
    en: {
      title: "Who Was Lazarus in the Bible? — Raised from the Dead | Bible Tea",
      description:
        "Who was Lazarus in the Bible? Jesus' friend who died — and walked out of the tomb four days later. John 11, retold as audio.",
    },
    es: {
      title: "¿Quién era Lázaro en la Biblia? — Resucitado | Bible Tea",
      description:
        "¿Quién fue Lázaro en la Biblia? El amigo de Jesús que murió y salió de la tumba a los cuatro días. Juan 11, narrado como audio.",
    },
  },
  "ch-jonah": {
    en: {
      title: "Who Was Jonah in the Bible? — The Prophet and the Fish | Bible Tea",
      description:
        "Who was Jonah in the Bible? The prophet who ran, got swallowed, and sulked when Nineveh repented. Jonah 1–4, retold as audio.",
    },
    es: {
      title: "¿Quién fue Jonás en la Biblia? — El profeta y el pez | Bible Tea",
      description:
        "¿Quién era Jonás en la Biblia? El profeta que huyó, fue tragado y se enojó cuando Nínive se arrepintió. Jonás 1–4, narrado.",
    },
  },
  "ch-pilate": {
    en: {
      title: "Who Was Pilate in the Bible? — The Governor Who Washed His Hands | Bible Tea",
      description:
        "Who was Pontius Pilate in the Bible? The Roman governor who found no guilt in Jesus — and crucified him anyway. The full story, retold.",
    },
    es: {
      title: "¿Quién era Pilato en la Biblia? — Poncio Pilato | Bible Tea",
      description:
        "¿Quién fue Poncio Pilato en la Biblia? El gobernador romano que no halló culpa en Jesús y aun así lo crucificó. La historia completa.",
    },
  },
  "ch-jacob": {
    en: {
      title: "Who Was Jacob in the Bible? — Esau's Twin | Bible Tea",
      description:
        "Who was Jacob in the Bible? Isaac's son, Esau's twin — stew, a stolen blessing, a ladder to heaven. His story, retold as audio.",
    },
    es: {
      title: "¿Quién fue Jacob en la Biblia? — El gemelo de Esaú | Bible Tea",
      description:
        "¿Quién era Jacob en la Biblia? Hijo de Isaac, gemelo de Esaú: un plato de lentejas, una bendición robada, una escalera al cielo.",
    },
  },
  "ch-lot": {
    en: {
      title: "Who Is Lot in the Bible? — Abraham's Nephew | Bible Tea",
      description:
        "Who is Lot in the Bible? Abraham's nephew who chose Sodom, fled, and looked back too late. Genesis 19, retold as immersive audio.",
    },
    es: {
      title: "¿Quién es Lot en la Biblia? — Sobrino de Abraham | Bible Tea",
      description:
        "¿Quién fue Lot en la Biblia? El sobrino de Abraham que eligió Sodoma, huyó y miró atrás demasiado tarde. Génesis 19, narrado.",
    },
  },
  "ch-gideon": {
    en: {
      title: "Who Is Gideon in the Bible? — 300 Against Midian | Bible Tea",
      description:
        "Who is Gideon in the Bible? The least in his family, asked to save Israel with 300 men. Judges 6–8, retold as immersive audio.",
    },
    es: {
      title: "¿Quién es Gedeón en la Biblia? — 300 contra Madián | Bible Tea",
      description:
        "¿Quién fue Gedeón en la Biblia? El menor de su casa, llamado a salvar a Israel con 300 hombres. Jueces 6–8, narrado como audio.",
    },
  },
  "ch-nicodemus": {
    en: {
      title: "Who Was Nicodemus in the Bible? — The Night Visitor | Bible Tea",
      description:
        "Who was Nicodemus in the Bible? A Pharisee who came to Jesus at night and heard 'you must be born again.' John 3, retold as audio.",
    },
    es: {
      title: "¿Quién era Nicodemo en la Biblia? — El que vino de noche | Bible Tea",
      description:
        "¿Quién fue Nicodemo en la Biblia? Un fariseo que fue a Jesús de noche y oyó «necesitas nacer de nuevo». Juan 3, narrado.",
    },
  },
  "ch-john-the-baptist": {
    en: {
      title: "Who Was John the Baptist in the Bible? | Bible Tea",
      description:
        "Who was John the Baptist? The prophet who prepared the way, said 'He must increase,' and died for it. His story, retold as audio.",
    },
    es: {
      title: "¿Quién fue Juan el Bautista en la Biblia? | Bible Tea",
      description:
        "¿Quién era Juan el Bautista? El profeta que preparó el camino, dijo «él debe crecer» y murió por eso. Su historia, narrada.",
    },
  },
  "ch-paul": {
    en: {
      title: "Who Was Paul in the Bible? — From Saul to Apostle | Bible Tea",
      description:
        "Who was Paul in the Bible? The church's worst enemy, blinded on the Damascus road, then its greatest apostle. Listen on Bible Tea.",
    },
    es: {
      title: "¿Quién fue Pablo en la Biblia? — De Saulo a apóstol | Bible Tea",
      description:
        "¿Quién era Pablo en la Biblia? El peor enemigo de la iglesia, cegado en el camino a Damasco, luego su mayor apóstol.",
    },
  },
  "ch-david": {
    en: {
      title: "Who Was David in the Bible? — Shepherd, King, Psalm-Writer | Bible Tea",
      description:
        "Who was David in the Bible? The boy who faced Goliath, the king who fell, the poet behind Psalm 23. His stories, retold as audio.",
    },
    es: {
      title: "¿Quién fue David en la Biblia? — Pastor, rey, salmista | Bible Tea",
      description:
        "¿Quién era David en la Biblia? El muchacho que enfrentó a Goliat, el rey que cayó, el poeta del Salmo 23. Sus historias, narradas.",
    },
  },
  "ch-cornelius": {
    en: {
      title: "Who Was Cornelius in the Bible? — The Roman Who Changed the Church | Bible Tea",
      description:
        "Who was Cornelius in the Bible? A Roman centurion whose vision opened the gospel to the nations. Acts 10, retold as audio.",
    },
    es: {
      title: "¿Quién fue Cornelio en la Biblia? — El romano que cambió la iglesia | Bible Tea",
      description:
        "¿Quién era Cornelio en la Biblia? Un centurión romano cuya visión abrió el evangelio a las naciones. Hechos 10, narrado.",
    },
  },
  "ch-deborah": {
    en: {
      title: "Who Is Deborah in the Bible? — The Judge and Prophet | Bible Tea",
      description:
        "Who is Deborah in the Bible? A judge, a prophet, and the woman who rode to war when Barak wouldn't go alone. Judges 4–5, retold.",
    },
    es: {
      title: "¿Quién es Débora en la Biblia? — Jueza y profetisa | Bible Tea",
      description:
        "¿Quién era Débora en la Biblia? Jueza, profetisa y la mujer que fue a la guerra cuando Barac no quiso ir solo. Jueces 4–5, narrado.",
    },
  },
  "ch-hezekiah": {
    en: {
      title: "Who Was Hezekiah in the Bible? — The King Who Got More Years | Bible Tea",
      description:
        "Who was Hezekiah in the Bible? The king who prayed, faced an empire, and was given fifteen extra years. His story, retold as audio.",
    },
    es: {
      title: "¿Quién era Ezequías en la Biblia? — El rey que recibió más años | Bible Tea",
      description:
        "¿Quién fue Ezequías en la Biblia? El rey que oró, enfrentó un imperio y recibió quince años más. Su historia, narrada como audio.",
    },
  },
};

/**
 * Spanish prayer pages already rank #1 for the query and get 0 clicks.
 * Titles must match "oración para el trabajo", not "{title} — Oración Guiada".
 */
export const PRAYER_SEO: Record<string, LocalizedSeo> = {
  "job-work": {
    en: {
      title: "Prayer for Work — Purpose and Direction | Bible Tea",
      description:
        "A guided prayer for your work when Monday feels heavy or the path is unclear. Read it here or listen with narration on Bible Tea.",
    },
    es: {
      title: "Oración para el trabajo | Bible Tea",
      description:
        "Oración para el trabajo cuando el lunes pesa o no sabes qué hacer con tu carrera. Léela aquí o escúchala con narración en Bible Tea.",
    },
  },
  "forgiving-yourself": {
    en: {
      title: "Prayer for Forgiving Yourself | Bible Tea",
      description:
        "God already forgave you. This guided prayer is for the part that still won't let go. Read it or listen on Bible Tea.",
    },
    es: {
      title: "Oración para perdonarme a mí mismo | Bible Tea",
      description:
        "Oración para perdonarme a mí mismo cuando Dios ya perdonó y tú no puedes. Léela aquí o escúchala en Bible Tea.",
    },
  },
  "letting-go-of-control": {
    en: {
      title: "Prayer for Letting Go of Control | Bible Tea",
      description:
        "A guided prayer to release your grip and trust God's plan. Read it here or listen with calming narration on Bible Tea.",
    },
    es: {
      title: "Oración para soltar y dejar ir | Bible Tea",
      description:
        "Oración para soltar y dejar ir cuando no puedes controlarlo todo. Léela aquí o escúchala con narración en Bible Tea.",
    },
  },
  "fear-of-future": {
    en: {
      title: "Prayer for Fear of the Future | Bible Tea",
      description:
        "When tomorrow terrifies you. A guided prayer to trust the One who holds it. Read or listen on Bible Tea.",
    },
    es: {
      title: "Oración para el miedo al futuro | Bible Tea",
      description:
        "Oración para cuando el mañana te aterra. Confía en Quien lo sostiene. Léela o escúchala en Bible Tea.",
    },
  },
  "endurance": {
    en: {
      title: "Prayer for Endurance | Bible Tea",
      description:
        "The race is long and your legs are heavy. A guided prayer to keep going. Read it here or listen on Bible Tea.",
    },
    es: {
      title: "Oración para la perseverancia | Bible Tea",
      description:
        "Oración para la perseverancia cuando la carrera es larga y las piernas pesan. Léela o escúchala en Bible Tea.",
    },
  },
  "trusting-gods-timing": {
    en: {
      title: "Prayer for Trusting God's Timing | Bible Tea",
      description:
        "It's taking too long. A guided prayer to trust that God's clock is perfect. Read or listen on Bible Tea.",
    },
    es: {
      title: "Oración para confiar en el tiempo de Dios | Bible Tea",
      description:
        "Oración para confiar en el tiempo de Dios cuando tarda demasiado. Léela o escúchala en Bible Tea.",
    },
  },
  "facing-giants": {
    en: {
      title: "Prayer for Strength | Bible Tea",
      description:
        "A guided prayer for strength when the problem is bigger than you. Read it here or listen on Bible Tea.",
    },
    es: {
      title: "Oración para la fortaleza | Bible Tea",
      description:
        "Oración para la fortaleza cuando el problema es más grande que tú. Léela o escúchala en Bible Tea.",
    },
  },
  "physical-healing": {
    en: {
      title: "Prayer for Healing | Bible Tea",
      description:
        "A guided prayer for healing when your body is broken. Bring it to the Healer. Read or listen on Bible Tea.",
    },
    es: {
      title: "Oración para la sanidad | Bible Tea",
      description:
        "Oración para la sanidad cuando el cuerpo está roto. Llévalo al Sanador. Léela o escúchala en Bible Tea.",
    },
  },
  "anxious-thoughts": {
    en: {
      title: "Prayer for Anxiety | Bible Tea",
      description:
        "A guided prayer for anxiety when your mind will not sit down. Read it here or listen on Bible Tea.",
    },
    es: {
      title: "Oración para la ansiedad | Bible Tea",
      description:
        "Oración para la ansiedad cuando la mente no se sienta. Léela aquí o escúchala en Bible Tea.",
    },
  },
  "protection-through-night": {
    en: {
      title: "Prayer for Protection | Bible Tea",
      description:
        "A guided prayer for protection through the night. Read it here or listen with narration on Bible Tea.",
    },
    es: {
      title: "Oración para la protección | Bible Tea",
      description:
        "Oración para la protección durante la noche. Léela aquí o escúchala en Bible Tea.",
    },
  },
  "peace-in-chaos": {
    en: {
      title: "Prayer for Peace | Bible Tea",
      description:
        "A guided prayer for peace when the storm is still in the boat. Read or listen on Bible Tea.",
    },
    es: {
      title: "Oración para la paz | Bible Tea",
      description:
        "Oración para la paz cuando la tormenta sigue en el bote. Léela o escúchala en Bible Tea.",
    },
  },
  "asking-forgiveness": {
    en: {
      title: "Prayer for Forgiveness | Bible Tea",
      description:
        "You blew it. This guided prayer asks God for forgiveness and believes His mercy is bigger. Read or listen on Bible Tea.",
    },
    es: {
      title: "Oración para el perdón | Bible Tea",
      description:
        "La regaste. Esta oración pide perdón a Dios y cree que Su misericordia es más grande. Léela o escúchala en Bible Tea.",
    },
  },
  "lost-someone": {
    en: {
      title: "Prayer for Grief | Bible Tea",
      description:
        "A guided prayer when you have lost someone and the chair is empty. Read it here or listen on Bible Tea.",
    },
    es: {
      title: "Oración para el duelo | Bible Tea",
      description:
        "Oración para el duelo cuando has perdido a alguien y la silla está vacía. Léela o escúchala en Bible Tea.",
    },
  },
  "marriage": {
    en: {
      title: "Prayer for Marriage | Bible Tea",
      description:
        "A guided prayer for your marriage — patience, grace, and staying committed. Read it here or listen on Bible Tea.",
    },
    es: {
      title: "Oración para el matrimonio | Bible Tea",
      description:
        "Oración para el matrimonio: paciencia, gracia y seguir eligiendo. Léela o escúchala en Bible Tea.",
    },
  },
  "lonely": {
    en: {
      title: "Prayer for Loneliness | Bible Tea",
      description:
        "No one calls. This guided prayer is for the hour you feel unseen. Read or listen on Bible Tea.",
    },
    es: {
      title: "Oración para la soledad | Bible Tea",
      description:
        "Nadie llama. Esta oración es para la hora en que nadie te ve. Léela o escúchala en Bible Tea.",
    },
  },
};

export function characterSeo(id: string, locale: Locale): SeoOverride {
  return CHARACTER_SEO[id]?.[locale] ?? {};
}

export function prayerSeo(slug: string, locale: Locale): SeoOverride {
  const key = slug.startsWith("pr-") ? slug.slice(3) : slug;
  return PRAYER_SEO[key]?.[locale] ?? PRAYER_SEO[slug]?.[locale] ?? {};
}

/** Keep titles in SERP-friendly range (Google typically shows ~60–70 chars). */
export function clampTitle(title: string, max = 70): string {
  if (title.length <= max) return title;
  const suffix = title.endsWith(" | Bible Tea") ? " | Bible Tea" : " - Bible Tea";
  if (title.endsWith(suffix)) {
    const budget = max - suffix.length;
    let body = title.slice(0, -suffix.length);
    if (body.length > budget) {
      let cut = body.slice(0, budget);
      const em = cut.lastIndexOf(" — ");
      if (em > 12) cut = cut.slice(0, em);
      else {
        const sp = cut.lastIndexOf(" ");
        if (sp > 12) cut = cut.slice(0, sp);
      }
      body = cut.replace(/[—\-\s:,]+$/u, "");
    }
    return `${body}${suffix}`;
  }
  let cut = title.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  if (sp > 12) cut = cut.slice(0, sp);
  return `${cut.replace(/[—\-\s:,]+$/u, "")}…`;
}

/** Keep meta descriptions in the ~120–155 char sweet spot. */
export function clampDescription(description: string, max = 155): string {
  const trimmed = description.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  let cut = trimmed.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  if (sp > 80) cut = cut.slice(0, sp);
  return `${cut.replace(/[—\-\s:,.]+$/u, "")}…`;
}

/** Title + description that include today's verse so the SERP snippet changes daily. */
export function verseOfTheDaySeo(
  locale: Locale,
  verse: { text: string; ref: string },
  date: Date,
): { title: string; description: string } {
  const dateLabel =
    locale === "es"
      ? date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const snippet =
    verse.text.length > 100
      ? `${verse.text.slice(0, 97).replace(/\s+\S*$/, "")}…`
      : verse.text;

  if (locale === "es") {
    return {
      title: clampTitle(`Versículo del día de hoy — ${verse.ref} | Bible Tea`),
      description: clampDescription(
        `Versículo del día de hoy (${dateLabel}, ${verse.ref}): “${snippet}” Léelo aquí o ponlo en tu pantalla con el widget gratis.`,
      ),
    };
  }
  return {
    title: clampTitle(`Bible Verse of the Day — ${verse.ref} | Bible Tea`),
    description: clampDescription(
      `Today's Bible verse of the day (${dateLabel}, ${verse.ref}): “${snippet}” Read it here, or add the free home-screen widget.`,
    ),
  };
}

export function prayerForTodaySeo(
  locale: Locale,
  prayerTitle: string,
  date: Date,
): { title: string; description: string } {
  const dateLabel =
    locale === "es"
      ? date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (locale === "es") {
    return {
      title: clampTitle("Oración de hoy | Bible Tea"),
      description: clampDescription(
        `Oración de hoy (${dateLabel}): ${prayerTitle}. Una oración guiada nueva cada día. Léela aquí o escúchala con narración en Bible Tea.`,
      ),
    };
  }
  return {
    title: clampTitle("Prayer for Today | Bible Tea"),
    description: clampDescription(
      `Prayer for today (${dateLabel}): ${prayerTitle}. A new guided prayer every day. Read it here, or listen with narration on Bible Tea.`,
    ),
  };
}
