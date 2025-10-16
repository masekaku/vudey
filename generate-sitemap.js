// generate-sitemap.js
// Sitemap generator untuk Videyweb (gabungan HTML + artifacts.json)

const fs = require("fs");
const path = require("path");

const baseUrl = "https://videyweb.web.id";
const rootDir = process.cwd();

console.log("📦 Generating sitemap from:", rootDir);

// === Ambil semua file HTML di root (kecuali sitemap) ===
let htmlFiles = [];
try {
  htmlFiles = fs
    .readdirSync(rootDir)
    .filter(
      (file) =>
        file.endsWith(".html") &&
        !["sitemap.html", "sitemap.xml"].includes(file)
    );
} catch (err) {
  console.error("⚠️ Gagal membaca file HTML:", err.message);
}

// === Ambil data dari artifacts.json ===
let artifacts = [];
const jsonPath = path.join(rootDir, "artifacts.json");
if (fs.existsSync(jsonPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    if (Array.isArray(data)) {
      artifacts = data;
      console.log(`📄 artifacts.json terbaca: ${artifacts.length} item`);
    } else {
      console.warn("⚠️ artifacts.json bukan array, dilewati");
    }
  } catch (err) {
    console.error("⚠️ Gagal parsing artifacts.json:", err.message);
  }
} else {
  console.warn("⚠️ artifacts.json tidak ditemukan di root!");
}

// === Generate URL untuk file HTML ===
const htmlUrls = htmlFiles.map((file) => {
  const loc =
    file === "index.html"
      ? `${baseUrl}/`
      : `${baseUrl}/${file.replace(".html", "")}`;
  return {
    loc,
    title: file.replace(".html", ""),
    lastmod: new Date().toISOString(),
    priority: file === "index.html" ? "1.0" : "0.8",
  };
});

// === Generate URL untuk artifacts (JSON posts) ===
const artifactUrls = artifacts
  .filter((a) => a && a.l)
  .map((a) => ({
    loc: a.l.startsWith("http") ? a.l : `${baseUrl}/${a.l}`,
    title: a.t || a.i,
    lastmod: new Date().toISOString(),
    priority: "0.5",
  }));

// === Gabungkan semua URL ===
const allUrls = [...htmlUrls, ...artifactUrls];
if (allUrls.length === 0) {
  console.warn("⚠️ Tidak ada URL yang ditemukan untuk sitemap!");
}

// === Generate sitemap.xml ===
const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

fs.writeFileSync(path.join(rootDir, "sitemap.xml"), xmlContent);
console.log(`✅ sitemap.xml berhasil dibuat! (${allUrls.length} URL)`);

// === Generate sitemap.html (untuk manusia) ===
const htmlLinks = allUrls
  .map(
    (u) =>
      `<li><a href="${u.loc}" target="_blank" rel="noopener">${u.title || u.loc}</a></li>`
  )
  .join("\n");

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sitemap | Videyweb</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #e2e2e2; padding: 2rem; }
  h1 { color: #00ff88; }
  ul { list-style: none; padding-left: 0; }
  li { margin: 0.4rem 0; }
  a { color: #00c3ff; text-decoration: none; }
  a:hover { text-decoration: underline; color: #00ff88; }
</style>
</head>
<body>
  <h1>Videyweb Sitemap</h1>
  <p>Generated on ${new Date().toLocaleString("id-ID")}</p>
  <ul>${htmlLinks}</ul>
</body>
</html>`;

fs.writeFileSync(path.join(rootDir, "sitemap.html"), htmlContent);
console.log("✅ sitemap.html berhasil dibuat!");