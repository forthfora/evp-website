import { renderMarkdown } from './render-markdown';

describe('renderMarkdown', () => {
	it('renders Markdown to HTML', () => {
		const html = renderMarkdown('# Title\n\nSome **bold** text.');
		expect(html).toContain('<h1>Title</h1>');
		expect(html).toContain('<strong>bold</strong>');
	});

	it('strips script tags and their content', () => {
		const html = renderMarkdown('<script>alert("xss")</script>Hello');
		expect(html).not.toContain('<script>');
		expect(html).not.toContain('alert');
		expect(html).toContain('Hello');
	});

	it('strips event handler attributes', () => {
		const html = renderMarkdown('<img src="x.png" onerror="alert(1)">');
		expect(html).not.toContain('onerror');
		expect(html).toContain('src="x.png"');
	});

	it('strips javascript: URLs', () => {
		const html = renderMarkdown('<a href="javascript:alert(2)">click</a>');
		expect(html).not.toContain('javascript:');
		expect(html).toContain('click');
	});

	it('keeps ordinary links and images', () => {
		const html = renderMarkdown('[site](https://example.com)![img](https://example.com/i.png)');
		expect(html).toContain('href="https://example.com"');
		expect(html).toContain('src="https://example.com/i.png"');
	});
});
