export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
}

export const defaultSEO: SEOProps = {
  title: "OneLink. Multiple lives.",
  description:
    "Share your links, files, and drops with one simple link. No more messy bios or multiple links.",
  image: "https://getonelink.io/og.png",
  url: "https://getonelink.io",
  type: "website",
  siteName: "OneLink",
  locale: "en",
};

export function generateSEOTags(props: SEOProps = {}) {
  const seo = { ...defaultSEO, ...props };
  const fullTitle = props.title
    ? `${props.title} | ${defaultSEO.siteName}`
    : defaultSEO.title;

  return {
    title: fullTitle,
    description: seo.description,
    image: seo.image,
    url: seo.url,
    type: seo.type,
    siteName: seo.siteName,
    locale: seo.locale,
  };
}
