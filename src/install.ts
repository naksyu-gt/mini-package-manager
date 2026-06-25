import { parsePackageJson, writePackageJson } from "./packageJson.js";
import { installPackage } from "./npm.js";
import { parsePackageSpecifier } from "./packageSpecifier.js";
import {
  collectDepsPackageList,
  resolvePackageLatestVersion,
} from "./resolver.js";
import { readLockFile, writeLockFile } from "./lockJson.js";
import type {
  ConflictedPackageInfo,
  DependenciesMap,
  InstallOption,
  PackageName,
} from "./types.js";

export default async function install(
  packageNames: PackageName[],
  option: InstallOption = {},
): Promise<void> {
  const packageJson = await parsePackageJson();

  await readLockFile();

  for (const rawPackageName of packageNames) {
    const { name, constraint } = parsePackageSpecifier(rawPackageName);

    const versionConstraint =
      constraint ?? `^${await resolvePackageLatestVersion(name)}`;

    if (option.saveDev) {
      packageJson.devDependencies[name] = versionConstraint;
    } else {
      packageJson.dependencies[name] = versionConstraint;
    }
  }

  const dependenciesMap: DependenciesMap = {
    ...packageJson.dependencies,
  };

  if (!option.production) {
    Object.assign(dependenciesMap, packageJson.devDependencies);
  }

  const topLevelPackageList: DependenciesMap = {};
  const conflictedPackageList: ConflictedPackageInfo[] = [];

  for (const [name, versionConstraint] of Object.entries(dependenciesMap)) {
    await collectDepsPackageList(
      name,
      versionConstraint,
      dependenciesMap,
      topLevelPackageList,
      conflictedPackageList,
      [],
    );
  }

  for (const [name, version] of Object.entries(topLevelPackageList)) {
    await installPackage(name, version, `node_modules/${name}`);
  }

  for (const { name, version, parent } of conflictedPackageList) {
    await installPackage(
      name,
      version,
      `node_modules/${parent}/node_modules/${name}`,
    );
  }

  await writePackageJson(packageJson);
  await writeLockFile();
}
