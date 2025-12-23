import { Helmet } from "react-helmet-async";
import { generateSEOTags, type SEOProps } from "@/lib/seo";

interface SEOComponentProps extends SEOProps {
  children?: React.ReactNode;
}

export function SEO({ children, ...props }: SEOComponentProps) {
  const tags = generateSEOTags(props);
  const fullTitle = props.title
    ? `${props.title} | ${tags.siteName}`
    : tags.title;

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="title" content={fullTitle} />
        <meta name="description" content={tags.description} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content={tags.type} />
        <meta property="og:url" content={tags.url} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={tags.description} />
        <meta property="og:image" content={tags.image} />
        <meta property="og:site_name" content={tags.siteName} />
        <meta property="og:locale" content={tags.locale} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={tags.url} />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={tags.description} />
        <meta name="twitter:image" content={tags.image} />

        {/* Canonical URL */}
        <link rel="canonical" href={tags.url} />
      </Helmet>
      {children}
    </>
  );
}
