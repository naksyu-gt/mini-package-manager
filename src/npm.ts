import { mkdir } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import * as tar from "tar";
import { installLog } from "./logger.js";
import type { NpmManifest, PackageName, Version } from "./types.js";

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

export async function installPackage(
  name: PackageName,
  version: Version,
  path: string,
): Promise<void> {
  const manifest = await fetchPackageManifest(name);

  const tarballUrl = manifest.versions[version]?.dist.tarball;

  if (!tarballUrl) {
    throw new Error(`Tarball URL not found: ${name}@${version}`);
  }

  const fullPath = `${process.cwd()}/${path}`;

  await mkdir(fullPath, { recursive: true });

  const response = await fetch(tarballUrl);

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download tarball: ${name}@${version}`);
  }

  await pipeline(
    Readable.fromWeb(response.body as any),
    tar.extract({
      cwd: fullPath,
      strip: 1,
    }),
  );

  installLog(name, version, path);
}
