#!/usr/bin/env node
/**
 * Copy pinned web-ifc WASM and @thatopen/fragments worker into /public
 * so the BIM viewer never loads them from unpkg/jsdelivr at runtime.
 * Paths are resolved from the exact installed package versions.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function packageDir(specifier) {
  const resolved = require.resolve(specifier);
  let dir = path.dirname(resolved);
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error(`Could not find package root for ${specifier}`);
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`copied ${path.relative(root, src)} -> ${path.relative(root, dest)}`);
}

const webIfcDir = packageDir("web-ifc");
const webIfcPkg = JSON.parse(fs.readFileSync(path.join(webIfcDir, "package.json"), "utf8"));
if (webIfcPkg.version !== "0.0.77") {
  throw new Error(`Expected web-ifc@0.0.77, found ${webIfcPkg.version}`);
}

const wasmDest = path.join(root, "public", "bim-test", "wasm");
fs.rmSync(wasmDest, { recursive: true, force: true });
fs.mkdirSync(wasmDest, { recursive: true });

for (const name of fs.readdirSync(webIfcDir)) {
  if (name.endsWith(".wasm") && !name.includes("node")) {
    copyFile(path.join(webIfcDir, name), path.join(wasmDest, name));
  }
}

const fragmentsDir = packageDir("@thatopen/fragments");
const fragmentsPkg = JSON.parse(
  fs.readFileSync(path.join(fragmentsDir, "package.json"), "utf8"),
);
if (fragmentsPkg.version !== "3.4.7") {
  throw new Error(`Expected @thatopen/fragments@3.4.7, found ${fragmentsPkg.version}`);
}

const workerCandidates = [
  path.join(fragmentsDir, "dist", "Worker"),
  path.join(fragmentsDir, "Worker"),
  path.join(fragmentsDir, "dist", "worker"),
];

const workerSrc = workerCandidates.find((candidate) => fs.existsSync(candidate));
if (!workerSrc) {
  throw new Error(
    `Could not find fragments worker directory. Looked in: ${workerCandidates.join(", ")}`,
  );
}

const workerDest = path.join(root, "public", "bim-test", "worker");
fs.rmSync(workerDest, { recursive: true, force: true });
fs.mkdirSync(workerDest, { recursive: true });
const workerFile = ["worker.mjs", "worker.min.mjs"].find((name) =>
  fs.existsSync(path.join(workerSrc, name)),
);
if (!workerFile) {
  throw new Error(`No worker.mjs in ${workerSrc}`);
}
copyFile(path.join(workerSrc, workerFile), path.join(workerDest, "worker.mjs"));

const versionsPath = path.join(root, "public", "bim-test", "asset-versions.json");
fs.writeFileSync(
  versionsPath,
  JSON.stringify(
    {
      "web-ifc": webIfcPkg.version,
      "@thatopen/fragments": fragmentsPkg.version,
      copiedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
);
console.log(`wrote ${path.relative(root, versionsPath)}`);
