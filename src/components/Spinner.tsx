interface SpinnerProps {
	/** sm = inline/button, md = section, lg = full page */
	size?: 'sm' | 'md' | 'lg';
	/** Tailwind border color class, defaults to brand green */
	color?: string;
	className?: string;
}

const SIZES: Record<NonNullable<SpinnerProps['size']>, string> = {
	sm: 'h-5 w-5',
	md: 'h-12 w-12',
	lg: 'h-16 w-16',
};

/**
 * Shared loading spinner (UI standardization).
 * Replaces the ad-hoc animate-spin divs that varied in size/color per page.
 */
function Spinner({ size = 'md', color = 'border-green-500', className = '' }: SpinnerProps) {
	return (
		<div
			className={`animate-spin rounded-full border-b-2 ${SIZES[size]} ${color} ${className}`}
			role="status"
			aria-label="Loading"
		></div>
	);
}

export default Spinner;
