// Renders PyATCLI's API_REFERENCE.md to the HTML snapshot the API Reference page shows.
//   cd personal-website/tools/api-reference && npm install     (once)
//   node render.mjs [API_REFERENCE.md] [out.html]
// With no arguments it reads ../PyATCLI/API_REFERENCE.md (the repo next to this one) and writes
// src/assets/docs/pyatcli-api-reference.html, which is the file the page loads.
//
// What it does beyond a plain markdown render, all for a page that is injected into a single-page app:
//   - every heading gets a GitHub-style id (the Contents list and the in-text links point at those),
//   - a link to a file in the repo (CLI_REFERENCE.md, ...) becomes a link to that file on GitHub,
//   - it reports every #link that has no heading to land on, and any repeated id. Fix those in
//     API_REFERENCE.md itself (a heading's id is its text lower-cased, punctuation dropped, spaces as hyphens).
// The page component (src/app/projects/api-reference-page) rewrites the #links and scrolls to the headings.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Marked } from "marked";
import GithubSlugger from "github-slugger";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(process.argv[2] ?? resolve(here, "../../../../PyATCLI/API_REFERENCE.md"));
const out = resolve(process.argv[3] ?? resolve(here, "../../src/assets/docs/pyatcli-api-reference.html"));
const REPO_BLOB = "https://github.com/zakgm2/PyATCLI/blob/main/";
const slugger = new GithubSlugger();
const ids = [];

const entities = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m) => entities[m]);

const marked = new Marked({
  gfm: true,
  renderer: {
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens);
      const id = slugger.slug(plain(inner));
      ids.push(id);
      return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
    },
  },
  walkTokens(token) {
    if (token.type === "link" && token.href && !/^(#|[a-z][a-z0-9+.-]*:)/i.test(token.href)) {
      token.href = REPO_BLOB + token.href.replace(/^\.?\//, "");
    }
  },
});

const html = marked.parse(readFileSync(src, "utf8"));
writeFileSync(out, html, "utf8");

const have = new Set(ids);
const wanted = [...html.matchAll(/href="#([^"]*)"/g)].map((m) => decodeURIComponent(m[1]));
const broken = [...new Set(wanted.filter((id) => !have.has(id)))];
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log(`${src}\n  -> ${out}`);
console.log(`${ids.length} headings with ids, ${wanted.length} in-page links, ${html.length} bytes`);
console.log("links with no heading:", broken.length ? broken : "none");
console.log("repeated ids:", dupes.length ? dupes : "none");
if (broken.length || dupes.length) process.exitCode = 1;
