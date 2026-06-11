import { CheckCircle, XCircle, Mail, Info } from 'lucide-react';

type Variant = 'error' | 'success' | 'info';

interface AlertMessageProps {
	variant?: Variant;
	message: string;
	/** Show a mail icon instead of the variant icon (e.g. "check your email" messages) */
	showEmailIcon?: boolean;
	className?: string;
}

const STYLES: Record<Variant, { box: string; icon: string; Icon: typeof Info }> = {
	error: {
		box: 'bg-red-500/10 border-red-500/30 text-red-400',
		icon: 'text-red-400',
		Icon: XCircle,
	},
	success: {
		box: 'bg-green-500/10 border-green-500/30 text-green-400',
		icon: 'text-green-400',
		Icon: CheckCircle,
	},
	info: {
		box: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
		icon: 'text-blue-400',
		Icon: Info,
	},
};

/**
 * Unified error/success/info message box (UI standardization).
 * Replaces the old mensajeError and SuccessMessage components.
 */
function AlertMessage({ variant = 'info', message, showEmailIcon = false, className = '' }: AlertMessageProps) {
	const { box, icon, Icon } = STYLES[variant];
	const FinalIcon = showEmailIcon ? Mail : Icon;
	return (
		<div className={`w-full border rounded-lg p-4 mb-4 flex items-start space-x-3 text-sm ${box} ${className}`}>
			<FinalIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${icon}`} />
			<p>{message}</p>
		</div>
	);
}

export default AlertMessage;
