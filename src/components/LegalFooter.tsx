import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Thin legal sub-footer strip: copyright line + links to the legal pages.
 * Shown on public pages (Start) and on the legal pages themselves.
 */
function LegalFooter() {
	const { t } = useTranslation(['legal']);
	const year = new Date().getFullYear();

	const links = [
		{ to: '/terms', label: t('footer.terms') },
		{ to: '/privacy', label: t('footer.privacy') },
		{ to: '/cookies', label: t('footer.cookies') },
		{ to: '/disclaimer', label: t('footer.disclaimer') },
	];

	return (
		<footer className="w-full border-t border-white/10 bg-black/30">
			<div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
				<p>{t('footer.copyright', { year })}</p>
				<nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
					{links.map((link, i) => (
						<span key={link.to} className="flex items-center gap-x-3">
							{i > 0 && <span className="text-gray-700" aria-hidden="true">|</span>}
							<Link to={link.to} className="hover:text-gray-300 transition-colors">
								{link.label}
							</Link>
						</span>
					))}
				</nav>
			</div>
		</footer>
	);
}

export default LegalFooter;
