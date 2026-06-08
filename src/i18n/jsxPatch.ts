// Runtime patch: intercept every JSX call to translate string children/props
// according to the active language. We mutate the named exports of
// `react/jsx-runtime` (and `react/jsx-dev-runtime`) — ES module exports are
// live bindings, so all files importing them pick up the wrapped function.

import * as jsxRuntime from "react/jsx-runtime";
import * as jsxDevRuntime from "react/jsx-dev-runtime";
import { dict } from "./dictionary";

type Lang = "fr" | "en";
let LANG: Lang = "fr";

export function setI18nLang(lang: Lang) {
  LANG = lang;
}

const TRANSLATABLE_PROPS = new Set([
  "placeholder",
  "title",
  "alt",
  "aria-label",
  "label",
  "subtitle",
  "badge",
]);

function lookup(s: string): string {
  if (typeof s !== "string" || !s) return s;
  const direct = dict[s];
  if (direct) return direct;
  const trimmed = s.trim();
  if (trimmed !== s) {
    const t = dict[trimmed];
    if (t) {
      const leading = s.match(/^\s*/)?.[0] ?? "";
      const trailing = s.match(/\s*$/)?.[0] ?? "";
      return leading + t + trailing;
    }
  }
  return s;
}

function translateValue(v: unknown): unknown {
  if (typeof v === "string") return lookup(v);
  if (Array.isArray(v)) {
    let mutated = false;
    const next = v.map((x) => {
      if (typeof x === "string") {
        const t = lookup(x);
        if (t !== x) { mutated = true; return t; }
      }
      return x;
    });
    return mutated ? next : v;
  }
  return v;
}

function maybeTranslateProps(props: unknown): unknown {
  if (LANG !== "en" || !props || typeof props !== "object") return props;
  const p = props as Record<string, unknown>;
  let out: Record<string, unknown> | null = null;

  if ("children" in p) {
    const t = translateValue(p.children);
    if (t !== p.children) {
      out = out ?? { ...p };
      out.children = t;
    }
  }

  for (const key in p) {
    if (key === "children") continue;
    if (TRANSLATABLE_PROPS.has(key) && typeof p[key] === "string") {
      const t = lookup(p[key] as string);
      if (t !== p[key]) {
        out = out ?? { ...p };
        out[key] = t;
      }
    }
  }

  return out ?? p;
}

type JsxFn = (type: unknown, props: unknown, key?: unknown, ...rest: unknown[]) => unknown;

function wrap(orig: JsxFn): JsxFn {
  return function patched(type, props, key, ...rest) {
    return orig(type, maybeTranslateProps(props), key, ...rest);
  };
}

const rt = jsxRuntime as unknown as { jsx: JsxFn; jsxs: JsxFn };
const dev = jsxDevRuntime as unknown as { jsxDEV: JsxFn };

if (!(rt as { __i18nPatched?: boolean }).__i18nPatched) {
  rt.jsx = wrap(rt.jsx);
  rt.jsxs = wrap(rt.jsxs);
  (rt as { __i18nPatched?: boolean }).__i18nPatched = true;
}
if (dev.jsxDEV && !(dev as { __i18nPatched?: boolean }).__i18nPatched) {
  dev.jsxDEV = wrap(dev.jsxDEV);
  (dev as { __i18nPatched?: boolean }).__i18nPatched = true;
}
