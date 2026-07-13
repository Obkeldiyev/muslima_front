import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type SiteSettings } from "./api";

// ─── Defaults (always complete) ───────────────────────────────────────────────
export const DEFAULT_SETTINGS: SiteSettings = {
  colors: {
    background: "oklch(0.975 0.012 85)",
    foreground: "oklch(0.19 0.008 60)",
    ink: "oklch(0.19 0.008 60)",
    inkSoft: "oklch(0.38 0.008 60)",
    rule: "oklch(0.86 0.012 75)",
    accent: "oklch(0.48 0.08 30)",
    accentForeground: "oklch(0.975 0.012 85)",
    card: "oklch(0.985 0.008 85)",
    cardForeground: "oklch(0.19 0.008 60)",
    secondary: "oklch(0.93 0.01 80)",
    secondaryForeground: "oklch(0.19 0.008 60)",
    muted: "oklch(0.94 0.01 80)",
    mutedForeground: "oklch(0.45 0.008 60)",
    border: "oklch(0.86 0.012 75)",
  },
  typography: {
    headingFont: "Fraunces, ui-serif, Georgia, serif",
    bodyFont: "Inter, ui-sans-serif, system-ui, sans-serif",
    paragraphSize: "16px",
    headingSize: "2.5rem",
  },
  borderRadius: {
    card: "1.5rem",
    button: "0.75rem",
    input: "0.5rem",
  },
  text: {
    siteTitle: "Muslima",
    siteSubtitle: "A Reading Room",
    issueLabel: "Issue No. 01",
    issueTagline: "Essays · Topics · Books",
    nav: {
      essays: "Essays",
      topics: "Topics",
      books: "Books",
      about: "About",
      studio: "Studio",
    },
    socials: [
      { label: "Telegram", url: "https://t.me/" },
      { label: "Instagram", url: "https://www.instagram.com/" },
    ],
    footer: {
      description:
        "A quiet publication for essays, books, and long-form reading. Published slowly, read slowly.",
      copyrightTemplate: "© {year} Muslima. All rights reserved.",
      tag: "Printed on the web",
    },
    home: {
      mastheadKicker: "The Current Issue",
      mastheadTitle: "Essays for the slow reader, published without hurry.",
      mastheadDescription:
        "Muslima gathers essays, books, and curated departments into one calm publication — designed to feel as deliberate as the work itself.",
      mastheadPills: [
        "Topics + essays + books",
        "Upload media in the studio",
        "Editorial cards and rich layouts",
      ],
      featuredKicker: "Featured",
      featuredTitle: "From the editors",
      recentKicker: "In this issue",
      recentTitle: "Recent essays",
      topicsKicker: "Departments",
      topicsTitle: "Topics we return to.",
      booksKicker: "Small editions",
      booksTitle: "Books from the house",
      moreKicker: "Also in the issue",
      moreTitle: "More reading",
      noContentMessage:
        "No content has been published yet. Enter the studio to begin.",
      seeAllLabel: "See all essays →",
    },
    about: {
      metaTitle: "About — Muslima",
      metaDescription: "About Muslima, a quiet literary publication.",
      kicker: "Colophon",
      title: "About the house.",
      paragraphs: [
        "Muslima is a small editorial publication for readers who prefer their writing quiet. We publish essays, gather them into topics, and print occasional books.",
        "We work without an algorithm and without a hurry. Everything you read here was chosen, edited, and set into type by hand.",
        "Long-form essays on ideas we find worth returning to. Topics we've committed to as departments. Small editions of longer works, available to read at your pace.",
      ],
    },
  },
};

// ─── Merge helper — always produces a complete SiteSettings object ─────────────
// Handles any partially-stored value from DB (missing fields, old shape, null)
export function mergeSettings(raw: unknown): SiteSettings {
  const d = DEFAULT_SETTINGS;
  // cast to any so we can do safe optional chaining without TS complaints
  const r = (raw ?? {}) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  return {
    colors: { ...d.colors, ...(r.colors ?? {}) },
    typography: { ...d.typography, ...(r.typography ?? {}) },
    borderRadius: { ...d.borderRadius, ...(r.borderRadius ?? {}) },
    text: {
      ...d.text,
      ...(r.text ?? {}),
      nav: { ...d.text.nav, ...(r.text?.nav ?? {}) },
      socials: Array.isArray(r.text?.socials)
        ? r.text.socials
            .filter((entry: { label?: unknown; url?: unknown } | null | undefined) => entry && (entry.label || entry.url))
            .map((entry: { label?: unknown; url?: unknown }) => ({
              label: typeof entry?.label === "string" ? entry.label : "",
              url: typeof entry?.url === "string" ? entry.url : "",
            }))
        : d.text.socials,
      // handle old shape: text.footerDescription / text.footerCopyright / text.footerTag
      footer: {
        description:
          r.text?.footer?.description ??
          r.text?.footerDescription ??
          d.text.footer.description,
        copyrightTemplate:
          r.text?.footer?.copyrightTemplate ??
          r.text?.footerCopyright ??
          d.text.footer.copyrightTemplate,
        tag: r.text?.footer?.tag ?? r.text?.footerTag ?? d.text.footer.tag,
      },
      home: { ...d.text.home, ...(r.text?.home ?? {}) },
      about: {
        ...d.text.about,
        ...(r.text?.about ?? {}),
        paragraphs:
          Array.isArray(r.text?.about?.paragraphs)
            ? r.text.about.paragraphs
            : d.text.about.paragraphs,
      },
    },
  };
}

// ─── Apply settings to CSS variables ─────────────────────────────────────────
export function applySettings(raw: unknown): void {
  const s = mergeSettings(raw);
  const root = document.documentElement;
  const c = s.colors;
  const t = s.typography;
  const r = s.borderRadius;

  root.style.setProperty("--background", c.background);
  root.style.setProperty("--paper", c.background);
  root.style.setProperty("--foreground", c.foreground);
  root.style.setProperty("--ink", c.ink);
  root.style.setProperty("--ink-soft", c.inkSoft);
  root.style.setProperty("--rule", c.rule);
  root.style.setProperty("--accent", c.accent);
  root.style.setProperty("--accent-foreground", c.accentForeground);
  root.style.setProperty("--card", c.card);
  root.style.setProperty("--card-foreground", c.cardForeground);
  root.style.setProperty("--secondary", c.secondary);
  root.style.setProperty("--secondary-foreground", c.secondaryForeground);
  root.style.setProperty("--muted", c.muted);
  root.style.setProperty("--muted-foreground", c.mutedForeground);
  root.style.setProperty("--border", c.border);

  root.style.setProperty("--font-serif", t.headingFont);
  root.style.setProperty("--font-sans", t.bodyFont);
  root.style.setProperty("--body-size", t.paragraphSize);
  root.style.setProperty("--heading-size", t.headingSize);

  root.style.setProperty("--radius-card", r.card);
  root.style.setProperty("--radius-button", r.button);
  root.style.setProperty("--radius-input", r.input);
}

// ─── Context ──────────────────────────────────────────────────────────────────
const Ctx = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery({
    queryKey: ["public", "site-settings"],
    queryFn: api.publicApi.siteSettings,
    staleTime: 5 * 60 * 1000,
  });

  // Always merge — safe even when data is undefined (loading) or partial (old DB)
  const settings = mergeSettings(data);

  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}

export function useSiteSettings(): SiteSettings {
  return useContext(Ctx);
}
