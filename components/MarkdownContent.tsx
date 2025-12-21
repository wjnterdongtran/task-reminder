"use client";

import ReactMarkdown from "react-markdown";

type StyleVariant = "default" | "eink";

interface MarkdownContentProps {
    content: string;
    className?: string;
    variant?: StyleVariant;
}

// Style configurations for each variant
const styles = {
    default: {
        container: "prose prose-invert prose-sm max-w-none",
        strong: "font-semibold text-cyan-300",
        em: "italic text-slate-300",
        a: "text-cyan-400 hover:text-cyan-300 underline",
        p: "mb-2 last:mb-0 leading-relaxed",
        ul: "list-disc list-inside space-y-1 my-2",
        ol: "list-decimal list-inside space-y-1 my-2",
        li: "text-slate-300",
        code: "px-1.5 py-0.5 bg-slate-700/50 rounded text-cyan-300 text-sm font-mono",
        pre: "p-3 bg-slate-800/50 rounded-lg overflow-x-auto my-2",
        bullet: "text-slate-500",
    },
    eink: {
        container: "prose prose-sm max-w-none font-serif-alt",
        strong: "font-semibold text-ink",
        em: "italic text-muted",
        a: "text-ink-dark hover:text-ink underline decoration-stone",
        p: "mb-2 last:mb-0 leading-relaxed text-ink",
        ul: "list-disc list-inside space-y-1 my-2",
        ol: "list-decimal list-inside space-y-1 my-2",
        li: "text-muted",
        code: "px-1.5 py-0.5 bg-stone/50 rounded text-ink-dark text-sm font-mono",
        pre: "p-3 bg-paper rounded-lg border border-stone overflow-x-auto my-2",
        bullet: "text-subtle",
    },
};

/**
 * Component for rendering markdown content with styled elements
 * Supports: bold, italic, links, lists, code
 * @param variant - "default" for dark theme, "eink" for light paper-like theme
 */
export default function MarkdownContent({
    content,
    className = "",
    variant = "default",
}: MarkdownContentProps) {
    const s = styles[variant];

    return (
        <div className={`${s.container} ${className}`}>
            <ReactMarkdown
                components={{
                    // Bold text
                    strong: ({ children }) => (
                        <strong className={s.strong}>{children}</strong>
                    ),
                    // Italic text
                    em: ({ children }) => (
                        <em className={s.em}>{children}</em>
                    ),
                    // Links
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={s.a}
                        >
                            {children}
                        </a>
                    ),
                    // Paragraphs
                    p: ({ children }) => (
                        <p className={s.p}>{children}</p>
                    ),
                    // Unordered lists
                    ul: ({ children }) => (
                        <ul className={s.ul}>{children}</ul>
                    ),
                    // Ordered lists
                    ol: ({ children }) => (
                        <ol className={s.ol}>{children}</ol>
                    ),
                    // List items
                    li: ({ children }) => (
                        <li className={s.li}>{children}</li>
                    ),
                    // Inline code
                    code: ({ children }) => (
                        <code className={s.code}>{children}</code>
                    ),
                    // Code blocks
                    pre: ({ children }) => (
                        <pre className={s.pre}>{children}</pre>
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
    className = "",
    ordered = false,
    variant = "default",
}: {
    items: string[];
    className?: string;
    ordered?: boolean;
    variant?: StyleVariant;
}) {
    if (!items || items.length === 0) return null;

    const s = styles[variant];

    return (
        <div className={className}>
            {items.map((item, index) => (
                <div key={index} className="flex gap-2 py-1">
                    <span className={`${s.bullet} shrink-0 my-2`}>
                        {ordered ? `${index + 1}.` : "•"}
                    </span>
                    <MarkdownContent
                        content={item}
                        className="flex-1"
                        variant={variant}
                    />
                </div>
            ))}
        </div>
    );
}
