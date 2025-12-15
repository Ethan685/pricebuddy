import fs from "fs";
import path from "path";

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name.startsWith(".")) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.isFile() && ent.name === "package.json") out.push(p);
  }
  return out;
}

const root = process.cwd();
const pkgs = walk(root);

for (const pkgPath of pkgs) {
  const pkgDir = path.dirname(pkgPath);
  const pkg = readJSON(pkgPath);
  pkg.scripts ||= {};

  const hasTsconfig = exists(path.join(pkgDir, "tsconfig.json"));

  // root scripts
  if (pkgDir === root) {
    pkg.scripts.build ||= "pnpm -r run build";
    pkg.scripts.typecheck ||= "pnpm -r run typecheck";
    pkg.scripts.lint ||= "pnpm -r run lint";
    writeJSON(pkgPath, pkg);
    continue;
  }

  if (hasTsconfig) {
    pkg.scripts.typecheck ||= "tsc -p tsconfig.json --noEmit";
    // lint는 eslint가 있을 때만 의미. 이미 lint가 없으면 기본값으로만 넣음.
    pkg.scripts.lint ||= "eslint .";
    writeJSON(pkgPath, pkg);
  }
}

console.log("DONE: scripts added/updated");
