import type { StorybookConfig } from "@storybook/react-vite";
import path from "node:path";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-themes"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src"),
      "next/link": path.resolve(__dirname, "mocks/next-link.tsx"),
      "next/navigation": path.resolve(__dirname, "mocks/next-navigation.ts"),
      "next/dynamic": path.resolve(__dirname, "mocks/next-dynamic.tsx"),
    };
    return config;
  },
};
export default config;
