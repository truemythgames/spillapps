import "dotenv/config";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "apps", "bible-tea", "content");

interface CatalogStory {
  id: string;
  title: string;
  description: string;
  section: string;
  bibleRef: string;
  inSeed: boolean;
  seedId: string | null;
}

const catalog: CatalogStory[] = JSON.parse(
  readFileSync(join(CONTENT_DIR, "story-catalog.json"), "utf8")
);

// ── Existing DB story IDs (slug → st-id) ──
const existingDbStories = new Map<string, string>([
  ["creation", "st-creation"],
  ["adam-and-eve", "st-adam-eve"],
  ["cain-and-abel", "st-cain-abel"],
  ["noahs-ark", "st-noah"],
  ["tower-of-babel", "st-babel"],
  ["abrahams-call", "st-abraham-call"],
  ["abraham-and-isaac", "st-abraham-isaac"],
  ["jacob-and-esau", "st-jacob-esau"],
  ["jacobs-ladder", "st-jacobs-ladder"],
  ["joseph-and-his-brothers", "st-joseph-brothers"],
  ["joseph-in-egypt", "st-joseph-egypt"],
  ["joseph-forgives-his-brothers", "st-joseph-forgives"],
  ["abrahams-sister-lie", "st-abe-sister-lie"],
  ["the-same-lie-again", "st-same-lie"],
  ["gods-promise-of-a-son", "st-promise-son"],
  ["tired-of-waiting", "st-tired-waiting"],
  ["sodom-and-gomorrah", "st-sodom"],
  ["lots-escape-gone-wrong", "st-lots-escape"],
  ["birth-of-isaac", "st-birth-isaac"],
  ["isaac-and-rebekah", "st-isaac-rebekah"],
  ["jacob-rachel-and-leah", "st-jacob-rachel"],
  ["jacob-wrestles-god", "st-jacob-wrestles"],
  ["jacobs-family-moves-to-egypt", "st-jacob-egypt"],
  ["baby-moses", "st-baby-moses"],
  ["the-burning-bush", "st-burning-bush"],
  ["the-ten-plagues", "st-ten-plagues"],
  ["crossing-the-red-sea", "st-red-sea"],
  ["the-ten-commandments", "st-ten-commandments"],
  ["the-golden-calf", "st-golden-calf"],
  ["wandering-the-desert", "st-wandering"],
  ["moses-final-days", "st-moses-final"],
  ["bread-from-heaven", "st-bread-heaven"],
  ["god-gives-a-second-chance", "st-second-chance"],
  ["building-gods-tent", "st-gods-tent"],
  ["joshua-and-jericho", "st-jericho"],
  ["samson-and-delilah", "st-samson"],
  ["ruth-and-naomi", "st-ruth"],
  ["david-and-goliath", "st-david-goliath"],
  ["david-becomes-king", "st-david-king"],
  ["david-and-bathsheba", "st-david-bathsheba"],
  ["solomons-wisdom", "st-solomon"],
  ["daniel-and-the-lions-den", "st-daniel-lions"],
  ["jonah-and-the-whale", "st-jonah"],
  ["esther-saves-her-people", "st-esther"],
  ["the-first-priests", "st-first-priests"],
  ["offerings-and-sacrifices", "st-offerings"],
  ["clean-and-unclean", "st-clean-unclean"],
  ["the-day-of-atonement", "st-atonement"],
  ["real-world-holiness", "st-holiness"],
  ["sacred-feasts-and-rhythms", "st-feasts"],
  ["birth-of-jesus", "st-birth-jesus"],
  ["jesus-gets-baptized", "st-baptism"],
  ["water-to-wine", "st-first-miracles"],
  ["the-good-samaritan", "st-good-samaritan"],
  ["the-prodigal-son", "st-prodigal-son"],
  ["walking-on-water", "st-walks-water"],
  ["feeding-5000", "st-feeds-5000"],
  ["the-last-supper", "st-last-supper"],
  ["the-crucifixion", "st-crucifixion"],
  ["the-resurrection", "st-resurrection"],
]);

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

function storyDbId(catalogId: string): string {
  if (existingDbStories.has(catalogId)) return existingDbStories.get(catalogId)!;
  return `st-${catalogId}`;
}

// ── Extract Bible book from bibleRef ──
function extractBook(ref: string): string {
  return ref
    .replace(/\s+\d+[:–\-].*$/, "")
    .replace(/\s+\d+$/, "")
    .replace(/,\s*$/, "")
    .trim();
}

// ── Season mapping: Bible book → season ID ──
const bookToSeason: Record<string, { id: string; testament: "old" | "new"; name: string; slug: string; desc: string }> = {
  Genesis: { id: "s-genesis", testament: "old", name: "Genesis", slug: "genesis", desc: "Where it all began. Creation, the first humans, epic floods, and family drama that puts reality TV to shame." },
  Exodus: { id: "s-exodus", testament: "old", name: "Exodus", slug: "exodus", desc: "Slavery, plagues, a sea splitting in half, and survival in the desert. The original action movie." },
  Leviticus: { id: "s-leviticus", testament: "old", name: "Leviticus", slug: "leviticus", desc: "Rules, rituals, and what it means to be holy. Less exciting than Exodus, but the foundation of everything." },
  Numbers: { id: "s-numbers", testament: "old", name: "Numbers", slug: "numbers", desc: "40 years of wandering, complaining, and learning to trust God. The ultimate road trip gone wrong." },
  Deuteronomy: { id: "s-deuteronomy", testament: "old", name: "Deuteronomy", slug: "deuteronomy", desc: "Moses' farewell speeches. A reminder of everything God did and everything Israel needs to do next." },
  Joshua: { id: "s-joshua", testament: "old", name: "Joshua", slug: "joshua", desc: "The Promised Land conquest. Walls fall, cities burn, and Israel finally gets home." },
  Judges: { id: "s-judges", testament: "old", name: "Judges", slug: "judges", desc: "Israel's darkest era. Heroes rise, chaos reigns, and everyone does what they want." },
  Ruth: { id: "s-ruth", testament: "old", name: "Ruth", slug: "ruth", desc: "A love story of loyalty and redemption set in the darkest period of Israel's history." },
  "1 Samuel": { id: "s-1samuel", testament: "old", name: "1 Samuel", slug: "1-samuel", desc: "From the last judge to the first king. Samuel, Saul, and David's rise." },
  "2 Samuel": { id: "s-2samuel", testament: "old", name: "2 Samuel", slug: "2-samuel", desc: "David's reign — triumphs, tragedies, and the messiest family in the Bible." },
  "1 Kings": { id: "s-1kings", testament: "old", name: "1 Kings", slug: "1-kings", desc: "Solomon's glory, the kingdom splits, and Elijah takes on 450 prophets." },
  "2 Kings": { id: "s-2kings", testament: "old", name: "2 Kings", slug: "2-kings", desc: "The long decline. Good kings, bad kings, and the fall of two nations." },
  "1-2 Kings various": { id: "s-2kings", testament: "old", name: "2 Kings", slug: "2-kings", desc: "" },
  "2 Kings various": { id: "s-2kings", testament: "old", name: "2 Kings", slug: "2-kings", desc: "" },
  "2 Chronicles": { id: "s-2chronicles", testament: "old", name: "2 Chronicles", slug: "2-chronicles", desc: "The southern kingdom's story retold — reformers, rebels, and the road to exile." },
  Daniel: { id: "s-daniel", testament: "old", name: "Daniel", slug: "daniel", desc: "Lions' dens, fiery furnaces, and apocalyptic visions. Faithfulness under pressure." },
  Esther: { id: "s-esther", testament: "old", name: "Esther", slug: "esther", desc: "A beauty queen saves her people. God's name is never mentioned, but his fingerprints are everywhere." },
  Jonah: { id: "s-jonah", testament: "old", name: "Jonah", slug: "jonah", desc: "A prophet runs from God, gets swallowed by a fish, and learns about mercy the hard way." },
  Matthew: { id: "s-matthew", testament: "new", name: "Matthew", slug: "matthew", desc: "The Gospel written for Jewish readers. Jesus as the promised Messiah, from birth to resurrection." },
  Mark: { id: "s-mark", testament: "new", name: "Mark", slug: "mark", desc: "The fast-paced Gospel. Action-packed miracles and the suffering servant." },
  Luke: { id: "s-luke", testament: "new", name: "Luke", slug: "luke", desc: "The most detailed Gospel. Jesus as the friend of outsiders, sinners, and the forgotten." },
  John: { id: "s-john", testament: "new", name: "John", slug: "john", desc: "The spiritual Gospel. Deep conversations, signs, and the Word made flesh." },
  Acts: { id: "s-acts", testament: "new", name: "Acts", slug: "acts", desc: "The early church explodes. From a room in Jerusalem to the ends of the Roman Empire." },
  James: { id: "s-james", testament: "new", name: "James", slug: "james", desc: "Faith without works is dead. Practical wisdom for real Christian living." },
  "2 Peter": { id: "s-2peter", testament: "new", name: "2 Peter", slug: "2-peter", desc: "Peter's urgent final letter. Hold on to truth, watch out for fakes." },
  "2 Timothy": { id: "s-2timothy", testament: "new", name: "2 Timothy", slug: "2-timothy", desc: "Paul's last letter from prison. A veteran passes the torch to the next generation." },
  Revelation: { id: "s-revelation", testament: "new", name: "Revelation", slug: "revelation", desc: "The ultimate ending. Visions, beasts, and the new heaven and earth." },
};

// Handle the edge case in the catalog
const bookAliases: Record<string, string> = {
  "Genesis 25,": "Genesis",
};

// ── Character → Story mapping ──
const characterStoryMap: Record<string, { name: string; desc: string; stories: string[] }> = {
  "ch-adam": { name: "Adam", desc: "The first human, made from dust", stories: ["creation", "adam-and-eve", "cain-and-abel"] },
  "ch-eve": { name: "Eve", desc: "The first woman, mother of all living", stories: ["creation", "adam-and-eve", "cain-and-abel"] },
  "ch-noah": { name: "Noah", desc: "Built an ark when nobody believed", stories: ["noahs-ark"] },
  "ch-abraham": { name: "Abraham", desc: "Father of nations, friend of God", stories: [
    "abrahams-call", "abrahams-sister-lie", "the-same-lie-again", "gods-promise-of-a-son",
    "tired-of-waiting", "sodom-and-gomorrah", "birth-of-isaac", "abraham-and-isaac", "isaac-and-rebekah",
  ]},
  "ch-sarah": { name: "Sarah", desc: "Abraham's wife, mother of Isaac", stories: [
    "abrahams-sister-lie", "the-same-lie-again", "gods-promise-of-a-son", "tired-of-waiting", "birth-of-isaac",
  ]},
  "ch-isaac": { name: "Isaac", desc: "The promised son, almost sacrificed", stories: [
    "birth-of-isaac", "abraham-and-isaac", "isaac-and-rebekah", "jacob-and-esau",
  ]},
  "ch-jacob": { name: "Jacob", desc: "The trickster who wrestled God", stories: [
    "jacob-and-esau", "jacobs-ladder", "jacob-rachel-and-leah", "jacob-wrestles-god",
    "joseph-and-his-brothers", "jacobs-family-moves-to-egypt",
  ]},
  "ch-joseph": { name: "Joseph", desc: "From pit to palace, the ultimate comeback", stories: [
    "joseph-and-his-brothers", "joseph-in-egypt", "joseph-forgives-his-brothers", "jacobs-family-moves-to-egypt",
  ]},
  "ch-moses": { name: "Moses", desc: "Led Israel out of slavery", stories: [
    "baby-moses", "the-burning-bush", "the-ten-plagues", "crossing-the-red-sea",
    "bread-from-heaven", "the-ten-commandments", "the-golden-calf", "god-gives-a-second-chance",
    "building-gods-tent", "wandering-the-desert", "moses-final-days",
    "the-first-priests", "offerings-and-sacrifices", "clean-and-unclean",
    "the-day-of-atonement", "real-world-holiness", "sacred-feasts-and-rhythms", "sabbath-jubilee-and-justice",
    "organizing-the-camp", "camp-rules-and-the-cloud", "complaining-craving-and-chaos",
    "12-spies-and-a-40-year-detour", "rebellion-and-the-earth-opens",
    "snakes-water-and-the-long-road", "a-new-census-a-new-start",
    "the-battle-against-midian", "dont-get-comfortable-too-early",
    "what-kind-of-leaders-god-wants", "rules-for-war", "law-for-messy-lives",
    "community-standards", "one-god-one-place", "what-god-really-wants",
    "dont-let-success-ruin-you", "remember-where-you-started",
    "cancel-debts-set-people-free", "the-ultimate-choice",
    "cities-of-refuge", "setting-boundaries", "fair-play-and-fair-trade",
    "moses-farewell-address", "choose-life-or-death", "blessings-and-curses",
    "the-warning-song",
  ]},
  "ch-joshua": { name: "Joshua", desc: "Moses' successor who conquered the Promised Land", stories: [
    "12-spies-and-a-40-year-detour",
    "joshua-takes-command", "crossing-the-jordan", "joshua-and-jericho",
    "achans-hidden-sin", "the-gibeonite-trick", "conquering-the-land",
    "caleb-claims-his-mountain", "claim-your-inheritance",
    "safe-cities-sacred-spaces", "the-altar-that-almost-started-a-war", "joshuas-final-challenge",
  ]},
  "ch-deborah": { name: "Deborah", desc: "Judge, prophet, and warrior leader", stories: ["deborah-and-jael", "the-cycle-of-disobedience"] },
  "ch-gideon": { name: "Gideon", desc: "Defeated an army with 300 men and some torches", stories: ["gideon-vs-the-midianites", "when-victory-goes-to-your-head"] },
  "ch-samson": { name: "Samson", desc: "Strongest man alive, weakest when it came to love", stories: ["samson-and-delilah"] },
  "ch-ruth": { name: "Ruth", desc: "Loyal to the end, an ancestor of Jesus", stories: ["ruth-and-naomi"] },
  "ch-david": { name: "David", desc: "Shepherd, giant-slayer, king, songwriter", stories: [
    "david-and-goliath", "sauls-last-stand", "two-kings-two-armies",
    "david-becomes-king", "david-dances-before-the-ark", "gods-promise-to-david",
    "kindness-to-mephibosheth", "david-and-bathsheba",
    "absaloms-rise", "absaloms-rebellion", "a-fathers-worst-battle",
    "davids-broken-return", "davids-last-battles", "davids-final-mistake",
  ]},
  "ch-solomon": { name: "Solomon", desc: "Wisest king ever, but couldn't follow his own advice", stories: ["solomons-wisdom", "the-kingdom-splits"] },
  "ch-elijah": { name: "Elijah", desc: "Called down fire from heaven", stories: ["elijah-on-mount-carmel"] },
  "ch-daniel": { name: "Daniel", desc: "Survived the lions' den", stories: ["daniel-and-the-lions-den"] },
  "ch-esther": { name: "Esther", desc: "Queen who risked everything to save her people", stories: ["esther-saves-her-people"] },
  "ch-jonah": { name: "Jonah", desc: "Ran from God, swallowed by a fish", stories: ["jonah-and-the-whale"] },
  "ch-mary": { name: "Mary", desc: "Mother of Jesus", stories: [
    "angel-visits-mary", "birth-of-jesus", "simeon-and-anna",
    "boy-jesus-at-the-temple", "water-to-wine",
  ]},
  "ch-john-the-baptist": { name: "John the Baptist", desc: "Prepared the way for Jesus", stories: [
    "angel-visits-zechariah", "birth-of-john-the-baptist",
    "john-the-baptist-preaches", "john-declares-the-lamb",
    "jesus-gets-baptized", "john-the-baptists-last-words", "john-the-baptist-beheaded",
  ]},
  "ch-jesus": { name: "Jesus", desc: "Son of God, Savior of the world", stories: [
    "birth-of-jesus", "simeon-and-anna", "the-wise-men", "flight-to-egypt",
    "boy-jesus-at-the-temple", "jesus-gets-baptized", "40-days-in-the-desert",
    "water-to-wine", "nicodemus-comes-at-night", "jesus-flips-tables",
    "healing-at-the-pool", "the-miraculous-catch", "casting-out-an-evil-spirit",
    "peters-mother-in-law-healed", "touching-the-leper", "through-the-roof",
    "matthew-leaves-everything", "the-sabbath-showdowns", "picking-the-twelve",
    "the-centurions-faith", "the-widows-son-lives-again",
    "deaf-ears-opened", "jesus-stops-a-storm", "legion-and-the-pigs",
    "jairus-daughter-and-the-bleeding-woman", "healing-the-officials-son",
    "demons-and-accusations", "feeding-5000", "walking-on-water",
    "feeding-4000", "bread-of-life", "the-purity-debate",
    "a-mothers-desperate-faith", "peters-big-confession", "the-transfiguration",
    "the-boy-with-a-demon", "jesus-predicts-his-death", "the-fish-with-a-coin",
    "the-festival-showdown", "born-blind-now-sees", "the-good-shepherd",
    "sending-out-72", "the-good-samaritan", "mary-and-martha",
    "teaching-them-to-pray", "casting-out-demons-and-taking-heat",
    "calling-out-the-pharisees", "the-woman-at-the-well",
    "lazarus-lives-again", "go-ahead-throw-a-stone",
    "the-wedding-feast-parables", "the-narrow-door", "counting-the-cost",
    "the-prodigal-son", "the-shrewd-manager", "the-rich-man-and-lazarus",
    "zacchaeus-climbs-a-tree", "anointed-at-bethany",
    "the-cursed-fig-tree", "palm-sunday", "caesars-coin",
    "faith-figs-and-loaded-questions", "marriage-and-the-afterlife",
    "the-greatest-commandment", "whose-son-is-the-messiah",
    "signs-of-the-end", "the-plot-against-jesus", "judas-makes-a-deal",
    "the-last-supper", "gethsemane", "arrested-in-the-garden",
    "before-the-sanhedrin", "jesus-before-pilate",
    "the-crucifixion", "buried-in-a-borrowed-tomb",
    "the-resurrection", "the-road-to-emmaus", "doubting-thomas",
    "the-great-commission", "the-ascension",
    "meeting-the-first-disciples", "john-declares-the-lamb",
    "john-the-baptists-last-words",
  ]},
  "ch-peter": { name: "Peter", desc: "From fisherman to the rock of the church", stories: [
    "the-miraculous-catch", "picking-the-twelve", "walking-on-water",
    "peters-big-confession", "the-transfiguration", "the-fish-with-a-coin",
    "the-last-supper", "gethsemane", "peters-three-denials",
    "the-resurrection", "the-road-to-emmaus", "the-ascension",
    "pentecost", "the-beautiful-gate-miracle", "ananias-and-sapphira",
    "peters-miracles", "cornelius-and-the-vision",
    "james-killed-peter-escapes", "the-jerusalem-council",
    "peters-final-letter",
  ]},
  "ch-paul": { name: "Paul", desc: "From persecutor to the greatest missionary", stories: [
    "saul-meets-jesus", "the-antioch-church",
    "pauls-first-journey", "the-jerusalem-council",
    "earthquake-at-philippi", "thessalonica-riot-and-berea",
    "athens-the-unknown-god", "riot-in-ephesus",
    "eutychus-falls-out-a-window", "farewell-at-miletus",
    "arrested-at-the-temple", "trials-before-governors",
    "shipwreck-and-malta", "paul-under-house-arrest",
    "pauls-last-letter",
  ]},
  // New characters
  "ch-lot": { name: "Lot", desc: "Abraham's nephew who chose the wrong neighborhood", stories: ["sodom-and-gomorrah", "lots-escape-gone-wrong"] },
  "ch-rebekah": { name: "Rebekah", desc: "Isaac's wife who played favorites", stories: ["isaac-and-rebekah", "jacob-and-esau"] },
  "ch-rachel": { name: "Rachel", desc: "Jacob worked 14 years to marry her", stories: ["jacob-rachel-and-leah"] },
  "ch-balaam": { name: "Balaam", desc: "The prophet whose donkey saw an angel first", stories: ["a-talking-donkey-and-a-hired-prophet", "when-curses-wont-stick"] },
  "ch-caleb": { name: "Caleb", desc: "Faithful spy who claimed his mountain at 85", stories: ["12-spies-and-a-40-year-detour", "caleb-claims-his-mountain"] },
  "ch-jephthah": { name: "Jephthah", desc: "A warrior judge who made a reckless vow", stories: ["jephthahs-reckless-vow"] },
  "ch-absalom": { name: "Absalom", desc: "David's son who tried to steal the throne", stories: ["absaloms-rise", "absaloms-rebellion", "a-fathers-worst-battle"] },
  "ch-hezekiah": { name: "Hezekiah", desc: "The king who prayed and got 15 extra years", stories: ["hezekiahs-extra-years", "one-angel-one-army-destroyed", "hezekiah-vs-the-empire"] },
  "ch-josiah": { name: "Josiah", desc: "The boy king who found the lost Book of the Law", stories: ["josiah-finds-the-lost-book", "josiahs-last-battle"] },
  "ch-nicodemus": { name: "Nicodemus", desc: "Pharisee who came to Jesus at night", stories: ["nicodemus-comes-at-night"] },
  "ch-martha": { name: "Martha", desc: "The busy sister who learned to sit still", stories: ["mary-and-martha", "lazarus-lives-again"] },
  "ch-lazarus": { name: "Lazarus", desc: "Died. Got raised. Had dinner with Jesus.", stories: ["lazarus-lives-again", "anointed-at-bethany"] },
  "ch-zacchaeus": { name: "Zacchaeus", desc: "Short tax collector who climbed a tree to see Jesus", stories: ["zacchaeus-climbs-a-tree"] },
  "ch-judas": { name: "Judas Iscariot", desc: "The disciple who betrayed Jesus for 30 coins", stories: ["judas-makes-a-deal", "the-last-supper", "arrested-in-the-garden"] },
  "ch-pilate": { name: "Pontius Pilate", desc: "Roman governor who washed his hands of Jesus", stories: ["jesus-before-pilate", "the-crucifixion"] },
  "ch-stephen": { name: "Stephen", desc: "First Christian martyr, stoned for his faith", stories: ["stephen-the-first-martyr"] },
  "ch-barnabas": { name: "Barnabas", desc: "The encourager who believed in Paul", stories: ["the-antioch-church", "pauls-first-journey"] },
  "ch-cornelius": { name: "Cornelius", desc: "First Gentile convert, a Roman centurion", stories: ["cornelius-and-the-vision"] },
  "ch-john-apostle": { name: "John the Apostle", desc: "The beloved disciple, author of Revelation", stories: [
    "meeting-the-first-disciples", "picking-the-twelve", "the-transfiguration",
    "johns-exile-and-revelation", "the-new-heaven-and-new-earth",
  ]},
};

// ── Playlist → Story mapping ──
const playlistStoryMap: Record<string, string[]> = {
  "pl-easter": [
    "palm-sunday", "the-plot-against-jesus", "judas-makes-a-deal", "the-last-supper",
    "gethsemane", "arrested-in-the-garden", "before-the-sanhedrin",
    "peters-three-denials", "jesus-before-pilate", "the-crucifixion",
    "buried-in-a-borrowed-tomb", "the-resurrection", "the-road-to-emmaus",
    "doubting-thomas", "the-great-commission", "the-ascension",
  ],
  "pl-beginners": [
    "creation", "adam-and-eve", "noahs-ark", "abrahams-call",
    "joseph-and-his-brothers", "baby-moses", "the-ten-commandments",
    "david-and-goliath", "daniel-and-the-lions-den", "jonah-and-the-whale",
    "birth-of-jesus", "the-good-samaritan", "the-prodigal-son",
    "the-crucifixion", "the-resurrection",
  ],
  "pl-drama": [
    "cain-and-abel", "sodom-and-gomorrah", "lots-escape-gone-wrong",
    "joseph-and-his-brothers", "the-ten-plagues", "the-golden-calf",
    "rebellion-and-the-earth-opens", "samson-and-delilah",
    "david-and-bathsheba", "absaloms-rebellion", "elijah-on-mount-carmel",
    "the-kingdom-splits", "jerusalem-burns",
    "john-the-baptist-beheaded", "arrested-in-the-garden",
    "the-crucifixion", "ananias-and-sapphira", "stephen-the-first-martyr",
  ],
  "pl-underdogs": [
    "baby-moses", "gideon-vs-the-midianites", "ruth-and-naomi",
    "david-and-goliath", "esther-saves-her-people", "daniel-and-the-lions-den",
    "the-widows-son-lives-again", "zacchaeus-climbs-a-tree",
    "the-woman-at-the-well", "born-blind-now-sees",
    "saul-meets-jesus", "earthquake-at-philippi",
  ],
  "pl-love": [
    "isaac-and-rebekah", "jacob-rachel-and-leah", "ruth-and-naomi",
    "gods-promise-to-david", "the-good-samaritan",
    "the-prodigal-son", "the-woman-at-the-well",
    "lazarus-lives-again", "anointed-at-bethany",
    "kindness-to-mephibosheth",
  ],
  "pl-miracles": [
    "creation", "crossing-the-red-sea", "bread-from-heaven",
    "joshua-and-jericho", "elijah-on-mount-carmel",
    "water-to-wine", "feeding-5000", "walking-on-water",
    "jesus-stops-a-storm", "the-widows-son-lives-again",
    "jairus-daughter-and-the-bleeding-woman", "born-blind-now-sees",
    "lazarus-lives-again", "the-resurrection",
    "pentecost", "the-beautiful-gate-miracle",
  ],
  "pl-family": [
    "cain-and-abel", "abraham-and-isaac", "jacob-and-esau",
    "jacob-rachel-and-leah", "joseph-and-his-brothers",
    "joseph-forgives-his-brothers", "baby-moses",
    "absaloms-rise", "absaloms-rebellion",
    "the-prodigal-son", "tired-of-waiting", "lots-escape-gone-wrong",
  ],
  "pl-jesus": [
    "birth-of-jesus", "boy-jesus-at-the-temple", "jesus-gets-baptized",
    "40-days-in-the-desert", "water-to-wine", "picking-the-twelve",
    "the-good-samaritan", "the-prodigal-son", "feeding-5000",
    "walking-on-water", "the-transfiguration", "lazarus-lives-again",
    "palm-sunday", "the-last-supper", "gethsemane",
    "the-crucifixion", "the-resurrection", "the-ascension",
  ],
  "pl-courage": [
    "abraham-and-isaac", "crossing-the-red-sea", "joshua-and-jericho",
    "deborah-and-jael", "gideon-vs-the-midianites",
    "david-and-goliath", "elijah-on-mount-carmel",
    "daniel-and-the-lions-den", "esther-saves-her-people",
    "jacob-wrestles-god", "stephen-the-first-martyr",
    "saul-meets-jesus", "earthquake-at-philippi",
    "shipwreck-and-malta",
  ],
  "pl-abraham": [
    "abrahams-call", "abrahams-sister-lie", "the-same-lie-again",
    "gods-promise-of-a-son", "tired-of-waiting",
    "sodom-and-gomorrah", "lots-escape-gone-wrong",
    "birth-of-isaac", "abraham-and-isaac", "isaac-and-rebekah",
  ],
  "pl-jacob": [
    "jacob-and-esau", "jacobs-ladder", "jacob-rachel-and-leah",
    "jacob-wrestles-god", "jacobs-family-moves-to-egypt",
  ],
  "pl-exodus": [
    "baby-moses", "the-burning-bush", "the-ten-plagues",
    "crossing-the-red-sea", "bread-from-heaven",
    "the-ten-commandments", "the-golden-calf",
    "god-gives-a-second-chance", "building-gods-tent",
  ],
  "pl-second-chances": [
    "god-gives-a-second-chance", "the-prodigal-son",
    "jonah-and-the-whale", "joseph-forgives-his-brothers",
    "david-and-bathsheba", "the-same-lie-again",
    "the-day-of-atonement", "zacchaeus-climbs-a-tree",
    "peters-three-denials", "saul-meets-jesus",
  ],
  "pl-relationships": [
    "isaac-and-rebekah", "jacob-rachel-and-leah", "ruth-and-naomi",
    "samson-and-delilah", "david-and-bathsheba",
    "the-good-samaritan", "mary-and-martha",
    "kindness-to-mephibosheth",
  ],
};

// ───────────── GENERATE SQL ─────────────
const sql: string[] = [];
sql.push("-- ============================================");
sql.push("-- Auto-generated: seasons, stories, characters, playlists");
sql.push("-- ============================================");
sql.push("");

// 1. Seasons
sql.push("-- ── NEW SEASONS ──");
const existingSeasons = new Set(["s-genesis", "s-exodus", "s-leviticus", "s-heroes", "s-jesus"]);
const createdSeasons = new Set<string>();
let seasonOrder = 10;

for (const [, info] of Object.entries(bookToSeason)) {
  if (existingSeasons.has(info.id) || createdSeasons.has(info.id)) continue;
  sql.push(
    `INSERT OR IGNORE INTO seasons (id, app_id, testament, name, slug, description, sort_order) VALUES ('${info.id}', 'bible-tea', '${info.testament}', '${esc(info.name)}', '${info.slug}', '${esc(info.desc)}', ${seasonOrder});`
  );
  createdSeasons.add(info.id);
  seasonOrder += 1;
}
sql.push("");

// 2. Stories
sql.push("-- ── NEW STORIES ──");
let storyOrder = 100;
const newStoryIds: string[] = [];

for (const story of catalog) {
  const dbId = storyDbId(story.id);
  if (existingDbStories.has(story.id)) continue;

  let book = extractBook(story.bibleRef);
  if (bookAliases[book]) book = bookAliases[book];
  const seasonInfo = bookToSeason[book];
  if (!seasonInfo) {
    console.error(`WARNING: No season for book "${book}" (story: ${story.id}, ref: ${story.bibleRef})`);
    continue;
  }

  newStoryIds.push(story.id);
  sql.push(
    `INSERT OR IGNORE INTO stories (id, app_id, season_id, title, slug, description, cover_image_key, sort_order, is_free, is_published) VALUES ('${dbId}', 'bible-tea', '${seasonInfo.id}', '${esc(story.title)}', '${esc(story.id)}', '${esc(story.description)}', 'stories/${story.id}/cover.webp', ${storyOrder}, 0, 1);`
  );
  storyOrder++;
}

// Also update existing stories in "Heroes & Kings" to their proper book season
sql.push("");
sql.push("-- ── REASSIGN EXISTING STORIES TO PROPER BOOK SEASONS ──");
const reassignments: [string, string][] = [
  ["st-jericho", "s-joshua"],
  ["st-samson", "s-judges"],
  ["st-ruth", "s-ruth"],
  ["st-david-goliath", "s-1samuel"],
  ["st-david-king", "s-2samuel"],
  ["st-david-bathsheba", "s-2samuel"],
  ["st-solomon", "s-1kings"],
  ["st-daniel-lions", "s-daniel"],
  ["st-jonah", "s-jonah"],
  ["st-esther", "s-esther"],
  // Life of Jesus → individual gospels
  ["st-birth-jesus", "s-luke"],
  ["st-baptism", "s-matthew"],
  ["st-first-miracles", "s-john"],
  ["st-good-samaritan", "s-luke"],
  ["st-prodigal-son", "s-luke"],
  ["st-walks-water", "s-matthew"],
  ["st-feeds-5000", "s-matthew"],
  ["st-last-supper", "s-matthew"],
  ["st-crucifixion", "s-matthew"],
  ["st-resurrection", "s-matthew"],
];
for (const [stId, seasonId] of reassignments) {
  sql.push(`UPDATE stories SET season_id = '${seasonId}' WHERE id = '${stId}';`);
}
sql.push("");

// 3. Characters
sql.push("-- ── NEW CHARACTERS ──");
const existingChars = new Set([
  "ch-adam", "ch-eve", "ch-noah", "ch-abraham", "ch-moses", "ch-david",
  "ch-jesus", "ch-joseph", "ch-daniel", "ch-esther", "ch-ruth", "ch-jonah",
  "ch-samson", "ch-solomon", "ch-joshua", "ch-jacob", "ch-isaac", "ch-sarah",
  "ch-elijah", "ch-peter", "ch-paul", "ch-mary", "ch-john-the-baptist",
  "ch-gideon", "ch-deborah",
]);
let charOrder = 100;

for (const [chId, info] of Object.entries(characterStoryMap)) {
  if (existingChars.has(chId)) continue;
  sql.push(
    `INSERT OR IGNORE INTO characters (id, app_id, name, description, sort_order) VALUES ('${chId}', 'bible-tea', '${esc(info.name)}', '${esc(info.desc)}', ${charOrder});`
  );
  charOrder++;
}
sql.push("");

// 4. Character-story links
sql.push("-- ── CHARACTER-STORY LINKS ──");
sql.push("-- Clear existing links and rebuild");
sql.push("DELETE FROM character_stories;");
sql.push("");

for (const [chId, info] of Object.entries(characterStoryMap)) {
  const links = info.stories.map((s) => `('${chId}', '${storyDbId(s)}')`);
  if (links.length > 0) {
    sql.push(`INSERT OR IGNORE INTO character_stories (character_id, story_id) VALUES`);
    sql.push(`  ${links.join(",\n  ")};`);
  }
}
sql.push("");

// 5. Playlist-story links
sql.push("-- ── PLAYLIST-STORY LINKS ──");
sql.push("DELETE FROM playlist_stories;");
sql.push("");

for (const [plId, stories] of Object.entries(playlistStoryMap)) {
  const links = stories.map((s, i) => `('${plId}', '${storyDbId(s)}', ${i + 1})`);
  if (links.length > 0) {
    sql.push(`INSERT OR IGNORE INTO playlist_stories (playlist_id, story_id, sort_order) VALUES`);
    sql.push(`  ${links.join(",\n  ")};`);
  }
}

const output = sql.join("\n");
const outputPath = join(ROOT, "scripts", "db-populate-all.sql");
import { writeFileSync } from "node:fs";
writeFileSync(outputPath, output, "utf8");
console.log(`Generated ${outputPath}`);
console.log(`  New seasons: ${createdSeasons.size}`);
console.log(`  New stories: ${newStoryIds.length}`);
console.log(`  Characters: ${Object.keys(characterStoryMap).length}`);
console.log(`  Playlists: ${Object.keys(playlistStoryMap).length}`);
