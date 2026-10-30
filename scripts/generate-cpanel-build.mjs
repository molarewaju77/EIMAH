import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const serverPath = path.resolve(root, ".output/server/index.mjs");
const publicDir = path.resolve(root, ".output/public");

async function main() {
  console.log("Generating index.html from TanStack Start server...");
  const serverModule = await import(`file://${serverPath.replace(/\\/g, "/")}`);
  const handler = serverModule.default;

  const res = await handler.fetch(
    new Request("https://eimah.com/"),
    {},
    { waitUntil: () => {} },
  );

  if (res.status !== 200) {
    throw new Error(`Prerender failed with status ${res.status}`);
  }

  let html = await res.text();

  // Write index.html to .output/public
  const indexHtmlPath = path.join(publicDir, "index.html");
  fs.writeFileSync(indexHtmlPath, html, "utf-8");
  console.log(`Wrote index.html (${html.length} bytes) to ${indexHtmlPath}`);

  // Create .htaccess for Apache / LiteSpeed (cPanel)
  const htaccessContent = `# Apache / LiteSpeed configuration for EIMAH SPA / TanStack Start
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Prevent rewriting existing files or directories
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable Gzip / Brotli compression for static assets
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json image/svg+xml
</IfModule>

# Set caching headers for immutable Vite assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
</IfModule>
`;

  const htaccessPath = path.join(publicDir, ".htaccess");
  fs.writeFileSync(htaccessPath, htaccessContent, "utf-8");
  console.log(`Wrote .htaccess to ${htaccessPath}`);

  // Automatically package build.zip (for local Windows/cPanel workflows)
  // On Vercel / CI environments, skip or package safely without failing the build.
  if (process.env.VERCEL) {
    console.log("Vercel deployment environment detected. Skipping cPanel build.zip packaging.");
    return;
  }

  try {
    console.log("Packaging build.zip for cPanel...");
    const zipPath = path.resolve(root, "build.zip");
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    const { execSync } = await import("node:child_process");
    if (process.platform === "win32") {
      const psCmd = `powershell -NoProfile -Command "Get-ChildItem -Path '${publicDir.replace(/'/g, "''")}' -Force | Compress-Archive -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force"`;
      execSync(psCmd, { stdio: "inherit" });
      console.log(`Successfully generated ready-to-upload build.zip at: ${zipPath}`);
    } else {
      // Linux / macOS fallback
      try {
        execSync(`cd "${publicDir}" && zip -r "${zipPath}" .`, { stdio: "inherit" });
        console.log(`Successfully generated ready-to-upload build.zip at: ${zipPath}`);
      } catch {
        console.log("Note: zip command not found or skipped on this platform.");
      }
    }
  } catch (zipError) {
    console.warn("Notice: build.zip could not be packaged automatically:", zipError.message);
  }
}

main().catch((err) => {
  console.error("Error generating static files:", err);
  process.exit(1);
});

