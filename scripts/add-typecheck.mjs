import fs from "fs";
import path from "path";

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
  const dir = path.dirname(pkgPath);
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.scripts ||= {};

  const hasTsconfig = fs.existsSync(path.join(dir, "tsconfig.json"));
  if (dir === root) {
    pkg.scripts.typecheck ||= "pnpm -r run typecheck";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    continue;
  }
  if (hasTsconfig) {
    pkg.scripts.typecheck ||= "tsc -p tsconfig.json --noEmit";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }
}
console.log("DONE: added typecheck scripts");
