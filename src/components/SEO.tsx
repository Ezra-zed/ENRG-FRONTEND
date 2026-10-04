import { useEffect } from "react";

const SITE_URL = "https://enrg.co.in";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

type SEOProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
};

export function SEO({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    const canonicalUrl = new URL(path, SITE_URL).toString();

    document.title = title;

    const setMeta = (
      selector: string,
      attribute: "name" | "property",
      key: string,
      content: string
    ) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }

      element.setAttribute("content", content);
    };

    const setLink = (rel: string, href: string) => {
      let element = document.head.querySelector<HTMLLinkElement>(
        `link[rel="${rel}"]`
      );

      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }

      element.setAttribute("href", href);
    };

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow"
    );

    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      description
    );
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[property="og:image"]', "property", "og:image", image);
    setMeta(
      'meta[property="og:site_name"]',
      "property",
      "og:site_name",
      "ENRG"
    );

    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
      description
    );
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", image);

    setLink("canonical", canonicalUrl);
    const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "ENRG",
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
    },
    {
      "@type": "WebSite",
      name: "ENRG",
      url: SITE_URL,
    },
  ],
};

let schemaElement = document.head.querySelector(
  'script[type="application/ld+json"]'
);

if (!schemaElement) {
  schemaElement = document.createElement("script");
  schemaElement.setAttribute("type", "application/ld+json");
  document.head.appendChild(schemaElement);
}

schemaElement.textContent = JSON.stringify(schema);
  }, [title, description, path, image, noindex]);

  return null;
}
