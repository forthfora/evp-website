import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { cn } from '@/utils/cn';

interface PolicyDropdownProps {
	/** Unique ID used for anchor navigation (#contact, #lawful, ...). */
	id: string;
	/** Dropdown heading text. */
	title: string;
	children: ReactNode;
	/** Whether the dropdown starts expanded. Defaults to false. */
	defaultOpen?: boolean;
}

/**
 * Collapsible policy section. The heading acts as a button that toggles the
 * body, with a smooth height animation. The anchor id lives on the wrapper so
 * `#lawful`-style links scroll to the section even when collapsed.
 */
export function PolicyDropdown({ id, title, children, defaultOpen = false }: PolicyDropdownProps) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<section id={id} className="glass-box w-full overflow-hidden">
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				aria-expanded={open}
				aria-controls={`${id}-body`}
				className="flex w-full cursor-pointer items-center justify-between gap-4 p-6 text-left md:p-8"
			>
				<h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
				<motion.span
					animate={{ rotate: open ? 180 : 0 }}
					transition={{ duration: 0.3, ease: 'easeInOut' }}
					className="shrink-0"
				>
					<ChevronDown className="size-7 md:size-8" aria-hidden />
				</motion.span>
			</button>

			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						id={`${id}-body`}
						key="body"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.35, ease: 'easeInOut' }}
						className="overflow-hidden"
					>
						<div
							className={cn(
								'border-t px-6 pt-6 pb-8 md:px-8',
								'flex flex-col gap-4 text-base md:text-lg',
							)}
						>
							{children}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</section>
	);
}
