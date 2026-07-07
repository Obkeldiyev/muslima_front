import { useEffect, useRef, useState } from "react";

type WordEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const toolbarButtons = [
  { label: "B", command: "bold", title: "Bold" },
  { label: "I", command: "italic", title: "Italic" },
  { label: "H2", command: "formatBlock", value: "h2", title: "Heading" },
  { label: "Quote", command: "formatBlock", value: "blockquote", title: "Quote" },
  { label: "• List", command: "insertUnorderedList", title: "Bullet list" },
  { label: "P", command: "formatBlock", value: "p", title: "Paragraph" },
] as const;

export function WordEditor({ value, onChange, placeholder = "Write your essay here…" }: WordEditorProps) {
  const [html, setHtml] = useState(value ?? "");
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHtml(value ?? "");
  }, [value]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [html]);

  const applyCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    const nextHtml = editorRef.current?.innerHTML ?? "";
    setHtml(nextHtml);
    onChange(nextHtml);
  };

  const handleInput = () => {
    const nextHtml = editorRef.current?.innerHTML ?? "";
    setHtml(nextHtml);
    onChange(nextHtml);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 rounded-sm border border-input bg-muted/30 p-2">
        {toolbarButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            title={button.title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyCommand(button.command, button.value)}
            className="rounded-sm border border-input bg-background px-2.5 py-1.5 text-sm text-ink transition hover:bg-muted"
          >
            {button.label}
          </button>
        ))}
      </div>

      <div className="min-h-[320px] rounded-sm border border-input bg-card px-4 py-4 text-sm leading-7 text-ink shadow-sm focus-within:ring-2 focus-within:ring-ring/30">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          data-placeholder={placeholder}
          className="min-h-[288px] outline-none prose-editorial max-w-none"
          style={{ whiteSpace: "pre-wrap" }}
        />
      </div>
      <p className="text-xs text-ink-soft">Format your piece like a document, then save it as polished essay content.</p>
    </div>
  );
}
