import { parsePackageSpecifier } from "./packageSpecifier.js";
import type { InstallOption, PackageName } from "./types.js";

export default async function install(
  packageNames: PackageName[],
  option: InstallOption = {},
): Promise<void> {
  for (const packageName of packageNames) {
    console.log(packageName, "=>", parsePackageSpecifier(packageName));
  }

  console.log("option:", option);
}
