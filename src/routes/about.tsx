import { createFileRoute } from "@tanstack/react-router";
import { useSiteSettings } from "@/lib/site-settings";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  const settings = useSiteSettings();
  const about = settings.text.about;

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-2xl px-6 md:px-10 py-20 md:py-28">
        <div className="eyebrow mb-6">{about.kicker}</div>
        <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight text-ink">{about.title}</h1>
        <div className="mt-10 prose-editorial">
          {about.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
