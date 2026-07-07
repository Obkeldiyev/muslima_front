import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api, type SiteSettings } from "@/lib/api";
import { mergeSettings, applySettings } from "@/lib/site-settings";
import { toast } from "sonner";
import { PrimaryButton, GhostButton } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});

type Tab = "colors" | "typography" | "text";

// ─── Font options ─────────────────────────────────────────────────────────────
const HEADING_FONTS = [
  { label: "Fraunces (default)", value: "Fraunces, ui-serif, Georgia, serif" },
  { label: "Georgia", value: "Georgia, ui-serif, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Palatino", value: "Palatino, 'Palatino Linotype', ui-serif, serif" },
  { label: "Garamond", value: "Garamond, 'EB Garamond', ui-serif, serif" },
  { label: "Baskerville", value: "Baskerville, 'Baskerville Old Face', ui-serif, serif" },
];

const BODY_FONTS = [
  { label: "Inter (default)", value: "Inter, ui-sans-serif, system-ui, sans-serif" },
  { label: "System default", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Georgia (serif body)", value: "Georgia, ui-serif, serif" },
];

// ─── Slider config ────────────────────────────────────────────────────────────
// Body size: 12–24 px
function pxToNum(v: string) { return parseInt(v) || 16; }
function numToPx(n: number) { return `${n}px`; }

// Heading size: 1.5–5 rem (stored as rem)
function remToNum(v: string) { return parseFloat(v) || 2.5; }
function numToRem(n: number) { return `${n}rem`; }

// Radius: 0–2 rem
function radiusToNum(v: string) {
  if (v === "0" || v === "0px") return 0;
  return parseFloat(v) || 0;
}
function numToRadius(n: number) { return n === 0 ? "0" : `${n}rem`; }

// ─── Main ─────────────────────────────────────────────────────────────────────
function SettingsAdmin() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("colors");

  const { data: fetched, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: api.admin.siteSettings.get,
  });

  const [draft, setDraft] = useState<SiteSettings>(() => mergeSettings(null));

  useEffect(() => {
    if (fetched) setDraft(mergeSettings(fetched));
  }, [fetched]);

  // Live preview while editing
  useEffect(() => { applySettings(draft); }, [draft]);

  const save = useMutation({
    mutationFn: (s: SiteSettings) => api.admin.siteSettings.update(s),
    onSuccess: (saved) => {
      const m = mergeSettings(saved);
      qc.setQueryData(["admin", "settings"], m);
      qc.invalidateQueries({ queryKey: ["public", "site-settings"] });
      setDraft(m);
      applySettings(m);
      toast.success("Saved!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function patchColors(patch: Partial<SiteSettings["colors"]>) {
    setDraft((d) => ({ ...d, colors: { ...d.colors, ...patch } }));
  }
  function patchTypography(patch: Partial<SiteSettings["typography"]>) {
    setDraft((d) => ({ ...d, typography: { ...d.typography, ...patch } }));
  }
  function patchRadius(patch: Partial<SiteSettings["borderRadius"]>) {
    setDraft((d) => ({ ...d, borderRadius: { ...d.borderRadius, ...patch } }));
  }
  function patchText(patch: Partial<SiteSettings["text"]>) {
    setDraft((d) => ({ ...d, text: { ...d.text, ...patch } }));
  }
  function patchNav(patch: Partial<SiteSettings["text"]["nav"]>) {
    setDraft((d) => ({ ...d, text: { ...d.text, nav: { ...d.text.nav, ...patch } } }));
  }
  function patchFooter(patch: Partial<SiteSettings["text"]["footer"]>) {
    setDraft((d) => ({ ...d, text: { ...d.text, footer: { ...d.text.footer, ...patch } } }));
  }
  function patchHome(patch: Partial<SiteSettings["text"]["home"]>) {
    setDraft((d) => ({ ...d, text: { ...d.text, home: { ...d.text.home, ...patch } } }));
  }
  function patchAbout(patch: Partial<SiteSettings["text"]["about"]>) {
    setDraft((d) => ({ ...d, text: { ...d.text, about: { ...d.text.about, ...patch } } }));
  }

  if (isLoading) return <div className="p-10 text-ink-soft">Loading…</div>;

  const TABS: { id: Tab; label: string }[] = [
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Fonts & Style" },
    { id: "text", label: "Texts" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-8 rule-b pb-6">
        <div>
          <div className="eyebrow mb-1">Configuration</div>
          <h1 className="font-serif text-3xl text-ink">Site settings</h1>
        </div>
        <PrimaryButton onClick={() => save.mutate(draft)} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save changes"}
        </PrimaryButton>
      </div>

      {/* Tabs */}
      <div className="flex mb-8 border border-rule rounded-sm overflow-hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              "flex-1 py-2.5 text-sm transition-colors " +
              (tab === t.id ? "bg-ink text-paper" : "bg-background text-ink-soft hover:text-ink")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── COLORS ── */}
      {tab === "colors" && (
        <div className="space-y-3">
          <p className="text-sm text-ink-soft mb-5">
            Click the color box or the 🎨 button to pick a color. Changes show instantly.
          </p>
          {([
            ["background", "Background", "Page background"],
            ["ink",        "Main text",  "Headings and body text"],
            ["inkSoft",    "Soft text",  "Labels, captions, secondary text"],
            ["accent",     "Accent",     "Links, hover effects, active items"],
            ["rule",       "Lines",      "Borders and dividers"],
            ["card",       "Card",       "Card and panel backgrounds"],
            ["secondary",  "Section tint","Subtle background sections"],
            ["muted",      "Muted",      "Input fields, disabled areas"],
          ] as [keyof SiteSettings["colors"], string, string][]).map(([key, label, hint]) => (
            <ColorRow
              key={key}
              label={label}
              hint={hint}
              value={draft.colors[key]}
              onChange={(v) => patchColors({ [key]: v })}
            />
          ))}
          <div className="pt-4">
            <GhostButton onClick={() => setDraft((d) => ({ ...d, colors: mergeSettings(null).colors }))}>
              Reset to default colors
            </GhostButton>
          </div>
        </div>
      )}

      {/* ── FONTS & STYLE ── */}
      {tab === "typography" && (
        <div className="space-y-8">

          {/* Fonts */}
          <section className="space-y-5">
            <h2 className="font-serif text-xl text-ink">Fonts</h2>

            <div>
              <Label text="Heading font" hint="Used for titles" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {HEADING_FONTS.map((f) => (
                  <FontCard
                    key={f.value}
                    label={f.label}
                    fontFamily={f.value}
                    selected={draft.typography.headingFont === f.value}
                    onSelect={() => patchTypography({ headingFont: f.value })}
                    preview="Aa Bb Cc"
                  />
                ))}
              </div>
            </div>

            <div>
              <Label text="Body font" hint="Used for paragraphs" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {BODY_FONTS.map((f) => (
                  <FontCard
                    key={f.value}
                    label={f.label}
                    fontFamily={f.value}
                    selected={draft.typography.bodyFont === f.value}
                    onSelect={() => patchTypography({ bodyFont: f.value })}
                    preview="The quick brown fox"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Sizes */}
          <section className="rule-t pt-6 space-y-6">
            <h2 className="font-serif text-xl text-ink">Text size</h2>

            <SliderRow
              label="Body text size"
              hint="How big the regular text is"
              min={12} max={24} step={1}
              value={pxToNum(draft.typography.paragraphSize)}
              displayValue={draft.typography.paragraphSize}
              onChange={(n) => patchTypography({ paragraphSize: numToPx(n) })}
              leftLabel="Small" rightLabel="Large"
            />

            <SliderRow
              label="Heading size"
              hint="How big the page titles are"
              min={1.5} max={5} step={0.25}
              value={remToNum(draft.typography.headingSize)}
              displayValue={draft.typography.headingSize}
              onChange={(n) => patchTypography({ headingSize: numToRem(n) })}
              leftLabel="Small" rightLabel="Large"
            />
          </section>

          {/* Roundness */}
          <section className="rule-t pt-6 space-y-6">
            <h2 className="font-serif text-xl text-ink">Corner roundness</h2>

            <SliderRow
              label="Cards"
              hint="Topic cards, book cards, panels"
              min={0} max={2} step={0.125}
              value={radiusToNum(draft.borderRadius.card)}
              displayValue={draft.borderRadius.card}
              onChange={(n) => patchRadius({ card: numToRadius(n) })}
              leftLabel="Sharp" rightLabel="Very round"
            />

            <SliderRow
              label="Buttons"
              hint="All clickable buttons"
              min={0} max={2} step={0.125}
              value={radiusToNum(draft.borderRadius.button)}
              displayValue={draft.borderRadius.button}
              onChange={(n) => patchRadius({ button: numToRadius(n) })}
              leftLabel="Sharp" rightLabel="Very round"
            />

            <SliderRow
              label="Inputs"
              hint="Text fields and dropdowns"
              min={0} max={2} step={0.125}
              value={radiusToNum(draft.borderRadius.input)}
              displayValue={draft.borderRadius.input}
              onChange={(n) => patchRadius({ input: numToRadius(n) })}
              leftLabel="Sharp" rightLabel="Very round"
            />
          </section>

          <div className="rule-t pt-4">
            <GhostButton
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  typography: mergeSettings(null).typography,
                  borderRadius: mergeSettings(null).borderRadius,
                }))
              }
            >
              Reset to defaults
            </GhostButton>
          </div>
        </div>
      )}

      {/* ── TEXTS ── */}
      {tab === "text" && (
        <div className="space-y-10">

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-ink">Site name</h2>
            <TextRow label="Site title" hint="In the header and footer" value={draft.text.siteTitle} onChange={(v) => patchText({ siteTitle: v })} />
            <TextRow label="Subtitle" hint="Small label next to the title" value={draft.text.siteSubtitle} onChange={(v) => patchText({ siteSubtitle: v })} />
            <TextRow label="Issue label" hint="Thin bar in the header" value={draft.text.issueLabel} onChange={(v) => patchText({ issueLabel: v })} />
            <TextRow label="Issue tagline" hint="Thin bar in the header" value={draft.text.issueTagline} onChange={(v) => patchText({ issueTagline: v })} />
          </section>

          <section className="rule-t pt-6 space-y-3">
            <h2 className="font-serif text-xl text-ink">Navigation</h2>
            {(["essays", "topics", "books", "about", "studio"] as const).map((key) => (
              <TextRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} hint="" value={draft.text.nav[key]} onChange={(v) => patchNav({ [key]: v })} />
            ))}
          </section>

          <section className="rule-t pt-6 space-y-3">
            <h2 className="font-serif text-xl text-ink">Footer</h2>
            <TextRow label="Description" hint="" value={draft.text.footer.description} onChange={(v) => patchFooter({ description: v })} multiline />
            <TextRow label="Copyright" hint="Use {year} for the current year" value={draft.text.footer.copyrightTemplate} onChange={(v) => patchFooter({ copyrightTemplate: v })} />
            <TextRow label="Footer tag" hint="Bottom right of the footer" value={draft.text.footer.tag} onChange={(v) => patchFooter({ tag: v })} />
          </section>

          <section className="rule-t pt-6 space-y-3">
            <h2 className="font-serif text-xl text-ink">Home page</h2>
            <TextRow label="Hero headline" hint="The big title" value={draft.text.home.mastheadTitle} onChange={(v) => patchHome({ mastheadTitle: v })} multiline />
            <TextRow label="Hero description" hint="Paragraph below the title" value={draft.text.home.mastheadDescription} onChange={(v) => patchHome({ mastheadDescription: v })} multiline />
            <TextRow label="Hero small label" hint="Tiny label above the title" value={draft.text.home.mastheadKicker} onChange={(v) => patchHome({ mastheadKicker: v })} />
            <TextRow label="Hero pills" hint="One per line" value={draft.text.home.mastheadPills.join("\n")} onChange={(v) => patchHome({ mastheadPills: v.split("\n").map((l) => l.trim()).filter(Boolean) })} multiline />
            <TextRow label="Featured label" hint="" value={draft.text.home.featuredKicker} onChange={(v) => patchHome({ featuredKicker: v })} />
            <TextRow label="Featured title" hint="" value={draft.text.home.featuredTitle} onChange={(v) => patchHome({ featuredTitle: v })} />
            <TextRow label="Recent essays label" hint="" value={draft.text.home.recentKicker} onChange={(v) => patchHome({ recentKicker: v })} />
            <TextRow label="Recent essays title" hint="" value={draft.text.home.recentTitle} onChange={(v) => patchHome({ recentTitle: v })} />
            <TextRow label="Topics label" hint="" value={draft.text.home.topicsKicker} onChange={(v) => patchHome({ topicsKicker: v })} />
            <TextRow label="Topics title" hint="" value={draft.text.home.topicsTitle} onChange={(v) => patchHome({ topicsTitle: v })} />
            <TextRow label="Books label" hint="" value={draft.text.home.booksKicker} onChange={(v) => patchHome({ booksKicker: v })} />
            <TextRow label="Books title" hint="" value={draft.text.home.booksTitle} onChange={(v) => patchHome({ booksTitle: v })} />
            <TextRow label='"See all" link' hint="" value={draft.text.home.seeAllLabel} onChange={(v) => patchHome({ seeAllLabel: v })} />
          </section>

          <section className="rule-t pt-6 space-y-3">
            <h2 className="font-serif text-xl text-ink">About page</h2>
            <TextRow label="Small top label" hint="" value={draft.text.about.kicker} onChange={(v) => patchAbout({ kicker: v })} />
            <TextRow label="Page title" hint="" value={draft.text.about.title} onChange={(v) => patchAbout({ title: v })} />
            <TextRow
              label="Body text"
              hint="Separate paragraphs with a blank line"
              value={draft.text.about.paragraphs.join("\n\n")}
              onChange={(v) =>
                patchAbout({ paragraphs: v.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) })
              }
              multiline
              rows={8}
            />
          </section>

          <div className="rule-t pt-4">
            <GhostButton onClick={() => setDraft((d) => ({ ...d, text: mergeSettings(null).text }))}>
              Reset all text to default
            </GhostButton>
          </div>
        </div>
      )}

      {/* Bottom save */}
      <div className="mt-10 rule-t pt-6 flex justify-end">
        <PrimaryButton onClick={() => save.mutate(draft)} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save changes"}
        </PrimaryButton>
      </div>
    </div>
  );
}

// ─── Color row ────────────────────────────────────────────────────────────────
function ColorRow({ label, hint, value, onChange }: {
  label: string; hint: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-2.5 rule-b last:border-b-0">
      <div className="w-36 shrink-0">
        <div className="text-sm text-ink">{label}</div>
        <div className="text-xs text-ink-soft">{hint}</div>
      </div>
      <div className="flex items-center gap-3 flex-1">
        {/* Live color swatch */}
        <div
          className="w-9 h-9 rounded-sm border border-rule shadow-sm shrink-0"
          style={{ background: value }}
        />
        {/* Native color picker — easy hex picking */}
        <label className="w-9 h-9 rounded-sm border border-rule flex items-center justify-center cursor-pointer relative shrink-0 overflow-hidden">
          <input
            type="color"
            className="absolute opacity-0 w-full h-full cursor-pointer"
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="text-base pointer-events-none select-none">🎨</span>
        </label>
        {/* Text value — for advanced users who want oklch etc */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent border border-rule rounded-sm px-2 py-1.5 text-xs font-mono text-ink focus:border-ink focus:outline-none"
        />
      </div>
    </div>
  );
}

// ─── Slider row ───────────────────────────────────────────────────────────────
function SliderRow({ label, hint, min, max, step, value, displayValue, onChange, leftLabel, rightLabel }: {
  label: string; hint: string;
  min: number; max: number; step: number;
  value: number; displayValue: string;
  onChange: (n: number) => void;
  leftLabel: string; rightLabel: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm text-ink">{label}</span>
          {hint && <span className="ml-2 text-xs text-ink-soft">{hint}</span>}
        </div>
        <span className="text-xs font-mono text-ink-soft bg-muted px-2 py-0.5 rounded-sm">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-ink"
        style={{ background: `linear-gradient(to right, var(--color-ink) 0%, var(--color-ink) ${((value - min) / (max - min)) * 100}%, var(--color-rule) ${((value - min) / (max - min)) * 100}%, var(--color-rule) 100%)` }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-ink-soft">{leftLabel}</span>
        <span className="text-xs text-ink-soft">{rightLabel}</span>
      </div>
    </div>
  );
}

// ─── Font card ────────────────────────────────────────────────────────────────
function FontCard({ label, fontFamily, selected, onSelect, preview }: {
  label: string; fontFamily: string; selected: boolean;
  onSelect: () => void; preview: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "text-left p-3 rounded-sm border transition-colors " +
        (selected
          ? "border-ink bg-ink/5"
          : "border-rule hover:border-ink/50")
      }
    >
      <div
        className="text-lg text-ink mb-1 truncate"
        style={{ fontFamily }}
      >
        {preview}
      </div>
      <div className="text-xs text-ink-soft flex items-center gap-1.5">
        {selected && <span className="w-1.5 h-1.5 rounded-full bg-ink inline-block" />}
        {label}
      </div>
    </button>
  );
}

// ─── Text row ────────────────────────────────────────────────────────────────
function TextRow({ label, hint, value, onChange, multiline = false, rows = 3 }: {
  label: string; hint: string; value: string;
  onChange: (v: string) => void;
  multiline?: boolean; rows?: number;
}) {
  const cls = "w-full bg-transparent border border-rule rounded-sm px-3 py-2 text-ink text-sm focus:border-ink focus:outline-none";
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 items-start py-1">
      <div className="pt-2">
        <div className="text-sm text-ink">{label}</div>
        {hint && <div className="text-xs text-ink-soft mt-0.5">{hint}</div>}
      </div>
      {multiline ? (
        <textarea className={cls + " resize-none"} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────
function Label({ text, hint }: { text: string; hint?: string }) {
  return (
    <div>
      <span className="text-sm font-medium text-ink">{text}</span>
      {hint && <span className="ml-2 text-xs text-ink-soft">{hint}</span>}
    </div>
  );
}
