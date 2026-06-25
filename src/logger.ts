import type { PackageName, Version, VersionConstraint } from "./types.js";

export function resolveByManifestLog(
  name: PackageName,
  constraint: VersionConstraint,
  version: Version,
): void {
  console.log(`[Resolve by manifest] ${name}@${constraint} to ${version}`);
}

export function resolveByLockfileLog(
  name: PackageName,
  constraint: VersionConstraint,
  version: Version,
): void {
  console.log(`[Resolve by lockfile] ${name}@${constraint} to ${version}`);
}

export function installLog(
  name: PackageName,
  version: Version,
  path: string,
): void {
  console.log(`[Installed] ${name}@${version} > ${path}`);
}

export function conflictLog(
  name: PackageName,
  constraint: VersionConstraint,
  rootConstraint: VersionConstraint | undefined,
): void {
  console.log(
    `[Conflict] ${name}@${constraint} is conflicted with root ${rootConstraint}`,
  );
}
