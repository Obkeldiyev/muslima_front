import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, ".output", "public");
const targetDir = path.join(rootDir, "dist");

if (!fs.existsSync(sourceDir)) {
  console.error(`Build output not found at ${sourceDir}`);
  process.exit(1);
}

function getAssetFile(dir, pattern) {
  if (!fs.existsSync(dir)) return null;
  const matches = fs
    .readdirSync(dir)
    .filter((file) => pattern.test(file))
    .sort((a, b) => a.localeCompare(b));
  return matches[0] || null;
}

function writeIndexHtml(outputDir) {
  const assetsDir = path.join(outputDir, "assets");
  const entryJs = getAssetFile(assetsDir, /^index-.*\.js$/);
  const entryCss = getAssetFile(assetsDir, /^styles-.*\.css$/);

  const cssTag = entryCss ? `    <link rel="stylesheet" href="/assets/${entryCss}">\n` : "";
  const jsTag = entryJs ? `    <script type="module" src="/assets/${entryJs}"></script>\n` : "";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f172a" />
    <title>Muslima</title>
${cssTag}  </head>
  <body>
    <div id="root"></div>
${jsTag}  </body>
</html>
`;

  fs.writeFileSync(path.join(outputDir, "index.html"), html);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });
writeIndexHtml(targetDir);
writeIndexHtml(sourceDir);

console.log(`Frontend static files copied to ${targetDir}`);
console.log(`Generated index.html at ${path.join(targetDir, "index.html")}`);
