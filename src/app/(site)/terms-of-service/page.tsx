import { buildMetadata } from "@/lib/seo";
import Page, { dynamic } from "../terms/page";

export { dynamic };

export const metadata = buildMetadata({
  title: "Terms of Service",
  description: "Terms that govern SathiCollege program search, admissions guidance, predictors, content, communities and student support.",
  path: "/terms-of-service"
});

export default Page;
