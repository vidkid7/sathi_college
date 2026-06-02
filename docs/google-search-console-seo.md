# Google Search Console and Indexing

This project is prepared for Google Search Console verification and indexing, but final registration must be done from the site owner's Google account.

## 1. Set the production URL

Set these Railway/production environment variables to the public canonical domain:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
```

Use the same domain that will be added in Google Search Console.

## 2. Add Google ownership verification

In Google Search Console, add the site as a URL-prefix property or domain property.

For the HTML meta tag method, copy only the verification token value from:

```html
<meta name="google-site-verification" content="TOKEN_HERE" />
```

Set one of these env vars in Railway:

```bash
GOOGLE_SITE_VERIFICATION=TOKEN_HERE
```

or:

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=TOKEN_HERE
```

Redeploy, then verify the property in Search Console.

## 3. Submit sitemaps

Submit this sitemap in Google Search Console:

```text
https://your-domain.com/sitemap.xml
```

The sitemap includes public static pages, colleges, exams, courses, careers, blog categories/posts, community posts, imported universities, and imported programs from the local database.

## 4. Request indexing

After verification:

1. Open URL Inspection in Search Console.
2. Test important URLs such as `/`, `/search-program`, `/courses`, `/colleges`, and high-value course/university pages.
3. Request indexing for priority pages.

Google decides whether and when to index. Technical SEO improves crawlability and understanding, but ranking depends on content quality, authority, backlinks, user behavior, speed, and competition.

## 5. Keep SEO healthy

- Keep every public page reachable through internal links.
- Avoid duplicate thin pages with only query parameters.
- Keep titles/descriptions specific to each page.
- Publish useful original guides in `/blog`.
- Keep sitemap URLs canonical and returning `200`.
- Re-submit the sitemap after large imports.
