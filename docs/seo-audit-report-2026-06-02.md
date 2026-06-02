# SathiCollege SEO Audit Report - 2026-06-02

## 1. SEO audit summary

Website: https://sathicollege.com

Platform: Custom Next.js app on Railway.

Business focus: SathiCollege global program search, university discovery, scholarships, student communities, predictors and admissions guidance.

Live crawl evidence before this fix:

- `robots.txt`: 200, references `https://sathicollege.com/sitemap.xml`.
- `sitemap.xml`: 200, 8,866,338 bytes, 39,013 URLs, 0 duplicate URLs, under Google sitemap limits.
- Sitemap groups: 30,021 course URLs, 8,733 college URLs, 58 exam URLs, 58 rank predictor URLs, 58 college predictor URLs, 22 blog URLs, 22 career URLs, 18 mock test URLs, 8 community URLs and core static pages.
- Google Search Console: URL-prefix property verified with HTML file. `/sitemap.xml` submitted successfully on 2026-06-02.

## 2. Critical issues

- Fixed: `/privacy-policy` and `/terms-of-service` were present in the sitemap while inheriting `noindex` metadata from legacy `/privacy` and `/terms` aliases.
- Fixed: Several public titles/descriptions were too India/engineering-focused for the current global program and university database.
- Fixed: Internal search/query variants such as `?q=`, `?search=`, `?quick=`, `?sort=`, `?maxTuition=` and `?requirement=` needed explicit `X-Robots-Tag: noindex, follow`.
- Fixed: Private surfaces needed stronger crawler headers in addition to robots disallow rules.

## 3. Completed fixes

- Added explicit route-level `X-Robots-Tag: noindex, nofollow` headers for `/admin`, `/api`, `/login` and `/signup`.
- Added middleware-level `X-Robots-Tag: noindex, follow` for low-value search/query result URLs.
- Made canonical policy pages indexable while keeping legacy aliases redirected.
- Updated SEO titles/descriptions for colleges, courses, careers, blog, community, about and contact pages to match global study-abroad data.
- Added long-lived immutable caching for `/assets/*` static media.
- Verified production build with `npm run build`.

## 4. Required access

- Bing Webmaster Tools account access is needed to register/import the verified Google Search Console property and submit the sitemap there.
- Google Analytics 4 and Google Tag Manager access are needed to create properties, connect Search Console and configure conversion events.
- DNS provider access is needed only if a Domain property is preferred over the already-verified URL-prefix property.
- Google Business Profile access is needed only if SathiCollege has a real public local office profile to manage.

## 5. Keyword map

| Page | Primary theme | Supporting keywords |
| --- | --- | --- |
| `/` | SathiCollege global program search | Sathi College, study abroad program finder, university search, scholarship search |
| `/search-program` | Course finder and program search | overseas programs, tuition filters, intakes, scholarships, eligibility |
| `/colleges` | Global universities and colleges | university search, college finder, USA universities, UK universities, Canada universities, Australia universities |
| `/courses` | Global courses and programs | study abroad programs, bachelor degree abroad, masters programs, MBA abroad, scholarship courses |
| `/careers` | Courses and career pathways | career pathways, courses by career, global education planning |
| `/exams` | Entrance exams | JEE Main, NEET UG, CAT, CUET, CLAT, exam guides |
| `/community` | Student communities | admissions community, study abroad community, scholarship guidance |
| `/blog` | Study abroad and admissions guides | scholarship tips, university comparison, course finder guides |
| `/about` | About SathiCollege | program search platform, admissions guidance |
| `/contact` | Admissions support contact | university shortlisting, scholarship guidance, counselling support |

## 6. Technical SEO checklist

- robots.txt: complete.
- sitemap.xml: complete and submitted to Google Search Console.
- canonical tags: present on audited major pages.
- HTTPS canonical domain: active on production.
- www/Railway duplicate host redirects: implemented in middleware.
- Admin/API/auth noindex: completed.
- Internal search duplicate noindex: completed.
- Structured data: Organization, WebSite, WebPage, Breadcrumb, ItemList, Course, Article, Occupation and software app schema exist where relevant.
- Sitemap conflict with noindex pages: fixed locally and ready for deployment.

## 7. On-page SEO checklist

- Unique titles for major pages: completed.
- Meta descriptions for major pages: completed.
- Canonicals for major pages: completed.
- JSON-LD on major pages: completed.
- Internal linking: present through navbar, page cards, tools and content sections.
- Image SEO: most images use descriptive alt text; continue improving imported college/program images as real assets become available.
- Thin content risk: imported detail pages depend on source data richness; prioritize enriching the highest-traffic countries/programs first.

## 8. Search engine registration status

- Google Search Console: verified.
- Google sitemap submission: completed, `/sitemap.xml` submitted successfully on 2026-06-02.
- Bing Webmaster Tools: pending account access or manual login/import.
- GA4/GTM: pending account access and measurement ID/container ID.

## 9. 30/60/90-day SEO plan

30 days:

- Monitor Search Console indexing, Pages, Sitemaps, Manual Actions, Security Issues and Core Web Vitals.
- Request indexing for homepage and the main category pages after deployment.
- Add GA4/GTM and track search, lead form, WhatsApp click, signup and chatbot events.
- Improve the highest-value college and course detail pages with richer original copy.

60 days:

- Build country landing pages for high-volume regions such as USA, UK, Canada, Australia, New Zealand, Germany and Ireland.
- Add FAQ content/schema for key program-search and admissions pages.
- Publish comparison and scholarship guide content based on Search Console query data.
- Start safe outreach for education directories, partner resources and scholarship pages.

90 days:

- Review indexed vs submitted URLs and prune/merge thin imported pages if needed.
- Expand internal links from blogs and guides into high-intent program/university pages.
- Improve Core Web Vitals based on field data.
- Build authority content around admissions timelines, intakes, tuition planning and scholarship eligibility.

## 10. Next actions

- Deploy the completed SEO fixes to Railway.
- Re-submit `/sitemap.xml` after deployment.
- Use Search Console URL Inspection for `/`, `/search-program`, `/colleges`, `/courses`, `/exams`, `/careers`, `/community` and `/blog`.
- Add Bing Webmaster Tools when account access is available.
- Add GA4/GTM when account access or measurement IDs are available.
