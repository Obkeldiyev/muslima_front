import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Muslima" },
      { name: "description", content: "About Muslima, a quiet literary publication." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-2xl px-6 md:px-10 py-20 md:py-28">
        <div className="eyebrow mb-6">Colophon</div>
        <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight text-ink">About the house.</h1>
        <div className="mt-10 prose-editorial">
          <p>
            Muslima is a small editorial publication for readers who prefer their writing quiet.
            We publish essays, gather them into topics, and print occasional books.
          </p>
          <p>
            We work without an algorithm and without a hurry. Everything you read here was
            chosen, edited, and set into type by hand.
          </p>
          <h2>What you'll find</h2>
          <p>
            Long-form essays on ideas we find worth returning to. Topics we've committed to as
            departments. Small editions of longer works, available to read at your pace.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
