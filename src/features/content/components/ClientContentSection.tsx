"use client";

import { MDXRemote } from "next-mdx-remote";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { MDXComponents } from "mdx/types";
import type { ClusterId } from "@/constants/cluster";
import ContentHeader from "./ContentHeader";

const mdxComponents: MDXComponents = {
  h1: () => null,
  table: (props) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
};

interface ClientContentSectionProps {
  title: string;
  cluster: ClusterId;
  mdxResult: MDXRemoteSerializeResult;
  headerAction?: React.ReactNode;
}

export default function ClientContentSection({
  title,
  cluster,
  mdxResult,
  headerAction,
}: ClientContentSectionProps) {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-8">
      <ContentHeader title={title} cluster={cluster} action={headerAction} />
      <div className="prose-jithub mt-8">
        <MDXRemote {...mdxResult} components={mdxComponents} />
      </div>
    </section>
  );
}
