import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, ".output", "public");
const targetDir = path.join(rootDir, "dist");
const assetsDir = path.join(targetDir, "assets");

if (!fs.existsSync(sourceDir)) {
  console.error(`Build output not found at ${sourceDir}`);
  process.exit(1);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

const assetFiles = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
const entryScript = assetFiles.find((file) => /^index-.*\.js$/.test(file));
const stylesheet = assetFiles.find((file) => /^styles-.*\.css$/.test(file));

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f172a" />
    <title>Muslima</title>
${stylesheet ? `    <link rel="stylesheet" href="/assets/${stylesheet}" />` : ""}
  </head>
  <body>
    <div id="root"></div>
${entryScript ? `    <script type="module" crossorigin src="/assets/${entryScript}"></script>` : ""}
  </body>
</html>
`;

fs.writeFileSync(path.join(targetDir, "index.html"), html);

console.log(`Frontend static files copied to ${targetDir}`);
console.log(`Generated dist/index.html with ${entryScript ?? "no entry script"}`);
