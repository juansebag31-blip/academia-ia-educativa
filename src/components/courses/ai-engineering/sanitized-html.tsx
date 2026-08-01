import styles from "./content.module.css";

type SanitizedHtmlProps = {
  html: string;
  className?: string;
  headingPolicy?: "preserve" | "duplicate-document-title" | "case-title";
};

function replaceFirstHeading(
  html: string,
  levels: number[],
  replacementTag: "p" | "h3",
  attributes: string,
) {
  const openingPattern = new RegExp(`<h(${levels.join("|")})(\\s[^>]*)?>`, "i");
  const openingMatch = openingPattern.exec(html);
  if (!openingMatch) return html;

  const originalLevel = openingMatch[1];
  const retainedAttributes = openingMatch[2] ?? "";
  const before = html.slice(0, openingMatch.index);
  const afterOpening = html.slice(openingMatch.index + openingMatch[0].length);
  const closingPattern = new RegExp(`</h${originalLevel}\\s*>`, "i");
  const closingMatch = closingPattern.exec(afterOpening);
  if (!closingMatch) return html;

  const content = afterOpening.slice(0, closingMatch.index);
  const after = afterOpening.slice(closingMatch.index + closingMatch[0].length);
  return `${before}<${replacementTag}${retainedAttributes} ${attributes}>${content}</${replacementTag}>${after}`;
}

function applyHeadingPolicy(html: string, policy: SanitizedHtmlProps["headingPolicy"]) {
  if (policy === "duplicate-document-title") {
    return replaceFirstHeading(
      html,
      [1],
      "p",
      'aria-hidden="true" data-ai-engineering-document-title',
    );
  }
  if (policy === "case-title") {
    return replaceFirstHeading(html, [1, 2, 3], "h3", "data-ai-engineering-case-title");
  }
  return html;
}

export function SanitizedHtml({
  html,
  className = "",
  headingPolicy = "preserve",
}: SanitizedHtmlProps) {
  return (
    <div
      className={`${styles.content} ${className}`.trim()}
      // This HTML is generated locally after scripts, styles, and event handlers are removed.
      dangerouslySetInnerHTML={{ __html: applyHeadingPolicy(html, headingPolicy) }}
    />
  );
}
