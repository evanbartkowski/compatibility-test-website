import fs from "node:fs";
const policy = JSON.parse(fs.readFileSync(new URL("../security-headers.json", import.meta.url), "utf8"));
const file = new URL("../firebase.json", import.meta.url);
const config = JSON.parse(fs.readFileSync(file, "utf8"));
const privatePaths = ["api", "profile", "settings", "results", "history", "compatibility", "invite", "feedback", "shared", "studio", "admin", "dashboard"];
config.hosting.headers = [
  { source: "**", headers: Object.entries(policy).map(([key, value]) => ({ key, value })) },
  { source: "/_next/static/**", headers: [{ key: "Cache-Control", value: "public,max-age=31536000,immutable" }] },
  ...privatePaths.flatMap(name => [name, `${name}/**`].map(source => ({ source: `/${source}`, headers: [{ key: "Cache-Control", value: "private,no-store" }, { key: "X-Robots-Tag", value: "noindex,nofollow" }] }))),
];
fs.writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
console.log("Synchronized Firebase Hosting security headers.");
