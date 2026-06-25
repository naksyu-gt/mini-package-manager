import type { NpmManifest, PackageName } from "./types.js";

const REGISTRY_URL = "https://registry.npmjs.org";

const MANIFEST_CACHE: Record<PackageName, NpmManifest> = {};

export async function fetchPackageManifest(
  name: PackageName,
): Promise<NpmManifest> {
  if (MANIFEST_CACHE[name]) {
    return MANIFEST_CACHE[name];
  }

  const url = `${REGISTRY_URL}/${name}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch manifest: ${name}`);
  }

  const manifest = (await response.json()) as NpmManifest;
  MANIFEST_CACHE[name] = manifest;

  return manifest;
}
