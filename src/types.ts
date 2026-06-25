export type PackageName = string;
export type Version = string;
export type VersionConstraint = string;

export type DependenciesMap = Record<PackageName, VersionConstraint>;

export type PackageDependencyMap = {
  dependencies: DependenciesMap;
  devDependencies: DependenciesMap;
};

export type InstallOption = {
  saveDev?: boolean;
  production?: boolean;
};

export type NpmManifest = {
  name: PackageName;
  "dist-tags": {
    latest: Version;
  };
  versions: Record<
    Version,
    {
      dist: {
        tarball: string;
        shasum?: string;
      };
      dependencies?: DependenciesMap;
    }
  >;
};

export type ResolvedPackageInfo = {
  version: Version;
  url: string;
  shasum?: string;
  dependencies: DependenciesMap;
};

export type LockFile = Record<string, ResolvedPackageInfo>;

export type ConflictedPackageInfo = {
  name: PackageName;
  version: Version;
  parent: PackageName;
};
