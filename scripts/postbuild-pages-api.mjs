import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const apiOrigin = (process.env.VITE_API_ORIGIN ?? "").replace(/\/$/, "");

const runtimePath = path.join(dist, "runtime-config.json");
const indexPath = path.join(dist, "index.html");

if (!fs.existsSync(dist)) {
  console.error("postbuild-pages-api: нет каталога dist — пропуск");
  process.exit(0);
}

fs.writeFileSync(runtimePath, JSON.stringify({ apiOrigin }, null, 0), "utf8");
console.log(
  "postbuild-pages-api: записан",
  runtimePath,
  apiOrigin ? "(apiOrigin задан)" : "(apiOrigin пустой — задай vars.VITE_API_ORIGIN)",
);

const trimSlash = ").replace(" + String.fromCharCode(47, 92, 47, 36, 47) + ",\"\")";
const loader =
  "<script>(function(){var b=\"/org-structure-frontend\";try{var sc=document.getElementsByTagName(\"script\");for(var i=0;i<sc.length;i++){var u=sc[i].getAttribute(\"src\");if(u&&u.indexOf(\"/assets/index\")!==-1){var p=u.indexOf(\"/assets/\");if(p>0)b=u.slice(0,p).replace(location.origin,\"\")||b;break}}}catch(e){}window.__RUNTIME_API_ORIGIN__=\"\";try{var x=new XMLHttpRequest();x.open(\"GET\",b+\"/runtime-config.json\",false);x.send(null);if(x.status>=200&&x.status<300&&x.responseText){var j=JSON.parse(x.responseText);if(j&&typeof j.apiOrigin===\"string\")window.__RUNTIME_API_ORIGIN__=String(j.apiOrigin" +
  trimSlash +
  ";}}catch(e2){}})();</script>";

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, "utf8");
  if (!html.includes("__RUNTIME_API_ORIGIN__")) {
    html = html.replace(/<script type="module"/, `${loader}<script type="module"`);
    fs.writeFileSync(indexPath, html, "utf8");
    console.log("postbuild-pages-api: вставлен загрузчик в index.html");
  }
}

const re = /const ([a-zA-Z0-9_$]+)="[^"]*"\.replace\(\/\\\/\$\/,""\)\?\?""/;
const assetsDir = path.join(dist, "assets");
if (!fs.existsSync(assetsDir)) {
  console.warn("postbuild-pages-api: нет dist/assets");
  process.exit(0);
}

for (const name of fs.readdirSync(assetsDir)) {
  if (!name.startsWith("index-") || !name.endsWith(".js")) continue;
  const fp = path.join(assetsDir, name);
  let js = fs.readFileSync(fp, "utf8");
  if (!re.test(js)) {
    if (js.includes("__RUNTIME_API_ORIGIN__")) {
      console.log("postbuild-pages-api:", name, "уже с патчем");
      continue;
    }
    console.warn("postbuild-pages-api: паттерн baseURL не найден в", name);
    continue;
  }
  const tail =
    ").replace(" + String.fromCharCode(47, 92, 47, 36, 47) + ",\"\")??\"\"";
  js = js.replace(
    re,
    (_, id) =>
      `const ${id}=(typeof window!=="undefined"&&window.__RUNTIME_API_ORIGIN__?String(window.__RUNTIME_API_ORIGIN__):"")${tail}`,
  );
  fs.writeFileSync(fp, js, "utf8");
  console.log("postbuild-pages-api: обновлён", name);
}
