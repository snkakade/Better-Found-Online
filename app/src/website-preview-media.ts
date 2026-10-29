const files: Record<string, string> = {
  "service-pages/websites/charterx": "charterx",
  "service-pages/websites/say-vanilla": "say-vanilla",
  "service-pages/websites/tech-sales": "tech-sales",
  "service-pages/websites/dr-shweta": "dr-shweta",
  "service-pages/websites/hello-honey-bunny": "hello-honey-bunny",
  "work/say-vanilla-mobile": "say-vanilla-phone",
  "work/charterx-tablet": "charterx-tablet",
  "work/tech-sales-desktop-smooth": "tech-sales-desktop",
  "work/tech-sales-tablet-smooth": "tech-sales-tablet",
  "work/tech-sales-mobile-smooth": "tech-sales-phone",
};

export function websitePreviewMedia(source: string) {
  const name = files[source.replace(/^\/assets\//, "").replace(/\.(webm|mp4)$/, "")];
  if (!name) throw new Error(`Website preview has no compatible media: ${source}`);
  return { src: `/assets/website-previews/${name}.mp4`, poster: `/assets/website-previews/${name}.jpg` };
}
