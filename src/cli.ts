import { Command } from "commander";

const program = new Command();

program.name("mini-pm").description("A tiny package manager for learning");

program
  .command("install")
  .argument("[packageNames...]", "packages to install")
  .action((packageNames: string[]) => {
    console.log("install command called");
    console.log("packages:", packageNames);
  });

program.parse();
