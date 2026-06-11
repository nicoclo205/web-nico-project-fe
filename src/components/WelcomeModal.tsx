import { useTranslation } from 'react-i18next';
import { GiSoccerBall } from 'react-icons/gi';

interface WelcomeModalProps {
	open: boolean;
	userName: string;
	onClose: () => void;
}

/**
 * One-time welcome modal shown on the user's first visit to the app.
 * Explains what FriendlyBet is, that access is free for a limited time,
 * and thanks the user for their support and appropriate use.
 */
function WelcomeModal({ open, userName, onClose }: WelcomeModalProps) {
	const { t } = useTranslation(['home']);
	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
			onClick={onClose}
		>
			<div
				className="bg-surface border border-white/10 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center gap-3 mb-4">
					<span className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center shrink-0">
						<GiSoccerBall className="text-2xl text-green-400" />
					</span>
					<h2 className="text-xl md:text-2xl font-bold text-white">
						{t('home:welcome.title', { name: userName })}
					</h2>
				</div>

				<div className="space-y-3 text-sm md:text-base text-gray-300 leading-relaxed">
					<p>{t('home:welcome.intro')}</p>
					<p>{t('home:welcome.whatYouCanDo')}</p>
					<p>{t('home:welcome.freeAccess')}</p>
					<p className="text-gray-400">{t('home:welcome.thanks')}</p>
				</div>

				<button
					onClick={onClose}
					className="btn-primary w-full py-3 mt-6 font-semibold"
				>
					{t('home:welcome.cta')}
				</button>
			</div>
		</div>
	);
}

export default WelcomeModal;
