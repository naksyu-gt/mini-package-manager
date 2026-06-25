import { parsePackageJson } from "./packageJson.js";
import { fetchPackageManifest } from "./npm.js";
import type { InstallOption, PackageName } from "./types.js";

export default async function install(
  packageNames: PackageName[],
  option: InstallOption = {},
): Promise<void> {
  const packageJson = await parsePackageJson();

  console.log("package.json:");
  console.log(packageJson);

  for (const packageName of packageNames) {
    const manifest = await fetchPackageManifest(packageName);

    console.log("manifest name:", manifest.name);
    console.log("latest:", manifest["dist-tags"].latest);
    console.log("version count:", Object.keys(manifest.versions).length);
  }

  console.log("option:", option);
}
