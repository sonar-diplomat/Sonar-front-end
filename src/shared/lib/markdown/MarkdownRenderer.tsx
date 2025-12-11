import React from 'react';
import styles from './MarkdownRenderer.module.css';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

/**
 * Simple markdown renderer for basic markdown syntax
 * Supports: # headings, **bold**, *italic*, `code`, [links](url), line breaks
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
    if (!content) return null;

    const parseInlineMarkdown = (text: string): React.ReactNode[] => {
        const nodes: React.ReactNode[] = [];
        let key = 0;

        // Pattern for inline markdown elements
        const patterns = [
            { regex: /\*\*(.+?)\*\*/g, type: 'bold' }, // **bold**
            { regex: /\*(.+?)\*/g, type: 'italic' }, // *italic*
            { regex: /`(.+?)`/g, type: 'code' }, // `code`
            { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' }, // [text](url)
        ];

        const matches: Array<{ start: number; end: number; type: string; content: string; url?: string }> = [];

        // Find all matches
        patterns.forEach(({ regex, type }) => {
            regex.lastIndex = 0;
            let match;
            while ((match = regex.exec(text)) !== null) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    type,
                    content: match[1],
                    url: type === 'link' ? match[2] : undefined,
                });
            }
        });

        // Sort matches by start position
        matches.sort((a, b) => a.start - b.start);

        // Remove overlapping matches (keep the first one)
        const nonOverlapping: typeof matches = [];
        for (const match of matches) {
            const overlaps = nonOverlapping.some(
                (existing) => !(match.end <= existing.start || match.start >= existing.end)
            );
            if (!overlaps) {
                nonOverlapping.push(match);
            }
        }

        // Process text with matches
        let currentPos = 0;
        nonOverlapping.forEach((match) => {
            // Add text before match
            if (match.start > currentPos) {
                const textBefore = text.slice(currentPos, match.start);
                if (textBefore) {
                    nodes.push(<React.Fragment key={`text-${key++}`}>{textBefore}</React.Fragment>);
                }
            }

            // Add matched element
            switch (match.type) {
                case 'bold':
                    nodes.push(<strong key={`bold-${key++}`}>{match.content}</strong>);
                    break;
                case 'italic':
                    nodes.push(<em key={`italic-${key++}`}>{match.content}</em>);
                    break;
                case 'code':
                    nodes.push(<code key={`code-${key++}`} className={styles.code}>{match.content}</code>);
                    break;
                case 'link':
                    nodes.push(
                        <a
                            key={`link-${key++}`}
                            href={match.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                        >
                            {match.content}
                        </a>
                    );
                    break;
            }

            currentPos = match.end;
        });

        // Add remaining text
        if (currentPos < text.length) {
            const remainingText = text.slice(currentPos);
            if (remainingText) {
                nodes.push(<React.Fragment key={`text-${key++}`}>{remainingText}</React.Fragment>);
            }
        }

        return nodes.length > 0 ? nodes : [text];
    };

    const parseMarkdown = (text: string): React.ReactNode[] => {
        const lines = text.split('\n');
        const nodes: React.ReactNode[] = [];
        let key = 0;

        lines.forEach((line, index) => {
            // Process headings (# Heading)
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                const level = Math.min(headingMatch[1].length, 6);
                const headingText = headingMatch[2];
                const headingContent = parseInlineMarkdown(headingText);
                
                switch (level) {
                    case 1:
                        nodes.push(<h1 key={`heading-${key++}`} className={styles.h1}>{headingContent}</h1>);
                        break;
                    case 2:
                        nodes.push(<h2 key={`heading-${key++}`} className={styles.h2}>{headingContent}</h2>);
                        break;
                    case 3:
                        nodes.push(<h3 key={`heading-${key++}`} className={styles.h3}>{headingContent}</h3>);
                        break;
                    case 4:
                        nodes.push(<h4 key={`heading-${key++}`} className={styles.h4}>{headingContent}</h4>);
                        break;
                    case 5:
                        nodes.push(<h5 key={`heading-${key++}`} className={styles.h5}>{headingContent}</h5>);
                        break;
                    case 6:
                        nodes.push(<h6 key={`heading-${key++}`} className={styles.h6}>{headingContent}</h6>);
                        break;
                }
            } else if (line.trim()) {
                // Regular line with inline markdown
                nodes.push(
                    <React.Fragment key={`line-${key++}`}>
                        {parseInlineMarkdown(line)}
                    </React.Fragment>
                );
            }

            // Add line break if not the last line
            if (index < lines.length - 1) {
                nodes.push(<br key={`br-${key++}`} />);
            }
        });

        return nodes;
    };

    return (
        <div className={`${styles.markdown} ${className}`}>
            {parseMarkdown(content)}
        </div>
    );
};

