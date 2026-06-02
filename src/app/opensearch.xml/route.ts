import { getSiteUrl } from "@/lib/seo";

export function GET() {
  const siteUrl = getSiteUrl();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>SathiCollege</ShortName>
  <Description>Search SathiCollege engineering colleges, exams, predictors, mock tests and counselling guides.</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image height="16" width="16" type="image/png">${siteUrl}/assets/brand/sathi-logo-glass-160.png</Image>
  <Url type="text/html" method="get" template="${siteUrl}/colleges?search={searchTerms}" />
</OpenSearchDescription>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/opensearchdescription+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400"
    }
  });
}
