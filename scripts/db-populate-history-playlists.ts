import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const APP_ID = "history-tea";
const CONTENT_DIR = join(ROOT, "apps", APP_ID, "content");
const CATALOG_PATH = join(CONTENT_DIR, "story-catalog.json");
const OUT_PATH = join(__dirname, "db-populate-history-playlists.sql");

interface CatalogStory {
  id: string;
  title: string;
  description: string;
  section: string;
  bibleRef: string;
  inSeed: boolean;
  seedId: string | null;
}

const catalog: CatalogStory[] = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
const byId = new Map(catalog.map((s) => [s.id, s]));

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

function storyDbId(s: CatalogStory): string {
  return s.seedId ?? `st-${s.id}`;
}

interface PlaylistDef {
  id: string;
  name: string;
  description: string;
  isFeatured: 0 | 1;
  sortOrder: number;
  stories: string[];
}

// ---------------------------------------------------------------------------
// 38 hand-curated playlists. Every story id is verified against the catalog.
// First 10 are the "front-page" featured set (sort_order 1-10).
// ---------------------------------------------------------------------------

const PLAYLISTS: PlaylistDef[] = [
  {
    id: "pl-ht-start-here",
    name: "Start Here",
    description: "The greatest hits of human history. Start your journey.",
    isFeatured: 1,
    sortOrder: 1,
    stories: [
      "building-the-pyramids",
      "the-trojan-horse",
      "ides-of-march",
      "fall-of-rome",
      "fall-of-constantinople",
      "columbus-1492",
      "storming-the-bastille",
      "moon-landing",
    ],
  },
  {
    id: "pl-ht-empires",
    name: "Empires Rise & Fall",
    description: "Every empire thinks it will last forever. None of them do.",
    isFeatured: 1,
    sortOrder: 2,
    stories: [
      "sargon-of-akkad",
      "cyrus-the-great",
      "alexander-the-great",
      "augustus-becomes-emperor",
      "fall-of-rome",
      "charlemagne-crowned",
      "fall-of-constantinople",
      "genghis-khan-rises",
      "ming-dynasty-rises",
      "fall-of-tenochtitlan",
      "soviet-collapse",
      "fall-of-saigon",
    ],
  },
  {
    id: "pl-ht-wars",
    name: "Wars That Changed Everything",
    description: "The battles that redrew the map of the world.",
    isFeatured: 1,
    sortOrder: 3,
    stories: [
      "battle-of-marathon",
      "battle-of-thermopylae",
      "hannibal-crosses-the-alps",
      "battle-of-cannae",
      "battle-of-tours",
      "battle-of-hastings",
      "hundred-years-war",
      "spanish-armada",
      "battle-of-waterloo",
      "battle-of-gettysburg",
      "battle-of-the-somme",
      "d-day",
      "stalingrad",
      "vietnam-war",
    ],
  },
  {
    id: "pl-ht-revolutions",
    name: "Revolutions",
    description: "When the people decided enough was enough.",
    isFeatured: 1,
    sortOrder: 4,
    stories: [
      "magna-carta",
      "boston-tea-party",
      "storming-the-bastille",
      "declaration-of-independence",
      "haitian-revolution",
      "1848-revolutions",
      "taiping-rebellion",
      "russian-revolution",
      "mao-founds-prc",
      "hungarian-revolution",
      "fall-of-the-berlin-wall",
      "arab-spring",
    ],
  },
  {
    id: "pl-ht-inventions",
    name: "Inventions & Discoveries",
    description: "The breakthroughs that built the modern world.",
    isFeatured: 1,
    sortOrder: 5,
    stories: [
      "ashurbanipals-library",
      "archimedes-eureka",
      "house-of-wisdom",
      "gutenberg-prints-the-bible",
      "leonardo-da-vinci",
      "galileos-trial",
      "newtons-apple",
      "darwin-publishes-origin",
      "sputnik-launches",
      "moon-landing",
    ],
  },
  {
    id: "pl-ht-disasters",
    name: "Plagues & Disasters",
    description: "When the world fell apart — fire, water, and pestilence.",
    isFeatured: 1,
    sortOrder: 6,
    stories: [
      "pompeii-destroyed",
      "justinian-plague",
      "the-black-death",
      "great-fire-of-london",
      "irish-potato-famine",
      "titanic-sinks",
      "spanish-flu",
      "stock-market-crash-1929",
      "hiroshima-and-nagasaki",
      "covid-19-pandemic",
    ],
  },
  {
    id: "pl-ht-explorers",
    name: "Explorers & Conquerors",
    description: "They sailed past the edge of the map and lived to tell.",
    isFeatured: 1,
    sortOrder: 7,
    stories: [
      "marco-polo-in-china",
      "zheng-he-treasure-fleet",
      "columbus-1492",
      "vasco-da-gama-india",
      "magellan-circumnavigates",
      "cortes-conquers-the-aztecs",
      "pizarro-and-the-inca",
      "drake-circumnavigates",
      "jamestown-founded",
      "mayflower-lands",
    ],
  },
  {
    id: "pl-ht-ancient-wonders",
    name: "Ancient Wonders",
    description: "Stones, temples, and tombs that still stop us in our tracks.",
    isFeatured: 1,
    sortOrder: 8,
    stories: [
      "building-the-pyramids",
      "the-great-sphinx",
      "hanging-gardens-of-babylon",
      "darius-builds-persepolis",
      "ashurbanipals-library",
      "hadrians-wall",
      "hagia-sophia-rises",
      "angkor-wat-built",
    ],
  },
  {
    id: "pl-ht-20th-century",
    name: "The 20th Century",
    description: "A hundred years that changed everything — and almost ended it.",
    isFeatured: 1,
    sortOrder: 9,
    stories: [
      "titanic-sinks",
      "archduke-franz-ferdinand",
      "russian-revolution",
      "spanish-flu",
      "hitler-rises",
      "pearl-harbor",
      "the-holocaust",
      "d-day",
      "hiroshima-and-nagasaki",
      "cuban-missile-crisis",
      "jfk-assassinated",
      "moon-landing",
      "fall-of-the-berlin-wall",
      "9-11",
    ],
  },
  {
    id: "pl-ht-power-moves",
    name: "Power Moves",
    description: "Coups, assassinations, and backstabs that rewrote history.",
    isFeatured: 1,
    sortOrder: 10,
    stories: [
      "ides-of-march",
      "sulla-marches-on-rome",
      "caesar-crosses-the-rubicon",
      "anne-boleyn-beheaded",
      "gunpowder-plot",
      "execution-of-charles-i",
      "marie-antoinettes-execution",
      "lincoln-assassinated",
      "archduke-franz-ferdinand",
      "jfk-assassinated",
    ],
  },
  {
    id: "pl-ht-last-stands",
    name: "Last Stands",
    description: "When defeat was certain, and they fought anyway.",
    isFeatured: 1,
    sortOrder: 11,
    stories: [
      "battle-of-thermopylae",
      "alamo",
      "battle-of-little-bighorn",
      "rorkes-drift",
      "gallipoli",
      "warsaw-uprising",
      "fall-of-berlin",
      "fall-of-saigon",
    ],
  },
  {
    id: "pl-ht-lost-civilizations",
    name: "Lost Civilizations",
    description: "Empires the jungle and desert swallowed whole.",
    isFeatured: 1,
    sortOrder: 12,
    stories: [
      "epic-of-gilgamesh",
      "sargon-of-akkad",
      "fall-of-babylon",
      "the-trojan-war",
      "cortes-conquers-the-aztecs",
      "fall-of-tenochtitlan",
      "pizarro-and-the-inca",
      "atahualpas-ransom",
    ],
  },
  {
    id: "pl-ht-underdogs",
    name: "Underdog Victories",
    description: "Outnumbered, outgunned, outsmart. Davids beating Goliaths.",
    isFeatured: 1,
    sortOrder: 13,
    stories: [
      "battle-of-marathon",
      "battle-of-salamis",
      "hannibal-crosses-the-alps",
      "joan-of-arc",
      "washington-crosses-the-delaware",
      "yorktown-surrender",
      "battle-of-britain",
      "midway",
    ],
  },
  {
    id: "pl-ht-forbidden-love",
    name: "Forbidden Love",
    description: "Romances that toppled kingdoms and ended in tragedy.",
    isFeatured: 1,
    sortOrder: 14,
    stories: [
      "cleopatra-and-caesar",
      "cleopatra-and-antony",
      "death-of-cleopatra",
      "justinian-and-theodora",
      "tale-of-genji",
      "henry-viii-six-wives",
      "anne-boleyn-beheaded",
      "mary-queen-of-scots",
    ],
  },
  {
    id: "pl-ht-royal-families",
    name: "Royal Families",
    description: "The Tudors, Medici, Romanovs — drama runs in the blood.",
    isFeatured: 1,
    sortOrder: 15,
    stories: [
      "medici-rise",
      "borgia-popes",
      "henry-viii-six-wives",
      "anne-boleyn-beheaded",
      "bloody-mary",
      "elizabeth-i",
      "mary-queen-of-scots",
      "tsar-and-family-shot",
    ],
  },
  {
    id: "pl-ht-women-rulers",
    name: "Women Who Ruled",
    description: "Queens, empresses, and rebels who ran the world.",
    isFeatured: 1,
    sortOrder: 16,
    stories: [
      "hatshepsut-pharaoh",
      "cleopatra-and-caesar",
      "boudiccas-revolt",
      "justinian-and-theodora",
      "joan-of-arc",
      "bloody-mary",
      "elizabeth-i",
      "mary-queen-of-scots",
      "catherine-the-great",
      "marie-antoinettes-execution",
    ],
  },
  {
    id: "pl-ht-kings-queens",
    name: "Kings & Queens",
    description: "Crowns, conquests, and royal disasters.",
    isFeatured: 1,
    sortOrder: 17,
    stories: [
      "cyrus-the-great",
      "ramses-ii",
      "alexander-the-great",
      "augustus-becomes-emperor",
      "charlemagne-crowned",
      "alfred-the-great",
      "richard-the-lionheart",
      "henry-viii-six-wives",
      "elizabeth-i",
      "louis-xiv-versailles",
      "peter-the-great",
      "catherine-the-great",
    ],
  },
  {
    id: "pl-ht-crusades",
    name: "The Crusades",
    description: "Two centuries of holy war between cross and crescent.",
    isFeatured: 1,
    sortOrder: 18,
    stories: [
      "battle-of-tours",
      "battle-of-manzikert",
      "first-crusade",
      "richard-the-lionheart",
      "saladin-retakes-jerusalem",
      "fourth-crusade-sacks-constantinople",
      "templars-destroyed",
      "fall-of-constantinople",
    ],
  },
  {
    id: "pl-ht-founding-docs",
    name: "Founding Documents",
    description: "The papers, speeches, and ideas that built the modern world.",
    isFeatured: 1,
    sortOrder: 19,
    stories: [
      "hammurabis-code",
      "draco-writes-the-laws",
      "magna-carta",
      "luthers-95-theses",
      "machiavelli-writes-the-prince",
      "declaration-of-independence",
      "monroe-doctrine",
      "emancipation-proclamation",
      "treaty-of-versailles",
      "mlk-i-have-a-dream",
    ],
  },
  {
    id: "pl-ht-genius-minds",
    name: "Genius Minds",
    description: "Philosophers and scientists who saw the future before everyone else.",
    isFeatured: 1,
    sortOrder: 20,
    stories: [
      "socrates-drinks-the-hemlock",
      "platos-academy",
      "archimedes-eureka",
      "marcus-aurelius-philosopher-king",
      "leonardo-da-vinci",
      "machiavelli-writes-the-prince",
      "galileos-trial",
      "newtons-apple",
      "voltaire-and-the-philosophes",
      "darwin-publishes-origin",
    ],
  },
  {
    id: "pl-ht-empires-east",
    name: "Empires of the East",
    description: "Mongols, Ming, samurai — Asia's epic dynasties.",
    isFeatured: 1,
    sortOrder: 21,
    stories: [
      "genghis-khan-rises",
      "mongols-sack-baghdad",
      "kublai-khan-and-yuan",
      "marco-polo-in-china",
      "kamikaze-saves-japan",
      "ming-dynasty-rises",
      "zheng-he-treasure-fleet",
      "samurai-code",
      "delhi-sultanate",
    ],
  },
  {
    id: "pl-ht-greek-glory",
    name: "Greek Glory",
    description: "Heroes, philosophers, and the wars that birthed Western civilization.",
    isFeatured: 1,
    sortOrder: 22,
    stories: [
      "the-trojan-war",
      "the-trojan-horse",
      "achilles-and-hector",
      "odysseus-goes-home",
      "battle-of-marathon",
      "battle-of-thermopylae",
      "battle-of-salamis",
      "pericles-golden-age",
      "alexander-the-great",
      "death-of-alexander",
    ],
  },
  {
    id: "pl-ht-american-revolution",
    name: "The American Revolution",
    description: "Tea parties, redcoats, and the birth of a republic.",
    isFeatured: 1,
    sortOrder: 23,
    stories: [
      "seven-years-war",
      "boston-tea-party",
      "declaration-of-independence",
      "washington-crosses-the-delaware",
      "yorktown-surrender",
      "war-of-1812",
      "monroe-doctrine",
      "alamo",
    ],
  },
  {
    id: "pl-ht-religions",
    name: "Birth of Religions",
    description: "How Christianity, Islam, and the world's faiths were born.",
    isFeatured: 1,
    sortOrder: 24,
    stories: [
      "destruction-of-jerusalem",
      "constantine-converts",
      "council-of-nicaea",
      "julian-the-apostate",
      "muhammads-revelation",
      "the-hijra",
      "battle-of-karbala",
      "luthers-95-theses",
    ],
  },
  {
    id: "pl-ht-tudors",
    name: "Tudor England",
    description: "Six wives, two beheadings, and a queen who built an empire.",
    isFeatured: 1,
    sortOrder: 25,
    stories: [
      "henry-viii-six-wives",
      "anne-boleyn-beheaded",
      "bloody-mary",
      "elizabeth-i",
      "mary-queen-of-scots",
      "spanish-armada",
      "gunpowder-plot",
    ],
  },
  {
    id: "pl-ht-quick-listens",
    name: "Quick Listens",
    description: "Bite-sized history. One event, one moment, one big idea.",
    isFeatured: 1,
    sortOrder: 26,
    stories: [
      "archimedes-eureka",
      "the-great-sphinx",
      "hanging-gardens-of-babylon",
      "tutankhamuns-tomb",
      "ides-of-march",
      "library-of-alexandria-burns",
      "vikings-raid-lindisfarne",
      "boston-tea-party",
      "archduke-franz-ferdinand",
      "christmas-truce-1914",
      "moon-landing",
      "fall-of-the-berlin-wall",
    ],
  },
  {
    id: "pl-ht-deep-dives",
    name: "Deep Dives",
    description: "Epic sagas. Empires, wars, and centuries that shaped the world.",
    isFeatured: 1,
    sortOrder: 27,
    stories: [
      "fall-of-rome",
      "fall-of-constantinople",
      "mongols-sack-baghdad",
      "the-black-death",
      "thirty-years-war",
      "storming-the-bastille",
      "napoleons-rise",
      "battle-of-gettysburg",
      "battle-of-the-somme",
      "russian-revolution",
      "operation-barbarossa",
      "cuban-missile-crisis",
    ],
  },
  {
    id: "pl-ht-cold-war",
    name: "Cold War Crises",
    description: "Decades of nuclear standoff and proxy wars on a knife's edge.",
    isFeatured: 1,
    sortOrder: 28,
    stories: [
      "iron-curtain",
      "berlin-airlift",
      "korean-war",
      "hungarian-revolution",
      "sputnik-launches",
      "cuban-missile-crisis",
      "vietnam-war",
      "fall-of-the-berlin-wall",
    ],
  },
  {
    id: "pl-ht-caesars",
    name: "The Caesars",
    description: "Madmen, philosophers, and gladiator-emperors who ruled Rome.",
    isFeatured: 1,
    sortOrder: 29,
    stories: [
      "augustus-becomes-emperor",
      "tiberius-on-capri",
      "caligulas-madness",
      "claudius-the-unlikely-emperor",
      "nero-burns-rome",
      "marcus-aurelius-philosopher-king",
      "commodus-the-gladiator-emperor",
      "constantine-converts",
    ],
  },
  {
    id: "pl-ht-naval",
    name: "Naval Battles",
    description: "When empires were won and lost on the open sea.",
    isFeatured: 1,
    sortOrder: 30,
    stories: [
      "battle-of-salamis",
      "battle-of-actium",
      "vasco-da-gama-india",
      "magellan-circumnavigates",
      "drake-circumnavigates",
      "spanish-armada",
      "battle-of-trafalgar",
      "midway",
    ],
  },
  {
    id: "pl-ht-modern-conflicts",
    name: "Modern Conflicts",
    description: "The crises that shaped the world after the Cold War.",
    isFeatured: 1,
    sortOrder: 31,
    stories: [
      "partition-of-india",
      "founding-of-israel",
      "iran-hostage-crisis",
      "rwandan-genocide",
      "yugoslav-wars",
      "9-11",
      "iraq-war",
      "financial-crisis-2008",
      "arab-spring",
      "covid-19-pandemic",
    ],
  },
  {
    id: "pl-ht-great-leaders",
    name: "Great Leaders",
    description: "The visionaries and statesmen who shaped nations.",
    isFeatured: 1,
    sortOrder: 32,
    stories: [
      "cyrus-the-great",
      "alexander-the-great",
      "augustus-becomes-emperor",
      "marcus-aurelius-philosopher-king",
      "charlemagne-crowned",
      "alfred-the-great",
      "peter-the-great",
      "catherine-the-great",
      "napoleons-rise",
      "lincoln-elected",
      "mandela-freed",
    ],
  },
  {
    id: "pl-ht-comebacks",
    name: "Greatest Comebacks",
    description: "From rock bottom to the top of the world.",
    isFeatured: 1,
    sortOrder: 33,
    stories: [
      "cincinnatus-saves-rome",
      "alfred-the-great",
      "claudius-the-unlikely-emperor",
      "joan-of-arc",
      "washington-crosses-the-delaware",
      "dunkirk-evacuation",
      "mandela-freed",
    ],
  },
  {
    id: "pl-ht-american-frontier",
    name: "The American Frontier",
    description: "Pioneers, gold rushes, and the brutal end of the Wild West.",
    isFeatured: 1,
    sortOrder: 34,
    stories: [
      "jamestown-founded",
      "mayflower-lands",
      "trail-of-tears",
      "alamo",
      "california-gold-rush",
      "shermans-march",
      "battle-of-little-bighorn",
      "wounded-knee",
    ],
  },
  {
    id: "pl-ht-roman-conquests",
    name: "Roman Conquests",
    description: "How a single city ate half the known world.",
    isFeatured: 1,
    sortOrder: 35,
    stories: [
      "hannibal-crosses-the-alps",
      "battle-of-cannae",
      "carthage-must-be-destroyed",
      "caesar-conquers-gaul",
      "varus-loses-the-legions",
      "boudiccas-revolt",
      "destruction-of-jerusalem",
      "trajan-builds-the-empire",
      "hadrians-wall",
      "sack-of-rome-410",
      "attila-the-hun",
      "fall-of-rome",
    ],
  },
  {
    id: "pl-ht-rebellions",
    name: "Rebellions & Uprisings",
    description: "Slaves, peasants, and rebels who took on the empire.",
    isFeatured: 1,
    sortOrder: 36,
    stories: [
      "spartacus-revolts",
      "boudiccas-revolt",
      "the-nika-riots",
      "taiping-rebellion",
      "sepoy-mutiny",
      "boxer-rebellion",
      "warsaw-uprising",
      "hungarian-revolution",
      "tiananmen-square",
    ],
  },
  {
    id: "pl-ht-tragic-endings",
    name: "Tragic Endings",
    description: "How the giants of history fell — beheadings, betrayals, and last words.",
    isFeatured: 1,
    sortOrder: 37,
    stories: [
      "socrates-drinks-the-hemlock",
      "death-of-alexander",
      "ides-of-march",
      "death-of-cleopatra",
      "anne-boleyn-beheaded",
      "execution-of-charles-i",
      "marie-antoinettes-execution",
      "napoleon-at-st-helena",
      "lincoln-assassinated",
      "tsar-and-family-shot",
    ],
  },
  {
    id: "pl-ht-renaissance",
    name: "The Renaissance",
    description: "Art, science, and a wakeup call across Europe.",
    isFeatured: 1,
    sortOrder: 38,
    stories: [
      "medici-rise",
      "fall-of-constantinople-renaissance-trigger",
      "gutenberg-prints-the-bible",
      "savonarolas-bonfire",
      "borgia-popes",
      "leonardo-da-vinci",
      "michelangelo-and-the-sistine",
      "machiavelli-writes-the-prince",
      "galileos-trial",
      "newtons-apple",
    ],
  },
];

// ---------------------------------------------------------------------------
// Validate every story id, then emit SQL.
// ---------------------------------------------------------------------------

let invalid = 0;
for (const def of PLAYLISTS) {
  for (const id of def.stories) {
    if (!byId.has(id)) {
      console.error(`[invalid] ${def.id}: story id "${id}" not in catalog`);
      invalid += 1;
    }
  }
}
if (invalid > 0) {
  console.error(`\n${invalid} invalid story ids — aborting before SQL emit.`);
  process.exit(1);
}

const sql: string[] = [];
sql.push("-- ============================================");
sql.push(`-- Auto-generated by scripts/db-populate-history-playlists.ts`);
sql.push(`-- App: ${APP_ID}`);
sql.push(`-- Playlists: ${PLAYLISTS.length}`);
sql.push("-- ============================================");
sql.push("");

// Wipe then re-insert so reorderings / re-curations are fully applied.
sql.push("-- Reset history-tea playlists (idempotent re-seed).");
sql.push(
  `DELETE FROM playlist_stories WHERE playlist_id IN (SELECT id FROM playlists WHERE app_id = '${APP_ID}');`,
);
sql.push(`DELETE FROM playlists WHERE app_id = '${APP_ID}';`);
sql.push("");

sql.push("-- ── PLAYLISTS ──");
for (const def of PLAYLISTS) {
  sql.push(
    `INSERT INTO playlists (id, app_id, name, description, playlist_type, is_featured, sort_order) VALUES ('${def.id}', '${APP_ID}', '${esc(def.name)}', '${esc(def.description)}', 'thematic', ${def.isFeatured}, ${def.sortOrder});`,
  );
}
sql.push("");

sql.push("-- ── PLAYLIST_STORIES ──");
let totalMappings = 0;
for (const def of PLAYLISTS) {
  let order = 1;
  for (const catId of def.stories) {
    const story = byId.get(catId)!;
    sql.push(
      `INSERT INTO playlist_stories (playlist_id, story_id, sort_order) VALUES ('${def.id}', '${storyDbId(story)}', ${order});`,
    );
    order += 1;
    totalMappings += 1;
  }
  console.log(`[ok] ${def.id} (${def.stories.length}) — ${def.name}`);
}
sql.push("");

writeFileSync(OUT_PATH, sql.join("\n"), "utf8");
console.log(`\nGenerated ${OUT_PATH}`);
console.log(`  Playlists: ${PLAYLISTS.length}`);
console.log(`  Mappings: ${totalMappings}`);
