export const mockAssetBySlug: Record<string, string> = {
  "jee-mains-2026": "/assets/sathicollege/mock/jee-mains.png",
  "jee-mains": "/assets/sathicollege/mock/jee-mains.png",
  "jee-advanced": "/assets/sathicollege/mock/jee-mains.png",
  "ap-eamcet": "/assets/sathicollege/mock/ap-eamcet.jpeg",
  "ts-eamcet": "/assets/sathicollege/mock/ts-eamcet.jpeg",
  kcet: "/assets/sathicollege/mock/kcet.jpeg",
  mhtcet: "/assets/sathicollege/mock/mht-cet.png",
  wbjee: "/assets/sathicollege/mock/wbjee.png",
  keam: "/assets/sathicollege/mock/keam.jpg",
  bitsat: "/assets/sathicollege/mock/bitsat.jpeg",
  viteee: "/assets/sathicollege/mock/viteee.jpeg",
  srmjee: "/assets/sathicollege/mock/srmjee.webp",
  lpunest: "/assets/sathicollege/mock/lpunest.png",
  kleee: "/assets/sathicollege/mock/kleee.png",
  cuet: "/assets/sathicollege/mock/cbse.png",
  cbse: "/assets/sathicollege/mock/cbse.png",
  gat: "/assets/sathicollege/mock/gat.png",
  nat: "/assets/sathicollege/mock/nat.jpeg"
};

export function mockAsset(slug: string) {
  return mockAssetBySlug[slug] || "/assets/generated/visual-trophy.png";
}
