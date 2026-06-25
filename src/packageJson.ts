import { readFile, writeFile } from "node:fs/promises";
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

export async function writePackageJson(
  dependencyMap: PackageDependencyMap,
): Promise<void> {
  const data = await readFile(PACKAGE_JSON_PATH, "utf-8");
  const currentJson = JSON.parse(data);

  const newJson = {
    ...currentJson,
    dependencies: dependencyMap.dependencies,
    devDependencies: dependencyMap.devDependencies,
  };

  if (Object.keys(newJson.dependencies).length === 0) {
    delete newJson.dependencies;
  }

  if (Object.keys(newJson.devDependencies).length === 0) {
    delete newJson.devDependencies;
  }

  await writeFile(PACKAGE_JSON_PATH, JSON.stringify(newJson, null, 2));
}
