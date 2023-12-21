import { BunPlugin } from "bun";
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

await rimraf(distDir);
// const exists = await Bun.file(distDir).exists();
// if (!exists) {
mkdir(distDir, async (err) => {
  if (err) console.error(err);
});
// }

const myPlugin: BunPlugin = {
  name: "YAML",
  async setup(build) {
    const { load } = await import("js-yaml");
    const { readFileSync } = await import("fs");

    // when a .yaml file is imported...
    build.onLoad({ filter: /\.(yaml|yml)$/ }, (args) => {
      // read and parse the file
      const text = readFileSync(args.path, "utf8");
      const exports = load(text) as Record<string, any>;

      // and returns it as a module
      return {
        exports,
        loader: "object", // special loader for JS objects
      };
    });
  },
};

const watcher = watch(
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
        join(srcDir, "script.ts"),
        join(srcDir, "panel.ts"),
        join(srcDir, "devtools.ts"),
      ],
      outdir: distDir,
      naming: "[name].bundle.[ext]",
      define: {
        PROJECT_PATH: JSON.stringify(Bun.env.PROJECT_PATH),
      },
      plugins: [myPlugin],
    });
    await Bun.write(join(distDir, "popup.html"), popup);
    await Bun.write(join(distDir, "devtools.html"), devtools);
    await Bun.write(join(distDir, "panel.html"), panel);
    await Bun.write(join(distDir, "manifest.json"), manifest);
  }
);
console.log("Watch started...");
