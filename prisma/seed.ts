import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  // Admin user
  const email = process.env.ADMIN_EMAIL || "admin@SathiCollege.in";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe@123";
  const hashed = await bcrypt.hash(password, 10);
  await db.user.upsert({
    where: { email },
    update: process.env.ADMIN_PASSWORD ? { name: "Admin", password: hashed, role: "ADMIN" } : {},
    create: { email, name: "Admin", password: hashed, role: "ADMIN" }
  });

  // Exams
  const exams = [
    { slug: "jee-main", name: "JEE Mains", shortName: "JEE Main", description: "Joint Entrance Examination Mains for engineering admissions across NITs, IIITs and GFTIs.", heroImage: "/assets/sathicollege/jee-common.png" },
    { slug: "jee-advanced", name: "JEE Advanced", shortName: "JEE Adv", description: "Joint Entrance Examination Advanced for IIT admissions.", heroImage: "/assets/sathicollege/jee-common.png" },
    { slug: "ap-eamcet", name: "AP EAMCET", shortName: "AP EAMCET", description: "Andhra Pradesh Engineering, Agriculture & Medical Common Entrance Test.", heroImage: "/assets/sathicollege/ap-eamcet.png" },
    { slug: "ts-eamcet", name: "TS EAMCET", shortName: "TS EAMCET", description: "Telangana State Engineering, Agriculture & Medical Common Entrance Test.", heroImage: "/assets/sathicollege/ts-eamcet.png" },
    { slug: "kcet", name: "KCET", shortName: "KCET", description: "Karnataka Common Entrance Test.", heroImage: "/assets/sathicollege/kcet.png" },
    { slug: "mht-cet", name: "MHT CET", shortName: "MHT CET", description: "Maharashtra Common Entrance Test.", heroImage: "/assets/sathicollege/mht-cet.png" },
    { slug: "keam", name: "KEAM", shortName: "KEAM", description: "Kerala Engineering Architecture Medical entrance examination.", heroImage: "/assets/sathicollege/keam.png" },
    { slug: "tnea", name: "TNEA", shortName: "TNEA", description: "Tamil Nadu Engineering Admissions.", heroImage: "/assets/sathicollege/tnea.png" },
    { slug: "wbjee", name: "WBJEE", shortName: "WBJEE", description: "West Bengal Joint Entrance Examination.", heroImage: "/assets/sathicollege/wbjee.png" },
    { slug: "bitsat", name: "BITSAT", shortName: "BITSAT", description: "Birla Institute of Technology and Science admission test for integrated first degree programs.", heroImage: "/assets/sathicollege/mock/bitsat.jpeg" },
    { slug: "gate", name: "GATE", shortName: "GATE", description: "Graduate Aptitude Test in Engineering for postgraduate engineering admissions and PSU screening.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "cat", name: "CAT", shortName: "CAT", category: "Management", description: "Common Admission Test for MBA and postgraduate management admissions.", heroImage: "/assets/generated/visual-dashboard.png" },
    { slug: "xat", name: "XAT", shortName: "XAT", category: "Management", description: "Xavier Aptitude Test for management program admissions.", heroImage: "/assets/generated/visual-dashboard.png" },
    { slug: "mat", name: "MAT", shortName: "MAT", category: "Management", description: "Management Aptitude Test for MBA and allied management admissions.", heroImage: "/assets/generated/visual-dashboard.png" },
    { slug: "cmat", name: "CMAT", shortName: "CMAT", category: "Management", description: "Common Management Admission Test for AICTE-approved management programs.", heroImage: "/assets/generated/visual-dashboard.png" },
    { slug: "cuet", name: "CUET", shortName: "CUET", category: "Common Entrance", description: "Common University Entrance Test for undergraduate and postgraduate admissions across participating universities.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "ca-foundation", name: "CA Foundation", shortName: "CA Foundation", category: "Commerce & Banking", description: "Entry-level chartered accountancy examination for commerce aspirants.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "cs-executive", name: "CS Executive", shortName: "CS Executive", category: "Commerce & Banking", description: "Company Secretary executive level examination.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "cma-foundation", name: "CMA Foundation", shortName: "CMA Foundation", category: "Commerce & Banking", description: "Foundation examination for cost and management accountancy.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "neet-ug", name: "NEET UG", shortName: "NEET UG", category: "Medical", description: "National Eligibility cum Entrance Test for undergraduate medical and dental admissions.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "neet-pg", name: "NEET PG", shortName: "NEET PG", category: "Medical", description: "National Eligibility cum Entrance Test for postgraduate medical admissions.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "aiims-nursing", name: "AIIMS Nursing", shortName: "AIIMS Nursing", category: "Nursing", description: "AIIMS nursing entrance pathway for nursing program admissions.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "aiapget", name: "AIAPGET", shortName: "AIAPGET", category: "Medical", description: "All India AYUSH Post Graduate Entrance Test.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "iit-jam", name: "IIT JAM", shortName: "IIT JAM", category: "Sciences", description: "Joint Admission Test for Masters for science postgraduate programs.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "nest", name: "NEST", shortName: "NEST", category: "Sciences", description: "National Entrance Screening Test for integrated science programs.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "icar-aieea", name: "ICAR AIEEA", shortName: "ICAR AIEEA", category: "Agriculture", description: "Agriculture entrance examination for ICAR-affiliated programs.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "nchmct-jee", name: "NCHMCT JEE", shortName: "NCHMCT JEE", category: "Hotel Management", description: "National Council hotel management entrance examination.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "aima-ugat", name: "AIMA UGAT", shortName: "AIMA UGAT", category: "Hotel Management", description: "Under Graduate Aptitude Test for selected undergraduate programs.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "iihm-echat", name: "IIHM eCHAT", shortName: "IIHM eCHAT", category: "Hotel Management", description: "Electronic Common Hospitality Admission Test for hotel management admissions.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "nimcet", name: "NIMCET", shortName: "NIMCET", category: "Information Technology", description: "NIT MCA Common Entrance Test for MCA admissions.", heroImage: "/assets/generated/visual-dashboard.png" },
    { slug: "mah-mca-cet", name: "MAH MCA CET", shortName: "MAH MCA CET", category: "Information Technology", description: "Maharashtra MCA common entrance test.", heroImage: "/assets/generated/visual-dashboard.png" },
    { slug: "ipu-cet", name: "IPU CET", shortName: "IPU CET", category: "Common Entrance", description: "Guru Gobind Singh Indraprastha University common entrance test.", heroImage: "/assets/generated/visual-dashboard.png" },
    { slug: "tissnet", name: "TISSNET", shortName: "TISSNET", category: "Arts & Humanities", description: "Entrance pathway for social science and humanities programs.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "jmi-entrance", name: "JMI Entrance", shortName: "JMI Entrance", category: "Arts & Humanities", description: "Jamia Millia Islamia entrance examination for selected programs.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "duet", name: "DUET", shortName: "DUET", category: "Arts & Humanities", description: "Delhi University entrance pathway for selected programs.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "iimc-entrance", name: "IIMC Entrance", shortName: "IIMC", category: "Mass Communication", description: "Indian Institute of Mass Communication entrance pathway.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "xic-oet", name: "XIC OET", shortName: "XIC OET", category: "Mass Communication", description: "Xavier Institute of Communications online entrance test.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "jenpas-ug", name: "JENPAS UG", shortName: "JENPAS UG", category: "Nursing", description: "West Bengal entrance test for nursing, paramedical and allied sciences.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "ruhs-nursing", name: "RUHS Nursing", shortName: "RUHS Nursing", category: "Nursing", description: "Rajasthan University of Health Sciences nursing entrance pathway.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "nift", name: "NIFT", shortName: "NIFT", category: "Design", description: "National Institute of Fashion Technology entrance examination.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "nid-dat", name: "NID DAT", shortName: "NID DAT", category: "Design", description: "National Institute of Design Design Aptitude Test.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "uceed", name: "UCEED", shortName: "UCEED", category: "Design", description: "Undergraduate Common Entrance Examination for Design.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "ceed", name: "CEED", shortName: "CEED", category: "Design", description: "Common Entrance Examination for Design.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "clat", name: "CLAT", shortName: "CLAT", category: "Law", description: "Common Law Admission Test for national law university admissions.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "ailet", name: "AILET", shortName: "AILET", category: "Law", description: "All India Law Entrance Test for National Law University Delhi.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "lsat-india", name: "LSAT India", shortName: "LSAT India", category: "Law", description: "Law School Admission Test India for law program admissions.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "mh-cet-law", name: "MH CET Law", shortName: "MH CET Law", category: "Law", description: "Maharashtra common entrance test for law admissions.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "gpat", name: "GPAT", shortName: "GPAT", category: "Pharmacy", description: "Graduate Pharmacy Aptitude Test for pharmacy admissions.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "neet-mds", name: "NEET MDS", shortName: "NEET MDS", category: "Dental", description: "National Eligibility cum Entrance Test for Master of Dental Surgery admissions.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "ini-cet", name: "INI CET", shortName: "INI CET", category: "Medical", description: "Institute of National Importance Combined Entrance Test for postgraduate medical admissions.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "aiims-paramedical", name: "AIIMS Paramedical", shortName: "AIIMS Paramedical", category: "Para Medical", description: "AIIMS entrance pathway for selected paramedical programs.", heroImage: "/assets/generated/visual-scale.png" },
    { slug: "ftii-jet", name: "FTII JET", shortName: "FTII JET", category: "Performing Arts", description: "Joint Entrance Test for film and television institute programs.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "nsd-entrance", name: "NSD Entrance", shortName: "NSD", category: "Performing Arts", description: "National School of Drama entrance pathway.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "srfti-entrance", name: "SRFTI Entrance", shortName: "SRFTI", category: "Performing Arts", description: "Satyajit Ray Film and Television Institute entrance pathway.", heroImage: "/assets/generated/visual-blog.png" },
    { slug: "ctet", name: "CTET", shortName: "CTET", category: "Education", description: "Central Teacher Eligibility Test for teaching eligibility.", heroImage: "/assets/generated/visual-dashboard.png" },
    { slug: "b-ed-entrance", name: "B.Ed Entrance", shortName: "B.Ed Entrance", category: "Education", description: "B.Ed entrance pathway for teacher education admissions.", heroImage: "/assets/generated/visual-dashboard.png" },
    { slug: "tet", name: "TET", shortName: "TET", category: "Education", description: "Teacher Eligibility Test for school teaching roles.", heroImage: "/assets/generated/visual-dashboard.png" }
  ];
  for (const e of exams) {
    await db.exam.upsert({ where: { slug: e.slug }, update: e, create: e });
  }

  const courseSeeds = [
    { slug: "b-tech", name: "B.Tech", category: "Engineering", level: "UG", duration: "4 years", description: "Bachelor of Technology programs focused on engineering fundamentals, branch specialization, projects and placement preparation.", image: "/assets/generated/hero-campus-generated.png", featured: true },
    { slug: "b-arch", name: "B.Arch", category: "Architecture", level: "UG", duration: "5 years", description: "Bachelor of Architecture programs covering design studios, building technology, planning, structures and professional practice.", image: "/assets/generated/visual-blog.png", featured: true },
    { slug: "b-tech-in-mechanical-engineering", name: "B.Tech in Mechanical Engineering", category: "Engineering", level: "UG", duration: "4 years", description: "Mechanical engineering degree path covering manufacturing, thermal systems, design, CAD, robotics and industrial applications.", image: "/assets/generated/hero-campus-generated.png", featured: true },
    { slug: "b-sc-radiotherapy", name: "B.Sc Radiotherapy", category: "Medical", level: "UG", duration: "3 years", description: "Radiotherapy program for students interested in oncology care, radiation equipment, patient handling and allied medical services.", image: "/assets/generated/visual-scale.png", featured: true },
    { slug: "b-sc-in-medical-laboratory-technology", name: "B.Sc in Medical Laboratory Technology", category: "Medical", level: "UG", duration: "3 years", description: "Medical laboratory technology program covering diagnostics, lab safety, pathology, microbiology and clinical testing workflows.", image: "/assets/generated/visual-scale.png", featured: true },
    { slug: "mba", name: "MBA", category: "Management", level: "PG", duration: "2 years", description: "Master of Business Administration program for management, leadership, analytics, finance, marketing and operations careers.", image: "/assets/generated/visual-dashboard.png", featured: true },
    { slug: "auto-cad", name: "Auto CAD", category: "Design", level: "Certification", duration: "3-6 months", description: "Auto CAD certification for drafting, technical drawing, design documentation and industry-ready CAD workflows.", image: "/assets/generated/visual-blog.png", featured: false },
    { slug: "b-des", name: "B.Des", category: "Design", level: "UG", duration: "4 years", description: "Bachelor of Design degree for product, communication, fashion, interaction, visual and service design careers.", image: "/assets/generated/visual-blog.png", featured: true },
    { slug: "b-ed", name: "B.Ed", category: "Education", level: "UG", duration: "2 years", description: "Bachelor of Education program for teaching careers, pedagogy, classroom practice, curriculum and education psychology.", image: "/assets/generated/visual-dashboard.png", featured: true },
    { slug: "b-sc-agriculture", name: "B.Sc Agriculture", category: "Agriculture", level: "UG", duration: "4 years", description: "Agriculture degree covering agronomy, soil science, horticulture, crop protection, farm management and agribusiness basics.", image: "/assets/generated/visual-scale.png", featured: true },
    { slug: "mba-in-media-management", name: "MBA in Media Management", category: "Management", level: "PG", duration: "2 years", description: "Management specialization for media strategy, digital publishing, advertising, brand partnerships and entertainment business.", image: "/assets/generated/visual-dashboard.png", featured: false },
    { slug: "mba-in-international-business", name: "MBA in International Business", category: "Management", level: "PG", duration: "2 years", description: "MBA specialization focused on trade, global markets, logistics, cross-border strategy and international finance.", image: "/assets/generated/visual-dashboard.png", featured: false },
    { slug: "mba-in-operations-management", name: "MBA in Operations Management", category: "Management", level: "PG", duration: "2 years", description: "Operations management specialization covering supply chain, process improvement, analytics, quality and production planning.", image: "/assets/generated/visual-dashboard.png", featured: false },
    { slug: "b-sc-in-statistics", name: "B.Sc in Statistics", category: "Sciences", level: "UG", duration: "3 years", description: "Statistics degree covering probability, inference, data analysis, modelling, statistical computing and applied analytics.", image: "/assets/generated/visual-scale.png", featured: false },
    { slug: "b-sc-in-home-science", name: "B.Sc in Home Science", category: "Sciences", level: "UG", duration: "3 years", description: "Home science degree covering nutrition, human development, resource management, textiles and family studies.", image: "/assets/generated/visual-scale.png", featured: false },
    { slug: "bachelor-of-management-studies", name: "Bachelor of Management Studies", category: "Management", level: "UG", duration: "3 years", description: "Undergraduate management program for business fundamentals, communication, finance, marketing and entrepreneurship.", image: "/assets/generated/visual-dashboard.png", featured: false },
    { slug: "bachelor-of-mass-communication", name: "Bachelor of Mass Communication", category: "Mass Communication", level: "UG", duration: "3 years", description: "Mass communication degree covering journalism, media writing, digital storytelling, production and public relations.", image: "/assets/generated/visual-blog.png", featured: false },
    { slug: "bachelor-of-computer-application", name: "Bachelor of Computer Application", category: "Information Technology", level: "UG", duration: "3 years", description: "Computer application program covering programming, databases, web development, software engineering and IT fundamentals.", image: "/assets/generated/visual-dashboard.png", featured: true },
    { slug: "b-pharma", name: "B.Pharma", category: "Pharmacy", level: "UG", duration: "4 years", description: "Pharmacy degree covering pharmaceutics, pharmacology, medicinal chemistry, drug regulation and healthcare practice.", image: "/assets/generated/visual-scale.png", featured: true },
    { slug: "bachelor-of-dental-surgery-bds", name: "Bachelor of Dental Surgery (BDS)", category: "Dental", level: "UG", duration: "5 years", description: "Dental surgery degree path for oral healthcare, clinical dentistry, dental materials, surgery and public dental health.", image: "/assets/generated/visual-scale.png", featured: true }
  ];
  for (const course of courseSeeds) {
    await db.course.upsert({ where: { slug: course.slug }, update: course, create: course });
  }

  const careerSeeds = [
    { slug: "ias-officer", name: "IAS Officer", sector: "Civil Services", description: "Civil services career focused on administration, governance, policy execution and public service leadership.", image: "/assets/generated/visual-dashboard.png", featured: true },
    { slug: "police-officer", name: "Police Officer", sector: "Public Safety", description: "Public safety role involving law enforcement, investigation, community protection and crisis response.", image: "/assets/generated/visual-dashboard.png", featured: true },
    { slug: "doctor", name: "Doctor", sector: "Healthcare", description: "Healthcare career diagnosing, treating and supporting patients through medical training and clinical practice.", image: "/assets/generated/visual-scale.png", featured: true },
    { slug: "crime-investigation-department-cid-officer", name: "Crime Investigation Department CID Officer", sector: "Investigation", description: "Investigation career focused on evidence collection, case analysis, interrogation support and criminal justice coordination.", image: "/assets/generated/visual-dashboard.png", featured: false },
    { slug: "indian-forest-service-ifs-officer", name: "Indian Forest Service IFS Officer", sector: "Civil Services", description: "Public service career managing forests, biodiversity, wildlife protection and environmental governance.", image: "/assets/generated/hero-campus-generated.png", featured: false },
    { slug: "pilot", name: "Pilot", sector: "Aviation", description: "Aviation career operating aircraft, managing flight safety, navigation, crew coordination and regulatory procedures.", image: "/assets/generated/visual-blog.png", featured: true },
    { slug: "veterinary-doctor-veterinarian", name: "Veterinary Doctor Veterinarian", sector: "Healthcare", description: "Animal healthcare career diagnosing, treating and preventing diseases in pets, livestock and wildlife.", image: "/assets/generated/visual-scale.png", featured: false },
    { slug: "army-officer", name: "Army Officer", sector: "Defence", description: "Defence leadership role focused on command, strategy, operations, discipline and national service.", image: "/assets/generated/visual-dashboard.png", featured: true },
    { slug: "fashion-designer", name: "Fashion Designer", sector: "Design", description: "Creative career in apparel design, styling, textiles, trend research, production and brand development.", image: "/assets/generated/visual-blog.png", featured: false },
    { slug: "air-hostess", name: "Air Hostess", sector: "Aviation", description: "Cabin crew career supporting passenger safety, service quality, emergency readiness and airline experience.", image: "/assets/generated/visual-blog.png", featured: false },
    { slug: "air-force-officer", name: "Air Force Officer", sector: "Defence", description: "Defence aviation role covering leadership, operations, flying branches, technical branches and national service.", image: "/assets/generated/visual-dashboard.png", featured: false },
    { slug: "company-secretary-cs", name: "Company Secretary CS", sector: "Corporate Governance", description: "Governance career supporting compliance, board processes, company law, reporting and corporate advisory.", image: "/assets/generated/visual-dashboard.png", featured: false },
    { slug: "loco-pilot", name: "Loco Pilot", sector: "Railways", description: "Railway operations career responsible for train operation, safety checks, signalling coordination and schedule discipline.", image: "/assets/generated/visual-dashboard.png", featured: false },
    { slug: "chartered-accountant", name: "Chartered Accountant", sector: "Finance", description: "Finance career in audit, taxation, accounting, compliance, advisory and business assurance.", image: "/assets/generated/visual-dashboard.png", featured: true },
    { slug: "central-reserve-police-force", name: "Central Reserve Police Force", sector: "Public Safety", description: "Paramilitary career supporting internal security, public order, disaster response and national duty.", image: "/assets/generated/visual-dashboard.png", featured: false },
    { slug: "chief-officer-merchant-navy", name: "Chief Officer Merchant Navy", sector: "Merchant Navy", description: "Maritime career supervising deck operations, cargo safety, navigation support and shipboard team management.", image: "/assets/generated/visual-blog.png", featured: false },
    { slug: "drug-inspector", name: "Drug Inspector", sector: "Pharmacy", description: "Regulatory healthcare role inspecting drug quality, licenses, manufacturing compliance and public safety standards.", image: "/assets/generated/visual-scale.png", featured: false },
    { slug: "investment-banker", name: "Investment Banker", sector: "Finance", description: "Finance career in capital markets, mergers, advisory, valuation, deal execution and institutional client work.", image: "/assets/generated/visual-dashboard.png", featured: true },
    { slug: "probationary-officer", name: "Probationary Officer", sector: "Banking", description: "Banking career track for branch operations, credit, customer service, compliance and financial products.", image: "/assets/generated/visual-dashboard.png", featured: false },
    { slug: "air-traffic-controller", name: "Air Traffic Controller", sector: "Aviation", description: "Aviation safety role coordinating aircraft movement, communication, runway flow and controlled airspace decisions.", image: "/assets/generated/visual-blog.png", featured: false },
    { slug: "narcotics-officer", name: "Narcotics Officer", sector: "Public Safety", description: "Enforcement career focused on narcotics control, investigations, intelligence gathering and legal procedure.", image: "/assets/generated/visual-dashboard.png", featured: false }
  ];
  for (const career of careerSeeds) {
    await db.career.upsert({ where: { slug: career.slug }, update: career, create: career });
  }

  // Communities
  const communities = [
    { slug: "jee", name: "JEE Mains and Advanced Community", description: "Get JEE Mains exam preparation resources, previous papers, counselling updates, and rank insights.", joinUrl: "https://rebrand.ly/799849e", image: "/assets/sathicollege/jee-common.png", order: 1 },
    { slug: "eamcet", name: "TS & AP EAMCET Community", description: "Access EAMCET preparation material, previous papers, cutoff analysis, and counselling updates.", joinUrl: "https://rebrand.ly/pq8aajt", image: "/assets/sathicollege/ap-eamcet.png", order: 2 },
    { slug: "kcet", name: "KCET Aspirants Community", description: "Access KCET preparation material, previous papers, cutoff analysis, and counselling updates.", joinUrl: "https://rebrand.ly/8432a7", image: "/assets/sathicollege/kcet.png", order: 3 },
    { slug: "tnea", name: "TNEA Counselling Community", description: "Stay updated with TNEA rank lists, counselling rounds, cutoff trends, and college guidance.", joinUrl: "https://rebrand.ly/b4d2fe", image: "/assets/sathicollege/tnea.png", order: 4 },
    { slug: "wbjee", name: "WBJEE Students Community", description: "Get WBJEE preparation tips, PYQs, counselling updates, and college prediction guidance.", joinUrl: "https://rebrand.ly/da51dkc", image: "/assets/sathicollege/wbjee.png", order: 5 },
    { slug: "private", name: "Private Engineering Entrance Community", description: "Updates and prep resources for VITEEE, SRMJEEE, BITSAT, MET, NIAT and others.", joinUrl: "https://rebrand.ly/09657b", image: "/assets/sathicollege/mock/bitsat.jpeg", order: 6 },
    { slug: "keam", name: "KEAM Aspirants Community", description: "Get KEAM exam preparation resources, previous papers, counselling updates, and rank insights.", joinUrl: "https://rebrand.ly/704788", image: "/assets/sathicollege/keam.png", order: 7 },
    { slug: "mhtcet", name: "MHTCET Aspirants Community", description: "Get MHTCET exam preparation resources, previous papers, counselling updates, and rank insights.", joinUrl: "https://rebrand.ly/9c143e", image: "/assets/sathicollege/mht-cet.png", order: 8 }
  ];
  for (const c of communities) {
    await db.community.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  const seededCommunities = await db.community.findMany();
  const communityBySlug = Object.fromEntries(seededCommunities.map((community) => [community.slug, community]));
  const admin = await db.user.findUnique({ where: { email } });
  const communityPosts = [
    {
      slug: "coimbatore-engineering-college-priority",
      title: "Coimbatore engineering college priority",
      body: "Sns college of engineering, Kathir college of engineering, Arjune college of engineering and Easwar college of engineering. Which one should I keep higher for counselling?",
      tag: "College comparison",
      communitySlug: "private",
      views: 84
    },
    {
      slug: "help-me-out-with-eapcet-prep",
      title: "Help me out with EAPCET prep",
      body: "I did not open a book properly for EAPCET and the exam is close. Need a realistic topic plan for the next few weeks.",
      tag: "EAMCET preparation",
      communitySlug: "eamcet",
      views: 117
    },
    {
      slug: "struggling-with-eamcet-counselling",
      title: "Struggling with EAMCET counselling",
      body: "Can someone explain how to check branch priority, local area rules and previous cutoff ranges before web options?",
      tag: "Counselling",
      communitySlug: "eamcet",
      views: 96
    },
    {
      slug: "jee-main-revision-starting-late",
      title: "JEE Main revision when starting late",
      body: "Need to prepare for JEE Exam. What should I revise first if I am starting late and want to avoid low-value topics?",
      tag: "JEE",
      communitySlug: "jee",
      views: 132
    },
    {
      slug: "verify-placement-stats-before-choice-filling",
      title: "How to verify placement stats before choice filling",
      body: "College websites show different placement numbers. What are the best ways to verify median package, branch-wise outcomes and internship quality?",
      tag: "Placements",
      communitySlug: "private",
      views: 74
    },
    {
      slug: "hostel-mess-and-campus-life-reviews",
      title: "Hostel mess and campus-life reviews",
      body: "Hostel, mess and campus-life reviews are confusing. How do you identify genuine student feedback before joining?",
      tag: "Campus life",
      communitySlug: "kcet",
      views: 63
    }
  ];
  if (admin) {
    for (const post of communityPosts) {
      const community = communityBySlug[post.communitySlug];
      await db.communityPost.upsert({
        where: { slug: post.slug },
        update: {
          title: post.title,
          body: post.body,
          tag: post.tag,
          views: post.views,
          communityId: community?.id ?? null,
          published: true
        },
        create: {
          slug: post.slug,
          title: post.title,
          body: post.body,
          tag: post.tag,
          views: post.views,
          communityId: community?.id ?? null,
          authorId: admin.id,
          published: true
        }
      });
    }
  }

  // Blog categories (mirrors SathiCollege.in's blog/category structure)
  const categories = [
    { slug: "ap-eamcet", name: "AP EAMCET", description: "AP EAMCET news, analysis, results and counselling." },
    { slug: "ts-eamcet", name: "TS EAMCET", description: "TS EAMCET (TG EAPCET) news, analysis, results and counselling." },
    { slug: "kcet", name: "KCET", description: "KCET news, cutoff and counselling guides." },
    { slug: "mht-cet", name: "MHT CET", description: "MHT CET news and counselling." },
    { slug: "keam", name: "KEAM", description: "KEAM updates, results and counselling." },
    { slug: "jee-main", name: "JEE Main", description: "JEE Main news, results and JoSAA updates." },
    { slug: "jee-advanced", name: "JEE Advanced", description: "JEE Advanced news and counselling." },
    { slug: "wbjee", name: "WBJEE", description: "WBJEE updates and counselling." },
    { slug: "tnea", name: "TNEA", description: "TNEA updates, ranks and counselling." },
    { slug: "engineering-colleges", name: "Engineering Colleges", description: "Engineering college overviews, placements and rankings." },
    { slug: "exam-news", name: "Exam News", description: "Latest engineering entrance exam news." }
  ];
  for (const c of categories) {
    await db.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  // Sample colleges
  const colleges = [
    { slug: "iit-bombay", name: "IIT Bombay", city: "Mumbai", state: "Maharashtra", type: "Government", rating: 4.9, fees: 230000, description: "Premier engineering institute in India.", heroImage: "/assets/institutes/iit-bombay.png", featured: true },
    { slug: "iit-delhi", name: "IIT Delhi", city: "New Delhi", state: "Delhi", type: "Government", rating: 4.9, fees: 230000, description: "One of the top IITs.", heroImage: "/assets/institutes/iit-delhi.png", featured: true },
    { slug: "nit-warangal", name: "NIT Warangal", city: "Warangal", state: "Telangana", type: "Government", rating: 4.6, fees: 150000, description: "Top National Institute of Technology.", heroImage: "/assets/institutes/nit-warangal.png", featured: true },
    { slug: "bits-pilani", name: "BITS Pilani", city: "Pilani", state: "Rajasthan", type: "Private", rating: 4.7, fees: 450000, description: "Leading private deemed university.", heroImage: "/assets/institutes/bits-pilani.png", featured: true },
    { slug: "vit-vellore", name: "VIT Vellore", city: "Vellore", state: "Tamil Nadu", type: "Private", rating: 4.4, fees: 200000, description: "Renowned private university.", heroImage: "/assets/institutes/vit-vellore.png", featured: false },
    { slug: "iiit-hyderabad", name: "IIIT Hyderabad", city: "Hyderabad", state: "Telangana", type: "Government", rating: 4.7, fees: 320000, description: "Top tier IT focused institute.", heroImage: "/assets/institutes/iiit-hyderabad.png", featured: true }
  ];
  for (const c of colleges) {
    await db.college.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  const seededExams = await db.exam.findMany();
  const seededColleges = await db.college.findMany();
  const examBySlug = Object.fromEntries(seededExams.map((exam) => [exam.slug, exam]));
  const collegeBySlug = Object.fromEntries(seededColleges.map((college) => [college.slug, college]));
  const eligiblePairs = [
    ["iit-bombay", "jee-main"], ["iit-bombay", "jee-advanced"],
    ["iit-delhi", "jee-main"], ["iit-delhi", "jee-advanced"],
    ["nit-warangal", "jee-main"], ["nit-warangal", "ts-eamcet"],
    ["bits-pilani", "jee-main"], ["bits-pilani", "bitsat"],
    ["vit-vellore", "jee-main"], ["vit-vellore", "tnea"],
    ["iiit-hyderabad", "jee-main"], ["iiit-hyderabad", "ts-eamcet"]
  ];
  for (const [collegeSlug, examSlug] of eligiblePairs) {
    const college = collegeBySlug[collegeSlug];
    const exam = examBySlug[examSlug];
    if (!college || !exam) continue;
    await db.collegeExam.upsert({
      where: { collegeId_examId: { collegeId: college.id, examId: exam.id } },
      update: {},
      create: { collegeId: college.id, examId: exam.id }
    });
  }

  const cutoffRows = [
    ["jee-main", "iit-bombay", "Computer Science", 950],
    ["jee-main", "iit-delhi", "Computer Science", 1200],
    ["jee-main", "iiit-hyderabad", "Computer Science", 2800],
    ["jee-main", "nit-warangal", "Computer Science", 6200],
    ["jee-main", "bits-pilani", "Computer Science", 8700],
    ["jee-main", "vit-vellore", "Computer Science", 45000],
    ["ts-eamcet", "iiit-hyderabad", "Computer Science", 1400],
    ["ts-eamcet", "nit-warangal", "Electronics", 6500],
    ["ap-eamcet", "vit-vellore", "Computer Science", 22000],
    ["tnea", "vit-vellore", "Information Technology", 18000]
  ] as const;
  for (const [examSlug, collegeSlug, branch, closingRank] of cutoffRows) {
    const exam = examBySlug[examSlug];
    const college = collegeBySlug[collegeSlug];
    if (!exam || !college) continue;
    const existing = await db.cutoff.findFirst({
      where: { examId: exam.id, collegeId: college.id, branch, category: "General", year: 2026 }
    });
    if (!existing) {
      await db.cutoff.create({
        data: { examId: exam.id, collegeId: college.id, branch, category: "General", year: 2026, closingRank }
      });
    }
  }

  // Representative original article shells based on the public sitemap taxonomy.
  const postSeeds = [
    ["jee-main", "jee-mains-2026-counselling-guide", "JEE Main 2026 Counselling: Complete Guide"],
    ["ap-eamcet", "ap-eamcet-2026-exam-analysis", "AP EAMCET 2026 Exam Analysis"],
    ["ts-eamcet", "ts-eamcet-answer-key-2026", "TS EAMCET Answer Key 2026"],
    ["kcet", "expected-kcet-cutoff-2026", "Expected KCET Cutoff 2026"],
    ["mht-cet", "mht-cet-2026-admit-card", "MHT CET 2026 Admit Card"],
    ["keam", "keam-result-2026", "KEAM Result 2026"],
    ["tnea", "tnea-marks-vs-rank", "TNEA Marks vs Rank"],
    ["engineering-colleges", "psg-college-of-technology-placement", "PSG College of Technology Placement"],
    ["engineering-colleges", "srmjeee-counselling", "SRMJEEE Counselling"],
    ["exam-news", "minimum-marks-in-jee-mains-2026-qualify-for-jee-advanced", "Minimum Marks in JEE Main 2026 to Qualify for JEE Advanced"]
  ] as const;
  const postImages = [
    "/assets/generated/visual-blog.png",
    "/assets/sathicollege/mock/jee-mains.png",
    "/assets/sathicollege/mock/ap-eamcet.jpeg",
    "/assets/sathicollege/mock/kcet.jpeg",
    "/assets/generated/visual-dashboard.png"
  ];
  for (const [index, seed] of postSeeds.entries()) {
    const [categorySlug, slug, title] = seed;
    const cat = await db.category.findUnique({ where: { slug: categorySlug } });
    await db.post.upsert({
      where: { slug },
      update: { categoryId: cat?.id ?? null, published: true, coverImage: postImages[index % postImages.length] },
      create: {
        slug,
        title,
        excerpt: `${title} explained with important dates, counselling context and practical next steps.`,
        content: `${title}\n\nThis is an original article shell for the admin-managed content system. Expand it with final editorial copy, official dates, eligibility notes, documents, cutoff ranges and FAQs before publishing at scale.\n\nStudents should always verify final information with official exam and counselling authorities.`,
        published: true,
        coverImage: postImages[index % postImages.length],
        tags: `${categorySlug},2026,counselling`,
        categoryId: cat?.id ?? null
      }
    });
  }

  // Default site settings (sathicollege)
  const { DEFAULT_SETTINGS } = await import("../src/lib/settings-defaults");
  await db.setting.upsert({
    where: { key: "site" },
    update: { value: JSON.stringify(DEFAULT_SETTINGS) },
    create: { key: "site", value: JSON.stringify(DEFAULT_SETTINGS) }
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
