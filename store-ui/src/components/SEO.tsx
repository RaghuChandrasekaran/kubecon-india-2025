import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  imageUrl?: string;
  image?: string; // Add alias for imageUrl
  url?: string;
  type?: string;
  schema?: object;
  preconnectUrls?: string[];
  noindex?: boolean; // Add noindex prop
  meta?: Array<{ name: string; content: string; }>;
}

/**
 * SEO component for dynamically setting meta tags for better search engine optimization
 * Implements proper Open Graph and Twitter Card meta tags for social sharing
 */
const SEO: React.FC<SEOProps> = ({
  title = 'E-Commerce Store - Quality Products at Great Prices',
  description = 'Shop our wide selection of products. Find great deals on electronics, fashion, home goods, and more.',
  keywords = 'e-commerce, online shopping, electronics, fashion, home goods',
  imageUrl = '/logo.png',
  image, // Destructure image prop
  url = window.location.href,
  type = 'website',
  schema,
  preconnectUrls = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net'
  ],
  noindex, // Destructure noindex prop
  meta, // Destructure meta prop
}) => {
  // Use image prop if provided, otherwise use imageUrl
  const finalImageUrl = image || imageUrl;
  
  // Convert relative image URL to absolute
  const absoluteImageUrl = finalImageUrl.startsWith('http') 
    ? finalImageUrl 
    : `${window.location.origin}${finalImageUrl}`;

  // Format the JSON-LD schema data
  const schemaData = schema 
    ? JSON.stringify(schema) 
    : JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": title,
        "description": description,
        "url": url,
      });

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Preconnect for external resources to improve performance */}
      {preconnectUrls.map((url, index) => (
        <link key={`preconnect-${index}`} rel="preconnect" href={url} crossOrigin="anonymous" />
      ))}

      {/* Font display optimization */}
      <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" />

      {/* Open Graph meta tags for social sharing (Facebook, LinkedIn) */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="E-Commerce Store" />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />

      {/* JSON-LD structured data */}
      <script type="application/ld+json">{schemaData}</script>

      {/* Additional meta tags from meta prop */}
      {meta && meta.map((m, index) => (
        <meta key={`meta-${index}`} name={m.name} content={m.content} />
      ))}

      {/* Noindex tag */}
      {noindex && <meta name="robots" content="noindex" />}
    </Helmet>
  );
};

export default SEO;