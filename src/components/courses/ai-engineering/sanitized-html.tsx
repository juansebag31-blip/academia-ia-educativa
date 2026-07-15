import styles from "./content.module.css";

type SanitizedHtmlProps = {
  html: string;
  className?: string;
};

export function SanitizedHtml({ html, className = "" }: SanitizedHtmlProps) {
  return (
    <div
      className={`${styles.content} ${className}`.trim()}
      // This HTML is generated locally after scripts, styles, and event handlers are removed.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
