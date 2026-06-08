import { Children, cloneElement, isValidElement, type ReactNode, useMemo } from "react";
import { useLanguage } from "./LanguageContext";
import { dict } from "./dictionary";

// Props whose string value should be translated.
const TRANSLATABLE_PROPS = new Set([
  "placeholder",
  "title",
  "alt",
  "aria-label",
  "label",
  "subtitle",
  "badge",
]);

function translateString(s: string, lang: "fr" | "en"): string {
  if (lang === "fr") return s;
  const trimmed = s.trim();
  if (!trimmed) return s;
  // Full match (preserving surrounding whitespace).
  const hit = dict[s] ?? dict[trimmed];
  if (hit) {
    if (hit === s) return s;
    // Re-apply surrounding whitespace if we matched trimmed form.
    if (hit === dict[trimmed] && trimmed !== s) {
      const leading = s.match(/^\s*/)?.[0] ?? "";
      const trailing = s.match(/\s*$/)?.[0] ?? "";
      return leading + hit + trailing;
    }
    return hit;
  }
  return s;
}

function translateNode(node: ReactNode, lang: "fr" | "en"): ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") return node;
  if (typeof node === "string") return translateString(node, lang);
  if (typeof node === "number") return node;

  if (Array.isArray(node)) {
    return node.map((c, i) => {
      const out = translateNode(c, lang);
      if (isValidElement(out) && out.key == null) {
        return cloneElement(out, { key: i });
      }
      return out;
    });
  }

  if (isValidElement(node)) {
    const el = node as React.ReactElement<Record<string, unknown>>;
    const props = el.props || {};
    const nextProps: Record<string, unknown> = {};
    let changed = false;

    for (const key in props) {
      const value = props[key];
      if (key === "children") continue;
      if (TRANSLATABLE_PROPS.has(key) && typeof value === "string") {
        const translated = translateString(value, lang);
        if (translated !== value) { nextProps[key] = translated; changed = true; }
      }
    }

    const originalChildren = (props as { children?: ReactNode }).children;
    const newChildren = translateNode(originalChildren, lang);
    const childrenChanged = newChildren !== originalChildren;

    if (!changed && !childrenChanged) return el;
    return cloneElement(el, nextProps, newChildren as ReactNode);
  }

  return node;
}

export function TranslateTree({ children }: { children: ReactNode }) {
  const { lang } = useLanguage();
  return useMemo(() => <>{translateNode(children, lang)}</>, [children, lang]);
}
