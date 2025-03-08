import { type CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../schema.graphql",
  documents: ["src/**/*.tsx", "src/**/*.ts"],
  overwrite: true,
  generates: {
    "./src/__generated__/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: {
          // make the fragment masking function name less confusing
          unmaskFunctionName: "getFragmentData",
        },
      },
      config: {
        documentMode: "string",
      },
    },
  },
};

export default config;
