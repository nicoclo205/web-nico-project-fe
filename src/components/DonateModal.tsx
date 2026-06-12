import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaHeart } from 'react-icons/fa';
import { FiX, FiCopy, FiCheck, FiMail } from 'react-icons/fi';

const BREB_KEY = '@MCL767';
const SUPPORT_EMAIL = 'global.niclami@gmail.com';

interface DonateModalProps {
	open: boolean;
	onClose: () => void;
}

/**
 * Voluntary donation modal: friendly pitch + Bre-B QR code + copyable key.
 * Opened from the "Support us" heart in the sidebar.
 */
function DonateModal({ open, onClose }: DonateModalProps) {
	const { t } = useTranslation(['donate']);
	const [copied, setCopied] = useState(false);

	if (!open) return null;

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(BREB_KEY);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			/* clipboard unavailable: ignore */
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
			onClick={onClose}
		>
			<div
				className="bg-surface border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="donate-title"
			>
				{/* Header */}
				<div className="flex items-start justify-between mb-4">
					<h3 id="donate-title" className="text-lg font-bold text-white flex items-center gap-2">
						<FaHeart className="text-rose-400" />
						{t('title')}
					</h3>
					<button
						type="button"
						onClick={onClose}
						aria-label={t('common:close')}
						className="text-gray-400 hover:text-white transition-colors p-1 -mt-1 -mr-1"
					>
						<FiX className="w-5 h-5" />
					</button>
				</div>

				{/* Pitch */}
				<p className="text-sm text-gray-300 leading-relaxed mb-3">{t('intro')}</p>
				<p className="text-xs text-gray-500 leading-relaxed mb-5">{t('voluntary')}</p>

				{/* QR */}
				<p className="text-sm text-gray-300 leading-relaxed mb-3">{t('scanHint')}</p>
				<div className="bg-white rounded-xl p-3 w-fit mx-auto mb-4">
					<img src="/donation-qr.png" alt="QR Bre-B" className="w-44 h-44" />
				</div>

				{/* Copyable key */}
				<div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4">
					<div>
						<p className="text-xs text-gray-500">{t('keyLabel')}</p>
						<p className="text-white font-mono font-semibold">{BREB_KEY}</p>
					</div>
					<button
						type="button"
						onClick={handleCopy}
						className="flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 transition-colors"
					>
						{copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
						{copied ? t('copied') : t('copy')}
					</button>
				</div>

				{/* Outside Colombia */}
				<p className="text-xs text-gray-500 leading-relaxed mb-4">
					{t('abroadPrefix')}{' '}
					<a
						href={`mailto:${SUPPORT_EMAIL}`}
						className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
					>
						<FiMail className="w-3 h-3" />
						{SUPPORT_EMAIL}
					</a>
				</p>

				<p className="text-sm text-gray-300 text-center font-medium">{t('thanks')}</p>
			</div>
		</div>
	);
}

export default DonateModal;
