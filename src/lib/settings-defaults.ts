// Pure, framework-free defaults so that seed scripts and server code
// can both import this without pulling `server-only`.

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export type SiteSettings = {
  siteName: string;
  shortName: string;
  tagline: string;
  description: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  social: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    telegram?: string;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleHighlight: string;
    titleLine2: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    stats: { value: string; label: string }[];
  };
  about: {
    title: string;
    body: string;
  };
  footer: {
    aboutText: string;
    columns: FooterColumn[];
    copyright: string;
    bottomNote: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage: string;
  };
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "SathiCollege",
  shortName: "Sathi",
  tagline: "Global college, university and program discovery",
  description:
    "Use SathiCollege (Sathi College) to search programs, universities, scholarships, tuition, intakes and eligibility requirements across the USA, UK, Australia, Canada and other study destinations.",
  logoUrl: "/assets/brand/sathi-logo-glass-160.webp",
  faviconUrl: "/assets/brand/sathi-logo-glass-160.png",
  email: "info@sathicollege.in",
  phone: "+919281014900",
  whatsapp: "919281014900",
  address: "Global",
  social: {
    instagram: "https://instagram.com/sathicollege",
    youtube: "https://youtube.com/@sathicollege",
    telegram: "https://t.me/sathicollege"
  },
  hero: {
    eyebrow: "Global program search for study abroad decisions",
    titleLine1: "Join",
    titleHighlight: "SathiCollege",
    titleLine2: "Global university and program discovery",
    description:
      "Search programs, universities, tuition, scholarships, eligibility requirements and intakes across top study destinations.",
    primaryCtaLabel: "Join WhatsApp",
    primaryCtaHref: "whatsapp",
    secondaryCtaLabel: "Predict Rank Now",
    secondaryCtaHref: "/rank-predictor",
    stats: [
      { value: "3,00,000+", label: "Students" },
      { value: "3,000+", label: "Universities Covered" }
    ]
  },
  about: {
    title: "Get trustworthy career guidance",
    body:
      "Choosing a university, country, program and scholarship path is a high-stakes decision. SathiCollege (Sathi College) brings searchable program, university, tuition, intake and eligibility data into one clear experience so students can compare options with confidence."
  },
  footer: {
    aboutText:
      "SathiCollege (Sathi College) helps students search global programs, compare universities, check scholarships, review eligibility and plan study abroad decisions.",
    columns: [
      {
        title: "Study Destinations",
        links: [
          { label: "USA Programs", href: "/search-program?country=United%20States%20of%20America" },
          { label: "UK Programs", href: "/search-program?country=United%20Kingdom" },
          { label: "Australia Programs", href: "/search-program?country=Australia" },
          { label: "Canada Programs", href: "/search-program?country=Canada" }
        ]
      },
      {
        title: "Program Search",
        links: [
          { label: "All Programs", href: "/search-program" },
          { label: "Scholarships", href: "/search-program?quick=scholarship" },
          { label: "Application Fee Waiver", href: "/search-program?quick=fee-waiver" },
          { label: "STEM Programs", href: "/search-program?quick=stem" },
          { label: "Online Programs", href: "/search-program?quick=online" }
        ]
      },
      {
        title: "Requirements",
        links: [
          { label: "IELTS", href: "/search-program?requirement=ielts" },
          { label: "TOEFL", href: "/search-program?requirement=toefl" },
          { label: "PTE", href: "/search-program?requirement=pte" },
          { label: "GRE", href: "/search-program?requirement=gre" },
          { label: "English Waiver", href: "/search-program?requirement=without-english" }
        ]
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Blog", href: "/blog" },
          { label: "Community", href: "/community" },
          { label: "Scholarship", href: "/scholarship" },
          { label: "Contact", href: "/contact" },
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Terms of Service", href: "/terms-of-service" }
        ]
      }
    ],
    copyright: `Copyright © ${new Date().getFullYear()} SathiCollege. All Rights Reserved.`,
    bottomNote: "Built for students comparing global study options."
  },
  seo: {
    metaTitle: "SathiCollege Official Website | Course Finder",
    metaDescription:
      "SathiCollege (Sathi College) official website for global course search, university comparison, scholarships, tuition, intakes, eligibility and admission planning.",
    keywords: [
      "SathiCollege", "Sathi College", "SathiCollege official website", "Sathi College official website",
      "sathicollege", "sathi college", "sathi", "sathi college official", "sathicollege official",
      "sathi college course finder", "sathicollage",
      "study abroad", "program search", "university search", "course finder", "scholarships",
      "USA universities", "UK universities", "Australia universities", "Canada universities", "IELTS waiver"
    ],
    ogImage: "/assets/generated/hero-campus-generated.png"
  }
};
