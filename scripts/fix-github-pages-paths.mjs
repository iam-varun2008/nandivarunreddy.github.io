import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const pagesBase = "/nandivarunreddy.github.io/";
const publicAssetRoots = [
  "certificates",
  "draco",
  "models",
  "projects",
  "video",
];
const textFilePattern = /\.(?:css|html|js)$/;
const distDirectory = fileURLToPath(new URL("../dist/", import.meta.url));
let adjustedFileCount = 0;

const adjustFile = async (filePath) => {
  const input = await readFile(filePath, "utf8");
  let output = input;

  for (const root of publicAssetRoots) {
    const rootPath = `/${root}/`;
    const pagesPath = `${pagesBase}${root}/`;
    const placeholder = `__PAGES_ASSET_${root.toUpperCase()}__`;

    output = output.replaceAll(pagesPath, placeholder);
    output = output.replaceAll(rootPath, pagesPath);
    output = output.replaceAll(placeholder, pagesPath);
  }

  if (output !== input) {
    await writeFile(filePath, output);
    adjustedFileCount += 1;
  }
};

const visitDirectory = async (directoryPath) => {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      await visitDirectory(entryPath);
    } else if (textFilePattern.test(entry.name)) {
      await adjustFile(entryPath);
    }
  }
};

await visitDirectory(distDirectory);
console.log(`Adjusted ${adjustedFileCount} generated file(s) for GitHub Pages.`);
