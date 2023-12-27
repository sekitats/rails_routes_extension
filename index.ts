import { watch, mkdir } from "fs";
import { join, resolve } from "path";
import { rimraf } from "rimraf";

const srcDir = resolve(import.meta.dir, "src");
const publicDir = resolve(import.meta.dir, "public");
const distDir = resolve(import.meta.dir, "dist");
const popup = Bun.file(join(publicDir, "popup.html"));
const panel = Bun.file(join(publicDir, "panel.html"));
const devtools = Bun.file(join(publicDir, "devtools.html"));
const manifest = Bun.file(join(publicDir, "manifest.json"));
const css = Bun.file(join(publicDir, "popup.css"));

await rimraf(distDir);
mkdir(distDir, async (err) => {
  if (err) console.error(err);
});

// @ts-ignore
if (!Bun.env.DEV_SERVER_PORT) {
  throw new Error(
    "Set the port number of webpack dev server to DEV_SERVER_PORT in the .env file"
  );
}

watch(
  import.meta.dir,
  {
    recursive: true,
  },
  async (event, filename) => {
    await Bun.build({
      entrypoints: [
        join(srcDir, "background.ts"),
        join(srcDir, "contentScript.ts"),
        join(srcDir, "popup.ts"),
        join(srcDir, "panel.ts"),
        join(srcDir, "devtools.ts"),
        join(srcDir, "index.jsx"),
      ],
      outdir: distDir,
      naming: "[name].bundle.[ext]",
      define: {
        DEV_SERVER_PORT: JSON.stringify(Bun.env.DEV_SERVER_PORT),
      },
    });
    await Bun.write(join(distDir, "popup.html"), popup);
    await Bun.write(join(distDir, "devtools.html"), devtools);
    await Bun.write(join(distDir, "panel.html"), panel);
    await Bun.write(join(distDir, "manifest.json"), manifest);
    await Bun.write(join(distDir, "popup.css"), css);
  }
);
console.log("Watch started...");
