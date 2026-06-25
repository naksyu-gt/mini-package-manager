import { readFile, writeFile } from "node:fs/promises";
import type {
  LockFile,
  PackageName,
  ResolvedPackageInfo,
  VersionConstraint,
} from "./types.js";

const LOCK_FILE_PATH = `${process.cwd()}/mini-pm.lock.json`;

const currentLockFile: LockFile = {};
const newLockFile: LockFile = {};

export async function readLockFile(): Promise<void> {
  const data = await readFile(LOCK_FILE_PATH, "utf-8").catch((error) => {
    if (error.code === "ENOENT") {
      return "{}";
    }

    throw error;
  });

  const parsed = JSON.parse(data) as LockFile;

  Object.assign(currentLockFile, parsed);
}

export function readLockedPackageInfo(
  name: PackageName,
  versionConstraint: VersionConstraint,
): ResolvedPackageInfo | null {
  return currentLockFile[`${name}@${versionConstraint}`] ?? null;
}

export function addLockFile(
  name: PackageName,
  versionConstraint: VersionConstraint,
  info: ResolvedPackageInfo,
): void {
  newLockFile[`${name}@${versionConstraint}`] = info;
}

export async function writeLockFile(): Promise<void> {
  const sorted = Object.fromEntries(
    Object.entries(newLockFile).sort(([a], [b]) => a.localeCompare(b)),
  );

  await writeFile(LOCK_FILE_PATH, JSON.stringify(sorted, null, 2), "utf-8");
}
