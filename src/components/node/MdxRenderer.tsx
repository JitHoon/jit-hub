import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import type { MDXComponents } from "mdx/types";

const mdxComponents: MDXComponents = {
  h1: (props) => <h1 {...props} />,
  h2: (props) => <h2 {...props} />,
  h3: (props) => <h3 {...props} />,
  p: (props) => <p {...props} />,
  ul: (props) => <ul {...props} />,
  ol: (props) => <ol {...props} />,
  li: (props) => <li {...props} />,
  a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
  hr: () => <hr className="my-6 border-border" />,
  blockquote: (props) => (
    <blockquote
      className="border-l-2 border-accent pl-4 italic text-muted"
      {...props}
    />
  ),
  strong: (props) => (
    <strong className="font-bold text-foreground" {...props} />
  ),
};

interface MdxRendererProps {
  source: string;
}

export default async function MdxRenderer({ source }: MdxRendererProps) {
  return (
    <div className="prose-jithub">
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          mdxOptions: {
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
