import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * 404 catch-all page (works logged in or out).
 */
const NotFound = () => {
	const navigate = useNavigate();
	const { t } = useTranslation(['common']);

	return (
		<div className="min-h-screen flex items-center justify-center bg-app p-4">
			<div className="bg-surface border border-white/5 p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
				<p className="text-7xl font-bold text-green-500 mb-4">404</p>
				<h1 className="text-2xl font-bold text-white mb-2">{t('common:notFoundTitle')}</h1>
				<p className="text-gray-400 mb-6">{t('common:notFoundDesc')}</p>
				<button onClick={() => navigate('/')} className="btn-primary w-full py-3">
					{t('common:goHome')}
				</button>
			</div>
		</div>
	);
};

export default NotFound;
