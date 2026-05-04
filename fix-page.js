const fs = require("fs");
const path = "/root/.openclaw/workspace/poc-site/src/app/briefs/page.tsx";
let content = fs.readFileSync(path, "utf8");
// Remove duplicate brace
content = content.replace('badge: "Latest"\n  },\n  {\n  {', 'badge: "Latest"\n  },');
fs.writeFileSync(path, content);
console.log("OK - fixed");
