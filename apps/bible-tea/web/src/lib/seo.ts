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
 * 2. `STORY_SEO` / `PLAYLIST_SEO` — hand-written titles and meta descriptions
 *    for pages that rank on page 1 with high impressions but ~0% CTR.
 *    Each override is phrased to match the actual queries from GSC.
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
      title: "John the Baptist's Last Words — What He Really Said | Bible Tea",
      description:
        "What were John the Baptist's last words? \"He must increase, I must decrease\" (John 3:30). The story behind his final recorded words — and how he died.",
    },
  },
  "john-the-baptist-beheaded": {
    en: {
      title: "Why Was John the Baptist Killed? — Matthew 14:1-12 | Bible Tea",
      description:
        "Why was John the Baptist beheaded? A king's rash oath, a grudge, and a birthday party gone dark. How John the Baptist died — the full story, retold.",
    },
    es: {
      title: "¿Por Qué Mataron a Juan el Bautista? — Mateo 14:1-12 | Bible Tea",
      description:
        "¿Por qué fue decapitado Juan el Bautista? Un juramento imprudente, un rencor y una fiesta que terminó mal. La historia completa, narrada como nunca.",
    },
  },
  "peters-miracles": {
    en: {
      title: "Peter's Miracles in the Bible — Acts 9:32-43 | Bible Tea",
      description:
        "What miracles did Peter perform? He heals paralyzed Aeneas in Lydda and raises Tabitha from the dead in Joppa. Every miracle of Peter, retold as audio.",
    },
    es: {
      title: "Los Milagros de Pedro en la Biblia — Hechos 9:32-43 | Bible Tea",
      description:
        "¿Qué milagros hizo Pedro? Sana al paralítico Eneas en Lida y resucita a Tabita en Jope. Los milagros de Pedro en la Biblia, narrados como audio inmersivo.",
    },
  },
  "walking-on-water": {
    en: {
      title: "Jesus Walks on Water — Full Story (Matthew 14:22-33) | Bible Tea",
      description:
        "Jesus walks on water in the middle of a storm — and Peter steps out to join him. Who walked on water with Jesus, what happened, and what it means.",
    },
  },
  "flight-to-egypt": {
    en: {
      title: "The Flight to Egypt — Why Jesus' Family Fled (Matthew 2) | Bible Tea",
      description:
        "An angel warns Joseph in a dream and the family escapes to Egypt by night while Herod hunts the child. The flight to Egypt story, retold as audio.",
    },
  },
  "crossing-the-red-sea": {
    en: {
      title: "Crossing the Red Sea — The Full Story (Exodus 14) | Bible Tea",
      description:
        "Trapped between Pharaoh's army and the sea, Moses raises his staff — and the sea splits. The crossing of the Red Sea, retold as immersive audio.",
    },
  },
  "zacchaeus-climbs-a-tree": {
    en: {
      title: "Zacchaeus: The Man Who Climbed a Tree to See Jesus | Bible Tea",
      description:
        "Who climbed a tree to see Jesus? Zacchaeus — a short, rich tax collector who scaled a sycamore in Jericho (Luke 19:1-10). And Jesus invited himself over.",
    },
    es: {
      title: "Zaqueo, el Hombre que Subió a un Árbol para Ver a Jesús | Bible Tea",
      description:
        "¿Quién subió a un árbol para ver a Jesús? Zaqueo — un recaudador de impuestos bajo y rico que trepó un sicómoro en Jericó (Lucas 19:1-10).",
    },
  },
  "the-rich-man-and-lazarus": {
    en: {
      title: "The Rich Man & Lazarus — Luke 16:19-31 Explained | Bible Tea",
      description:
        "A rich man ignores the beggar at his gate. Both die — and everything flips. The rich man and Lazarus (Luke 16:19-31), its meaning, retold as audio.",
    },
    es: {
      title: "El Rico y Lázaro — Lucas 16:19-31 Explicado | Bible Tea",
      description:
        "Un hombre rico ignora al mendigo en su puerta. Ambos mueren — y todo cambia. La parábola del rico y Lázaro (Lucas 16:19-31) y su significado.",
    },
  },
  "elijah-on-mount-carmel": {
    en: {
      title: "Elijah on Mount Carmel — Fire from Heaven (1 Kings 18) | Bible Tea",
      description:
        "One prophet vs 450 prophets of Baal. Two altars, one challenge: the god who answers with fire wins. Elijah on Mount Carmel, retold as immersive audio.",
    },
  },
  "angel-visits-zechariah": {
    en: {
      title: "The Angel Visits Zechariah — Why He Went Mute (Luke 1) | Bible Tea",
      description:
        "An angel promises old Zechariah a miracle son — John the Baptist. He doubts it and loses his voice for 9 months. Luke 1:5-25, retold as audio.",
    },
  },
  "simeon-and-anna": {
    en: {
      title: "Simeon & Anna in the Temple — Luke 2:22-40 Explained | Bible Tea",
      description:
        "Who were Simeon and Anna? Two elderly believers who waited their whole lives for the Messiah — and recognized him in a baby. Luke 2:22-40, retold.",
    },
  },
  "jacob-and-esau": {
    en: {
      title: "Jacob & Esau: The Bible's Twin Brothers (Genesis 25-27) | Bible Tea",
      description:
        "Were Jacob and Esau twins? Yes — sons of Isaac and Rebekah. A stolen blessing, a bowl of stew, and decades of family beef. The full story, retold.",
    },
  },
  "the-centurions-faith": {
    en: {
      title: "The Centurion's Faith — Matthew 8:5-13 Explained | Bible Tea",
      description:
        "A Roman centurion tells Jesus: \"just say the word and my servant will be healed.\" Why Jesus called it the greatest faith in Israel. Retold as audio.",
    },
    es: {
      title: "La Fe del Centurión Romano — Mateo 8:5-13 Explicado | Bible Tea",
      description:
        "Un centurión romano le dice a Jesús: \"solo di la palabra y mi siervo sanará.\" Por qué Jesús la llamó la fe más grande de Israel. Narrado como audio.",
    },
  },
  "feeding-4000": {
    en: {
      title: "Jesus Feeds the 4,000 — Matthew 15:32-39 | Bible Tea",
      description:
        "The feeding of the 4,000: a few loaves, a few fish, thousands fed — and it's not the same story as the 5,000. Matthew 15:32-39, retold as audio.",
    },
    es: {
      title: "Jesús Alimenta a 4,000 — Mateo 15:32-39 | Bible Tea",
      description:
        "Jesús alimenta a 4,000 personas con unos panes y unos peces — y no es la misma historia de los 5,000. Mateo 15:32-39, narrado como audio inmersivo.",
    },
  },
  "boy-jesus-at-the-temple": {
    en: {
      title: "Boy Jesus at the Temple, Age 12 — Luke 2:41-52 | Bible Tea",
      description:
        "Jesus at 12 goes missing for three days — his parents find him in the temple, schooling the teachers. The boy Jesus in the temple, retold as audio.",
    },
    es: {
      title: "El Niño Jesús en el Templo, a los 12 Años — Lucas 2:41-52 | Bible Tea",
      description:
        "Jesús a los 12 años desaparece por tres días — sus padres lo encuentran en el templo, asombrando a los maestros. Lucas 2:41-52, narrado como audio.",
    },
  },
  "the-miraculous-catch": {
    en: {
      title: "The Miraculous Catch of Fish — Luke 5:1-11 | Bible Tea",
      description:
        "Professional fishermen catch nothing all night. Jesus says try again — and the nets nearly break. The miraculous catch of fish, retold as audio.",
    },
  },
  "absaloms-rebellion": {
    en: {
      title: "Absalom's Rebellion — Why He Turned on David | Bible Tea",
      description:
        "Who was Absalom? David's own son — who stole Israel's hearts and forced the king to flee. Why Absalom rebelled against David (2 Samuel 15-17), retold.",
    },
    es: {
      title: "La Rebelión de Absalón contra David — 2 Samuel 15-17 | Bible Tea",
      description:
        "¿Quién era Absalón en la Biblia? El propio hijo de David — que robó el corazón del pueblo y obligó al rey a huir. La rebelión de Absalón, narrada.",
    },
  },
  "gods-promise-to-david": {
    en: {
      title: "God's Promise to David — 2 Samuel 7 Explained | Bible Tea",
      description:
        "What did God promise David in 2 Samuel 7? A house, a kingdom, and a throne established forever. The covenant with David, retold as immersive audio.",
    },
  },
  "david-writes-psalm-23": {
    en: {
      title: "Who Wrote Psalm 23? The Story Behind David's Psalm | Bible Tea",
      description:
        "Who wrote Psalm 23 — and when? David, the shepherd-turned-king. The story behind \"The Lord is my shepherd,\" retold as immersive audio on Bible Tea.",
    },
  },
  "the-golden-calf": {
    en: {
      title: "The Golden Calf — The Idol at Sinai (Exodus 32) | Bible Tea",
      description:
        "Moses is gone 40 days and Israel melts its jewelry into a golden calf — a false god. The golden calf story (Exodus 32), retold as immersive audio.",
    },
    es: {
      title: "El Becerro de Oro — El Falso Dios de Éxodo 32 | Bible Tea",
      description:
        "El becerro de oro era un falso dios: Moisés tardó 40 días y el pueblo fundió sus joyas para adorar un ídolo. Éxodo 32, narrado como nunca antes.",
    },
  },
  "jesus-stops-a-storm": {
    en: {
      title: "Jesus Calms the Storm — Mark 4:35-41 | Bible Tea",
      description:
        "A storm hits, the disciples panic, and Jesus is asleep in the boat. \"Peace, be still.\" Jesus calms the storm (Mark 4:35-41), retold as audio.",
    },
  },
  "saul-meets-jesus": {
    en: {
      title: "Saul Meets Jesus on the Road to Damascus — Acts 9 | Bible Tea",
      description:
        "A blinding light, a voice from heaven, and the church's worst enemy becomes its greatest apostle. Saul's conversion on the road to Damascus, retold.",
    },
  },
  "hosea-and-gomer": {
    en: {
      title: "Hosea & Gomer — The Bible's Hardest Love Story | Bible Tea",
      description:
        "God tells the prophet Hosea to marry Gomer. She leaves — and he buys her back. The story of Hosea and Gomer (Hosea 1-3) and what it means, retold.",
    },
  },
  "joseph-and-his-brothers": {
    en: {
      title: "Joseph & His Brothers — The Betrayal (Genesis 37) | Bible Tea",
      description:
        "Joseph's brothers fake his death and sell him for silver — all over a coat and some dreams. Joseph and his brothers (Genesis 37), retold as audio.",
    },
  },
  "athens-the-unknown-god": {
    en: {
      title: "The Unknown God in Athens — Acts 17:15-34 | Bible Tea",
      description:
        "Paul finds an altar \"to the unknown god\" in Athens — and tells them exactly who it is. Paul at the Areopagus (Acts 17:15-34), retold as audio.",
    },
    es: {
      title: "Al Dios Desconocido — Pablo en Atenas (Hechos 17) | Bible Tea",
      description:
        "Pablo encuentra en Atenas un altar \"al dios desconocido\" — y les dice exactamente quién es. Hechos 17:15-34, narrado como audio inmersivo.",
    },
  },
  "the-witch-of-endor": {
    en: {
      title: "The Witch of Endor — Saul's Séance (1 Samuel 28) | Bible Tea",
      description:
        "Desperate king Saul visits a medium to summon dead Samuel — and it works. The witch of Endor (1 Samuel 28), the Bible's eeriest story, retold.",
    },
  },
  "jacobs-ladder": {
    en: {
      title: "Jacob's Ladder — The Dream at Bethel (Genesis 28) | Bible Tea",
      description:
        "A fugitive falls asleep on a rock and dreams of a stairway to heaven with angels on it. Jacob's ladder (Genesis 28) and its meaning, retold as audio.",
    },
  },
  "the-fiery-furnace": {
    en: {
      title: "The Fiery Furnace — Shadrach, Meshach & Abednego | Bible Tea",
      description:
        "Three men refuse to bow, get thrown into a blazing furnace — and a fourth figure appears in the flames. Daniel 3, retold as immersive audio.",
    },
  },
  "elijah-fed-by-ravens": {
    es: {
      title: "Elías Alimentado por Cuervos — 1 Reyes 17:1-7 | Bible Tea",
      description:
        "¿Qué profeta fue alimentado por cuervos? Elías — escondido en el arroyo de Querit mientras los pájaros le traían pan y carne. 1 Reyes 17:1-7, narrado.",
    },
  },
  "eutychus-falls-out-a-window": {
    es: {
      title: "Eutico, el Joven que se Cayó de la Ventana — Hechos 20 | Bible Tea",
      description:
        "¿Cómo se llama el que se cayó de la ventana en la Biblia? Eutico — se durmió en el sermón de Pablo, cayó de un tercer piso y volvió a la vida.",
    },
  },
  "elijah-and-the-widow": {
    es: {
      title: "Elías y la Viuda de Sarepta — 1 Reyes 17:8-24 | Bible Tea",
      description:
        "Una viuda con su último puñado de harina, un profeta que pide pan, y un milagro que no se acaba. Elías y la viuda (1 Reyes 17:8-24), narrado.",
    },
  },
  "caleb-claims-his-mountain": {
    es: {
      title: "Caleb Reclama su Tierra — Josué 14 | Bible Tea",
      description:
        "A los 85 años, Caleb reclama su tierra: \"dame la montaña con los gigantes.\" Y la conquista. La historia de Caleb (Josué 14), narrada como audio.",
    },
  },
  "god-answers-job": {
    es: {
      title: "Dios Responde a Job desde el Torbellino — Job 38-41 | Bible Tea",
      description:
        "¿Desde dónde respondió Dios a Job? Desde un torbellino: \"¿Dónde estabas tú cuando yo fundaba la tierra?\" Job 38-41, narrado como audio inmersivo.",
    },
  },
  "achans-hidden-sin": {
    es: {
      title: "El Pecado de Acán — Josué 7 | Bible Tea",
      description:
        "El pecado oculto de Acán: roba botín prohibido, lo esconde bajo su tienda, e Israel pierde la batalla. Josué 7, narrado como audio inmersivo.",
    },
  },
  "the-boy-with-a-demon": {
    es: {
      title: "El Niño con un Demonio — Mateo 17:14-21 | Bible Tea",
      description:
        "Los discípulos no pueden liberar a un niño poseído. Jesús lo hace al instante: \"esta clase solo sale con oración.\" Mateo 17:14-21, narrado.",
    },
  },
  "jesus-before-pilate": {
    es: {
      title: "Jesús Ante Pilato — El Juicio (Mateo 27:11-26) | Bible Tea",
      description:
        "Pilato no encuentra culpa en Jesús, pero la multitud grita por la crucifixión — y él se lava las manos. Jesús ante Pilato, narrado como audio.",
    },
  },
  "ruth-and-naomi": {
    es: {
      title: "Rut y Noemí — Historia Completa (Rut 1-4) | Bible Tea",
      description:
        "\"Donde tú vayas, yo iré.\" La historia de Rut y Noemí: lealtad, pérdida y un final que cambió la historia. Rut 1-4, narrado como audio inmersivo.",
    },
  },
  "the-good-samaritan": {
    es: {
      title: "El Buen Samaritano — Lucas 10:25-37 Explicado | Bible Tea",
      description:
        "Un hombre asaltado, religiosos que pasan de largo, y el forastero despreciado que se detiene. La parábola del buen samaritano y su significado.",
    },
  },
  "wandering-the-desert": {
    es: {
      title: "40 Años Vagando por el Desierto — Números 14-36 | Bible Tea",
      description:
        "¿Por qué Israel vagó 40 años por el desierto? No confiaron en Dios en la frontera de la tierra prometida. Números 14-36, narrado como audio.",
    },
  },
  "lots-escape-gone-wrong": {
    es: {
      title: "La Huida de Lot de Sodoma — Génesis 19:30-38 | Bible Tea",
      description:
        "Lot sale de Sodoma, su esposa mira atrás y se convierte en sal — y luego todo empeora. Génesis 19:30-38, narrado como audio inmersivo.",
    },
  },
  "a-talking-donkey-and-a-hired-prophet": {
    es: {
      title: "El Burro que Habla y el Profeta Balaam — Números 22 | Bible Tea",
      description:
        "¿A qué personaje de la Biblia le habló un burro? A Balaam — contratado para maldecir a Israel, hasta que su burra vio al ángel. Números 22, narrado.",
    },
  },
};

/** Curated titles/descriptions for playlist pages, keyed by playlist id. */
export const PLAYLIST_SEO: Record<string, LocalizedSeo> = {
  "pl-love": {
    en: {
      title: "Love Stories in the Bible — The Greatest Romances | Bible Tea",
      description:
        "The greatest love stories in the Bible — Isaac & Rebekah, Jacob & Rachel, Ruth, the Prodigal Son and more. A guide to each one, plus immersive audio.",
    },
    es: {
      title: "Historias de Amor en la Biblia — Los Grandes Romances | Bible Tea",
      description:
        "Las historias de amor más grandes de la Biblia — Isaac y Rebeca, Jacob y Raquel, Rut y más. Una guía de cada una, con audio inmersivo en Bible Tea.",
    },
  },
  "pl-underdogs": {
    en: {
      title: "Underdog Stories in the Bible — Nobody Saw It Coming | Bible Tea",
      description:
        "Underdogs in the Bible: David vs Goliath, Gideon's 300, Esther, Ruth and more. Nobody believed in them — they proved everyone wrong. A story-by-story guide.",
    },
    es: {
      title: "Los Menospreciados de la Biblia — Nadie Lo Vio Venir | Bible Tea",
      description:
        "Los grandes menospreciados de la Biblia: David contra Goliat, los 300 de Gedeón, Ester, Rut y más. Una guía historia por historia, con audio inmersivo.",
    },
  },
  "pl-women": {
    en: {
      title: "Women of the Bible — Their Stories, Retold | Bible Tea",
      description:
        "The fierce, faithful, fearless women of the Bible — Deborah, Ruth, Esther, Mary and more. Their stories retold as immersive audio on Bible Tea.",
    },
    es: {
      title: "Mujeres de la Biblia — Sus Historias, Narradas | Bible Tea",
      description:
        "Las historias de las mujeres de la Biblia — Débora, Rut, Ester, María y más. Fieles, valientes e imparables. Escúchalas como audio inmersivo.",
    },
  },
  "pl-miracles": {
    en: {
      title: "Miracles in the Bible — Every Wonder, Retold | Bible Tea",
      description:
        "Seas splitting, fire from heaven, the dead raised. A guide to the Bible's greatest miracles in order, each retold as immersive audio on Bible Tea.",
    },
    es: {
      title: "Milagros de la Biblia — Cada Prodigio, Narrado | Bible Tea",
      description:
        "Mares que se parten, fuego del cielo, muertos que resucitan. Una guía de los milagros más grandes de la Biblia en orden, con audio inmersivo.",
    },
  },
  "pl-easter": {
    en: {
      title: "The Easter Story — Holy Week Day by Day | Bible Tea",
      description:
        "The complete Easter story in order: Palm Sunday, the Last Supper, the trial, the crucifixion and the resurrection. 16 episodes of immersive audio.",
    },
    es: {
      title: "La Historia de la Pascua — Semana Santa Día a Día | Bible Tea",
      description:
        "La historia completa de la Semana Santa en orden: Domingo de Ramos, la Última Cena, el juicio, la crucifixión y la resurrección. 16 episodios en audio.",
    },
  },
  "pl-jesus": {
    en: {
      title: "The Life of Jesus — Every Story in Order | Bible Tea",
      description:
        "The complete life of Jesus in 18 stories, from the manger to the ascension — birth, baptism, miracles, parables, cross and resurrection. Listen free.",
    },
    es: {
      title: "La Vida de Jesús — Todas las Historias en Orden | Bible Tea",
      description:
        "La vida completa de Jesús en 18 historias, del pesebre a la ascensión — nacimiento, bautismo, milagros, parábolas, cruz y resurrección. Escucha gratis.",
    },
  },
};

export function storySeo(id: string, locale: Locale): SeoOverride {
  return STORY_SEO[id]?.[locale] ?? {};
}

export function playlistSeo(id: string, locale: Locale): SeoOverride {
  return PLAYLIST_SEO[id]?.[locale] ?? {};
}
