"use server";

import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { ClusterId } from "@/constants/cluster";
import { getNodeBySlug } from "../utils/pipeline";
import { fixEmphasisEdgeCases } from "../utils/fix-emphasis";

interface SerializedContent {
  title: string;
  cluster: ClusterId;
  mdxResult: MDXRemoteSerializeResult;
}

export async function getSerializedContent(
  slug: string,
): Promise<SerializedContent | null> {
  const node = getNodeBySlug(slug);
  if (!node) return null;

  const mdxResult = await serialize(fixEmphasisEdgeCases(node.content), {
    mdxOptions: {
      format: "md",
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            theme: {
              dark: "github-dark",
              light: "github-light",
            },
            keepBackground: false,
          },
        ],
      ],
    },
  });

  return {
    title: node.frontmatter.title,
    cluster: node.frontmatter.cluster,
    mdxResult,
  };
}
