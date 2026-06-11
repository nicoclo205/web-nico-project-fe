import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	message: string;
	confirmLabel: string;
	cancelLabel?: string;
	danger?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

/**
 * Standardized confirmation modal (replaces window.confirm for destructive actions).
 */
function ConfirmDialog({
	open,
	title,
	message,
	confirmLabel,
	cancelLabel,
	danger = false,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const { t } = useTranslation(['common']);
	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
			onClick={onCancel}
		>
			<div
				className="bg-surface border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className="text-lg font-bold text-white mb-2">{title}</h3>
				<p className="text-sm text-gray-400 mb-6">{message}</p>
				<div className="flex gap-3">
					<button onClick={onCancel} className="btn-secondary flex-1 py-2.5">
						{cancelLabel ?? t('common:cancel')}
					</button>
					<button onClick={onConfirm} className={`${danger ? 'btn-danger' : 'btn-primary'} flex-1 py-2.5`}>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}

export default ConfirmDialog;
