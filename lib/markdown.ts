/**
 * Preprocess markdown to ensure numbered lists are properly formatted.
 * Markdown requires a blank line before lists for proper parsing.
 */
export function preprocessMarkdown(text: string): string {
  return text.replace(/([^\n])(\n)(\d+\.\s)/g, '$1\n\n$3');
}
