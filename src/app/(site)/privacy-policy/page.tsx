import { buildMetadata } from "@/lib/seo";
import Page, { dynamic } from "../privacy/page";

export { dynamic };

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How SathiCollege collects, uses and protects student account, contact and admission guidance data.",
  path: "/privacy-policy"
});

export default Page;
