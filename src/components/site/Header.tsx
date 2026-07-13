import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/lib/site-settings";

export function SiteHeader() {
  const settings = useSiteSettings();
  const nav = [
    { to: "/essays", label: settings.text.nav.essays },
    { to: "/topics", label: settings.text.nav.topics },
    { to: "/books", label: settings.text.nav.books },
    { to: "/about", label: settings.text.nav.about },
  ] as const;
  const socials = settings.text.socials.filter((social) => social?.label?.trim() && social?.url?.trim());

  return (
    <header className="rule-b bg-background">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <div className="flex items-center justify-between py-5">
          <Link to="/" className="flex items-baseline gap-3">
            <span className="font-serif text-2xl tracking-tight text-ink">{settings.text.siteTitle}</span>
            <span className="eyebrow hidden sm:inline">{settings.text.siteSubtitle}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm text-ink-soft hover:text-ink transition-colors"
                activeProps={{ className: "text-sm text-ink" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {socials.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                {socials.map((social) => (
                  <a
                    key={`${social.label}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-rule px-2.5 py-1 text-[0.68rem] tracking-[0.14em] uppercase text-ink-soft transition-colors hover:border-ink hover:text-ink"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            )}
            <Link to="/admin" className="eyebrow hover:text-ink transition-colors">
              {settings.text.nav.studio}
            </Link>
          </div>
        </div>
        <div className="rule-t flex items-center justify-between py-2.5 text-[0.68rem] tracking-[0.14em] uppercase text-ink-soft">
          <span>{settings.text.issueLabel}</span>
          <span className="hidden sm:inline">{settings.text.issueTagline}</span>
          <span>{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
        </div>
      </div>
    </header>
  );
}
