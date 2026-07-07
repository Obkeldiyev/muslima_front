import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/lib/site-settings";

export function SiteFooter() {
  const settings = useSiteSettings();
  const copyright = settings.text.footer.copyrightTemplate.replace(
    /\{year\}/g,
    String(new Date().getFullYear()),
  );

  return (
    <footer className="rule-t mt-24 bg-background">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-serif text-2xl text-ink">{settings.text.siteTitle}</div>
          <p className="mt-3 max-w-md text-sm text-ink-soft leading-relaxed">
            {settings.text.footer.description}
          </p>
        </div>
        <div>
          <div className="eyebrow mb-3">Read</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/essays" className="hover:text-ink text-ink-soft">{settings.text.nav.essays}</Link></li>
            <li><Link to="/topics" className="hover:text-ink text-ink-soft">{settings.text.nav.topics}</Link></li>
            <li><Link to="/books" className="hover:text-ink text-ink-soft">{settings.text.nav.books}</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-3">The House</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-ink text-ink-soft">{settings.text.nav.about}</Link></li>
            <li><Link to="/admin" className="hover:text-ink text-ink-soft">{settings.text.nav.studio}</Link></li>
          </ul>
        </div>
      </div>
      <div className="rule-t">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10 py-6 flex items-center justify-between text-xs text-ink-soft">
          <span>{copyright}</span>
          <span className="eyebrow">{settings.text.footer.tag}</span>
        </div>
      </div>
    </footer>
  );
}
