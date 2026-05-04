const fs = require("fs");
const path = "/root/.openclaw/workspace/poc-site/src/app/briefs/page.tsx";
if (!fs.existsSync(path)) {
  console.error("NOT FOUND:", path);
  // Try to find it
  const { execSync } = require("child_process");
  const result = execSync("find /root/.openclaw/workspace/poc-site -name page.tsx -path '*/briefs/*' 2>/dev/null").toString().trim();
  console.error("SEARCH RESULT:", result);
  process.exit(1);
}
const content = fs.readFileSync(path, "utf8");
let updated = content.replace('badge: "Latest"', 'badge: undefined');
const newEntry = [
  '  {',
  '    title: "Tech Trends Brief \u2014 15 Technologies to Watch",',
  '    date: "May 1, 2026",',
  '    type: "tech",',
  '    description: "AI coding agents, MCP universal integration, edge inference accelerators, construction computer vision, voice AI agents, multimodal models, and 9 more trends with MVP experiments for PGC.",',
  '    file: "/briefs/tech-brief-2026-05-01.html",',
  '    badge: "Latest"',
  '  },',
  '  {'
].join("\n");
updated = updated.replace('const briefs: Brief[] = [\n', 'const briefs: Brief[] = [\n' + newEntry + '\n');
fs.writeFileSync(path, updated);
console.log("OK - page.tsx updated");
