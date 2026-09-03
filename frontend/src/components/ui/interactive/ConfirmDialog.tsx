import { AnimatePresence, motion } from 'framer-motion';
import { type RefObject, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/utils/cn';

import { SectionDivider } from '../section/SectionDivider';
import { buttonVariants } from './button/button-variants';

type DialogPosition =
	| 'center'
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'middle-left'
	| 'middle-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

type AnchorPlacement = 'top' | 'bottom' | 'left' | 'right';
type AnchorAlign = 'start' | 'center' | 'end';

const positionClasses: Record<DialogPosition, string> = {
	center: 'items-center justify-center',
	'top-left': 'items-start justify-start',
	'top-center': 'items-start justify-center',
	'top-right': 'items-start justify-end',
	'middle-left': 'items-center justify-start',
	'middle-right': 'items-center justify-end',
	'bottom-left': 'items-end justify-start',
	'bottom-center': 'items-end justify-center',
	'bottom-right': 'items-end justify-end',
};

const FOCUSABLE_SELECTOR = [
	'a[href]',
	'button:not([disabled])',
	'textarea:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
		(el) => el.offsetParent !== null, // excludes hidden/display:none elements
	);
}

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	/** Style the confirm button as destructive (e.g. log out). */
	destructive?: boolean;
	/** Fixed position on screen. Defaults to 'center'. Ignored when `anchorRef` is set. */
	position?: DialogPosition;
	/**
	 * Element to anchor the dialog to (e.g. the button that opened it).
	 * When provided, the dialog is positioned relative to this element instead of `position`.
	 */
	anchorRef?: RefObject<HTMLElement | null>;
	/** Side of the anchor to place the dialog on. Defaults to 'bottom'. */
	anchorPlacement?: AnchorPlacement;
	/** Alignment along the anchor's edge. Defaults to 'start'. */
	anchorAlign?: AnchorAlign;
	/** Gap between the anchor and the dialog, in pixels. Defaults to 8. */
	anchorOffset?: number;
	/** Close the dialog when clicking the backdrop. Defaults to true. */
	closeOnBackdropClick?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmDialog({
	open,
	title,
	message,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	destructive = false,
	position = 'center',
	anchorRef,
	anchorPlacement = 'bottom',
	anchorAlign = 'start',
	anchorOffset = 8,
	closeOnBackdropClick = true,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const titleId = useId();
	const descriptionId = useId();
	const cancelRef = useRef<HTMLButtonElement | null>(null);
	const dialogRef = useRef<HTMLDivElement | null>(null);
	const triggerElementRef = useRef<HTMLElement | null>(null);

	const onConfirmRef = useRef(onConfirm);
	const onCancelRef = useRef(onCancel);
	useLayoutEffect(() => {
		onConfirmRef.current = onConfirm;
		onCancelRef.current = onCancel;
	}, [onConfirm, onCancel]);

	const [anchoredCoords, setAnchoredCoords] = useState<{ top: number; left: number } | null>(null);

	useLayoutEffect(() => {
		if (!open) return;

		triggerElementRef.current = document.activeElement as HTMLElement | null;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onCancelRef.current();
				return;
			}

			if (event.key !== 'Tab' || !dialogRef.current) return;

			const focusable = getFocusableElements(dialogRef.current);
			if (focusable.length === 0) {
				event.preventDefault();
				return;
			}

			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			const active = document.activeElement;

			if (event.shiftKey) {
				if (active === first || !dialogRef.current.contains(active)) {
					event.preventDefault();
					last.focus();
				}
			} else {
				if (active === last || !dialogRef.current.contains(active)) {
					event.preventDefault();
					first.focus();
				}
			}
		};
		window.addEventListener('keydown', onKeyDown);

		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		cancelRef.current?.focus();

		return () => {
			window.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = prevOverflow;
			triggerElementRef.current?.focus();
		};
	}, [open]);

	useLayoutEffect(() => {
		if (!open || !anchorRef) {
			setAnchoredCoords(null);
			return;
		}

		const updatePosition = () => {
			const anchorEl = anchorRef.current;
			const dialogEl = dialogRef.current;
			if (!anchorEl || !dialogEl) return;

			const anchorRect = anchorEl.getBoundingClientRect();
			const dialogWidth = dialogEl.offsetWidth;
			const dialogHeight = dialogEl.offsetHeight;

			const margin = 8;
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			let top = 0;
			let left = 0;

			switch (anchorPlacement) {
				case 'top':
					top = anchorRect.top - dialogHeight - anchorOffset;
					break;
				case 'bottom':
					top = anchorRect.bottom + anchorOffset;
					break;
				case 'left':
					left = anchorRect.left - dialogWidth - anchorOffset;
					break;
				case 'right':
					left = anchorRect.right + anchorOffset;
					break;
			}

			if (anchorPlacement === 'top' || anchorPlacement === 'bottom') {
				switch (anchorAlign) {
					case 'start':
						left = anchorRect.left;
						break;
					case 'center':
						left = anchorRect.left + anchorRect.width / 2 - dialogWidth / 2;
						break;
					case 'end':
						left = anchorRect.right - dialogWidth;
						break;
				}
			} else {
				switch (anchorAlign) {
					case 'start':
						top = anchorRect.top;
						break;
					case 'center':
						top = anchorRect.top + anchorRect.height / 2 - dialogHeight / 2;
						break;
					case 'end':
						top = anchorRect.bottom - dialogHeight;
						break;
				}
			}

			if (anchorPlacement === 'bottom' && top + dialogHeight > viewportHeight - margin) {
				const flipped = anchorRect.top - dialogHeight - anchorOffset;
				if (flipped >= margin) top = flipped;
			}
			if (anchorPlacement === 'top' && top < margin) {
				const flipped = anchorRect.bottom + anchorOffset;
				if (flipped + dialogHeight <= viewportHeight - margin) top = flipped;
			}
			if (anchorPlacement === 'right' && left + dialogWidth > viewportWidth - margin) {
				const flipped = anchorRect.left - dialogWidth - anchorOffset;
				if (flipped >= margin) left = flipped;
			}
			if (anchorPlacement === 'left' && left < margin) {
				const flipped = anchorRect.right + anchorOffset;
				if (flipped + dialogWidth <= viewportWidth - margin) left = flipped;
			}

			top = Math.min(
				Math.max(top, margin),
				Math.max(margin, viewportHeight - dialogHeight - margin),
			);
			left = Math.min(
				Math.max(left, margin),
				Math.max(margin, viewportWidth - dialogWidth - margin),
			);

			setAnchoredCoords({ top, left });
		};

		updatePosition();

		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);

		const resizeObserver = new ResizeObserver(updatePosition);
		if (anchorRef.current) resizeObserver.observe(anchorRef.current);
		if (dialogRef.current) resizeObserver.observe(dialogRef.current);

		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
			resizeObserver.disconnect();
		};
	}, [open, anchorRef, anchorPlacement, anchorAlign, anchorOffset]);

	const isAnchored = Boolean(anchorRef !== undefined);

	const handleBackdropClick = () => {
		if (closeOnBackdropClick) onCancelRef.current();
	};

	const dialog = (
		<AnimatePresence>
			{open && (
				<div className="fixed inset-0 z-50" onClick={handleBackdropClick}>
					<motion.div
						className="pointer-events-none absolute inset-0 bg-black/40 backdrop-blur-[1px]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
						aria-hidden="true"
					/>

					<div
						className={cn(
							'relative h-full w-full',
							!isAnchored && cn('flex p-4', positionClasses[position]),
						)}
					>
						<motion.div
							ref={dialogRef}
							role="dialog"
							aria-modal="true"
							aria-labelledby={titleId}
							aria-describedby={descriptionId}
							onClick={(event) => event.stopPropagation()}
							className="bg-background/80 glass-box ring-accent/30 relative w-full max-w-xs rounded-2xl p-6 shadow-2xl ring-1"
							style={
								isAnchored
									? {
											position: 'fixed',
											top: anchoredCoords?.top ?? 0,
											left: anchoredCoords?.left ?? 0,
											margin: 0,
											visibility: anchoredCoords ? 'visible' : 'hidden',
										}
									: undefined
							}
							initial={{ opacity: 0, scale: 0.95, y: 30 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 12 }}
							transition={{ duration: 0.2, ease: 'easeOut' }}
						>
							<h2 className="text-xl font-bold">{title}</h2>
							<SectionDivider width="w-68" />
							<p id={descriptionId} className="text-foreground/60 mt-2 text-sm">
								{message}
							</p>
							<div className="mt-6 flex justify-end gap-3">
								<button
									type="button"
									ref={cancelRef}
									onClick={() => onCancelRef.current()}
									className={buttonVariants({ intent: 'ghost', size: 'sm' })}
								>
									{cancelLabel}
								</button>
								<button
									type="button"
									onClick={() => onConfirmRef.current()}
									className={cn(
										buttonVariants({ intent: 'primary', size: 'sm' }),
										destructive && 'bg-red-600 hover:bg-red-500',
									)}
								>
									{confirmLabel}
								</button>
							</div>
						</motion.div>
					</div>
				</div>
			)}
		</AnimatePresence>
	);

	return typeof document !== 'undefined' ? createPortal(dialog, document.body) : null;
}
