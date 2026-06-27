import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { GiSoccerBall } from 'react-icons/gi';

interface AnnounceModalProps {
	open: boolean;
	/** Close + mark as seen. */
	onClose: () => void;
	/** Open the donation (QR) modal. Should also mark this modal as seen. */
	onDonate: () => void;
}

/**
 * One-time announcement shown once per user after the World Cup group stage ends.
 * Shows after the first-time WelcomeModal (queued, never stacked) and is gated by
 * a per-user localStorage key in HomePage.
 */
function AnnounceModal({ open, onClose, onDonate }: AnnounceModalProps) {
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
				role="dialog"
				aria-modal="true"
				aria-labelledby="announce-title"
			>
				<div className="flex items-center gap-3 mb-4">
					<span className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center shrink-0">
						<GiSoccerBall className="text-2xl text-green-400" />
					</span>
					<h2 id="announce-title" className="text-xl md:text-2xl font-bold text-white">
						{t('home:announce.title')}
					</h2>
				</div>

				<p className="text-sm md:text-base text-gray-300 leading-relaxed">
					<Trans
						i18nKey="home:announce.body"
						components={{
							donate: (
								<button
									type="button"
									onClick={onDonate}
									className="text-green-400 hover:text-green-300 underline font-medium"
								/>
							),
							about: (
								<Link
									to="/about"
									onClick={onClose}
									className="text-green-400 hover:text-green-300 underline font-medium"
								/>
							),
						}}
					/>
				</p>

				<button
					onClick={onClose}
					className="btn-primary w-full py-3 mt-6 font-semibold"
				>
					{t('home:announce.cta')}
				</button>
			</div>
		</div>
	);
}

export default AnnounceModal;
