import { readFile } from "node:fs/promises";
import type { PackageDependencyMap } from "./types.js";

const PACKAGE_JSON_PATH = `${process.cwd()}/package.json`;

export async function parsePackageJson(): Promise<PackageDependencyMap> {
  const data = await readFile(PACKAGE_JSON_PATH, "utf-8");
  const json = JSON.parse(data);

  return {
    dependencies: json.dependencies ?? {},
    devDependencies: json.devDependencies ?? {},
  };
}
