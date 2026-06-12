import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelectorEnhanced from '../components/LanguageSelectorEnhanced';
import LegalFooter from '../components/LegalFooter';

export type LegalDoc = 'terms' | 'privacy' | 'cookies' | 'disclaimer';

interface LegalSection {
	heading: string;
	body: string[];
}

interface LegalPageProps {
	doc: LegalDoc;
}

/**
 * Generic public legal page. Renders title + sections for one of the four
 * legal documents (terms, privacy, cookies, disclaimer) from the `legal`
 * i18n namespace.
 */
function LegalPage({ doc }: LegalPageProps) {
	const { t } = useTranslation(['legal']);
	const sections = t(`${doc}.sections`, { returnObjects: true }) as LegalSection[];

	return (
		<div className="w-full min-h-screen flex flex-col bg-app text-white">
			{/* Header */}
			<header className="w-full p-4 border-b border-white/10">
				<div className="container mx-auto flex justify-between items-center">
					<Link to="/" className="text-2xl font-bold text-myBlue hover:opacity-80 transition-opacity">
						FriendlyBet
					</Link>
					<LanguageSelectorEnhanced />
				</div>
			</header>

			{/* Document */}
			<main className="flex-grow w-full">
				<div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
					<h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{t(`${doc}.title`)}</h1>
					<p className="text-gray-500 text-sm mb-8">{t('common.lastUpdated')}</p>

					<div className="space-y-8">
						{sections.map((section) => (
							<section key={section.heading}>
								<h2 className="text-lg font-semibold text-white mb-3">{section.heading}</h2>
								<div className="space-y-3">
									{section.body.map((paragraph, i) => (
										<p key={i} className="text-gray-300 text-sm md:text-base leading-relaxed">
											{paragraph}
										</p>
									))}
								</div>
							</section>
						))}
					</div>

					<div className="mt-10 pt-6 border-t border-white/10">
						<Link to="/" className="text-green-400 text-sm hover:text-green-300 transition-colors">
							&larr; {t('common.backHome')}
						</Link>
					</div>
				</div>
			</main>

			<LegalFooter />
		</div>
	);
}

export default LegalPage;
