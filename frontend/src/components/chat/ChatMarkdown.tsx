"use client";

import {
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  Fragment,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import styles from "@/components/chat/ChatWorkspace.module.css";


type MarkdownBlock =
  | {
      type: "code";
      language: string;
      content: string;
    }
  | {
      type: "text";
      content: string;
    };

function splitFencedBlocks(
  content: string
): MarkdownBlock[] {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n");
  const blocks: MarkdownBlock[] = [];
  let textBuffer: string[] = [];
  let codeBuffer: string[] = [];
  let inCode = false;
  let language = "";

  const flushText = () => {
    if (textBuffer.length === 0) {
      return;
    }

    blocks.push({
      type: "text",
      content: textBuffer.join("\n"),
    });
    textBuffer = [];
  };

  const flushCode = () => {
    blocks.push({
      type: "code",
      language,
      content: codeBuffer.join("\n"),
    });
    codeBuffer = [];
    language = "";
  };

  for (const line of lines) {
    const fence = line.match(
      /^```\s*([^\s`]*)\s*$/
    );

    if (fence) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushText();
        inCode = true;
        language = fence[1] ?? "";
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
    } else {
      textBuffer.push(line);
    }
  }

  if (inCode) {
    flushCode();
  }

  flushText();

  return blocks;
}

function safeHref(
  value: string
): string | null {
  const href = value.trim();

  if (
    href.startsWith("/") &&
    !href.startsWith("//")
  ) {
    return href;
  }

  if (
    href.startsWith("#") ||
    /^https?:\/\//i.test(href) ||
    /^mailto:/i.test(href)
  ) {
    return href;
  }

  return null;
}

function renderInline(
  text: string,
  keyPrefix: string
): ReactNode[] {
  const pattern =
    /(`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^\)\n]+\))/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while (
    (match = pattern.exec(text)) !== null
  ) {
    if (match.index > lastIndex) {
      nodes.push(
        text.slice(
          lastIndex,
          match.index
        )
      );
    }

    const token = match[0];
    const key = `${keyPrefix}-${index}`;

    if (
      token.startsWith("`") &&
      token.endsWith("`")
    ) {
      nodes.push(
        <code
          key={key}
          className={styles.inlineCode}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (
      token.startsWith("**") &&
      token.endsWith("**")
    ) {
      nodes.push(
        <strong key={key}>
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      const linkMatch = token.match(
        /^\[([^\]]+)\]\(([^)]+)\)$/
      );

      if (linkMatch) {
        const label = linkMatch[1];
        const href = safeHref(
          linkMatch[2]
        );

        if (href) {
          const external =
            /^https?:\/\//i.test(
              href
            );

          nodes.push(
            <a
              key={key}
              href={href}
              target={
                external
                  ? "_blank"
                  : undefined
              }
              rel={
                external
                  ? "noopener noreferrer"
                  : undefined
              }
            >
              {label}
              {external && (
                <ExternalLink
                  size={12}
                  aria-hidden="true"
                />
              )}
            </a>
          );
        } else {
          nodes.push(label);
        }
      } else {
        nodes.push(token);
      }
    }

    lastIndex =
      pattern.lastIndex;
    index += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(
      text.slice(lastIndex)
    );
  }

  return nodes;
}

function splitTableRow(
  line: string
): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(
  line: string
): boolean {
  const cells = splitTableRow(line);

  return (
    cells.length > 0 &&
    cells.every((cell) =>
      /^:?-{3,}:?$/.test(cell)
    )
  );
}

function renderTextBlock(
  content: string,
  blockKey: string
): ReactNode[] {
  const lines = content.split("\n");
  const output: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(
      /^(#{1,6})\s+(.+)$/
    );

    if (heading) {
      const level = heading[1].length;
      const children = renderInline(
        heading[2],
        `${blockKey}-heading-${index}`
      );

      const headingTags = [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ] as const;
      const HeadingTag =
        headingTags[level - 1];

      output.push(
        <HeadingTag
          key={`${blockKey}-${index}`}
          className={styles.markdownHeading}
        >
          {children}
        </HeadingTag>
      );
      index += 1;
      continue;
    }

    if (
      index + 1 < lines.length &&
      line.includes("|") &&
      isTableSeparator(
        lines[index + 1]
      )
    ) {
      const header =
        splitTableRow(line);
      const rows: string[][] = [];
      index += 2;

      while (
        index < lines.length &&
        lines[index].includes("|") &&
        lines[index].trim()
      ) {
        rows.push(
          splitTableRow(
            lines[index]
          )
        );
        index += 1;
      }

      output.push(
        <div
          className={styles.tableScroller}
          key={`${blockKey}-table-${index}`}
        >
          <table>
            <thead>
              <tr>
                {header.map(
                  (cell, cellIndex) => (
                    <th
                      key={
                        `${blockKey}-th-${cellIndex}`
                      }
                    >
                      {renderInline(
                        cell,
                        `${blockKey}-th-${cellIndex}`
                      )}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map(
                (row, rowIndex) => (
                  <tr
                    key={
                      `${blockKey}-tr-${rowIndex}`
                    }
                  >
                    {row.map(
                      (
                        cell,
                        cellIndex
                      ) => (
                        <td
                          key={
                            `${blockKey}-td-${rowIndex}-${cellIndex}`
                          }
                        >
                          {renderInline(
                            cell,
                            `${blockKey}-td-${rowIndex}-${cellIndex}`
                          )}
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const unordered = line.match(
      /^\s*[-*+]\s+(.+)$/
    );

    if (unordered) {
      const items: string[] = [];

      while (
        index < lines.length
      ) {
        const item = lines[
          index
        ].match(
          /^\s*[-*+]\s+(.+)$/
        );

        if (!item) {
          break;
        }

        items.push(item[1]);
        index += 1;
      }

      output.push(
        <ul
          key={`${blockKey}-ul-${index}`}
        >
          {items.map(
            (item, itemIndex) => (
              <li
                key={
                  `${blockKey}-uli-${itemIndex}`
                }
              >
                {renderInline(
                  item,
                  `${blockKey}-uli-${itemIndex}`
                )}
              </li>
            )
          )}
        </ul>
      );
      continue;
    }

    const ordered = line.match(
      /^\s*\d+\.\s+(.+)$/
    );

    if (ordered) {
      const items: string[] = [];

      while (
        index < lines.length
      ) {
        const item = lines[
          index
        ].match(
          /^\s*\d+\.\s+(.+)$/
        );

        if (!item) {
          break;
        }

        items.push(item[1]);
        index += 1;
      }

      output.push(
        <ol
          key={`${blockKey}-ol-${index}`}
        >
          {items.map(
            (item, itemIndex) => (
              <li
                key={
                  `${blockKey}-oli-${itemIndex}`
                }
              >
                {renderInline(
                  item,
                  `${blockKey}-oli-${itemIndex}`
                )}
              </li>
            )
          )}
        </ol>
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoted: string[] = [];

      while (
        index < lines.length &&
        /^>\s?/.test(lines[index])
      ) {
        quoted.push(
          lines[index].replace(
            /^>\s?/, ""
          )
        );
        index += 1;
      }

      output.push(
        <blockquote
          key={`${blockKey}-quote-${index}`}
        >
          {quoted.map(
            (quote, quoteIndex) => (
              <Fragment
                key={
                  `${blockKey}-quote-line-${quoteIndex}`
                }
              >
                {renderInline(
                  quote,
                  `${blockKey}-quote-line-${quoteIndex}`
                )}
                {quoteIndex <
                  quoted.length - 1 && (
                  <br />
                )}
              </Fragment>
            )
          )}
        </blockquote>
      );
      continue;
    }

    const paragraph: string[] = [
      line,
    ];
    index += 1;

    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6})\s+/.test(
        lines[index]
      ) &&
      !/^\s*[-*+]\s+/.test(
        lines[index]
      ) &&
      !/^\s*\d+\.\s+/.test(
        lines[index]
      ) &&
      !/^>\s?/.test(lines[index])
    ) {
      if (
        index + 1 < lines.length &&
        lines[index].includes("|") &&
        isTableSeparator(
          lines[index + 1]
        )
      ) {
        break;
      }

      paragraph.push(
        lines[index]
      );
      index += 1;
    }

    output.push(
      <p
        key={`${blockKey}-p-${index}`}
      >
        {paragraph.map(
          (paragraphLine, lineIndex) => (
            <Fragment
              key={
                `${blockKey}-p-line-${lineIndex}`
              }
            >
              {renderInline(
                paragraphLine,
                `${blockKey}-p-line-${lineIndex}`
              )}
              {lineIndex <
                paragraph.length - 1 && (
                <br />
              )}
            </Fragment>
          )
        )}
      </p>
    );
  }

  return output;
}

function CodeBlock({
  content,
  language,
}: {
  content: string;
  language: string;
}) {
  const [copied, setCopied] =
    useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        content
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.codeBlock}>
      <div
        className={styles.codeBlockHeader}
      >
        <span>
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <Check size={14} />
          ) : (
            <Copy size={14} />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre dir="ltr">
        <code>{content}</code>
      </pre>
    </div>
  );
}

export default function ChatMarkdown({
  content,
}: {
  content: string;
}) {
  const blocks = useMemo(
    () => splitFencedBlocks(content),
    [content]
  );

  return (
    <div
      className={styles.markdown}
      dir="auto"
    >
      {blocks.map(
        (block, index) =>
          block.type === "code" ? (
            <CodeBlock
              key={`code-${index}`}
              content={block.content}
              language={block.language}
            />
          ) : (
            <Fragment
              key={`text-${index}`}
            >
              {renderTextBlock(
                block.content,
                `text-${index}`
              )}
            </Fragment>
          )
      )}
    </div>
  );
}
