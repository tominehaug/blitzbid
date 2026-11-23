const fs = require("fs");

const skip = [
  "node_modules",
  "dist",
  "build.js",
  "package.json",
  "package-lock.json",
  "input.css",
  "README.md",
];

fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist");

for (const name of fs.readdirSync(".")) {
  if (name.startsWith(".") || skip.includes(name)) continue;
  fs.cpSync(name, `dist/${name}`, { recursive: true });
}

fs.writeFileSync(
  "dist/js/config.js",
  `export const API_URL = ${JSON.stringify(process.env.API_URL)};\n` +
    `export const API_KEY = ${JSON.stringify(process.env.API_KEY)};\n`,
);
