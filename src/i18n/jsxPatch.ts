// DOM-based translator. ES module exports of react/jsx-runtime are read-only
// in modern Vite/ESM, so we can't monkey-patch them. Instead we walk the DOM
// and translate text nodes + select attributes whenever the tree changes.

import { dict } from "./dictionary";

type Lang = "fr" | "en";
let LANG: Lang = "fr";
let observer: MutationObserver | null = null;

const TRANSLATABLE_ATTRS = ["placeholder", "title", "alt", "aria-label"];

function lookup(s: string): string {
  if (!s) return s;
  const direct = dict[s];
  if (direct) return direct;
  const trimmed = s.trim();
  if (trimmed && trimmed !== s) {
    const t = dict[trimmed];
    if (t) {
      const leading = s.match(/^\s*/)?.[0] ?? "";
      const trailing = s.match(/\s*$/)?.[0] ?? "";
      return leading + t + trailing;
    }
  }
  return s;
}

function translateNode(node: Node) {
  if (LANG !== "en") return;
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue ?? "";
    const next = lookup(text);
    if (next !== text) node.nodeValue = next;
    return;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tag = el.tagName;
    if (tag === "SCRIPT" || tag === "STYLE") return;
    for (const attr of TRANSLATABLE_ATTRS) {
      const v = el.getAttribute(attr);
      if (v) {
        const next = lookup(v);
        if (next !== v) el.setAttribute(attr, next);
      }
    }
    node.childNodes.forEach(translateNode);
  }
}

function translateAll() {
  if (typeof document === "undefined") return;
  translateNode(document.body);
}

function ensureObserver() {
  if (typeof document === "undefined" || observer) return;
  observer = new MutationObserver((mutations) => {
    if (LANG !== "en") return;
    for (const m of mutations) {
      if (m.type === "characterData" && m.target) {
        translateNode(m.target);
      } else if (m.type === "childList") {
        m.addedNodes.forEach(translateNode);
      } else if (m.type === "attributes" && m.target && m.attributeName) {
        const el = m.target as Element;
        if (TRANSLATABLE_ATTRS.includes(m.attributeName)) {
          const v = el.getAttribute(m.attributeName);
          if (v) {
            const next = lookup(v);
            if (next !== v) el.setAttribute(m.attributeName, next);
          }
        }
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: TRANSLATABLE_ATTRS,
  });
}

export function setI18nLang(lang: Lang) {
  LANG = lang;
  if (typeof window === "undefined") return;
  // Defer so React has committed the latest tree.
  queueMicrotask(() => {
    ensureObserver();
    if (lang === "en") translateAll();
    // For FR we'd need original strings; rely on React re-render via key remount.
  });
}
