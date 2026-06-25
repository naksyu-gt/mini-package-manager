export type ParsedPackageSpecifier = {
  name: string;
  constraint: string | null;
};

export function parsePackageSpecifier(input: string): ParsedPackageSpecifier {
  if (input.startsWith("@")) {
    const versionSeparatorIndex = input.indexOf("@", 1);

    if (versionSeparatorIndex === -1) {
      return {
        name: input,
        constraint: null,
      };
    }

    return {
      name: input.slice(0, versionSeparatorIndex),
      constraint: input.slice(versionSeparatorIndex + 1),
    };
  }

  const versionSeparatorIndex = input.indexOf("@");

  if (versionSeparatorIndex === -1) {
    return {
      name: input,
      constraint: null,
    };
  }

  return {
    name: input.slice(0, versionSeparatorIndex),
    constraint: input.slice(versionSeparatorIndex + 1),
  };
}
