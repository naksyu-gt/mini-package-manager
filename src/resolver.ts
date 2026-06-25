import semver from "semver";
import { fetchPackageManifest } from "./npm.js";
import type {
  PackageName,
  ResolvedPackageInfo,
  VersionConstraint,
} from "./types.js";

export async function resolvePackage(
  name: PackageName,
  versionConstraint: VersionConstraint,
): Promise<ResolvedPackageInfo> {
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

  return {
    version,
    url: versionInfo.dist.tarball,
    shasum: versionInfo.dist.shasum,
    dependencies: versionInfo.dependencies ?? {},
  };
}
