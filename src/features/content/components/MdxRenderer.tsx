import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import type { MDXComponents } from "mdx/types";
import { fixEmphasisEdgeCases } from "../utils/fix-emphasis";

const mdxComponents: MDXComponents = {
  h1: () => null,
  h2: (props) => <h2 {...props} />,
  h3: (props) => <h3 {...props} />,
  h4: (props) => <h4 {...props} />,
  p: (props) => <p {...props} />,
  ul: (props) => <ul {...props} />,
  ol: (props) => <ol {...props} />,
  li: (props) => <li {...props} />,
  a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
  hr: (props) => <hr {...props} />,
  blockquote: (props) => <blockquote {...props} />,
  strong: (props) => <strong {...props} />,
  em: (props) => <em {...props} />,
  table: (props) => <table {...props} />,
  thead: (props) => <thead {...props} />,
  tbody: (props) => <tbody {...props} />,
  tr: (props) => <tr {...props} />,
  th: (props) => <th {...props} />,
  td: (props) => <td {...props} />,
  img: (props) => <img {...props} />,
};

interface MdxRendererProps {
  source: string;
}

export default async function MdxRenderer({ source }: MdxRendererProps) {
  return (
    <div className="prose-jithub">
      <MDXRemote
        source={fixEmphasisEdgeCases(source)}
        components={mdxComponents}
        options={{
          mdxOptions: {
            format: "md",
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
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
        }}
      />
    </div>
  );
}
