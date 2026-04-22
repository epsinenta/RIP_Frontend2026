import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const bundlePath = path.join(root, "assets", "index-DQcu897t.js");
const cssPath = path.join(root, "assets", "index-DOqCYXU6.css");

let js = fs.readFileSync(bundlePath, "utf8");

const anchor =
  'onClick:ge,disabled:!be,children:"Сбросить"})]})]';

if (js.includes("clip-search-section__processing")) {
  console.log("patch-clip-indicator: already patched");
  process.exit(0);
}

if (!js.includes(anchor)) {
  console.error("patch-clip-indicator: anchor not found (bundle changed?)");
  process.exit(1);
}

const insert = `,x&&B.length>0&&!Q&&(!N[0]||!N[0].embedding)?b.jsxs("p",{className:"clip-search-section__processing",role:"status","aria-live":"polite",children:[b.jsx("span",{className:"clip-spinner",role:"presentation"}),b.jsx("span",{children:"Подготовка модели и каталога…"})]}):null,x&&B.length>0&&!Q&&v&&!V&&N[0]&&N[0].embedding?b.jsxs("p",{className:"clip-search-section__processing",role:"status","aria-live":"polite",children:[b.jsx("span",{className:"clip-spinner",role:"presentation"}),b.jsx("span",{children:"Идёт обработка изображения…"})]}):null`;

const replacement =
  'onClick:ge,disabled:!be,children:"Сбросить"})]})' + insert + "]";

js = js.replace(anchor, replacement);
fs.writeFileSync(bundlePath, js, "utf8");
console.log("patch-clip-indicator: updated", bundlePath);

const cssAppend = `

.clip-spinner{display:inline-block;width:0.95rem;height:0.95rem;border:2px solid #c55f4d;border-right-color:transparent;border-radius:50%;animation:rip-clip-spin .75s linear infinite;margin-right:10px;vertical-align:middle;flex-shrink:0}
@keyframes rip-clip-spin{to{transform:rotate(360deg)}}
.clip-search-section__processing{display:flex;align-items:center;gap:10px;margin:12px 0 0;width:100%;font-size:.95rem;color:#2c353d;font-weight:500}
`;

let css = fs.readFileSync(cssPath, "utf8");
if (!css.includes("rip-clip-spin")) {
  fs.writeFileSync(cssPath, css + cssAppend, "utf8");
  console.log("patch-clip-indicator: appended styles", cssPath);
} else {
  console.log("patch-clip-indicator: styles already present");
}
