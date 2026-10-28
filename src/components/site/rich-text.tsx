/**
 * Renders admin-authored rich text as plain paragraphs.
 * The legacy CMS stores plain text with blank-line separated paragraphs and
 * manual line breaks — never raw HTML — so rendering as text nodes is safe.
 */
export function RichText({ text, className = "" }: { text?: string; className?: string }) {
  if (!text?.trim()) return null;

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line text-sm leading-8 text-black/70 sm:text-base">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
