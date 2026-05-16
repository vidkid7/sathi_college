import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  // Admin user
  const email = process.env.ADMIN_EMAIL || "admin@sathicollege.in";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe@123";
  const hashed = await bcrypt.hash(password, 10);
  await db.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Admin", password: hashed, role: "ADMIN" }
  });

  // Exams
  const exams = [
    { slug: "jee-main", name: "JEE Mains", shortName: "JEE Main", description: "Joint Entrance Examination Mains for engineering admissions across NITs, IIITs and GFTIs.", heroImage: "/assets/collegedost/jee-common.png" },
    { slug: "jee-advanced", name: "JEE Advanced", shortName: "JEE Adv", description: "Joint Entrance Examination Advanced for IIT admissions.", heroImage: "/assets/collegedost/jee-common.png" },
    { slug: "ap-eamcet", name: "AP EAMCET", shortName: "AP EAMCET", description: "Andhra Pradesh Engineering, Agriculture & Medical Common Entrance Test.", heroImage: "/assets/collegedost/ap-eamcet.png" },
    { slug: "ts-eamcet", name: "TS EAMCET", shortName: "TS EAMCET", description: "Telangana State Engineering, Agriculture & Medical Common Entrance Test.", heroImage: "/assets/collegedost/ts-eamcet.png" },
    { slug: "kcet", name: "KCET", shortName: "KCET", description: "Karnataka Common Entrance Test.", heroImage: "/assets/collegedost/kcet.png" },
    { slug: "mht-cet", name: "MHT CET", shortName: "MHT CET", description: "Maharashtra Common Entrance Test.", heroImage: "/assets/collegedost/mht-cet.png" },
    { slug: "keam", name: "KEAM", shortName: "KEAM", description: "Kerala Engineering Architecture Medical entrance examination.", heroImage: "/assets/collegedost/keam.png" },
    { slug: "tnea", name: "TNEA", shortName: "TNEA", description: "Tamil Nadu Engineering Admissions.", heroImage: "/assets/collegedost/tnea.png" },
    { slug: "wbjee", name: "WBJEE", shortName: "WBJEE", description: "West Bengal Joint Entrance Examination.", heroImage: "/assets/collegedost/wbjee.png" }
  ];
  for (const e of exams) {
    await db.exam.upsert({ where: { slug: e.slug }, update: e, create: e });
  }

  // Communities
  const communities = [
    { slug: "jee", name: "JEE Mains and Advanced Community", description: "Get JEE Mains exam preparation resources, previous papers, counselling updates, and rank insights.", joinUrl: "https://rebrand.ly/799849e", image: "/assets/collegedost/jee-common.png", order: 1 },
    { slug: "eamcet", name: "TS & AP EAMCET Community", description: "Access EAMCET preparation material, previous papers, cutoff analysis, and counselling updates.", joinUrl: "https://rebrand.ly/pq8aajt", image: "/assets/collegedost/ap-eamcet.png", order: 2 },
    { slug: "kcet", name: "KCET Aspirants Community", description: "Access KCET preparation material, previous papers, cutoff analysis, and counselling updates.", joinUrl: "https://rebrand.ly/8432a7", image: "/assets/collegedost/kcet.png", order: 3 },
    { slug: "tnea", name: "TNEA Counselling Community", description: "Stay updated with TNEA rank lists, counselling rounds, cutoff trends, and college guidance.", joinUrl: "https://rebrand.ly/b4d2fe", image: "/assets/collegedost/tnea.png", order: 4 },
    { slug: "wbjee", name: "WBJEE Students Community", description: "Get WBJEE preparation tips, PYQs, counselling updates, and college prediction guidance.", joinUrl: "https://rebrand.ly/da51dkc", image: "/assets/collegedost/wbjee.png", order: 5 },
    { slug: "private", name: "Private Engineering Entrance Community", description: "Updates and prep resources for VITEEE, SRMJEEE, BITSAT, MET, NIAT and others.", joinUrl: "https://rebrand.ly/09657b", image: "/assets/collegedost/mock/bitsat.jpeg", order: 6 },
    { slug: "keam", name: "KEAM Aspirants Community", description: "Get KEAM exam preparation resources, previous papers, counselling updates, and rank insights.", joinUrl: "https://rebrand.ly/704788", image: "/assets/collegedost/keam.png", order: 7 },
    { slug: "mhtcet", name: "MHTCET Aspirants Community", description: "Get MHTCET exam preparation resources, previous papers, counselling updates, and rank insights.", joinUrl: "https://rebrand.ly/9c143e", image: "/assets/collegedost/mht-cet.png", order: 8 }
  ];
  for (const c of communities) {
    await db.community.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  // Blog categories (mirrors collegedost.in's blog/category structure)
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
    "/assets/collegedost/mock/jee-mains.png",
    "/assets/collegedost/mock/ap-eamcet.jpeg",
    "/assets/collegedost/mock/kcet.jpeg",
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
