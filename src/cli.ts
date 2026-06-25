import { Command } from "commander";
import install from "./install.js";

const program = new Command();

program
  .name("mini-pm")
  .description("A tiny package manager for learning")
  .option("--save-dev", "save package to devDependencies")
  .option("--production", "install only dependencies");

program
  .command("install")
  .argument("[packageNames...]", "packages to install")
  .action(async (packageNames: string[]) => {
    const options = program.opts();

    await install(packageNames, {
      saveDev: Boolean(options.saveDev),
      production: Boolean(options.production),
    });
  });

program.parse();
