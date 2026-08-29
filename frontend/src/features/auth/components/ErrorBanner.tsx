import { motion } from 'framer-motion';

export function ErrorBanner({ message }: { message: string }) {
	return (
		<motion.p
			initial={{ opacity: 0, y: -8 }}
			animate={{ opacity: 1, y: 0 }}
			className="min-h-5 text-center text-sm text-red-500"
			role="alert"
		>
			{message}
		</motion.p>
	);
}
