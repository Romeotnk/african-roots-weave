import sanitizeHtml from "sanitize-html";

// For fields that are genuinely meant to hold rich HTML from an editor (e.g.
// Article.content, rendered client-side with dangerouslySetInnerHTML) — unlike
// the global sanitizeMiddleware, which only strips dangerous constructs from
// every request field indiscriminately, this fully parses and allowlists HTML
// and is only meant to be called on fields known to hold real markup.
const options: sanitizeHtml.IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "h1", "h2", "span"],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": ["class"],
    img: ["src", "alt", "title", "width", "height"],
    a: ["href", "name", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  disallowedTagsMode: "discard",
};

export const sanitizeRichText = (html: string) => sanitizeHtml(html, options);
