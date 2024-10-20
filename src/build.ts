import fs from "fs/promises";
import path from "path";
import { glob } from "glob";

import chalk from "chalk";

import type { IKnittyConfig } from ".";

const currentDirectory = process.cwd();

const {
  default: config,
}: {
  default: IKnittyConfig;
} = await import(path.join(currentDirectory, "knitty.config.ts"));

const pages = await glob(`src/pages/**/*`);

await fs.mkdir(config.outputDirectory, { recursive: true });

const handleLayout = async (frontmatter: Record<string, any>, code: string) => {
  const raw_layout = await fs.readFile(
    path.join("src/_includes", frontmatter.layout),
    "utf-8"
  );

  return raw_layout.replace(/\{\s*(.*?)\s*\}/g, (_, variable) => frontmatter[variable] || code);
};

const startTime = new Date();
console.log(chalk.cyan("[KNIT] Building website!"))

// Process each page file
for (const pagePath of pages) {
  const file = await fs.readFile(pagePath, "utf-8");
  const fileExtension = pagePath.split(".").slice(1).join(".");

  const handler = config.handlers.find((x) =>
    x.fileExtensions.includes(fileExtension)
  );
  if (!handler) {
    console.warn(
      `couldn't find a handler for file type: ${fileExtension}, skipping ${pagePath}`
    );
    continue;
  }

  const output = handler.parse(file);

  fs.writeFile(
    path.join(
      config.outputDirectory,
      pagePath.replace("src/pages/", "").replace("src\\pages\\", "").replace(fileExtension, "html")
    ),
    await handleLayout(output.frontmatter, output.compiledCode)
  );
  console.log(chalk.cyan(`[KNIT] Wrote ${pagePath}`))
}

// Imports entire public folder into build folder
if (await fs.exists(config.publicFolder)) {
  fs.cp(config.publicFolder, config.outputDirectory, { recursive: true });
  console.log(chalk.cyan(`[KNIT] Wrote ${config.publicFolder} to ${config.outputDirectory}`))
}

console.log(chalk.cyan(`[KNIT] Finished building website in ${(new Date().getTime() - startTime.getTime()) / 100}s`))
