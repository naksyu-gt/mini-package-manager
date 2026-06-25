import semver from "semver";
import { fetchPackageManifest } from "./npm.js";
import {
  conflictLog,
  resolveByLockfileLog,
  resolveByManifestLog,
} from "./logger.js";
import { addLockFile, readLockedPackageInfo } from "./lockJson.js";
import type {
  ConflictedPackageInfo,
  DependenciesMap,
  PackageName,
  ResolvedPackageInfo,
  VersionConstraint,
} from "./types.js";

export async function resolvePackageLatestVersion(
  name: PackageName,
): Promise<string> {
  const manifest = await fetchPackageManifest(name);
  return manifest["dist-tags"].latest;
}

export async function resolvePackage(
  name: PackageName,
  versionConstraint: VersionConstraint,
): Promise<ResolvedPackageInfo> {
  const locked = readLockedPackageInfo(name, versionConstraint);

  if (locked) {
    resolveByLockfileLog(name, versionConstraint, locked.version);
    addLockFile(name, versionConstraint, locked);
    return locked;
  }

  const manifest = await fetchPackageManifest(name);

  const version = semver.maxSatisfying(
    Object.keys(manifest.versions),
    versionConstraint,
  );

  if (!version) {
    throw new Error(
      `Satisfied version not found: ${name}@${versionConstraint}`,
    );
  }

  const versionInfo = manifest.versions[version];

  const resolved: ResolvedPackageInfo = {
    version,
    url: versionInfo.dist.tarball,
    shasum: versionInfo.dist.shasum,
    dependencies: versionInfo.dependencies ?? {},
  };

  resolveByManifestLog(name, versionConstraint, version);
  addLockFile(name, versionConstraint, resolved);

  return resolved;
}

export async function collectDepsPackageList(
  name: PackageName,
  versionConstraint: VersionConstraint,
  rootDependenciesMap: Readonly<DependenciesMap>,
  topLevelList: DependenciesMap,
  conflictedList: ConflictedPackageInfo[],
  dependencyStack: PackageName[],
): Promise<void> {
  dependencyStack.push(name);

  const packageInfo = await resolvePackage(name, versionConstraint);

  const topLevelExists = topLevelList[name] !== undefined;
  const topLevelVersion = topLevelList[name];
  const isRootDependency = dependencyStack.length === 1;

  const isCompatibleToTopLevel =
    topLevelExists && semver.satisfies(topLevelVersion, versionConstraint);

  if (!topLevelExists && isRootDependency) {
    topLevelList[name] = packageInfo.version;
  } else if (!topLevelExists && !rootDependenciesMap[name]) {
    topLevelList[name] = packageInfo.version;
  } else if (!topLevelExists && rootDependenciesMap[name]) {
    const rootResolved = await resolvePackage(name, rootDependenciesMap[name]);

    if (semver.satisfies(rootResolved.version, versionConstraint)) {
      // root のバージョンで満たせるので、別途入れない
    } else {
      conflictLog(name, versionConstraint, rootDependenciesMap[name]);

      const parent = dependencyStack[dependencyStack.length - 2];

      conflictedList.push({
        name,
        version: packageInfo.version,
        parent,
      });
    }
  } else if (topLevelExists && isCompatibleToTopLevel) {
    // すでに node_modules 直下にあり、互換性もあるので何もしない
  } else {
    conflictLog(name, versionConstraint, rootDependenciesMap[name]);

    const parent = dependencyStack[dependencyStack.length - 2];

    conflictedList.push({
      name,
      version: packageInfo.version,
      parent,
    });
  }

  for (const [depName, depVersionConstraint] of Object.entries(
    packageInfo.dependencies,
  )) {
    await collectDepsPackageList(
      depName,
      depVersionConstraint,
      rootDependenciesMap,
      topLevelList,
      conflictedList,
      dependencyStack,
    );
  }

  dependencyStack.pop();
}
