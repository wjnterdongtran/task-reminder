'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Component for rendering markdown content with styled elements
 * Supports: bold, italic, links, lists, code
 */
export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`prose prose-invert prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
        // Bold text
        strong: ({ children }) => (
          <strong className="font-semibold text-cyan-300">{children}</strong>
        ),
        // Italic text
        em: ({ children }) => (
          <em className="italic text-slate-300">{children}</em>
        ),
        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline"
          >
            {children}
          </a>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),
        // Unordered lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
        ),
        // Ordered lists
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
        ),
        // List items
        li: ({ children }) => (
          <li className="text-slate-300">{children}</li>
        ),
        // Inline code
        code: ({ children }) => (
          <code className="px-1.5 py-0.5 bg-slate-700/50 rounded text-cyan-300 text-sm font-mono">
            {children}
          </code>
        ),
        // Code blocks
        pre: ({ children }) => (
          <pre className="p-3 bg-slate-800/50 rounded-lg overflow-x-auto my-2">
            {children}
          </pre>
        ),
      }}
    >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Render an array of strings as a markdown list
 */
export function MarkdownList({
  items,
  className = '',
  ordered = false,
}: {
  items: string[];
  className?: string;
  ordered?: boolean;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 py-1">
          <span className="text-slate-500 flex-shrink-0">
            {ordered ? `${index + 1}.` : '•'}
          </span>
          <MarkdownContent content={item} className="flex-1" />
        </div>
      ))}
    </div>
  );
}
