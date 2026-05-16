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
  siteName: "sathicollege",
  shortName: "Sathi",
  tagline: "India's leading community for engineering aspirants",
  description:
    "Join sathicollege, India's leading community for 12th class graduates. Get up-to-date info on JEE, EAMCET, KCET, MHT-CET, KEAM, TNEA, WBJEE — exam tips, counselling, branch selection, cutoffs and results.",
  logoUrl: "/assets/brand/sathi-logo.png",
  faviconUrl: "/assets/brand/sathi-logo.png",
  email: "info@sathicollege.in",
  phone: "+919281014900",
  whatsapp: "919281014900",
  address: "India",
  social: {
    instagram: "https://instagram.com/sathicollege",
    youtube: "https://youtube.com/@sathicollege",
    telegram: "https://t.me/sathicollege"
  },
  hero: {
    eyebrow: "India's #1 community for engineering aspirants",
    titleLine1: "Join",
    titleHighlight: "sathicollege",
    titleLine2: "India's leading community for 12th class graduates",
    description:
      "Get up-to-date information on JEE, EAMCET, exam tips, engineering counselling, branch selection, cutoffs, results and more.",
    primaryCtaLabel: "Join WhatsApp",
    primaryCtaHref: "whatsapp",
    secondaryCtaLabel: "Predict Rank Now",
    secondaryCtaHref: "/rank-predictor",
    stats: [
      { value: "3,00,000+", label: "Students" },
      { value: "3,000+", label: "Colleges Covered" }
    ]
  },
  about: {
    title: "Get trustworthy career guidance",
    body:
      "After completing intermediate / 12th class, you're in one of the most crucial stages of your life. You have to make important decisions while dealing with confusion. With thousands of websites available, it's hard to know who to trust. sathicollege is here to help you make the right choices for your future."
  },
  footer: {
    aboutText:
      "India's leading community for 12th class graduates. Trustworthy guidance for engineering admissions and counselling.",
    columns: [
      {
        title: "Engineering Colleges",
        links: [
          { label: "All Colleges", href: "/colleges" },
          { label: "Compare Colleges", href: "/college-comparison" },
          { label: "Government", href: "/colleges?type=Government" },
          { label: "Private", href: "/colleges?type=Private" }
        ]
      },
      {
        title: "Rank Predictor",
        links: [
          { label: "JEE Mains", href: "/rank-predictor/jee-main" },
          { label: "JEE Advanced", href: "/rank-predictor/jee-advanced" },
          { label: "AP EAMCET", href: "/rank-predictor/ap-eamcet" },
          { label: "TS EAMCET", href: "/rank-predictor/ts-eamcet" },
          { label: "KCET", href: "/rank-predictor/kcet" },
          { label: "MHT CET", href: "/rank-predictor/mht-cet" },
          { label: "KEAM", href: "/rank-predictor/keam" },
          { label: "TNEA", href: "/rank-predictor/tnea" },
          { label: "WBJEE", href: "/rank-predictor/wbjee" }
        ]
      },
      {
        title: "College Predictor",
        links: [
          { label: "JEE Mains/Advanced", href: "/college-predictor/jee-main" },
          { label: "AP EAMCET", href: "/college-predictor/ap-eamcet" },
          { label: "TS EAMCET", href: "/college-predictor/ts-eamcet" },
          { label: "MHT CET", href: "/college-predictor/mht-cet" },
          { label: "Karnataka CET", href: "/college-predictor/kcet" },
          { label: "KEAM", href: "/college-predictor/keam" },
          { label: "TNEA", href: "/college-predictor/tnea" },
          { label: "WBJEE", href: "/college-predictor/wbjee" }
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
    copyright: `Copyright © ${new Date().getFullYear()} sathicollege. All Rights Reserved.`,
    bottomNote: "Made with ♥ for engineering aspirants in India."
  },
  seo: {
    metaTitle: "SathiCollege (Sathi College) | Engineering Rank Predictor, College Predictor & Admissions",
    metaDescription:
      "SathiCollege helps engineering aspirants with rank predictors, college predictors, mock tests, student communities and counselling guidance.",
    keywords: [
      "SathiCollege", "Sathi College", "sathicollege", "sathi college", "sathicollage",
      "JEE", "EAMCET", "KCET", "MHT CET", "KEAM", "TNEA", "WBJEE",
      "rank predictor", "college predictor", "engineering counselling", "sathicollege"
    ],
    ogImage: "/assets/generated/hero-campus-generated.png"
  }
};
