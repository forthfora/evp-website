import { useEffect } from 'react';

interface PageMetaProps {
	title: string;
	description: string;
}

export function PageMeta({ title, description }: PageMetaProps) {
	useEffect(() => {
		document.title = `${title} | EVP`;
		document.querySelector('meta[name="description"]')?.setAttribute('content', description);
	}, [title, description]);

	return null;
}
