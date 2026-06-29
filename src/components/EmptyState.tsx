import React from 'react';
import { FiSearch } from 'react-icons/fi';

interface EmptyStateProps {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	actionLabel?: string;
	onAction?: () => void;
}

function EmptyState({ icon = <FiSearch className="text-6xl mb-4 mx-auto text-gray-400" />, title, description, actionLabel, onAction }: EmptyStateProps) {
	return (
		<div className="text-center py-12 px-6 bg-surface border border-white/5 rounded-2xl">
			<div className="text-6xl mb-4 flex justify-center">{icon}</div>
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
