import DOMPurify from 'dompurify';
import { marked } from 'marked';

/**
 * Render the admin's Markdown to sanitised HTML for the preview and the
 * email payload. DOMPurify strips scripts, event handlers, and unsafe
 * URLs; the backend sanitises again with nh3 before sending.
 */
export function renderMarkdown(src: string): string {
	const html = marked.parse(src, { async: false, breaks: true, gfm: true });
	return DOMPurify.sanitize(html);
}
