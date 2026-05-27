"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  BriefcaseBusiness,
  Calculator,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  Menu,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
  type LucideIcon
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { safeImageSrc } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  description?: string;
};

type NavColumn = {
  title: string;
  links: NavLink[];
};

type NavCategory = {
  label: string;
  href: string;
  description: string;
  columns: NavColumn[];
};

type MegaGroup = {
  label: string;
  tagline: string;
  icon: LucideIcon;
  accent: string;
  layout?: "rail" | "flat";
  categories: NavCategory[];
  quickLinks: NavLink[];
  cta: NavLink;
  cards?: Array<NavLink & { image: string; meta?: string }>;
};

const directLinks = [
  { href: "/", label: "Home" },
  { href: "/community", label: "Community" }
];

const navShellClass = "mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-8";

type CollegeTypeConfig = {
  label: string;
  degrees: string[];
  exams: string[];
  locations: string[];
};

const collegeSearchHref = (query: string) => `/colleges?search=${encodeURIComponent(query)}`;

const slugifyPath = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const collegeTypeConfigs: CollegeTypeConfig[] = [
  {
    label: "Management",
    degrees: ["MBA", "BBA", "PGDM", "BMS", "Executive MBA"],
    exams: ["CAT", "MAT", "XAT", "CMAT"],
    locations: ["Delhi", "Mumbai", "Bengaluru", "Pune"]
  },
  {
    label: "Commerce & Banking",
    degrees: ["B.Com", "M.Com", "BBA Finance", "Banking & Insurance", "Chartered Accountancy"],
    exams: ["CUET", "CA Foundation", "CS Executive", "CMA Foundation"],
    locations: ["Delhi", "Mumbai", "Kolkata", "Ahmedabad"]
  },
  {
    label: "Medical",
    degrees: ["MBBS", "BAMS", "BHMS", "BPT", "MD"],
    exams: ["NEET UG", "NEET PG", "INI CET", "AIAPGET"],
    locations: ["Delhi", "Mumbai", "Chennai", "Bengaluru"]
  },
  {
    label: "Sciences",
    degrees: ["B.Sc", "M.Sc", "B.Sc Physics", "B.Sc Chemistry", "B.Sc Mathematics"],
    exams: ["CUET", "IIT JAM", "NEST", "ICAR AIEEA"],
    locations: ["Delhi", "Pune", "Kolkata", "Hyderabad"]
  },
  {
    label: "Hotel Management",
    degrees: ["BHM", "BHMCT", "Diploma in Hotel Management", "MBA Hospitality", "Culinary Arts"],
    exams: ["NCHMCT JEE", "CUET", "AIMA UGAT", "IIHM eCHAT"],
    locations: ["Delhi", "Mumbai", "Bengaluru", "Goa"]
  },
  {
    label: "Information Technology",
    degrees: ["BCA", "MCA", "B.Sc IT", "Cyber Security", "Data Science"],
    exams: ["NIMCET", "CUET", "MAH MCA CET", "IPU CET"],
    locations: ["Bengaluru", "Hyderabad", "Pune", "Chennai"]
  },
  {
    label: "Arts & Humanities",
    degrees: ["BA", "MA", "BA Psychology", "BA Economics", "BA English"],
    exams: ["CUET", "TISSNET", "JMI Entrance", "DUET"],
    locations: ["Delhi", "Kolkata", "Mumbai", "Pune"]
  },
  {
    label: "Mass Communication",
    degrees: ["BJMC", "BA Journalism", "MA Mass Communication", "Digital Media", "Advertising"],
    exams: ["CUET", "IIMC Entrance", "XIC OET", "IPU CET"],
    locations: ["Delhi", "Mumbai", "Noida", "Bengaluru"]
  },
  {
    label: "Nursing",
    degrees: ["B.Sc Nursing", "GNM", "ANM", "M.Sc Nursing", "Post Basic B.Sc Nursing"],
    exams: ["NEET UG", "AIIMS Nursing", "JENPAS UG", "RUHS Nursing"],
    locations: ["Delhi", "Bengaluru", "Chennai", "Hyderabad"]
  },
  {
    label: "Agriculture",
    degrees: ["B.Sc Agriculture", "M.Sc Agriculture", "Horticulture", "Forestry", "Agribusiness"],
    exams: ["ICAR AIEEA", "CUET", "KCET", "AP EAMCET"],
    locations: ["Punjab", "Maharashtra", "Karnataka", "Tamil Nadu"]
  },
  {
    label: "Design",
    degrees: ["B.Des", "M.Des", "Fashion Design", "Interior Design", "Graphic Design"],
    exams: ["NIFT", "NID DAT", "UCEED", "CEED"],
    locations: ["Delhi", "Mumbai", "Ahmedabad", "Bengaluru"]
  },
  {
    label: "Law",
    degrees: ["LLB", "BA LLB", "BBA LLB", "LLM", "Corporate Law"],
    exams: ["CLAT", "AILET", "LSAT India", "MH CET Law"],
    locations: ["Delhi", "Bengaluru", "Hyderabad", "Pune"]
  },
  {
    label: "Pharmacy",
    degrees: ["B.Pharm", "D.Pharm", "M.Pharm", "Pharm.D", "Pharmaceutical Chemistry"],
    exams: ["GPAT", "CUET", "MHT CET", "TS EAMCET"],
    locations: ["Hyderabad", "Pune", "Ahmedabad", "Chennai"]
  },
  {
    label: "Para Medical",
    degrees: ["BMLT", "BPT", "Radiology", "Optometry", "Operation Theatre Technology"],
    exams: ["NEET UG", "CUET", "JENPAS UG", "AIIMS Paramedical"],
    locations: ["Delhi", "Mumbai", "Kolkata", "Chennai"]
  },
  {
    label: "Dental",
    degrees: ["BDS", "MDS", "Dental Hygiene", "Dental Mechanics", "Oral Surgery"],
    exams: ["NEET UG", "NEET MDS", "INI CET", "CUET"],
    locations: ["Delhi", "Mumbai", "Bengaluru", "Chennai"]
  },
  {
    label: "Performing Arts",
    degrees: ["Bachelor of Fine Arts", "Music", "Dance", "Theatre", "Film Studies"],
    exams: ["CUET", "FTII JET", "NSD Entrance", "SRFTI Entrance"],
    locations: ["Delhi", "Mumbai", "Kolkata", "Chennai"]
  },
  {
    label: "Education",
    degrees: ["B.Ed", "M.Ed", "D.El.Ed", "B.P.Ed", "Special Education"],
    exams: ["CUET", "CTET", "B.Ed Entrance", "TET"],
    locations: ["Delhi", "Lucknow", "Jaipur", "Patna"]
  }
];

const collegeTypeCategories: NavCategory[] = collegeTypeConfigs.map(({ label, degrees, exams, locations }) => ({
  label,
  href: collegeSearchHref(label),
  description: `${label} colleges, degree options, entrance exams and city-wise discovery.`,
  columns: [
    {
      title: "Colleges By Degrees",
      links: degrees.map((degree) => ({
        href: collegeSearchHref(degree),
        label: `${degree} colleges`
      }))
    },
    {
      title: "Popular Searches",
      links: [
        { href: collegeSearchHref(`Top ${label} colleges`), label: `Top ${label} Colleges` },
        { href: collegeSearchHref(`Government ${label} colleges`), label: `Government ${label} Colleges` },
        { href: collegeSearchHref(`Private ${label} colleges`), label: `Private ${label} Colleges` },
        { href: collegeSearchHref(`${label} admission`), label: `${label} Admission` },
        { href: collegeSearchHref(`${label} fees`), label: `${label} Fees` }
      ]
    },
    {
      title: "Entrance Exams",
      links: exams.map((exam) => ({
        href: `/exams/${slugifyPath(exam)}`,
        label: exam
      }))
    },
    {
      title: "By Location",
      links: locations.map((location) => ({
        href: collegeSearchHref(`${label} colleges in ${location}`),
        label: `${label} Colleges in ${location}`
      }))
    }
  ]
}));

const examSubLinks = [
  { label: "Eligibility", hash: "#eligibility" },
  { label: "Syllabus", hash: "#syllabus" },
  { label: "Exam Pattern", hash: "#exam-pattern" },
  { label: "How to Prepare", hash: "#preparation" },
  { label: "Previous Year Question Paper", hash: "#previous-year-question-paper" }
];

type ExamMenuConfig = {
  label: string;
  exams: Array<{ slug: string; label: string }>;
};

const createExamCategory = ({ label, exams }: ExamMenuConfig): NavCategory => ({
  label,
  href: `/exams?category=${encodeURIComponent(label)}`,
  description: `${label} exams with eligibility, syllabus, pattern, preparation and previous paper links.`,
  columns: exams.map((exam) => ({
    title: exam.label,
    links: examSubLinks.map((item) => ({
      href: `/exams/${exam.slug}${item.hash}`,
      label: item.label
    }))
  }))
});

const examCategories: NavCategory[] = [
  createExamCategory({
    label: "Engineering",
    exams: [
      { slug: "jee-main", label: "JEE Mains" },
      { slug: "jee-advanced", label: "JEE Advanced" },
      { slug: "bitsat", label: "BITSAT" },
      { slug: "gate", label: "GATE" },
      { slug: "wbjee", label: "WBJEE" }
    ]
  }),
  createExamCategory({
    label: "Management",
    exams: [
      { slug: "cat", label: "CAT" },
      { slug: "xat", label: "XAT" },
      { slug: "mat", label: "MAT" },
      { slug: "cmat", label: "CMAT" },
      { slug: "cuet", label: "CUET" }
    ]
  }),
  createExamCategory({
    label: "Commerce & Banking",
    exams: [
      { slug: "ca-foundation", label: "CA Foundation" },
      { slug: "cs-executive", label: "CS Executive" },
      { slug: "cma-foundation", label: "CMA Foundation" },
      { slug: "cuet", label: "CUET" }
    ]
  }),
  createExamCategory({
    label: "Medical",
    exams: [
      { slug: "neet-ug", label: "NEET UG" },
      { slug: "neet-pg", label: "NEET PG" },
      { slug: "aiims-nursing", label: "AIIMS Nursing" },
      { slug: "aiapget", label: "AIAPGET" }
    ]
  }),
  createExamCategory({
    label: "Sciences",
    exams: [
      { slug: "cuet", label: "CUET" },
      { slug: "iit-jam", label: "IIT JAM" },
      { slug: "nest", label: "NEST" },
      { slug: "icar-aieea", label: "ICAR AIEEA" }
    ]
  }),
  createExamCategory({
    label: "Hotel Management",
    exams: [
      { slug: "nchmct-jee", label: "NCHMCT JEE" },
      { slug: "cuet", label: "CUET" },
      { slug: "aima-ugat", label: "AIMA UGAT" },
      { slug: "iihm-echat", label: "IIHM eCHAT" }
    ]
  }),
  createExamCategory({
    label: "Information Technology",
    exams: [
      { slug: "nimcet", label: "NIMCET" },
      { slug: "cuet", label: "CUET" },
      { slug: "mah-mca-cet", label: "MAH MCA CET" },
      { slug: "ipu-cet", label: "IPU CET" }
    ]
  }),
  createExamCategory({
    label: "Arts & Humanities",
    exams: [
      { slug: "cuet", label: "CUET" },
      { slug: "tissnet", label: "TISSNET" },
      { slug: "jmi-entrance", label: "JMI Entrance" },
      { slug: "duet", label: "DUET" }
    ]
  }),
  createExamCategory({
    label: "Mass Communication",
    exams: [
      { slug: "cuet", label: "CUET" },
      { slug: "iimc-entrance", label: "IIMC Entrance" },
      { slug: "xic-oet", label: "XIC OET" },
      { slug: "ipu-cet", label: "IPU CET" }
    ]
  }),
  createExamCategory({
    label: "Nursing",
    exams: [
      { slug: "neet-ug", label: "NEET UG" },
      { slug: "aiims-nursing", label: "AIIMS Nursing" },
      { slug: "jenpas-ug", label: "JENPAS UG" },
      { slug: "ruhs-nursing", label: "RUHS Nursing" }
    ]
  }),
  createExamCategory({
    label: "Agriculture",
    exams: [
      { slug: "icar-aieea", label: "ICAR AIEEA" },
      { slug: "cuet", label: "CUET" },
      { slug: "kcet", label: "KCET" },
      { slug: "ap-eamcet", label: "AP EAMCET" }
    ]
  }),
  createExamCategory({
    label: "Design",
    exams: [
      { slug: "nift", label: "NIFT" },
      { slug: "nid-dat", label: "NID DAT" },
      { slug: "uceed", label: "UCEED" },
      { slug: "ceed", label: "CEED" }
    ]
  }),
  createExamCategory({
    label: "Law",
    exams: [
      { slug: "clat", label: "CLAT" },
      { slug: "ailet", label: "AILET" },
      { slug: "lsat-india", label: "LSAT India" },
      { slug: "mh-cet-law", label: "MH CET Law" }
    ]
  }),
  createExamCategory({
    label: "Pharmacy",
    exams: [
      { slug: "gpat", label: "GPAT" },
      { slug: "cuet", label: "CUET" },
      { slug: "mht-cet", label: "MHT CET" },
      { slug: "ts-eamcet", label: "TS EAMCET" }
    ]
  }),
  createExamCategory({
    label: "Para Medical",
    exams: [
      { slug: "neet-ug", label: "NEET UG" },
      { slug: "cuet", label: "CUET" },
      { slug: "jenpas-ug", label: "JENPAS UG" },
      { slug: "aiims-paramedical", label: "AIIMS Paramedical" }
    ]
  }),
  createExamCategory({
    label: "Dental",
    exams: [
      { slug: "neet-ug", label: "NEET UG" },
      { slug: "neet-mds", label: "NEET MDS" },
      { slug: "ini-cet", label: "INI CET" },
      { slug: "cuet", label: "CUET" }
    ]
  }),
  createExamCategory({
    label: "Performing Arts",
    exams: [
      { slug: "cuet", label: "CUET" },
      { slug: "ftii-jet", label: "FTII JET" },
      { slug: "nsd-entrance", label: "NSD Entrance" },
      { slug: "srfti-entrance", label: "SRFTI Entrance" }
    ]
  }),
  createExamCategory({
    label: "Education",
    exams: [
      { slug: "cuet", label: "CUET" },
      { slug: "ctet", label: "CTET" },
      { slug: "b-ed-entrance", label: "B.Ed Entrance" },
      { slug: "tet", label: "TET" }
    ]
  })
];

const courseColumns: NavColumn[] = [
  {
    title: "Popular Courses",
    links: ["B.Tech", "B.Arch", "B.Tech in Mechanical Engineering", "B.Sc Radiotherapy", "B.Sc in Medical Laboratory Technology"].map((label) => ({
      href: `/courses/${slugifyPath(label)}`,
      label
    }))
  },
  {
    title: "Management & Design",
    links: ["MBA", "Auto CAD", "B.Des", "B.Ed", "B.Sc Agriculture"].map((label) => ({
      href: `/courses/${slugifyPath(label)}`,
      label
    }))
  },
  {
    title: "Specializations",
    links: ["MBA in Media Management", "MBA in International Business", "MBA in Operations Management", "B.Sc in Statistics", "B.Sc in Home Science"].map((label) => ({
      href: `/courses/${slugifyPath(label)}`,
      label
    }))
  },
  {
    title: "Professional Programs",
    links: ["Bachelor of Management Studies", "Bachelor of Mass Communication", "Bachelor of Computer Application", "B.Pharma", "Bachelor of Dental Surgery (BDS)"].map((label) => ({
      href: `/courses/${slugifyPath(label)}`,
      label
    }))
  }
];

const careerColumns: NavColumn[] = [
  {
    title: "Popular Careers",
    links: ["IAS Officer", "Police Officer", "Doctor", "Crime Investigation Department CID Officer", "Indian Forest Service IFS Officer"].map((label) => ({
      href: `/careers/${slugifyPath(label)}`,
      label
    }))
  },
  {
    title: "Aviation & Services",
    links: ["Pilot", "Veterinary Doctor Veterinarian", "Army Officer", "Fashion Designer", "Air Hostess", "Air Force Officer"].map((label) => ({
      href: `/careers/${slugifyPath(label)}`,
      label
    }))
  },
  {
    title: "Business & Government",
    links: ["Company Secretary CS", "Loco Pilot", "Chartered Accountant", "Central Reserve Police Force", "Chief Officer Merchant Navy"].map((label) => ({
      href: `/careers/${slugifyPath(label)}`,
      label
    }))
  },
  {
    title: "Finance & Safety",
    links: ["Drug Inspector", "Investment Banker", "Probationary Officer", "Air Traffic Controller", "Narcotics Officer"].map((label) => ({
      href: `/careers/${slugifyPath(label)}`,
      label
    }))
  }
];

const megaGroups: MegaGroup[] = [
  {
    label: "Colleges",
    tagline: "Find colleges by exam, city, branch, ownership and comparison fit.",
    icon: Building2,
    accent: "#f59e0b",
    cta: { href: "/colleges", label: "View all colleges", description: "Open the full searchable college directory" },
    quickLinks: [
      { href: "/colleges", label: "Find Your College" },
      { href: "/college-comparison", label: "Compare Colleges" },
      { href: "/college-predictor", label: "College Predictor" }
    ],
    categories: [
      {
        label: "Engineering",
        href: "/colleges",
        description: "Engineering colleges, exam links, states and popular branches in one panel.",
        columns: [
          {
            title: "Featured Colleges",
            links: [
              { href: "/colleges/iit-bombay", label: "IIT Bombay", description: "Mumbai, Maharashtra" },
              { href: "/colleges/iit-delhi", label: "IIT Delhi", description: "New Delhi, Delhi" },
              { href: "/colleges/nit-warangal", label: "NIT Warangal", description: "Warangal, Telangana" },
              { href: "/colleges/bits-pilani", label: "BITS Pilani", description: "Pilani, Rajasthan" },
              { href: "/colleges/vit-vellore", label: "VIT Vellore", description: "Vellore, Tamil Nadu" },
              { href: "/colleges/iiit-hyderabad", label: "IIIT Hyderabad", description: "Hyderabad, Telangana" }
            ]
          },
          {
            title: "Important Exams",
            links: [
              { href: "/exams/jee-main", label: "JEE Main", description: "National engineering entrance" },
              { href: "/exams/jee-advanced", label: "JEE Advanced", description: "IIT admission exam" },
              { href: "/exams/ap-eamcet", label: "AP EAMCET", description: "Andhra Pradesh counselling" },
              { href: "/exams/ts-eamcet", label: "TS EAMCET", description: "Telangana counselling" },
              { href: "/exams/kcet", label: "KCET", description: "Karnataka admissions" }
            ]
          },
          {
            title: "Top States",
            links: [
              { href: "/colleges?search=Maharashtra", label: "Maharashtra" },
              { href: "/colleges?search=Delhi", label: "Delhi" },
              { href: "/colleges?search=Karnataka", label: "Karnataka" },
              { href: "/colleges?search=Telangana", label: "Telangana" },
              { href: "/colleges?search=Tamil%20Nadu", label: "Tamil Nadu" }
            ]
          },
          {
            title: "Related Branches",
            links: [
              { href: "/colleges?search=Computer%20Science", label: "Computer Science Engineering" },
              { href: "/colleges?search=Mechanical", label: "Mechanical Engineering" },
              { href: "/colleges?search=Civil", label: "Civil Engineering" },
              { href: "/colleges?search=Electronics", label: "Electronics Engineering" },
              { href: "/colleges?search=Artificial%20Intelligence", label: "AI & Data Science" }
            ]
          }
        ]
      },
      ...collegeTypeCategories,
      {
        label: "By Ownership",
        href: "/colleges",
        description: "Shortcuts for government, private and high-value college searches.",
        columns: [
          {
            title: "College Type",
            links: [
              { href: "/colleges?type=Government", label: "Government Colleges", description: "Public institutes and universities" },
              { href: "/colleges?type=Private", label: "Private Colleges", description: "Private and deemed universities" },
              { href: "/college-comparison", label: "Compare by Fees", description: "Review cost, rating and location" },
              { href: "/scholarship", label: "Scholarship Guidance", description: "Financial support options" }
            ]
          },
          {
            title: "Decision Tools",
            links: [
              { href: "/college-predictor/jee-main", label: "JEE College Predictor" },
              { href: "/college-predictor/ap-eamcet", label: "AP EAMCET College Predictor" },
              { href: "/college-predictor/ts-eamcet", label: "TS EAMCET College Predictor" },
              { href: "/college-comparison/engineering", label: "Cutoff Comparison" }
            ]
          },
          {
            title: "Popular Cities",
            links: [
              { href: "/colleges?search=Mumbai", label: "Colleges in Mumbai" },
              { href: "/colleges?search=Delhi", label: "Colleges in Delhi" },
              { href: "/colleges?search=Hyderabad", label: "Colleges in Hyderabad" },
              { href: "/colleges?search=Bengaluru", label: "Colleges in Bengaluru" }
            ]
          }
        ]
      }
    ]
  },
  {
    label: "Exam",
    tagline: "Browse entrance exams by stream with eligibility, syllabus, pattern and preparation links.",
    icon: GraduationCap,
    accent: "#38bdf8",
    cta: { href: "/exams", label: "View all exams", description: "Browse every supported exam guide" },
    quickLinks: [
      { href: "/exams/jee-main", label: "JEE Main" },
      { href: "/exams/bitsat", label: "BITSAT" },
      { href: "/exams/gate", label: "GATE" },
      { href: "/rank-predictor", label: "Rank Predictor" }
    ],
    categories: examCategories
  },
  {
    label: "Courses",
    tagline: "Popular degree and specialization shortcuts backed by the course database.",
    icon: ClipboardCheck,
    accent: "#22c55e",
    layout: "flat",
    cta: { href: "/courses", label: "View All Courses", description: "Open the admin-managed course directory" },
    quickLinks: [
      { href: "/courses/b-tech", label: "B.Tech" },
      { href: "/courses/mba", label: "MBA" },
      { href: "/courses/bachelor-of-computer-application", label: "BCA" }
    ],
    categories: [
      {
        label: "Popular Courses",
        href: "/courses",
        description: "High-intent course links laid out like the CollegeDekho popular courses panel.",
        columns: courseColumns
      }
    ]
  },
  {
    label: "Careers",
    tagline: "Career discovery links for students comparing streams, roles and outcomes.",
    icon: BriefcaseBusiness,
    accent: "#14b8a6",
    layout: "flat",
    cta: { href: "/careers", label: "View All Careers", description: "Open the admin-managed career directory" },
    quickLinks: [
      { href: "/careers/ias-officer", label: "IAS Officer" },
      { href: "/careers/doctor", label: "Doctor" },
      { href: "/careers/pilot", label: "Pilot" }
    ],
    categories: [
      {
        label: "Popular Careers",
        href: "/careers",
        description: "Career options grouped in the same four-column discovery pattern as the reference.",
        columns: careerColumns
      }
    ]
  },
  {
    label: "Predictors",
    tagline: "Rank, college, cutoff and comparison tools from the old navbar, now grouped deeper.",
    icon: Calculator,
    accent: "#a855f7",
    cta: { href: "/college-predictor", label: "Start predicting", description: "Choose exam, rank and category" },
    quickLinks: [
      { href: "/rank-predictor", label: "Rank Predictor" },
      { href: "/college-predictor", label: "College Predictor" },
      { href: "/college-comparison", label: "Cutoff Comparison" }
    ],
    categories: [
      {
        label: "Prediction Tools",
        href: "/rank-predictor",
        description: "The previous predictor menu preserved with exam-specific routes.",
        columns: [
          {
            title: "Rank Predictors",
            links: [
              { href: "/rank-predictor", label: "All Rank Predictors", description: "Choose a supported entrance exam" },
              { href: "/rank-predictor/jee-main", label: "JEE Main Rank Predictor" },
              { href: "/rank-predictor/ap-eamcet", label: "AP EAMCET Rank Predictor" },
              { href: "/rank-predictor/ts-eamcet", label: "TS EAMCET Rank Predictor" },
              { href: "/rank-predictor/kcet", label: "KCET Rank Predictor" }
            ]
          },
          {
            title: "College Predictors",
            links: [
              { href: "/college-predictor", label: "All College Predictors", description: "Find likely colleges by rank" },
              { href: "/college-predictor/jee-main", label: "JEE Main College Predictor" },
              { href: "/college-predictor/ap-eamcet", label: "AP EAMCET College Predictor" },
              { href: "/college-predictor/ts-eamcet", label: "TS EAMCET College Predictor" },
              { href: "/college-predictor/wbjee", label: "WBJEE College Predictor" }
            ]
          },
          {
            title: "Compare & Decide",
            links: [
              { href: "/college-comparison", label: "Compare Colleges" },
              { href: "/college-comparison/engineering", label: "Cutoff Comparison" },
              { href: "/ap-eapcet-ai-chatbot", label: "AP EAPCET AI Chatbot" },
              { href: "/contact", label: "Talk to Counselling Team" }
            ]
          }
        ]
      }
    ]
  },
  {
    label: "Latest Updates",
    tagline: "Exam news, admission articles, scholarship updates and active discussions.",
    icon: Newspaper,
    accent: "#fb7185",
    layout: "flat",
    cta: { href: "/blog", label: "Read All News", description: "Open articles and admission news" },
    quickLinks: [
      { href: "/blog", label: "All Articles" },
      { href: "/blog/category/exam-news", label: "Exam News" },
      { href: "/community", label: "Discussions" }
    ],
    cards: [
      {
        href: "/blog/minimum-marks-in-jee-mains-2026-qualify-for-jee-advanced",
        label: "Minimum Marks in JEE Main 2026 to Qualify for JEE Advanced",
        description: "Eligibility score context, qualification range and counselling next steps.",
        image: "/assets/sathicollege/jee-common.png",
        meta: "Exam News"
      },
      {
        href: "/blog/ts-eamcet-answer-key-2026",
        label: "TS EAMCET Answer Key 2026",
        description: "Answer key release, objection window and expected result flow.",
        image: "/assets/generated/hero-campus-generated.png",
        meta: "Live Updates"
      },
      {
        href: "/blog/expected-kcet-cutoff-2026",
        label: "Expected KCET Cutoff 2026",
        description: "College-wise cutoff expectations and category planning.",
        image: "/assets/sathicollege/wbjee.png",
        meta: "Rank Analysis"
      },
      {
        href: "/blog/mht-cet-2026-admit-card",
        label: "MHT CET 2026 Admit Card",
        description: "Admit card timeline, download steps and exam-day checklist.",
        image: "/assets/generated/visual-blog.png",
        meta: "Admission Alert"
      }
    ],
    categories: [
      {
        label: "Updates",
        href: "/blog",
        description: "Latest admission, exam and college content.",
        columns: [
          {
            title: "News & Guides",
            links: [
              { href: "/blog", label: "All Articles" },
              { href: "/blog/category/exam-news", label: "Exam News" },
              { href: "/blog/category/engineering-colleges", label: "Engineering College Guides" },
              { href: "/scholarship", label: "Scholarships" }
            ]
          },
          {
            title: "Active Communities",
            links: [
              { href: "/community/jee", label: "JEE Community" },
              { href: "/community/eamcet", label: "EAMCET Community" },
              { href: "/community/kcet", label: "KCET Community" },
              { href: "/community/wbjee", label: "WBJEE Community" }
            ]
          },
          {
            title: "Fast Actions",
            links: [
              { href: "/signup", label: "Create Account" },
              { href: "/login", label: "Sign In" },
              { href: "/contact", label: "Submit a Question" }
            ]
          }
        ]
      }
    ]
  },
  {
    label: "More",
    tagline: "More to explore, research tools and quick links in a clean three-column panel.",
    icon: Sparkles,
    accent: "#f97316",
    layout: "flat",
    cta: { href: "/about", label: "About SathiCollege", description: "Learn how this platform helps aspirants" },
    quickLinks: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/careers", label: "Career Compass" }
    ],
    categories: [
      {
        label: "More to explore",
        href: "/about",
        description: "Platform links and support tools matching the reference menu structure.",
        columns: [
          {
            title: "More to explore",
            links: [
              { href: "/contact", label: "Common Application Form" },
              { href: "/courses", label: "Job Ready Courses" },
              { href: "/colleges", label: "ETP Admissions" },
              { href: "/scholarship", label: "Scholarships" },
              { href: "/blog/category/exam-news", label: "Boards" },
              { href: "/blog", label: "Articles" },
              { href: "/blog/category/exam-news", label: "Telugu News" },
              { href: "/courses", label: "CD Academy" }
            ]
          },
          {
            title: "Tools & Research",
            links: [
              { href: "/careers", label: "Career Compass" },
              { href: "/community", label: "Write a Review" },
              { href: "/community", label: "Qna Forum" },
              { href: "/rank-predictor/jee-main", label: "JEE Main Rank Predictor" },
              { href: "/blog", label: "Full Forms" }
            ]
          },
          {
            title: "Quick Links",
            links: [
              { href: "/about", label: "About Us" },
              { href: "/contact", label: "Contact Us" },
              { href: "/signup", label: "Join Us" },
              { href: "/about", label: "CD Heart Report" }
            ]
          }
        ]
      }
    ]
  }
];

const searchSuggestions = [
  { name: "Search Programs", href: "/search-program", logo: "/assets/brand/sathi-logo.png", meta: "CourseFinder-style program search" },
  { name: "Computer Science", href: "/search-program?q=Computer%20Science", logo: "/assets/generated/visual-dashboard.png", meta: "Search programs and universities" },
  { name: "MBA", href: "/search-program?q=MBA", logo: "/assets/generated/visual-dashboard.png", meta: "Search management programs" },
  { name: "University of Exeter", href: "/search-program?q=University%20of%20Exeter", logo: "/assets/generated/hero-campus-generated.png", meta: "Search university programs" },
  { name: "IIT Bombay", href: "/colleges/iit-bombay", logo: "/assets/institutes/iit-bombay.png", meta: "Mumbai, Maharashtra" },
  { name: "IIT Delhi", href: "/colleges/iit-delhi", logo: "/assets/institutes/iit-delhi.png", meta: "New Delhi, Delhi" },
  { name: "NIT Warangal", href: "/colleges/nit-warangal", logo: "/assets/institutes/nit-warangal.png", meta: "Warangal, Telangana" },
  { name: "BITS Pilani", href: "/colleges/bits-pilani", logo: "/assets/institutes/bits-pilani.png", meta: "Pilani, Rajasthan" },
  { name: "JEE Main", href: "/exams/jee-main", logo: "/assets/sathicollege/jee-common.png", meta: "Exam guide and predictors" },
  { name: "AP EAMCET", href: "/exams/ap-eamcet", logo: "/assets/sathicollege/ap-eamcet.png", meta: "Exam guide and predictors" },
  { name: "TS EAMCET", href: "/exams/ts-eamcet", logo: "/assets/sathicollege/ts-eamcet.png", meta: "Exam guide and predictors" },
  { name: "KCET", href: "/exams/kcet", logo: "/assets/sathicollege/kcet.png", meta: "Exam guide and predictors" },
  { name: "MHT CET", href: "/exams/mht-cet", logo: "/assets/sathicollege/mht-cet.png", meta: "Exam guide and predictors" },
  { name: "B.Tech", href: "/search-program?q=B.Tech", logo: "/assets/generated/hero-campus-generated.png", meta: "Search B.Tech programs" },
  { name: "Doctor", href: "/careers/doctor", logo: "/assets/generated/visual-scale.png", meta: "Popular career" },
  { name: "Pilot", href: "/careers/pilot", logo: "/assets/generated/visual-blog.png", meta: "Popular career" },
  { name: "Rank Predictor", href: "/rank-predictor", logo: "/assets/generated/visual-dashboard.png", meta: "Marks to rank estimate" },
  { name: "College Predictor", href: "/college-predictor", logo: "/assets/generated/visual-trophy.png", meta: "Rank to college matches" },
  { name: "Mock Tests", href: "/mock-test", logo: "/assets/generated/visual-scale.png", meta: "Practice tests" }
];

export type NavbarProps = {
  siteName: string;
  shortName: string;
  logoUrl: string | null;
  whatsappHref: string;
};

function normalizePath(href: string) {
  return href.split("?")[0].replace(/\/$/, "") || "/";
}

function isLinkActive(pathname: string, href: string) {
  const path = normalizePath(href);
  return pathname === path || (path !== "/" && pathname.startsWith(`${path}/`));
}

function getActiveCategory(group: MegaGroup, selectedLabel?: string) {
  return group.categories.find((category) => category.label === selectedLabel) || group.categories[0];
}

function columnGridClass(columnCount: number) {
  if (columnCount >= 4) return "grid gap-4 md:grid-cols-2 xl:grid-cols-4";
  if (columnCount === 3) return "grid gap-4 md:grid-cols-3";
  return "grid gap-4 md:grid-cols-2";
}

function MegaPanel({
  group,
  selectedCategory,
  onCategoryChange,
  onNavigate,
  onPointerEnter,
  onPointerLeave
}: {
  group: MegaGroup;
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
  onNavigate: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}) {
  const Icon = group.icon;
  const activeCategory = getActiveCategory(group, selectedCategory);
  const isFlat = group.layout === "flat";

  return (
    <motion.div
      data-nav-panel={group.label}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      data-nav-dropdown
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className="absolute left-0 right-0 top-full hidden md:block"
    >
      <div className={`${navShellClass} pb-3 pt-1`}>
        <div
          className={`liquid-panel grid max-h-[calc(100vh-7.5rem)] overflow-hidden ${
            isFlat ? "grid-cols-1" : "md:grid-cols-[230px_1fr] xl:grid-cols-[245px_1fr_230px]"
          }`}
        >
          {!isFlat && (
          <aside className="nice-scroll max-h-[calc(100vh-9rem)] overflow-y-auto border-b border-white/60 bg-white/30 p-3 dark:border-white/10 dark:bg-white/5 md:border-b-0 md:border-r">
            <div className="liquid-surface flex items-start gap-3 p-3">
              <span className="icon-tile">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-base font-extrabold">{group.label}</p>
                <p className="mt-1 text-xs leading-5 text-[rgb(var(--fg-muted))]">{group.tagline}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-1">
              {group.categories.map((category) => {
                const isSelected = category.label === activeCategory.label;
                return (
                  <button
                    key={category.label}
                    type="button"
                    onMouseEnter={() => onCategoryChange(category.label)}
                    onFocus={() => onCategoryChange(category.label)}
                    onClick={() => onCategoryChange(category.label)}
                    className={`rounded-lg px-3 py-2.5 text-left text-sm font-bold transition ${
                      isSelected
                        ? "bg-white/74 text-[rgb(var(--primary))] shadow-sm dark:bg-white/10"
                        : "text-[rgb(var(--fg-muted))] hover:bg-white/48 hover:text-[rgb(var(--fg))] dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      {category.label}
                      <ChevronDown className="-rotate-90 h-4 w-4" />
                    </span>
                    <span className="mt-1 block text-xs font-medium leading-5 text-[rgb(var(--fg-muted))]">{category.description}</span>
                  </button>
                );
              })}
            </div>
          </aside>
          )}

          <div className="nice-scroll max-h-[calc(100vh-9rem)] overflow-x-hidden overflow-y-auto p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-lg font-extrabold">{isFlat ? group.label : activeCategory.label}</p>
                <p className="text-sm text-[rgb(var(--fg-muted))]">{isFlat ? group.tagline : activeCategory.description}</p>
              </div>
              <Link href={isFlat ? group.cta.href : activeCategory.href} onClick={onNavigate} className="subtle-link">
                {isFlat ? group.cta.label : "View all"}
                <ChevronDown className="-rotate-90 h-4 w-4" />
              </Link>
            </div>
            {group.cards && (
              <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {group.cards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    onClick={onNavigate}
                  className="group liquid-surface overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={card.image} alt="" className="h-28 w-full object-cover" />
                    <span className="block p-3">
                      {card.meta && <span className="mb-1 block text-xs font-extrabold text-[rgb(var(--primary))]">{card.meta}</span>}
                      <span className="line-clamp-2 block text-sm font-extrabold text-[rgb(var(--fg))] group-hover:text-[rgb(var(--primary))]">{card.label}</span>
                      {card.description && <span className="mt-2 line-clamp-2 block text-xs leading-5 text-[rgb(var(--fg-muted))]">{card.description}</span>}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            <div className={columnGridClass(activeCategory.columns.length)}>
              {activeCategory.columns.map((column) => (
                <section key={`${group.label}-${activeCategory.label}-${column.title}`} className="min-w-0">
                  <h3 className="mb-2 text-xs font-extrabold text-[rgb(var(--fg-muted))]">{column.title}</h3>
                  <div className="grid gap-1">
                    {column.links.map((item) => (
                      <Link
                        key={`${column.title}-${item.href}-${item.label}`}
                        href={item.href}
                        onClick={onNavigate}
                        className="group rounded-lg px-2 py-2 text-sm transition hover:bg-[rgb(var(--primary))]/10"
                      >
                        <span className="block truncate font-bold text-[rgb(var(--fg))] group-hover:text-[rgb(var(--primary))]">{item.label}</span>
                        {item.description && <span className="mt-0.5 block truncate text-xs leading-5 text-[rgb(var(--fg-muted))]">{item.description}</span>}
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          {!isFlat && (
          <aside className="hidden border-t border-white/60 bg-white/24 p-4 dark:border-white/10 dark:bg-white/5 xl:block xl:border-l xl:border-t-0">
            <p className="text-xs font-extrabold text-[rgb(var(--fg-muted))]">Quick Actions</p>
            <div className="mt-3 grid gap-2">
              {group.quickLinks.map((item) => (
                <Link
                  key={`${group.label}-${item.href}-${item.label}`}
                  href={item.href}
                  onClick={onNavigate}
                  className="rounded-lg bg-white/64 px-3 py-2 text-sm font-bold shadow-sm transition hover:bg-white/82 hover:text-[rgb(var(--primary))] dark:bg-white/5 dark:hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Link href={group.cta.href} onClick={onNavigate} className="btn-primary mt-4 block px-3 py-3 text-sm font-bold text-white shadow-lg">
              <span className="block">{group.cta.label}</span>
              {group.cta.description && <span className="mt-1 block text-xs font-medium text-white/80">{group.cta.description}</span>}
            </Link>
          </aside>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function Navbar({ siteName, shortName, logoUrl, whatsappHref }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [categoryByGroup, setCategoryByGroup] = useState<Record<string, string>>({});
  const closeTimerRef = useRef<number | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const brandRestRaw = siteName.toLowerCase().startsWith(shortName.toLowerCase())
    ? siteName.slice(shortName.length)
    : siteName.replace(shortName, "").trim();
  const brandRest = brandRestRaw ? `${brandRestRaw.charAt(0).toUpperCase()}${brandRestRaw.slice(1)}` : "College";
  const brandLogoSrc = safeImageSrc(logoUrl, "/assets/brand/sathi-logo.png");
  const selectedGroup = useMemo(() => megaGroups.find((group) => group.label === activeGroup) || null, [activeGroup]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    cancelScheduledClose();
    setActiveGroup(null);
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeMenus = (event: PointerEvent | MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-nav-dropdown]")) setActiveGroup(null);
      if (!target?.closest("[data-search-dropdown]")) setSearchOpen(false);
    };
    window.addEventListener("pointerdown", closeMenus);
    window.addEventListener("mousedown", closeMenus);
    window.addEventListener("click", closeMenus);
    return () => {
      window.removeEventListener("pointerdown", closeMenus);
      window.removeEventListener("mousedown", closeMenus);
      window.removeEventListener("click", closeMenus);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAllMenus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function closeAllMenus() {
    cancelScheduledClose();
    setActiveGroup(null);
    setOpen(false);
    setSearchOpen(false);
  }

  function cancelScheduledClose() {
    if (!closeTimerRef.current) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function scheduleMegaClose() {
    cancelScheduledClose();
    closeTimerRef.current = window.setTimeout(() => {
      setActiveGroup(null);
      closeTimerRef.current = null;
    }, 170);
  }

  function openGroup(group: MegaGroup) {
    cancelScheduledClose();
    setActiveGroup(group.label);
    setSearchOpen(false);
    setCategoryByGroup((current) => ({
      ...current,
      [group.label]: current[group.label] || group.categories[0].label
    }));
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search-program?q=${encodeURIComponent(q)}` : "/search-program");
    closeAllMenus();
  }

  const searchMatches = searchSuggestions
    .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.meta.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 7);

  const brand = (
    <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 no-tap" aria-label={siteName} onClick={closeAllMenus}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={brandLogoSrc} alt={`${siteName} logo`} className="h-11 w-11 rounded-xl object-contain shadow-lg shadow-blue-500/20" />
      <span className="min-w-0 whitespace-nowrap font-display text-xl font-extrabold">
        <span className="text-[rgb(var(--primary))]">{shortName}</span>
        <span>{brandRest}</span>
      </span>
    </Link>
  );

  return (
    <header className={`sticky top-0 z-50 bg-transparent transition-all ${scrolled ? "nav-blur" : ""}`}>
      <div className={`${navShellClass} py-2.5`}>
        <div className="liquid-nav flex h-14 items-center justify-between gap-3 rounded-lg px-3 sm:px-4">
        {brand}

        <nav
          data-nav-dropdown
          onMouseEnter={cancelScheduledClose}
          onMouseLeave={scheduleMegaClose}
          className="ml-2 hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex"
        >
          {directLinks.slice(0, 1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeAllMenus}
              className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-bold transition ${
                isLinkActive(pathname, link.href)
                  ? "bg-white/72 text-[rgb(var(--primary))] shadow-sm dark:bg-white/10"
                  : "text-[rgb(var(--fg-muted))] hover:bg-white/42 hover:text-[rgb(var(--fg))] dark:hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {megaGroups.map((group) => {
            const isOpen = activeGroup === group.label;
            const hasActiveLink = group.categories.some((category) => category.columns.some((column) => column.links.some((link) => isLinkActive(pathname, link.href))));
            return (
              <button
                key={group.label}
                type="button"
                onMouseEnter={() => openGroup(group)}
                onFocus={() => openGroup(group)}
                onClick={() => openGroup(group)}
                aria-expanded={isOpen}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-bold transition ${
                  isOpen || hasActiveLink
                    ? "bg-white/72 text-[rgb(var(--primary))] shadow-sm dark:bg-white/10"
                    : "text-[rgb(var(--fg-muted))] hover:bg-white/42 hover:text-[rgb(var(--fg))] dark:hover:bg-white/5"
                }`}
              >
                <span className="whitespace-nowrap">{group.label}</span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
            );
          })}
          {directLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeAllMenus}
              className={`hidden whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-bold transition min-[1850px]:inline-flex ${
                isLinkActive(pathname, link.href)
                  ? "bg-white/72 text-[rgb(var(--primary))] shadow-sm dark:bg-white/10"
                  : "text-[rgb(var(--fg-muted))] hover:bg-white/42 hover:text-[rgb(var(--fg))] dark:hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <div className="relative" data-search-dropdown>
            <form onSubmit={onSearch} className="hidden min-w-[230px] items-center gap-2 rounded-lg border border-white/70 bg-white/54 px-3 py-2 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 2xl:flex">
              <button type="submit" aria-label="Submit search" className="text-[rgb(var(--fg-muted))] transition hover:text-[rgb(var(--primary))]">
                <Search className="h-4 w-4" />
              </button>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  setSearchOpen(true);
                  setActiveGroup(null);
                }}
                onClick={() => {
                  setSearchOpen(true);
                  setActiveGroup(null);
                }}
                placeholder="Search programs, universities..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-[rgb(var(--fg-muted))]"
              />
            </form>
            <button
              type="button"
              onClick={() => {
                setSearchOpen((current) => !current);
                setActiveGroup(null);
              }}
              aria-label="Search colleges and exams"
              className="glass grid h-10 w-10 place-items-center rounded-lg text-[rgb(var(--fg-muted))] transition hover:scale-105 hover:text-[rgb(var(--primary))] 2xl:hidden"
            >
              <Search className="h-5 w-5" />
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="liquid-panel absolute right-0 top-12 z-[80] w-[min(92vw,400px)] p-3 text-[rgb(var(--fg))]"
                >
                  <form onSubmit={onSearch} className="flex items-center gap-2 rounded-lg border border-white/70 bg-white/58 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                    <button type="submit" aria-label="Submit search" className="text-[rgb(var(--fg-muted))] transition hover:text-[rgb(var(--primary))]">
                      <Search className="h-4 w-4" />
                    </button>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      autoFocus
                      placeholder="Search programs, universities..."
                      className="w-full bg-transparent text-sm outline-none placeholder:text-[rgb(var(--fg-muted))]"
                    />
                  </form>
                  <div className="mt-2 grid gap-1">
                    {searchMatches.map((item) => (
                      <Link key={item.href} href={item.href} onClick={closeAllMenus} className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/54 dark:hover:bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.logo} alt={`${item.name} logo`} className="h-9 w-9 rounded-lg bg-white object-contain p-1 shadow-sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold">{item.name}</span>
                          <span className="block truncate text-xs text-[rgb(var(--fg-muted))]">{item.meta}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ThemeToggle />
          {session?.user ? (
            <Link href={session.user.role === "ADMIN" || session.user.role === "EDITOR" ? "/admin" : "/community"} className="hidden btn-ghost max-w-[150px] truncate whitespace-nowrap px-4 py-2 min-[1700px]:inline-flex" title={session.user.name || session.user.email || "Account"}>
              <UserRound className="h-5 w-5" />
              <span className="truncate">{session.user.name || session.user.email}</span>
            </Link>
          ) : (
            <Link href="/login" className="hidden btn-ghost whitespace-nowrap px-4 py-2 min-[1700px]:inline-flex">
              <UserRound className="h-4 w-4" />
              Sign In
            </Link>
          )}
          {session?.user ? (
            <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="hidden btn-primary whitespace-nowrap px-4 py-2 min-[1700px]:inline-flex">
              Sign Out
            </button>
          ) : (
            <Link href="/signup" className="hidden btn-primary whitespace-nowrap px-4 py-2 min-[1700px]:inline-flex">
              <ShieldCheck className="h-4 w-4" />
              Sign Up
            </Link>
          )}
          <button
            onClick={() => {
              setOpen((v) => !v);
              setActiveGroup(null);
              setSearchOpen(false);
            }}
            aria-label="Open menu"
            className="glass grid h-10 w-10 place-items-center rounded-lg transition hover:scale-105 xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedGroup && (
          <MegaPanel
            key={selectedGroup.label}
            group={selectedGroup}
            selectedCategory={categoryByGroup[selectedGroup.label]}
            onCategoryChange={(category) => setCategoryByGroup((current) => ({ ...current, [selectedGroup.label]: category }))}
            onNavigate={closeAllMenus}
            onPointerEnter={cancelScheduledClose}
            onPointerLeave={scheduleMegaClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden"
          >
            <div className="container liquid-panel mx-4 mb-4 max-h-[calc(100vh-5.5rem)] overflow-y-auto p-4 sm:mx-auto">
              <form onSubmit={onSearch} className="mb-3 flex items-center gap-2 rounded-lg border border-white/70 bg-white/58 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <button type="submit" aria-label="Submit search" className="text-[rgb(var(--fg-muted))] transition hover:text-[rgb(var(--primary))]">
                  <Search className="h-4 w-4" />
                </button>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search programs, universities..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[rgb(var(--fg-muted))]"
                />
              </form>
              {query.trim() && searchMatches.length > 0 && (
                <div className="mb-3 grid gap-1 rounded-lg border border-white/70 bg-white/48 p-2 dark:border-white/10 dark:bg-white/5">
                  {searchMatches.map((item) => (
                    <Link key={item.href} href={item.href} onClick={closeAllMenus} className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/54 dark:hover:bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.logo} alt={`${item.name} logo`} className="h-9 w-9 rounded-lg bg-white object-contain p-1 shadow-sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">{item.name}</span>
                        <span className="block truncate text-xs text-[rgb(var(--fg-muted))]">{item.meta}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              <div className="grid gap-1">
                {directLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={closeAllMenus} className="rounded-lg px-3 py-2.5 text-sm font-bold hover:bg-white/48 dark:hover:bg-white/5">
                    {link.label}
                  </Link>
                ))}
                {megaGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <details key={group.label} className="rounded-lg">
                      <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold text-[rgb(var(--fg-muted))] hover:bg-white/48 dark:hover:bg-white/5 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {group.label}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </summary>
                      <div className="grid gap-3 rounded-lg bg-white/48 p-3 text-[rgb(var(--fg))] dark:bg-white/5">
                        {group.categories.map((category) => (
                          <section key={`${group.label}-${category.label}`} className="grid gap-2">
                            <div>
                              <h3 className="text-sm font-extrabold">{category.label}</h3>
                              <p className="text-xs leading-5 text-[rgb(var(--fg-muted))]">{category.description}</p>
                            </div>
                            {category.columns.map((column) => (
                              <div key={`${group.label}-${category.label}-${column.title}`} className="grid gap-1">
                                <h4 className="text-xs font-extrabold text-[rgb(var(--fg-muted))]">{column.title}</h4>
                                {column.links.map((item) => (
                                  <Link key={`${group.label}-${category.label}-${column.title}-${item.href}-${item.label}`} href={item.href} onClick={closeAllMenus} className="rounded-lg px-2 py-1.5 text-sm font-semibold hover:bg-[rgb(var(--primary))]/10">
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            ))}
                          </section>
                        ))}
                      </div>
                    </details>
                  );
                })}
                {session?.user ? (
                  <div className="mt-2 grid gap-2">
                    <Link href={session.user.role === "ADMIN" || session.user.role === "EDITOR" ? "/admin" : "/community"} onClick={closeAllMenus} className="btn-ghost">
                      {session.user.name || session.user.email}
                    </Link>
                    <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="btn-primary">
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Link href="/login" onClick={closeAllMenus} className="btn-ghost">
                      Sign In
                    </Link>
                    <Link href="/signup" onClick={closeAllMenus} className="btn-primary">
                      Sign Up
                    </Link>
                  </div>
                )}
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-2">
                  Join WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
