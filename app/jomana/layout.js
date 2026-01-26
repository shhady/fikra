export const metadata = {
  title: "JOMANA | כרטיס ביקור דיגיטלי",
  description: "כרטיס ביקור דיגיטלי יוקרתי לסטודיו JOMANA לעיצוב פנים והום סטיילינג.",
  alternates: {
    canonical: "/jomana",
  },
  openGraph: {
    title: "JOMANA | עיצוב פנים והום סטיילינג",
    description: "כרטיס ביקור דיגיטלי יוקרתי לסטודיו JOMANA לעיצוב פנים והום סטיילינג.",
    locale: "he_IL",
    type: "website",
    url: "https://www.leadpage.co/jomana",
    images: [
      {
        // Place the 1200x600 image here: /public/jomana/og-1200x600.png
        url: "/jomana/og-1200x600.png",
        width: 1200,
        height: 600,
        alt: "JOMANA Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JOMANA | עיצוב פנים והום סטיילינג",
    description: "כרטיס ביקור דיגיטלי יוקרתי לסטודיו JOMANA לעיצוב פנים והום סטיילינג.",
    images: ["/jomana/og-1200x600.png"],
  },
};

import "../globals.css";

export default function JomanaLayout({ children }) {
  const baseUrl = "https://www.leadpage.co";
  const pageUrl = `${baseUrl}/jomana`;
  const logoUrl = `${baseUrl}/jomana-logo-transparent.png`;
  const ogImageUrl = `${baseUrl}/jomana/og-1200x600.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${pageUrl}#organization`,
        name: "JOMANA Studio",
        url: pageUrl,
        logo: logoUrl,
        telephone: "+972546849896",
        email: "JOMANA_AN@HOTMAIL.COM",
      },
      {
        "@type": "WebSite",
        "@id": `${pageUrl}#website`,
        url: pageUrl,
        name: "JOMANA",
        publisher: { "@id": `${pageUrl}#organization` },
        inLanguage: "he-IL",
      },
      {
        "@type": "ImageObject",
        "@id": `${pageUrl}#primaryimage`,
        url: ogImageUrl,
        width: 1200,
        height: 600,
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "JOMANA | כרטיס ביקור דיגיטלי",
        isPartOf: { "@id": `${pageUrl}#website` },
        about: { "@id": `${pageUrl}#organization` },
        primaryImageOfPage: { "@id": `${pageUrl}#primaryimage` },
        inLanguage: "he-IL",
      },
    ],
  };

  return (
    <html lang="he" dir="rtl">
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

