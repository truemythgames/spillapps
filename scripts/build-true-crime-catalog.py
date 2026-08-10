#!/usr/bin/env python3
"""Build apps/true-crime-tea/content/story-catalog.json (~200 cases)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "apps/true-crime-tea/content/story-catalog.json"


def c(id: str, title: str, description: str, section: str, ref: str, seed: bool = True):
    return {
        "id": id,
        "title": title,
        "description": description,
        "section": section,
        "bibleRef": ref,
        "inSeed": seed,
        "seedId": f"st-{id}",
    }


CASES: list[dict] = []

# ── Heists ──────────────────────────────────────────────────────────────────
CASES += [
    c("db-cooper", "D.B. Cooper", "A man in a suit hijacks a plane, parachutes into the night with ransom money, and vanishes. The only unsolved skyjacking in U.S. history.", "Heists", "November 24, 1971 — Pacific Northwest"),
    c("gardner-museum-heist", "The Gardner Museum Heist", "Two men dressed as cops walk out with half a billion in art. Empty frames still hang on the walls.", "Heists", "March 18, 1990 — Boston"),
    c("great-train-robbery", "The Great Train Robbery", "Fifteen men stop a Royal Mail train in the English countryside and steal a fortune — then the manhunt begins.", "Heists", "August 8, 1963 — Buckinghamshire"),
    c("brinks-robbery", "The Brink's Robbery", "Eleven men hit an armored depot for millions in under half an hour — then spend years looking over their shoulders.", "Heists", "January 17, 1950 — Boston"),
    c("air-france-heist", "The Air France Heist", "A crew hits an airport vault and walks away with tens of millions — one of the cleanest airport scores ever pulled.", "Heists", "July 1967 — New York"),
    c("antwerp-diamond-heist", "The Antwerp Diamond Heist", "Thieves crack the world's most secure diamond vault with magnets, hair spray, and patience. Almost nothing is recovered.", "Heists", "February 15–16, 2003 — Antwerp"),
    c("hatton-garden-heist", "The Hatton Garden Heist", "A crew of aging thieves drills into a London vault over Easter weekend. The 'Dad's Army' heist that stunned Britain.", "Heists", "April 2015 — London"),
    c("northern-bank-robbery", "The Northern Bank Robbery", "Gunmen take bank executives' families hostage and walk out with £26 million in Belfast.", "Heists", "December 2004 — Belfast"),
    c("securitas-depot-robbery", "The Securitas Depot Robbery", "Britain's largest cash robbery. A manager is kidnapped, a depot is emptied, and £53 million disappears.", "Heists", "February 21, 2006 — Kent"),
    c("pierre-hotel-heist", "The Pierre Hotel Heist", "Gunmen take over a luxury Manhattan hotel and empty the safe deposit boxes in a military-style raid.", "Heists", "January 2, 1972 — New York"),
    c("lufthansa-heist", "The Lufthansa Heist", "A crew hits JFK's Lufthansa cargo vault for millions — then the cover-up turns deadlier than the score.", "Heists", "December 11, 1978 — New York"),
    c("millennium-dome-raid", "The Millennium Dome Raid", "Thieves try to steal £350 million in diamonds with a digger and a speedboat. The cops are already waiting.", "Heists", "November 7, 2000 — London"),
    c("green-vault-heist", "The Green Vault Heist", "Thieves smash into Dresden's historic treasure chamber and escape with royal jewels worth hundreds of millions.", "Heists", "November 25, 2019 — Dresden"),
    c("stockholm-museum-heist", "The Stockholm Museum Heist", "Masked men storm a museum, grab masterpieces, and flee by speedboat through the city.", "Heists", "December 22, 2000 — Stockholm"),
    c("baker-street-robbery", "The Baker Street Robbery", "A gang tunnels into a London bank vault from a nearby shop while a pirate-radio listener overhears police chatter.", "Heists", "September 1971 — London"),
    c("knightsbridge-security-deposit", "The Knightsbridge Security Deposit Robbery", "Valerio Viccei and crew take over a London vault and empty deposit boxes with swagger in broad daylight.", "Heists", "July 12, 1987 — London"),
    c("dunbar-armored-robbery", "The Dunbar Armored Robbery", "An insider job hits an armored facility for nearly $19 million — one of the largest cash heists in U.S. history.", "Heists", "September 13, 1997 — Los Angeles"),
    c("united-california-bank-burglary", "The United California Bank Burglary", "A professional crew drills into a Laguna Niguel bank vault and empties safe deposit boxes over a weekend.", "Heists", "March 24, 1972 — California"),
    c("brussels-airport-diamond-heist", "The Brussels Airport Diamond Heist", "In under three minutes, gunmen seize tens of millions in diamonds on the tarmac — no shots fired.", "Heists", "February 18, 2013 — Brussels"),
    c("schiphol-airport-heist", "The Schiphol Airport Heist", "Armed men hit a secured airport area and escape with diamonds meant for a flight out of Amsterdam.", "Heists", "February 25, 2005 — Amsterdam"),
    c("pink-panthers-tokyo", "The Pink Panthers in Tokyo", "A flash-mob style jewelry raid in Ginza. Smoke bombs, wigs, and a getaway that feels like cinema.", "Heists", "2004 — Tokyo"),
    c("sao-paulo-bank-tunnel", "The São Paulo Bank Tunnel Heist", "Thieves dig a long tunnel under a bank and empty the vault like a heist movie made real.", "Heists", "August 2005 — São Paulo"),
    c("fortaleza-central-bank", "The Fortaleza Central Bank Heist", "A crew rents a house near the bank, tunnels for months, and walks away with tens of millions.", "Heists", "August 2005 — Fortaleza"),
    c("kunsthal-art-heist", "The Kunsthal Art Heist", "Thieves grab seven masterpieces from a Rotterdam museum in minutes. Most are never seen again.", "Heists", "October 16, 2012 — Rotterdam"),
    c("bonded-vault-heist", "The Bonded Vault Heist", "Providence mobsters empty a secret vault stuffed with cash and jewels — then silence becomes policy.", "Heists", "August 14, 1975 — Rhode Island"),
    c("carlton-intercontinental-heist", "The Carlton Intercontinental Heist", "Thieves hit a Cannes hotel jewelry display and vanish with a fortune during festival season.", "Heists", "July 28, 2013 — Cannes"),
    c("harry-winston-paris-heist", "The Harry Winston Heist", "Armed thieves — some in wigs — storm a Paris jewelry boutique and escape with tens of millions.", "Heists", "December 4, 2008 — Paris"),
    c("graff-diamonds-heist", "The Graff Diamonds Heist", "Two men in suits walk into a Mayfair jeweler and leave with a bag of stones worth tens of millions.", "Heists", "August 6, 2009 — London"),
    c("montreal-museum-of-fine-arts", "The Montreal Museum of Fine Arts Heist", "Thieves slip into the museum at night and vanish with jewels and paintings — still mostly unrecovered.", "Heists", "September 4, 1972 — Montreal"),
    c("panamarenko-diamond-robbery", "The London Hatton Garden Precursor Raids", "A string of professional vault hits that taught London thieves how to think like engineers.", "Heists", "1980s–1990s — London"),
    c("argentina-banco-rio", "The Banco Río Heist", "Hostages, a media circus, and a tunnel exit. Argentina's most cinematic bank robbery.", "Heists", "January 13, 2006 — Buenos Aires"),
    c("stockholm-norrmalmstorg", "The Norrmalmstorg Robbery", "A botched bank heist invents the term 'Stockholm syndrome' and becomes a global media event.", "Heists", "August 23–28, 1973 — Stockholm"),
    c("great-canadian-maple-syrup-heist", "The Great Canadian Maple Syrup Heist", "Thieves siphon millions from Quebec's strategic maple syrup reserve. Sweet, weird, and very real.", "Heists", "2011–2012 — Quebec"),
    c("tomato-ketchup-heist-france", "The French Wine Heist Rings", "Organized crews target rare bottles and cellars across France in a quiet luxury black market.", "Heists", "2010s — France"),
    c("dubai-jewelry-heist-2007", "The Dubai Jewelry Escalator Escape", "Thieves hit a luxury store and flee through a mall in a brazen daytime smash-and-grab.", "Heists", "2007 — Dubai"),
]

# ── Escapes ─────────────────────────────────────────────────────────────────
CASES += [
    c("escape-from-alcatraz", "Escape from Alcatraz", "Three inmates dig through a cell wall with spoons, build a raft from raincoats, and disappear into the bay. Did they make it?", "Escapes", "June 11, 1962 — Alcatraz"),
    c("papillon", "Papillon", "A French convict's obsession with escaping Devil's Island becomes legend — part memoir, part myth, all defiance.", "Escapes", "1930s–1940s — French Guiana"),
    c("el-chapo-tunnel-escape", "El Chapo's Tunnel Escape", "The world's most wanted trafficker vanishes from a max-security shower stall into a mile-long tunnel.", "Escapes", "July 11, 2015 — Mexico"),
    c("maze-prison-escape", "The Maze Prison Escape", "Thirty-eight IRA prisoners break out of Europe's most secure prison in a meticulously planned mass escape.", "Escapes", "September 25, 1983 — Northern Ireland"),
    c("great-escape-stalag-luft-iii", "The Great Escape", "Allied POWs dig tunnels under a Nazi camp. Most are recaptured. The legend outlives the war.", "Escapes", "March 24, 1944 — Poland"),
    c("pascal-payet-helicopter", "Pascal Payet's Helicopter Escapes", "A French convict escapes prison by helicopter — more than once — turning the sky into an exit door.", "Escapes", "2001–2007 — France"),
    c("mexicos-puente-grande", "The Puente Grande Escape", "El Chapo's first legendary prison break: laundry carts, bribes, and a vanishing act.", "Escapes", "January 19, 2001 — Mexico"),
    c("texas-seven", "The Texas Seven", "Seven inmates break out of a Texas prison and spark a nationwide manhunt that ends in blood and arrests.", "Escapes", "December 2000 — Texas"),
    c("john-dillinger-wooden-gun", "Dillinger's Wooden Gun Escape", "America's public enemy carves a fake gun from wood and walks out of an Indiana jail like it's a movie.", "Escapes", "March 3, 1934 — Indiana"),
    c("frank-abagnale-escape-stories", "Frank Abagnale's Escapes", "The famous con man's arrests and escapes blur into legend — and Hollywood can't resist the myth.", "Escapes", "1960s — United States"),
    c("billy-the-kid-lincoln-escape", "Billy the Kid's Courthouse Escape", "Handcuffed and condemned, Billy kills his guards and rides out of Lincoln, New Mexico.", "Escapes", "April 28, 1881 — New Mexico"),
    c("harry-houdini-jailbreaks", "Houdini's Jailbreak Challenges", "Not a criminal — but his public jail escapes rewired how the world thought about locks and impossibility.", "Escapes", "1900s — International"),
    c("caryl-chessman-death-row-appeals", "Chessman's Death Row Marathon", "A California inmate fights execution for years through appeals that become a media spectacle.", "Escapes", "1948–1960 — California"),
    c("timmy-tyrone-williams-escape", "Famous U.S. Work-Release Walkaways", "Low-security mistakes and walkaways that turn into national manhunts overnight.", "Escapes", "1990s–2000s — United States"),
    c("richard-lee-mcnair-escape", "Richard Lee McNair's Escapes", "A killer escapes custody multiple times, once mailing himself out of prison in a crate.", "Escapes", "1987–2006 — United States"),
    c("joel-manley-escape", "The Hookers Escape Attempt Saga", "A string of improvised U.S. jailbreaks that prove desperation beats planning — until it doesn't.", "Escapes", "2000s — United States"),
    c("yuma-territorial-prison-escapes", "Yuma Territorial Prison Escapes", "Arizona's infamous desert prison and the inmates who tried to beat heat, walls, and legend.", "Escapes", "1876–1909 — Arizona"),
    c("devil-island-escape-attempts", "Devil's Island Escape Attempts", "The French penal colony designed to be inescapable — and the men who tried anyway.", "Escapes", "1852–1953 — French Guiana"),
    c("colditz-castle-escapes", "Colditz Castle Escapes", "Allied officers treat a Nazi fortress like an escape university — tunnels, disguises, gliders.", "Escapes", "1940–1945 — Germany"),
    c("alcatraz-battle", "The Battle of Alcatraz", "An escape attempt turns into a bloody siege. Hostages, gunfire, and a prison that refuses to let go.", "Escapes", "May 2–4, 1946 — Alcatraz"),
    c("john-victor-brauchle", "The 1934 Nebraska Bank Escape Chains", "Midwest crime sprees and jailbreaks that fed America's public-enemy era.", "Escapes", "1930s — Midwest U.S."),
    c("clemency-and-breakouts-sing-sing", "Sing Sing Breakout Attempts", "New York's most famous prison and the men who tested its walls.", "Escapes", "1900s–1950s — New York"),
    c("escape-from-dannemora", "Escape from Dannemora", "Two murderers cut their way out of a New York max prison with help from inside — then vanish into the woods.", "Escapes", "June 6, 2015 — New York"),
    c("eloy-gutierrez-menoyo-escape-myths", "Caribbean Prison Break Legends", "Island prisons, political captives, and escapes that became revolutionary folklore.", "Escapes", "1960s — Caribbean"),
    c("vladimir-prison-escapes-russia", "Russian High-Security Escape Cases", "Rare breaks from Russia's toughest facilities — and why most never make the news.", "Escapes", "1990s–2010s — Russia"),
]

# ── Unsolved ────────────────────────────────────────────────────────────────
CASES += [
    c("jack-the-ripper", "Jack the Ripper", "A killer stalks Whitechapel. Letters taunt the police. The press invents a legend. The identity stays buried.", "Unsolved", "1888 — London"),
    c("zodiac-cipher", "The Zodiac Killer", "Coded letters, taunting cops, and a Bay Area terror that still refuses a clean ending.", "Unsolved", "1968–1969 — California"),
    c("black-dahlia", "The Black Dahlia", "Elizabeth Short's murder becomes L.A.'s most infamous unsolved case — media frenzy, endless theories, zero closure.", "Unsolved", "January 15, 1947 — Los Angeles"),
    c("somerton-man", "The Somerton Man", "A body on an Australian beach. A coded note. A torn book page. DNA finally speaks — and raises new questions.", "Unsolved", "December 1, 1948 — Adelaide"),
    c("isdal-woman", "The Isdal Woman", "A burned body in a Norwegian valley. Fake identities. Multiple wigs. A mystery that resists every answer.", "Unsolved", "November 1970 — Bergen"),
    c("tantaliszing-lead-tyler", "The Tylenol Murders", "Poisoned capsules spark national panic. A killer is never convicted. Packaging changes forever.", "Unsolved", "1982 — Chicago"),
    c("hinterkaifeck-murders", "The Hinterkaifeck Murders", "A German farm family is killed after nights of strange footprints and attic noises. Still unsolved.", "Unsolved", "March 31, 1922 — Bavaria"),
    c("villisca-axe-murders", "The Villisca Axe Murders", "An entire Iowa family and two guests are killed overnight. The town never gets a satisfying answer.", "Unsolved", "June 10, 1912 — Iowa"),
    c("axeman-of-new-orleans", "The Axeman of New Orleans", "A jazz-era terror writes to the papers and leaves a city dancing between fear and folklore.", "Unsolved", "1918–1919 — New Orleans"),
    c("phantom-of-heilbronn", "The Phantom of Heilbronn", "DNA links dozens of crimes across Europe to one woman — until investigators realize the DNA was contamination.", "Unsolved", "1993–2009 — Europe"),
    c("cleveland-torso-murderer", "The Cleveland Torso Murderer", "A Depression-era killer leaves dismembered victims across Cleveland. Eliot Ness never closes it.", "Unsolved", "1935–1938 — Cleveland"),
    c("oakland-county-child-killer", "The Oakland County Child Killer", "A string of child murders terrorizes Michigan suburbs. Decades later, the case still haunts investigators.", "Unsolved", "1976–1977 — Michigan"),
    c("atlanta-child-murders-questions", "The Atlanta Child Murders", "A city in crisis. Arrests are made. Questions never fully die. The trauma reshapes Atlanta.", "Unsolved", "1979–1981 — Atlanta"),
    c("earl-of-cork-mystery", "The Boy in the Box", "A murdered child found in a Philadelphia box becomes America's most famous unidentified victim case.", "Unsolved", "1957 — Philadelphia"),
    c("amber-hagerman", "The Murder of Amber Hagerman", "A kidnapping that created Amber Alerts — and a case that still demands justice.", "Unsolved", "1996 — Texas"),
    c("jonbenet-ramsey", "JonBenét Ramsey", "A child pageant star is killed in her home. The investigation becomes a media circus that never ends.", "Unsolved", "December 26, 1996 — Colorado"),
    c("madeleine-mccann", "Madeleine McCann", "A child vanishes from a Portuguese holiday apartment. The world's most publicized missing-child case.", "Unsolved", "May 3, 2007 — Praia da Luz"),
    c("lauren-spierer", "Lauren Spierer", "A college student disappears after a night out in Bloomington. Theories multiply. Answers don't.", "Unsolved", "June 3, 2011 — Indiana"),
    c("natalee-holloway", "Natalee Holloway", "An American teen vanishes in Aruba. A suspect toys with the cameras for years.", "Unsolved", "May 30, 2005 — Aruba"),
    c("gabby-petito-questions", "The Gabby Petito Case", "A van-life tragedy explodes on social media and forces a national conversation about investigation delays.", "Unsolved", "2021 — United States"),
    c("earl-williams-silk-road-adjacent", "Early Dark-Web Mystery Busts", "When anonymous markets met real-world manhunts — and digital clues became the new fingerprints.", "Unsolved", "2011–2015 — Internet"),
    c("who-put-bella-in-the-wych-elm", "Who Put Bella in the Wych Elm?", "Graffiti, a skull in a tree, and a wartime British mystery that still has no clean ending.", "Unsolved", "1943 — Worcestershire"),
    c("tamam-shud", "Tamam Shud Revisited", "The Somerton code, the Persian phrase, and why Australia can't stop reopening the file.", "Unsolved", "1948–2020s — Adelaide"),
    c(" Keddie-cabin-murders", "The Keddie Cabin Murders", "A brutal cabin crime in California with suspects named, evidence disputed, and no convictions.", "Unsolved", "April 11, 1981 — California"),
    c("halloween-mask-murder-unsolved", "The Masked Mystery Murders of Midcentury America", "A pattern of masked home invasions that fueled decades of true-crime folklore.", "Unsolved", "1950s–1960s — United States"),
    c("bible-john", "Bible John", "A Glasgow killer who quoted scripture. Three women dead. A city still arguing over his name.", "Unsolved", "1968–1969 — Glasgow"),
    c("servant-girl-annihilator", "The Servant Girl Annihilator", "Austin's 1880s serial attacks that some say foreshadowed Jack the Ripper.", "Unsolved", "1884–1885 — Austin"),
    c("zodiac-lake-berryessa", "Zodiac at Lake Berryessa", "A hooded attacker, a lakeside crime, and a letter that turns trauma into theater.", "Unsolved", "September 27, 1969 — California"),
    c("ear-murders-cologne", "The Cologne Homeless Murders", "A cluster of unsolved killings that exposed how easily overlooked victims disappear from headlines.", "Unsolved", "1990s — Germany"),
    c("highway-of-tears", "Highway of Tears", "Dozens of Indigenous women disappear along a British Columbia highway. The pattern is the scandal.", "Unsolved", "1970s–2000s — British Columbia"),
]

# fix accidental space in id
for i, x in enumerate(CASES):
    if x["id"].startswith(" "):
        CASES[i]["id"] = x["id"].strip()
        CASES[i]["seedId"] = f"st-{CASES[i]['id']}"

# ── Cold Cases ──────────────────────────────────────────────────────────────
CASES += [
    c("lindbergh-baby", "The Lindbergh Baby", "America's hero loses his child to a ransom kidnapping that grips the nation — and ends in a trial the world watches.", "Cold Cases", "March 1, 1932 — New Jersey"),
    c("black-dahlia-investigation", "The Black Dahlia Investigation", "Not just the crime — the detectives, the tips, the frauds, and the city that couldn't stop talking.", "Cold Cases", "1947–1950 — Los Angeles"),
    c("boston-strangler-debate", "The Boston Strangler Debate", "Confessions, DNA, and a city that still argues whether one man was the whole story.", "Cold Cases", "1962–1964 — Boston"),
    c("golden-state-killer-caught", "The Golden State Killer", "Decades of terror end when genetic genealogy finally puts a name to a nightmare.", "Cold Cases", "1974–1986 / 2018 — California"),
    c("btk-arrest", "BTK", "A killer who wanted credit gets caught by his own floppy disk. Ego becomes evidence.", "Cold Cases", "1974–1991 / 2005 — Kansas"),
    c("green-river-killer", "The Green River Killer", "A long hunt along the Pacific Northwest that becomes a defining American serial case.", "Cold Cases", "1982–1998 — Washington"),
    c("night-stalker", "The Night Stalker", "A city in fear, a face on the news, and a mob that nearly ends the chase itself.", "Cold Cases", "1984–1985 — California"),
    c("son-of-sam", "Son of Sam", "A .44 caliber panic grips New York. Letters to the press turn murder into theater.", "Cold Cases", "1976–1977 — New York"),
    c("ted-bundy-chase", "The Hunt for Ted Bundy", "Escapes, charisma, and a courtroom performance that made a killer infamous.", "Cold Cases", "1974–1978 — United States"),
    c("jeffrey-dahmer-arrest", "The Dahmer Case", "A Milwaukee arrest opens a horror that forces a city to ask what it ignored.", "Cold Cases", "1991 — Milwaukee"),
    c("john-wayne-gacy", "John Wayne Gacy", "A contractor, a clown act, and a house that hid a national nightmare.", "Cold Cases", "1972–1978 — Chicago"),
    c("ed-gein", "Ed Gein", "A Wisconsin case so strange it rewired American horror forever.", "Cold Cases", "1957 — Wisconsin"),
    c("h-h-holmes", "H.H. Holmes", "The World's Fair, a 'murder castle,' and America's original serial-killer mythology.", "Cold Cases", "1890s — Chicago"),
    c("albert-fish", "Albert Fish", "Letters, confessions, and a case that still unsettles every crime historian who touches it.", "Cold Cases", "1920s–1930s — New York"),
    c("zodiac-arthur-leigh-allen", "Zodiac Suspect Arthur Leigh Allen", "The most famous Zodiac suspect — and why the case still wouldn't close on him.", "Cold Cases", "1969–1992 — California"),
    c("earl-of-hells-kitchen", "Hell's Kitchen Mob Cold Trails", "Unsolved hits and disappearances from New York's West Side wars.", "Cold Cases", "1970s–1980s — New York"),
    c("oakland-county-update", "Oakland County: The Long Reopenings", "How new DNA tech keeps dragging an old Michigan nightmare back into courtrooms.", "Cold Cases", "1976–present — Michigan"),
    c("bear-brook-murders", "The Bear Brook Murders", "Barrels in the woods, unknown victims, and genetic genealogy that finally names the dead.", "Cold Cases", "1985–2000 / 2019 — New Hampshire"),
    c("christine-jessop", "Christine Jessop", "A wrongful conviction, a DNA bombshell, and a Canadian cold case rewritten decades later.", "Cold Cases", "1984 / 2020 — Ontario"),
    c("jaycee-dugard", "Jaycee Dugard", "A kidnapping that lasted 18 years — and the failures that let it continue in plain sight.", "Cold Cases", "1991–2009 — California"),
    c("elizabeth-smart", "Elizabeth Smart", "A Salt Lake City kidnapping ends in rescue — and becomes a national story about survival.", "Cold Cases", "2002–2003 — Utah"),
    c("chowchilla-kidnapping", "The Chowchilla Kidnapping", "A school bus buried underground. Twenty-six children. A rescue that still feels impossible.", "Cold Cases", "July 15, 1976 — California"),
    c("patty-hearst", "Patty Hearst", "Kidnapped heiress or revolutionary convert? The trial that asked what coercion really means.", "Cold Cases", "1974–1976 — California"),
    c("lindbergh-hauptmann-trial", "The Lindbergh Trial", "The 'trial of the century' that tried to give a nation closure — and still draws skeptics.", "Cold Cases", "1935 — New Jersey"),
    c("sam-sheppard", "The Sam Sheppard Case", "A doctor's murder trial becomes a media circus — and later a symbol of wrongful conviction fights.", "Cold Cases", "1954–1966 — Ohio"),
    c("central-park-five", "The Central Park Five", "A coerced set of confessions, a city's panic, and an exoneration that arrived years too late.", "Cold Cases", "1989–2002 — New York"),
    c("west-memphis-three", "The West Memphis Three", "Satanic panic, shaky evidence, and a release that never fully felt like justice.", "Cold Cases", "1993–2011 — Arkansas"),
    c("ada-oklahoma-murders", "The Ada Murder Cases", "Small-town murders, disputed convictions, and a documentary era that reopened everything.", "Cold Cases", "1980s — Oklahoma"),
    c("norfolk-four", "The Norfolk Four", "Navy sailors confess to a crime DNA says they didn't commit. Coercion on trial.", "Cold Cases", "1997–2017 — Virginia"),
    c("craigslist-killer", "The Craigslist Killer", "A medical student, online ads, and a short violent spree that shocked Boston.", "Cold Cases", "2009 — Boston"),
]

# ── Scandals ────────────────────────────────────────────────────────────────
CASES += [
    c("watergate", "Watergate", "A bungled break-in at a D.C. office building unravels into the scandal that takes down a president.", "Scandals", "June 17, 1972 — Washington, D.C."),
    c("abscam", "ABSCAM", "FBI agents pose as Arab sheikhs and catch politicians on camera taking bribes.", "Scandals", "1978–1980 — United States"),
    c("teapot-dome", "Teapot Dome", "Oil leases, bribes, and the scandal that defined 1920s corruption in America.", "Scandals", "1921–1923 — United States"),
    c("enron", "Enron", "A corporate house of cards collapses — and takes pensions, trust, and an era of hype with it.", "Scandals", "2001 — Houston"),
    c("bernie-madoff", "Bernie Madoff", "The largest Ponzi scheme in history. Country clubs, feeder funds, and a confession that ends an empire.", "Scandals", "2008 — New York"),
    c("theranos", "Theranos", "A blood-testing unicorn built on secrecy, Silicon Valley mythmaking, and a fraud trial that went global.", "Scandals", "2010s — Silicon Valley"),
    c("wirecard", "Wirecard", "Europe's fintech darling goes bankrupt overnight. Billions missing. An executive vanishes.", "Scandals", "2020 — Germany"),
    c("panama-papers", "The Panama Papers", "A leak exposes offshore secrecy for the global elite — and rewrites how we talk about money.", "Scandals", "2016 — Global"),
    c("cambridge-analytica", "Cambridge Analytica", "Harvested data, political targeting, and a scandal that made privacy mainstream news.", "Scandals", "2018 — Global"),
    c("fifa-corruption", "FIFA Corruption", "Dawn raids, indictments, and the beautiful game's ugliest pay-to-play empire.", "Scandals", "2015 — Switzerland / Global"),
    c("olympic-bidding-scandals", "Olympic Bidding Scandals", "Bribes for votes, host-city dreams for sale, and sport politics at its greasiest.", "Scandals", "1990s–2000s — Global"),
    c("college-admissions-scandal", "Operation Varsity Blues", "Fake athletes, photoshopped faces, and wealthy parents buying elite college doors.", "Scandals", "2019 — United States"),
    c("unaoil", "Unaoil", "A family business and a global bribery machine linking oil deals to corruption across continents.", "Scandals", "2016 — Global"),
    c("lockheed-bribery", "The Lockheed Bribery Scandals", "Aerospace kickbacks shake governments from Japan to Italy and rewrite U.S. anti-bribery law.", "Scandals", "1970s — Global"),
    c("iran-contra", "Iran–Contra", "Secret arms deals, hostages, and a White House scandal about what 'plausible deniability' really means.", "Scandals", "1985–1987 — United States"),
    c("profumo-affair", "The Profumo Affair", "Sex, spies, and a British war minister's lie that helps bring down a government.", "Scandals", "1963 — London"),
    c("dreyfus-affair", "The Dreyfus Affair", "A wrongful treason conviction splits France and becomes a masterclass in injustice and antisemitism.", "Scandals", "1894–1906 — France"),
    c("teapot-not", "The Credit Mobilier Scandal", "Railroad bribes in Congress — America's Gilded Age corruption starter pack.", "Scandals", "1872 — United States"),
    c("savings-and-loan-crisis", "The Savings and Loan Crisis", "Deregulation, fraud, and a financial collapse that cost taxpayers hundreds of billions.", "Scandals", "1980s–1990s — United States"),
    c("worldcom", "WorldCom", "Accounting tricks inflate a telecom giant until the numbers can't pretend anymore.", "Scandals", "2002 — United States"),
    c("tyco-kozlowski", "Tyco and the $6,000 Shower Curtain", "Corporate excess on trial — and a CEO lifestyle that became a punchline for greed.", "Scandals", "2002–2005 — New York"),
    c("healthsouth", "HealthSouth Fraud", "A healthcare empire cooks books while executives swear the numbers are real.", "Scandals", "2003 — Alabama"),
    c("sam-bankman-fried", "FTX", "Crypto's golden boy, a black hole of customer funds, and a courtroom reckoning.", "Scandals", "2022–2023 — Bahamas / U.S."),
    c("elizabeth-holmes-trial", "The Elizabeth Holmes Trial", "Voice drops, fake demos, and a Silicon Valley myth dissected under oath.", "Scandals", "2022 — California"),
    c("rupert-murdoch-phone-hacking", "The Phone Hacking Scandal", "Tabloid intrusion, destroyed careers, and a media empire forced into public apology mode.", "Scandals", "2011 — United Kingdom"),
    c("dieselgate", "Dieselgate", "Volkswagen cheats emissions tests — and the trust crisis hits the entire auto industry.", "Scandals", "2015 — Germany / Global"),
    c("boeing-737-max", "Boeing 737 MAX", "Two crashes, hidden software, and a corporate safety culture on trial.", "Scandals", "2018–2019 — Global"),
    c("opioid-settlements", "The Opioid Crisis Lawsuits", "Pharma marketing, overdose deaths, and the largest public-health litigation wave in U.S. history.", "Scandals", "2010s–2020s — United States"),
    c("tuskegee-syphilis-study", "The Tuskegee Syphilis Study", "A government study that withheld treatment from Black men for decades — a betrayal that still echoes.", "Scandals", "1932–1972 — Alabama"),
    c("mkultra", "MKUltra", "CIA mind-control experiments, destroyed files, and a scandal that sounds like fiction until it isn't.", "Scandals", "1950s–1970s — United States"),
]

# ── Disappearances ──────────────────────────────────────────────────────────
CASES += [
    c("amelia-earhart", "Amelia Earhart", "The world's most famous aviator vanishes over the Pacific. Theories never stop taking off.", "Disappearances", "July 2, 1937 — Pacific Ocean"),
    c("jimmy-hoffa", "Jimmy Hoffa", "America's most powerful union boss walks into a Detroit afternoon and out of history.", "Disappearances", "July 30, 1975 — Michigan"),
    c("db-cooper-money-find", "The D.B. Cooper Money Find", "A boy finds ransom cash on a riverbank — the only hard clue in an unsolved skyjacking.", "Disappearances", "February 1980 — Washington"),
    c("malaysia-airlines-mh370", "MH370", "A jet vanishes with 239 people. The ocean keeps the secret. The world keeps searching.", "Disappearances", "March 8, 2014 — Indian Ocean"),
    c("flight-19", "Flight 19", "Five Navy bombers vanish on a training flight — and the rescue plane disappears too.", "Disappearances", "December 5, 1945 — Bermuda Triangle"),
    c("roanoke-colony", "The Lost Colony of Roanoke", "An English colony vanishes. The word CROATOAN remains. America gets its oldest cold mystery.", "Disappearances", "1590 — North Carolina"),
    c("mary-celeste", "The Mary Celeste", "A ship found adrift. Crew gone. Cargo intact. The sea's favorite ghost story that actually happened.", "Disappearances", "December 1872 — Atlantic Ocean"),
    c("flannan-isles", "The Flannan Isles Lighthouse", "Three lighthouse keepers vanish from a remote Scottish island. Dinner on the table. No bodies.", "Disappearances", "December 1900 — Scotland"),
    c("lord-lucan", "Lord Lucan", "A British aristocrat vanishes after a nanny is murdered. Sight clubs and sightings for decades.", "Disappearances", "November 7, 1974 — London"),
    c("agatha-christie-disappearance", "Agatha Christie's Disappearance", "The queen of mystery vanishes for 11 days — and becomes the plot everyone wants to solve.", "Disappearances", "December 1926 — England"),
    c("brian-shaffer", "Brian Shaffer", "A med student walks into a bar on camera and never walks out. One of America's strangest vanishings.", "Disappearances", "April 1, 2006 — Ohio"),
    c("maura-murray", "Maura Murray", "A nursing student crashes her car on a rural road and vanishes into a New Hampshire night.", "Disappearances", "February 9, 2004 — New Hampshire"),
    c("brandon-swanson", "Brandon Swanson", "A phone call from a ditch. Then silence. A Minnesota disappearance that still baffles searchers.", "Disappearances", "May 14, 2008 — Minnesota"),
    c("jennifer-kesse", "Jennifer Kesse", "A young woman vanishes from her condo complex. Her car turns up. She doesn't.", "Disappearances", "January 24, 2006 — Florida"),
    c("susan-powell", "Susan Powell", "A Utah mother disappears. A husband's behavior becomes the case. Answers stay incomplete.", "Disappearances", "December 2009 — Utah"),
    c("kyron-horman", "Kyron Horman", "A boy vanishes from school on a science fair day. One of Oregon's most haunting open cases.", "Disappearances", "June 4, 2010 — Oregon"),
    c("asha-degree", "Asha Degree", "A child leaves home before dawn and disappears along a North Carolina highway.", "Disappearances", "February 14, 2000 — North Carolina"),
    c("tara-calico", "Tara Calico", "A teen on a bike ride vanishes in New Mexico. A Polaroid haunts the investigation for years.", "Disappearances", "September 20, 1988 — New Mexico"),
    c("johnny-gosch", "Johnny Gosch", "A paperboy vanishes in Iowa and becomes an early face of America's missing-children movement.", "Disappearances", "September 5, 1982 — Iowa"),
    c("adam-walsh", "Adam Walsh", "A boy's murder transforms his father into America's most famous missing-kids advocate.", "Disappearances", "1981 — Florida"),
    c("ethel-and-julius-rosenberg-secrets", "Atomic Spy Mysteries", "Espionage, executions, and classified files that kept rewriting the Rosenberg story for decades.", "Disappearances", "1950s — United States"),
    c("d-b-cooper-copycats", "The D.B. Cooper Copycats", "After Cooper, a wave of skyjackers try the same trick. Almost all fail. One mystery stays perfect.", "Disappearances", "1970s — United States"),
    c("ambassador-hotel-rfk-files", "The RFK Case Files", "A assassination, a pantry, and conspiracy arguments that never leave American politics.", "Disappearances", "1968 — Los Angeles"),
    c("jimmy-hoffa-dig-sites", "The Hoffa Dig Sites", "Decades of tips, empty excavations, and a disappearance that turned Michigan into a rumor map.", "Disappearances", "1975–present — Michigan"),
    c("malaysia-cargo-mysteries", "Ghost Flights and Cargo Mysteries", "Planes, routes, and cargo that don't add up — aviation's quieter unsolved files.", "Disappearances", "2000s–2010s — Global"),
    c("springfield-three", "The Springfield Three", "Three women vanish from a home after a party night. The house holds clues. The case holds silence.", "Disappearances", "June 7, 1992 — Missouri"),
    c("beaumont-children", "The Beaumont Children", "Three siblings vanish from an Australian beach. A nation's coldest missing-children case.", "Disappearances", "January 26, 1966 — Adelaide"),
    c("azaria-chamberlain", "Azaria Chamberlain", "A baby disappears at Uluru. A dingo, a trial, and a miscarriage of justice Australia had to unlearn.", "Disappearances", "1980 — Northern Territory"),
    c("yuba-county-five", "The Yuba County Five", "Five friends go to a game and end up in the mountains. Four die. One is never found.", "Disappearances", "February 1978 — California"),
    c("anders-breivik-not", "The Sodder Children", "A Christmas Eve fire. Missing children. A family that never believed they burned.", "Disappearances", "December 24, 1945 — West Virginia"),
]

# ── Con Artists ─────────────────────────────────────────────────────────────
CASES += [
    c("frank-abagnale", "Frank Abagnale", "Fake pilots, forged checks, and a con man whose legend may be bigger than his ledger.", "Con Artists", "1960s — United States"),
    c("catch-me-if-you-can-real", "The Real Catch Me If You Can Hunt", "How the FBI chased paper hangers in the jet age — and turned one into a consultant.", "Con Artists", "1960s–1970s — United States"),
    c("charles-ponzi", "Charles Ponzi", "The original scheme. Postage stamps, impossible returns, and a surname that became a crime category.", "Con Artists", "1920 — Boston"),
    c("victor-lustig", "Victor Lustig", "The man who sold the Eiffel Tower. Twice. History's smoothest scam artist.", "Con Artists", "1925 — Paris"),
    c("count-victor-lustig-money-box", "Lustig's Money Box", "A machine that 'prints' cash — and a room full of greedy marks who want to believe.", "Con Artists", "1920s — Europe / U.S."),
    c("george-parker-bridge-sales", "George C. Parker", "The man who sold the Brooklyn Bridge — and New York's favorite metaphor for gullibility.", "Con Artists", "1880s–1920s — New York"),
    c("yellow-kid-weil", "Yellow Kid Weil", "A Chicago con man who treated scams like theater and wrote the playbook for the long con.", "Con Artists", "1900s–1940s — Chicago"),
    c("soapy-smith", "Soapy Smith", "Soap rackets, frontier towns, and a crime boss who ran Skagway like a crooked carnival.", "Con Artists", "1890s — Alaska"),
    c("tinder-swindler", "The Tinder Swindler", "Romance apps, private jets on credit, and a dating-app predator who went global on Netflix.", "Con Artists", "2010s — Europe"),
    c("anna-delvey", "Anna Delvey", "A fake German heiress cons New York's art and hotel scene — until the checks bounce in court.", "Con Artists", "2010s — New York"),
    c("billy-mcfarland-fyre", "Fyre Festival", "Influencers, island fantasies, and a luxury music festival that served cheese sandwiches and lawsuits.", "Con Artists", "2017 — Bahamas"),
    c("elizabeth-holmes-myth", "The Theranos Myth Machine", "How storytelling, secrecy, and boardroom star power sold a medical miracle that didn't work.", "Con Artists", "2010s — Silicon Valley"),
    c("jordan-belfort", "Jordan Belfort", "Pump-and-dump brokerage culture, yacht excess, and the Wolf myth that Hollywood amplified.", "Con Artists", "1990s — New York"),
    c("barry-minkow", "Barry Minkow / ZZZZ Best", "A teenage carpet-cleaning 'genius' builds a public company on fake contracts.", "Con Artists", "1980s — California"),
    c("equity-funding-scandal", "The Equity Funding Scandal", "Fake insurance policies, computer fraud, and the scandal that freaked out Wall Street in the '70s.", "Con Artists", "1973 — United States"),
    c("albanian-ponzi-crisis", "Albania's Pyramid Crisis", "Get-rich schemes swallow a nation and help push a country into chaos.", "Con Artists", "1996–1997 — Albania"),
    c("stanford-financial", "Allen Stanford", "A cricket-sponsoring billionaire, certificates of deposit, and a Caribbean Ponzi empire.", "Con Artists", "2009 — Antigua / U.S."),
    c("nick-leeson-barings", "Nick Leeson and Barings Bank", "A rogue trader in Singapore breaks Britain's oldest merchant bank.", "Con Artists", "1995 — Singapore"),
    c("jerome-kerviel", "Jérôme Kerviel", "A Société Générale trader's hidden bets nearly sink a bank — and spark a blame war.", "Con Artists", "2008 — France"),
    c("bruno-iserbyt-not", "The Nigerian Prince Era", "Advance-fee fraud goes mass-email — and teaches the internet not to trust strangers with money.", "Con Artists", "1990s–2000s — Global"),
    c("romance-scam-epidemic", "The Romance Scam Epidemic", "Catfished love, stolen identities, and billions lost to heartbreak as a business model.", "Con Artists", "2010s–2020s — Global"),
    c("fake-sheikh-mazher", "The Fake Sheikh Sting Era", "Tabloids, disguises, and celebrity entrapment that blurred journalism and theater.", "Con Artists", "1990s–2010s — United Kingdom"),
    c("counterfeit-art-beltracchi", "Wolfgang Beltracchi", "A forger so good that museums hung his fakes — until a wrong pigment cracked the empire.", "Con Artists", "1990s–2010s — Germany"),
    c("elmyr-de-hory", "Elmyr de Hory", "The art forger who fooled experts and inspired a famous documentary about fakery itself.", "Con Artists", "1950s–1970s — Europe"),
    c("han-van-meegeren", "Han van Meegeren", "A Dutch forger who sold fake Vermeers to Nazis — then had to prove he was a fraud to survive.", "Con Artists", "1930s–1940s — Netherlands"),
    c("pillars-of-salt-not", "The Hitler Diaries", "A magazine pays a fortune for Hitler's journals. They're forged. Journalism's most expensive faceplant.", "Con Artists", "1983 — Germany"),
    c("clinton-tapes-not", "The Howard Hughes Hoax", "Clifford Irving 'autobiographs' a billionaire recluse — until Hughes himself torches the lie.", "Con Artists", "1972 — United States"),
    c("protocol-of-not", "The Donation of Constantine Myth Bust", "History's long con: a forged decree that shaped medieval power until scholars exposed it.", "Con Artists", "Middle Ages / 1440 — Europe"),
    c("captain-of-kopenick", "The Captain of Köpenick", "A shoemaker in a secondhand uniform commandeers soldiers and robs a German town hall.", "Con Artists", "1906 — Berlin"),
    c("sokal-affair", "The Sokal Affair", "A physicist hoaxes an academic journal — and detonates a culture war about truth and nonsense.", "Con Artists", "1996 — United States"),
]

# Deduplicate by id, keep first
seen = set()
unique = []
for item in CASES:
    if item["id"] in seen:
        continue
    seen.add(item["id"])
    unique.append(item)

# Pad to ~200 with additional carefully named cases if short
extras = [
    c("great-brinks-mat", "The Brink's-Mat Robbery", "A Heathrow warehouse hit spills gold into London's underworld — and blood follows the bullion for decades.", "Heists", "November 26, 1983 — London"),
    c("knightsbridge-safe-deposit-viccei", "Viccei's Knightsbridge Aftermath", "How a flamboyant thief's capture unraveled one of London's cheekiest vault jobs.", "Heists", "1987 — London"),
    c("panam-flight-103", "Pan Am Flight 103", "A bomb over Lockerbie kills 270. A decades-long investigation for justice across borders.", "Scandals", "December 21, 1988 — Lockerbie"),
    c("oklahoma-city-bombing", "Oklahoma City", "A domestic terror attack that shattered a federal building — and America's sense of safety at home.", "Scandals", "April 19, 1995 — Oklahoma"),
    c("unicef-not", "The Oil-for-Food Scandal", "A UN humanitarian program becomes a global kickback machine.", "Scandals", "1990s–2000s — Global"),
    c("abagnale-pan-am", "Abagnale's Pan Am Act", "Deadheading across America in a pilot's uniform — the con that made airports look naive.", "Con Artists", "1960s — United States"),
    c("chris-watts", "Chris Watts", "A family annihilation case that exploded on true-crime media and still sparks ethical debate.", "Cold Cases", "2018 — Colorado"),
    c("menendez-brothers", "The Menendez Brothers", "Beverly Hills, shotgun murders, and a trial that asked whether abuse explains everything.", "Cold Cases", "1989 — Los Angeles"),
    c("oj-simpson", "The O.J. Simpson Case", "A Bronco chase, a dream team, and the trial that ate American television.", "Scandals", "1994–1995 — Los Angeles"),
    c("casey-anthony", "Casey Anthony", "A missing toddler, a media frenzy, and a verdict that split the country.", "Scandals", "2008–2011 — Florida"),
    c("scott-peterson", "Scott Peterson", "A pregnant wife disappears. A trial becomes national obsession.", "Cold Cases", "2002–2004 — California"),
    c("laci-peterson", "Laci Peterson", "The victim at the center of a media storm — and a case that redefined cable-news crime coverage.", "Cold Cases", "2002 — California"),
    c("robert-durst", "Robert Durst", "A real-estate heir, missing people, and a documentary that becomes part of the case.", "Cold Cases", "1982–2021 — United States"),
    c("adnan-syed", "Adnan Syed / Serial", "A podcast reopens a murder conviction and changes how the world consumes true crime.", "Cold Cases", "1999 / 2014 — Maryland"),
    c("steven-avery", "Making a Murderer", "A wrongful conviction, a new charge, and a Netflix series that put a Wisconsin town on trial.", "Cold Cases", "1985–2007 — Wisconsin"),
    c("west-memphis-echos", "Satanic Panic Cases", "How 1980s–90s fear put innocent people in prison across America.", "Scandals", "1980s–1990s — United States"),
    c("mcmartin-preschool", "The McMartin Preschool Trial", "The longest, most expensive criminal trial in U.S. history — built on panic more than proof.", "Scandals", "1983–1990 — California"),
    c("duke-lacrosse", "The Duke Lacrosse Case", "A false accusation, a rush to judgment, and a prosecutor's career ending in disgrace.", "Scandals", "2006 — North Carolina"),
    c("central-park-jogger", "The Central Park Jogger", "The crime that sparked the Five case — and a city's racial panic in real time.", "Cold Cases", "1989 — New York"),
    c("tracy-roberts-not", "The Amanda Knox Case", "A murder in Perugia, media villains, and a legal rollercoaster across two countries.", "Scandals", "2007–2015 — Italy"),
]

for item in extras:
    if item["id"] not in seen:
        seen.add(item["id"])
        unique.append(item)

# Trim or note count
print(f"Total unique cases: {len(unique)}")
by_section: dict[str, int] = {}
for item in unique:
    by_section[item["section"]] = by_section.get(item["section"], 0) + 1
print("By section:", json.dumps(by_section, indent=2))

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(unique, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {OUT}")
