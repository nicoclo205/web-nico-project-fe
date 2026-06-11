interface EmptyStateProps {
	icon?: string;
	title: string;
	description?: string;
	actionLabel?: string;
	onAction?: () => void;
}

/**
 * Standardized empty state with optional call-to-action (UI standardization).
 */
function EmptyState({ icon = '🔍', title, description, actionLabel, onAction }: EmptyStateProps) {
	return (
		<div className="text-center py-12 px-6 bg-surface border border-white/5 rounded-2xl">
			<span className="text-6xl mb-4 block">{icon}</span>
			<p className="text-white text-lg font-semibold">{title}</p>
			{description && <p className="text-gray-400 text-sm mt-2">{description}</p>}
			{actionLabel && onAction && (
				<button onClick={onAction} className="btn-primary mt-6 px-6 py-3">
					{actionLabel}
				</button>
			)}
		</div>
	);
}

export default EmptyState;
