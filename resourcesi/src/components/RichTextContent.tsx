import { Link } from "react-router-dom";

/**
 * Renders text with:
 * - Clickable URLs (auto-detected)
 * - Clickable #hashtags (links to /explore?tag=...)
 * - @mentions (styled, links to profile when available)
 */
export default function RichTextContent({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;

  // Split by URLs, hashtags, mentions - keep order
  const parts: { type: "text" | "url" | "hashtag" | "mention"; value: string }[] = [];
  const urlRegex = /https?:\/\/[^\s]+/g;
  const hashtagRegex = /#[\w]+/g;
  const mentionRegex = /@[\w]+/g;
  const combinedRegex = /(https?:\/\/[^\s]+)|(#[\w]+)|(@[\w]+)/g;

  let lastIndex = 0;
  let match;
  while ((match = combinedRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    if (match[1]) parts.push({ type: "url", value: match[1] });
    else if (match[2]) parts.push({ type: "hashtag", value: match[2].slice(1) });
    else if (match[3]) parts.push({ type: "mention", value: match[3] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.type === "text") return <span key={i}>{p.value}</span>;
        if (p.type === "url")
          return (
            <a
              key={i}
              href={p.value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {p.value}
            </a>
          );
        if (p.type === "hashtag")
          return (
            <Link
              key={i}
              to={`/explore?tag=${encodeURIComponent(p.value)}`}
              className="text-primary hover:underline font-medium"
            >
              #{p.value}
            </Link>
          );
        if (p.type === "mention")
          return (
            <span key={i} className="text-primary font-medium">
              @{p.value}
            </span>
          );
        return null;
      })}
    </span>
  );
}
