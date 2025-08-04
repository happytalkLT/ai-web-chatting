import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownMessageProps {
  content: string;
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  const components: Partial<Components> = {
    h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-bold mt-2 mb-1">{children}</h3>,
    h4: ({ children }) => <h4 className="text-base font-bold mt-2 mb-1">{children}</h4>,
    h5: ({ children }) => <h5 className="text-sm font-bold mt-1 mb-1">{children}</h5>,
    h6: ({ children }) => <h6 className="text-xs font-bold mt-1 mb-1">{children}</h6>,
    p: ({ children }) => <p className="mb-2">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-2 ml-4">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 ml-4">{children}</ol>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-500 pl-4 my-2 italic text-gray-300">
        {children}
      </blockquote>
    ),
    code: (props: any) => {
      const { children, inline, className, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      
      if (!inline && match) {
        return (
          <pre className="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto mb-2">
            <code className={className} {...rest}>
              {children}
            </code>
          </pre>
        );
      }
      
      if (!inline) {
        return (
          <pre className="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto mb-2">
            <code {...rest}>
              {children}
            </code>
          </pre>
        );
      }
      
      return (
        <code className="bg-gray-700 text-yellow-300 px-1 py-0.5 rounded text-sm" {...rest}>
          {children}
        </code>
      );
    },
    table: ({ children }) => (
      <div className="overflow-x-auto mb-2">
        <table className="min-w-full border-collapse border border-gray-600">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-700">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-gray-600">{children}</tr>,
    th: ({ children }) => (
      <th className="border border-gray-600 px-3 py-2 text-left font-bold">{children}</th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-600 px-3 py-2">{children}</td>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline"
      >
        {children}
      </a>
    ),
    hr: () => <hr className="my-4 border-gray-600" />,
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    del: ({ children }) => <del className="line-through">{children}</del>,
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}