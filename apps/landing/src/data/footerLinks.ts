export interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface FooterSectionData {
  title: string;
  links: FooterLink[];
}

export function getFooterSections(
  t: (key: string) => string,
): FooterSectionData[] {
  return [
    {
      title: t("landing.footer.product"),
      links: [
        {
          label: t("landing.footer.features"),
          href: "#features",
          isExternal: false,
        },
        {
          label: t("landing.footer.pricing"),
          href: "#pricing",
          isExternal: false,
        },
      ],
    },
    {
      title: t("landing.footer.company"),
      links: [
        {
          label: t("landing.footer.contact"),
          href: "mailto:support@getonelink.app",
          isExternal: true,
        },
      ],
    },
    {
      title: t("landing.footer.legal"),
      links: [
        {
          label: t("landing.footer.privacy"),
          href: "/privacy",
          isExternal: false,
        },
        {
          label: t("landing.footer.terms"),
          href: "/terms",
          isExternal: false,
        },
      ],
    },
    {
      title: t("landing.footer.app"),
      links: [
        {
          label: t("landing.footer.signIn"),
          href: "https://app.getonelink.io/auth",
          isExternal: true,
        },
        {
          label: t("landing.footer.signUp"),
          href: "https://app.getonelink.io/auth",
          isExternal: true,
        },
      ],
    },
  ];
}
