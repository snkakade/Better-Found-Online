type PageSchemaProps = {
  name: string;
  path: string;
  description: string;
};

const siteUrl = "https://betterfoundonline.com";

export function PageSchema({ name, path, description }: PageSchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name,
          url: `${siteUrl}${path}`,
          description,
          isPartOf: {
            "@type": "WebSite",
            name: "Better Found Online",
            url: siteUrl,
          },
        }),
      }}
    />
  );
}
