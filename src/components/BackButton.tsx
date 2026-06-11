import { FaArrowLeft } from 'react-icons/fa';

interface BackButtonProps {
	onClick: () => void;
	className?: string;
}

/**
 * Standardized back button (UI standardization) — one arrow style everywhere.
 */
function BackButton({ onClick, className = '' }: BackButtonProps) {
	return (
		<button
			onClick={onClick}
			aria-label="Back"
			className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-300 ${className}`}
		>
			<FaArrowLeft />
		</button>
	);
}

export default BackButton;
