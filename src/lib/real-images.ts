type UniversityImageInput = {
  sourceId?: number | null;
  name?: string | null;
  country?: string | null;
};

type CourseImageInput = {
  name?: string | null;
  category?: string | null;
};

type CareerImageInput = {
  name?: string | null;
  sector?: string | null;
};

type ExamImageInput = {
  name?: string | null;
  category?: string | null;
};

type PostImageInput = {
  title?: string | null;
  category?: string | null;
};

const image = (id: string, crop = "entropy") =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=960&q=80&crop=${crop}`;

export const REAL_IMAGES = {
  campus: image("photo-1523050854058-8df90110c9f1"),
  globalCampus: image("photo-1498243691581-b145c3f54a5a"),
  engineering: image("photo-1581091226825-a6a2a5aee158"),
  architecture: image("photo-1503387762-592deb58ef4e"),
  medical: image("photo-1576091160550-2173dba999ef"),
  lab: image("photo-1582719471384-894fbb16e074"),
  business: image("photo-1556761175-b413da4baf72"),
  finance: image("photo-1554224155-6726b3ff858f"),
  design: image("photo-1518005020951-eccb494ad742"),
  education: image("photo-1503676260728-1c00da094a0b"),
  agriculture: image("photo-1500382017468-9049fed747ef"),
  media: image("photo-1495020689067-958852a7765e"),
  computer: image("photo-1515879218367-8466d910aaa4"),
  pharmacy: image("photo-1584308666744-24d5c474f2ae"),
  dental: image("photo-1606811971618-4486d14f3f99"),
  law: image("photo-1589829545856-d10d557cf95f"),
  aviation: image("photo-1436491865332-7a61a109cc05"),
  publicService: image("photo-1450101499163-c8848c66ca85"),
  defence: image("photo-1500530855697-b586d89ba3ee"),
  hospitality: image("photo-1555396273-367ea4eb4db5"),
  fashion: image("photo-1483985988355-763728e1935b"),
  exam: image("photo-1434030216411-0b793f4b4173"),
  news: image("photo-1495020689067-958852a7765e"),
  counselling: image("photo-1523240795612-9a054b0db644"),
  scholarship: image("photo-1523580846011-d3a5bc25702b"),
  ranking: image("photo-1554224154-26032ffc0d07")
} as const;

const UNIVERSITY_DOMAIN_BY_SOURCE_ID: Record<number, string> = {
  1: "asu.edu",
  3: "gmu.edu",
  4: "oregonstate.edu",
  7: "slu.edu",
  9: "uab.edu",
  45: "oregonstate.edu",
  80: "pace.edu",
  192: "sydney.edu.au",
  194: "unsw.edu.au",
  197: "unsw.edu.au",
  306: "gla.ac.uk",
  307: "birmingham.ac.uk",
  310: "liverpool.ac.uk",
  311: "ncl.ac.uk",
  313: "le.ac.uk",
  314: "surrey.ac.uk",
  315: "strath.ac.uk",
  318: "essex.ac.uk",
  323: "ntu.ac.uk",
  331: "northumbria.ac.uk",
  333: "uel.ac.uk",
  335: "herts.ac.uk",
  367: "port.ac.uk",
  390: "canterbury.ac.nz",
  564: "aut.ac.nz",
  598: "berkeley.edu",
  650: "mmu.ac.uk",
  677: "illinoisstate.edu",
  708: "tees.ac.uk",
  753: "hofstra.edu",
  760: "waikato.ac.nz",
  761: "wgtn.ac.nz",
  782: "unsw.edu.au",
  818: "brunel.ac.uk",
  862: "kingston.ac.uk",
  871: "coventry.ac.uk",
  885: "qub.ac.uk",
  886: "exeter.ac.uk",
  899: "york.ac.uk",
  948: "uea.ac.uk",
  955: "sussex.ac.uk",
  961: "brighton.ac.uk",
  1078: "nottingham.ac.uk",
  1084: "abdn.ac.uk",
  1095: "lancaster.ac.uk",
  1107: "keele.ac.uk",
  1132: "leeds.ac.uk",
  1146: "southampton.ac.uk",
  1154: "exeter.ac.uk",
  1181: "jhu.edu",
  1238: "auckland.ac.nz",
  1511: "hull.ac.uk",
  1569: "derby.ac.uk",
  1624: "otago.ac.nz",
  1626: "berkeley.edu",
  1655: "reading.ac.uk",
  1680: "adelaide.edu.au",
  1705: "yale.edu",
  1706: "cornell.edu",
  1712: "ucla.edu",
  2129: "ucsd.edu",
  [-104151]: "asu.edu",
  [-104179]: "arizona.edu",
  [-123961]: "usc.edu",
  [-134130]: "ufl.edu",
  [-139959]: "uga.edu",
  [-153658]: "uiowa.edu",
  [-170976]: "umich.edu",
  [-174066]: "umn.edu",
  [-201885]: "uc.edu",
  [-204796]: "osu.edu",
  [-214777]: "psu.edu",
  [-215293]: "pitt.edu",
  [-221661]: "southern.edu",
  [-228723]: "tamu.edu",
  [-230764]: "utah.edu",
  [-236948]: "washington.edu",
  [-240444]: "wisc.edu",
  [-711243142]: "swinburne.edu.au",
  [-714064327]: "anu.edu.au",
  [-718649141]: "uow.edu.au",
  [-724067722]: "monash.edu",
  [-733830807]: "newcastle.edu.au",
  [-756651087]: "rmit.edu.au",
  [-760577685]: "mq.edu.au",
  [-774427074]: "adelaide.edu.au",
  [-793638452]: "flinders.edu.au",
  [-796162825]: "uts.edu.au",
  [-832894198]: "sydney.edu.au",
  [-848680015]: "unsw.edu.au",
  [-851458792]: "uq.edu.au",
  [-896929784]: "unimelb.edu.au"
};

const UNIVERSITY_DOMAIN_PATTERNS: Array<[RegExp, string]> = [
  [/berkeley/i, "berkeley.edu"],
  [/johns hopkins/i, "jhu.edu"],
  [/cornell/i, "cornell.edu"],
  [/yale/i, "yale.edu"],
  [/pennsylvania/i, "upenn.edu"],
  [/ucla|los angeles/i, "ucla.edu"],
  [/new south wales|unsw/i, "unsw.edu.au"],
  [/sydney/i, "sydney.edu.au"],
  [/melbourne|unimelb/i, "unimelb.edu.au"],
  [/monash/i, "monash.edu"],
  [/rmit|royal melbourne/i, "rmit.edu.au"],
  [/technology sydney|uts/i, "uts.edu.au"],
  [/queensland/i, "uq.edu.au"],
  [/wollongong/i, "uow.edu.au"],
  [/newcastle/i, "newcastle.edu.au"],
  [/macquarie/i, "mq.edu.au"],
  [/auckland/i, "auckland.ac.nz"],
  [/waikato/i, "waikato.ac.nz"],
  [/otago/i, "otago.ac.nz"],
  [/canterbury/i, "canterbury.ac.nz"],
  [/george mason/i, "gmu.edu"],
  [/illinois state/i, "illinoisstate.edu"],
  [/oregon state/i, "oregonstate.edu"],
  [/arizona state/i, "asu.edu"],
  [/minnesota/i, "umn.edu"],
  [/cincinnati/i, "uc.edu"],
  [/hofstra/i, "hofstra.edu"],
  [/texas a&m|texas a and m/i, "tamu.edu"],
  [/pittsburgh/i, "pitt.edu"],
  [/florida/i, "ufl.edu"],
  [/washington/i, "washington.edu"],
  [/southern california/i, "usc.edu"],
  [/michigan/i, "umich.edu"],
  [/wisconsin/i, "wisc.edu"],
  [/birmingham/i, "birmingham.ac.uk"],
  [/glasgow/i, "gla.ac.uk"],
  [/brunel/i, "brunel.ac.uk"],
  [/liverpool/i, "liverpool.ac.uk"],
  [/nottingham/i, "nottingham.ac.uk"],
  [/exeter/i, "exeter.ac.uk"],
  [/leeds/i, "leeds.ac.uk"],
  [/southampton/i, "southampton.ac.uk"],
  [/surrey/i, "surrey.ac.uk"],
  [/strathclyde/i, "strath.ac.uk"],
  [/reading/i, "reading.ac.uk"],
  [/lancaster/i, "lancaster.ac.uk"],
  [/essex/i, "essex.ac.uk"],
  [/portsmouth/i, "port.ac.uk"],
  [/hertfordshire/i, "herts.ac.uk"],
  [/leicester/i, "le.ac.uk"],
  [/coventry/i, "coventry.ac.uk"],
  [/york/i, "york.ac.uk"],
  [/east anglia/i, "uea.ac.uk"],
  [/queen.?s university belfast/i, "qub.ac.uk"]
];

const EXAM_DOMAIN_BY_KEYWORD: Array<[RegExp, string]> = [
  [/jee|cuet|neet|cmat/i, "nta.ac.in"],
  [/gate/i, "gate2026.iitg.ac.in"],
  [/cat/i, "iimcat.ac.in"],
  [/xat/i, "xatonline.in"],
  [/mat|ugat/i, "mat.aima.in"],
  [/bitsat/i, "bitsadmission.com"],
  [/clat/i, "consortiumofnlus.ac.in"],
  [/ailet/i, "nationallawuniversitydelhi.in"],
  [/nift/i, "nift.ac.in"],
  [/nid/i, "admissions.nid.edu"],
  [/uceed|ceed|jam/i, "iitb.ac.in"],
  [/aiims/i, "aiimsexams.ac.in"],
  [/gpat/i, "natboard.edu.in"],
  [/tnea/i, "tneaonline.org"],
  [/wbjee/i, "wbjeeb.nic.in"],
  [/mht/i, "cetcell.mahacet.org"],
  [/kcet/i, "cetonline.karnataka.gov.in"],
  [/keam/i, "cee.kerala.gov.in"],
  [/eamcet/i, "cets.apsche.ap.gov.in"]
];

function logoFromDomain(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`;
}

function normalize(value?: string | null) {
  return (value || "").toLowerCase();
}

export function isGeneratedPlaceholder(value?: string | null) {
  return !value || value.includes("/assets/generated/");
}

export function isPlaceholderImage(value?: string | null) {
  return isGeneratedPlaceholder(value);
}

export function universityLogoUrl(input: UniversityImageInput) {
  const sourceId = typeof input.sourceId === "number" ? input.sourceId : null;
  const mapped = sourceId !== null ? UNIVERSITY_DOMAIN_BY_SOURCE_ID[sourceId] : undefined;
  if (mapped) return logoFromDomain(mapped);

  const name = input.name || "";
  const pattern = UNIVERSITY_DOMAIN_PATTERNS.find(([regex]) => regex.test(name));
  if (pattern) return logoFromDomain(pattern[1]);

  return "";
}

export function universityCampusImage(input?: UniversityImageInput) {
  const country = normalize(input?.country);
  if (country.includes("australia")) return image("photo-1523050854058-8df90110c9f1");
  if (country.includes("united kingdom")) return image("photo-1523580846011-d3a5bc25702b");
  if (country.includes("new zealand")) return image("photo-1498243691581-b145c3f54a5a");
  if (country.includes("canada")) return image("photo-1562774053-701939374585");
  if (country.includes("united states")) return image("photo-1498243691581-b145c3f54a5a");
  return REAL_IMAGES.campus;
}

export function courseImageFor(input: CourseImageInput) {
  const text = `${input.name || ""} ${input.category || ""}`.toLowerCase();
  if (/computer|software|data|information technology|bca|artificial intelligence|cyber/.test(text)) return REAL_IMAGES.computer;
  if (/architecture|b\.?arch|urban|construction/.test(text)) return REAL_IMAGES.architecture;
  if (/medical|radiotherapy|laboratory|nursing|health|doctor|dental|bds/.test(text)) return /dental|bds/.test(text) ? REAL_IMAGES.dental : REAL_IMAGES.medical;
  if (/pharma|pharmacy/.test(text)) return REAL_IMAGES.pharmacy;
  if (/business|management|mba|commerce|finance|accounting/.test(text)) return REAL_IMAGES.business;
  if (/design|fashion|auto cad|cad|animation|media/.test(text)) return REAL_IMAGES.design;
  if (/education|b\.?ed|teacher/.test(text)) return REAL_IMAGES.education;
  if (/agriculture|horticulture|food/.test(text)) return REAL_IMAGES.agriculture;
  if (/mass communication|journalism|media/.test(text)) return REAL_IMAGES.media;
  if (/law|legal/.test(text)) return REAL_IMAGES.law;
  return REAL_IMAGES.globalCampus;
}

export function careerImageFor(input: CareerImageInput) {
  const text = `${input.name || ""} ${input.sector || ""}`.toLowerCase();
  if (/pilot|aviation|air hostess|air force|air traffic/.test(text)) return REAL_IMAGES.aviation;
  if (/doctor|veterinary|drug inspector|medical|health/.test(text)) return REAL_IMAGES.medical;
  if (/fashion|designer/.test(text)) return REAL_IMAGES.fashion;
  if (/chartered accountant|investment|banker|finance|company secretary/.test(text)) return REAL_IMAGES.finance;
  if (/police|army|force|narcotics|forest|cid|officer/.test(text)) return REAL_IMAGES.publicService;
  if (/merchant navy|loco pilot/.test(text)) return REAL_IMAGES.defence;
  return REAL_IMAGES.business;
}

export function examImageFor(input: ExamImageInput) {
  const text = `${input.name || ""} ${input.category || ""}`;
  const domainMatch = EXAM_DOMAIN_BY_KEYWORD.find(([regex]) => regex.test(text));
  if (domainMatch) return logoFromDomain(domainMatch[1]);
  const lower = text.toLowerCase();
  if (/medical|nursing|pharmacy|dental/.test(lower)) return REAL_IMAGES.medical;
  if (/management|commerce|banking/.test(lower)) return REAL_IMAGES.business;
  if (/law/.test(lower)) return REAL_IMAGES.law;
  if (/design|arts|communication/.test(lower)) return REAL_IMAGES.design;
  return REAL_IMAGES.exam;
}

export function postImageFor(input: PostImageInput) {
  const text = `${input.title || ""} ${input.category || ""}`.toLowerCase();
  if (/scholarship|funding/.test(text)) return REAL_IMAGES.scholarship;
  if (/counselling|admission|selection|cutoff|merit/.test(text)) return REAL_IMAGES.counselling;
  if (/rank|result|answer key|admit card|exam|jee|eamcet|kcet|cet|neet/.test(text)) return REAL_IMAGES.exam;
  if (/placement|college|university|campus/.test(text)) return REAL_IMAGES.campus;
  return REAL_IMAGES.news;
}

export function displayImage(current: string | null | undefined, fallback: string) {
  return isGeneratedPlaceholder(current) ? fallback : current || fallback;
}

export function realImageOr(current: string | null | undefined, fallback: string) {
  return displayImage(current, fallback);
}
