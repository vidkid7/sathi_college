export const mockAssetBySlug: Record<string, string> = {
  "jee-mains-2026": "/assets/collegedost/mock/jee-mains.png",
  "jee-mains": "/assets/collegedost/mock/jee-mains.png",
  "jee-advanced": "/assets/collegedost/mock/jee-mains.png",
  "ap-eamcet": "/assets/collegedost/mock/ap-eamcet.jpeg",
  "ts-eamcet": "/assets/collegedost/mock/ts-eamcet.jpeg",
  kcet: "/assets/collegedost/mock/kcet.jpeg",
  mhtcet: "/assets/collegedost/mock/mht-cet.png",
  wbjee: "/assets/collegedost/mock/wbjee.png",
  keam: "/assets/collegedost/mock/keam.jpg",
  bitsat: "/assets/collegedost/mock/bitsat.jpeg",
  viteee: "/assets/collegedost/mock/viteee.jpeg",
  srmjee: "/assets/collegedost/mock/srmjee.webp",
  lpunest: "/assets/collegedost/mock/lpunest.png",
  kleee: "/assets/collegedost/mock/kleee.png",
  cuet: "/assets/collegedost/mock/cbse.png",
  cbse: "/assets/collegedost/mock/cbse.png",
  gat: "/assets/collegedost/mock/gat.png",
  nat: "/assets/collegedost/mock/nat.jpeg"
};

export function mockAsset(slug: string) {
  return mockAssetBySlug[slug] || "/assets/generated/visual-trophy.png";
}
