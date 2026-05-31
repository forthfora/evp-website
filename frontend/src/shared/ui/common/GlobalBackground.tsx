import { useEffect, useRef } from 'react';

interface Blob {
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	opacity: number;
	hue: number;
}

const BLOB_COUNT = 40;

function createBlob(width: number, height: number): Blob {
	return {
		x: Math.random() * width,
		y: Math.random() * height,
		vx: (Math.random() - 0.5) * 0.4,
		vy: (Math.random() - 0.5) * 0.4,
		radius: 50 + Math.random() * 160,
		opacity: 0.12 + Math.random() * 0.1,
		hue: 200 + Math.random() * 60, // blue-purple range to match EVP branding
	};
}

export function GlobalBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationId: number;
		let blobs: Blob[] = [];

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		const initBlobs = () => {
			blobs = Array.from({ length: BLOB_COUNT }, () => createBlob(canvas.width, canvas.height));
		};

		const draw = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const isDark = document.documentElement.classList.contains('dark');
			const saturation = isDark ? '40%' : '35%';
			const lightness = isDark ? '55%' : '65%';

			for (const b of blobs) {
				// Drift
				b.x += b.vx;
				b.y += b.vy;

				// Soft bounce
				if (b.x < -b.radius) b.x = canvas.width + b.radius;
				if (b.x > canvas.width + b.radius) b.x = -b.radius;
				if (b.y < -b.radius) b.y = canvas.height + b.radius;
				if (b.y > canvas.height + b.radius) b.y = -b.radius;

				// Radial gradient blob
				const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
				gradient.addColorStop(0, `hsla(${b.hue}, ${saturation}, ${lightness}, ${b.opacity})`);
				gradient.addColorStop(1, `hsla(${b.hue}, ${saturation}, ${lightness}, 0)`);

				ctx.beginPath();
				ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
				ctx.fillStyle = gradient;
				ctx.fill();
			}

			animationId = requestAnimationFrame(draw);
		};

		const handleResize = () => {
			resize();
			initBlobs();
		};

		resize();
		initBlobs();
		draw();

		window.addEventListener('resize', handleResize);
		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return (
		<canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
	);
}
