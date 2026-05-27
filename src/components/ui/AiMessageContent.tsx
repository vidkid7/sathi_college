import type { ReactNode } from "react";

type ParsedBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "result"; title: string; summary: string; url?: string };

const internalOrExternalUrl = /^(https?:\/\/|\/(?!\/))/i;
const inlineUrlPattern = /(https?:\/\/[^\s)]+|\/[a-zA-Z0-9][^\s),.]*)/g;

export function FormattedAssistantMessage({ text }: { text: string }) {
  const blocks = parseAssistantText(text);

  if (!blocks.length) return null;

  return (
    <div className="sathi-ai-message space-y-2 whitespace-normal">
      {blocks.map((block, index) => {
        if (block.kind === "result") {
          const title = block.url ? (
            <SafeLink href={block.url} className="text-[rgb(var(--primary))] hover:underline">
              {block.title}
            </SafeLink>
          ) : (
            block.title
          );

          return (
            <div
              key={`${block.title}-${index}`}
              className="sathi-chat-bullet rounded-xl border border-[rgb(var(--border))] bg-white/58 p-3 shadow-sm dark:bg-white/[0.04]"
            >
              <p className="text-[13px] font-extrabold leading-5 text-[rgb(var(--fg))]">{title}</p>
              {block.summary ? (
                <p className="mt-1 text-[12px] leading-5 text-[rgb(var(--fg-muted))]">
                  <InlineTextWithLinks text={block.summary} />
                </p>
              ) : null}
            </div>
          );
        }

        return (
          <p key={`${block.text}-${index}`} className="text-[13px] leading-6 text-[rgb(var(--fg))]">
            <InlineTextWithLinks text={block.text} />
          </p>
        );
      })}
    </div>
  );
}

function parseAssistantText(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  let tableHeaders: string[] | null = null;
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (isMarkdownTableLine(line)) {
      const cells = splitTableCells(line);
      if (!cells.length || isSeparatorRow(cells)) continue;

      if (!tableHeaders) {
        tableHeaders = cells;
        continue;
      }

      blocks.push(tableRowToResult(tableHeaders, cells));
      continue;
    }

    tableHeaders = null;
    const parsed = parseResultLine(line);
    blocks.push(parsed || { kind: "paragraph", text: line });
  }

  return blocks;
}

function parseResultLine(line: string): ParsedBlock | null {
  const isListItem = /^(?:[-*]|\d+[.)])\s+/.test(line);
  const clean = line.replace(/^(?:[-*]|\d+[.)])\s+/, "").trim();
  const linked = clean.match(/^(.*?)\s+\((https?:\/\/[^)]+|\/[^)\s]+)\):\s*(.*)$/i);

  if (linked) {
    return {
      kind: "result",
      title: linked[1].trim(),
      url: linked[2].trim(),
      summary: linked[3].trim()
    };
  }

  if (!isListItem) return null;

  const colonIndex = clean.indexOf(": ");
  if (colonIndex > 2 && colonIndex < 120) {
    return {
      kind: "result",
      title: clean.slice(0, colonIndex).trim(),
      summary: clean.slice(colonIndex + 2).trim()
    };
  }

  return {
    kind: "result",
    title: clean,
    summary: ""
  };
}

function isMarkdownTableLine(line: string) {
  return line.startsWith("|") && line.includes("|", 1);
}

function splitTableCells(line: string) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
    .filter(Boolean);
}

function isSeparatorRow(cells: string[]) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
}

function tableRowToResult(headers: string[], cells: string[]): ParsedBlock {
  const title = cleanCell(cells[0] || "Search result");
  const url = cells.map(extractUrl).find(Boolean);
  const summary = cells
    .slice(1)
    .map((cell, index) => {
      const label = headers[index + 1] || "Detail";
      if (/^link$/i.test(label)) return "";
      const value = cleanCell(cell);
      return value ? `${label}: ${value}` : "";
    })
    .filter(Boolean)
    .join(". ");

  return {
    kind: "result",
    title,
    url,
    summary
  };
}

function extractUrl(value: string) {
  const markdown = value.match(/\((https?:\/\/[^)]+|\/[^)]+)\)/i);
  if (markdown) return markdown[1].trim();

  const plain = value.match(/https?:\/\/\S+|\/[^\s|)]+/i);
  return plain?.[0]?.trim();
}

function cleanCell(value: string) {
  const markdown = value.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+)\)$/i);
  return (markdown ? markdown[1] : value).replace(/`/g, "").trim();
}

function InlineTextWithLinks({ text }: { text: string }) {
  const parts = text.split(inlineUrlPattern);

  return (
    <>
      {parts.map((part, index) => {
        if (!internalOrExternalUrl.test(part)) return <span key={`${part}-${index}`}>{part}</span>;

        return (
          <SafeLink key={`${part}-${index}`} href={part} className="font-bold text-[rgb(var(--primary))] hover:underline">
            {part}
          </SafeLink>
        );
      })}
    </>
  );
}

function SafeLink({
  href,
  className,
  children
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (!internalOrExternalUrl.test(href)) return <span className={className}>{children}</span>;

  const external = href.startsWith("http");
  return (
    <a href={href} className={className} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
      {children}
    </a>
  );
}
