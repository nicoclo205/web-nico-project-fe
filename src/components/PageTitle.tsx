import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TITLES: { match: (p: string) => boolean; key: string }[] = [
	{ match: (p) => p === '/homepage', key: 'titles.home' },
	{ match: (p) => p === '/soccer-matches', key: 'titles.soccer' },
	{ match: (p) => p === '/world-cup', key: 'titles.soccer' },
	{ match: (p) => p === '/tennis-matches', key: 'titles.tennis' },
	{ match: (p) => p === '/basketball-matches', key: 'titles.basketball' },
	{ match: (p) => p === '/f1-races', key: 'titles.f1' },
	{ match: (p) => p === '/rooms', key: 'titles.rooms' },
	{ match: (p) => p.startsWith('/room/'), key: 'titles.roomDetail' },
	{ match: (p) => p === '/streak-pong', key: 'titles.streakPong' },
	{ match: (p) => p === '/settings', key: 'titles.settings' },
	{ match: (p) => p === '/about', key: 'titles.about' },
	{ match: (p) => p === '/login', key: 'titles.login' },
	{ match: (p) => p === '/start' || p === '/', key: 'titles.start' },
	{
		match: (p) => ['/terms', '/privacy', '/cookies', '/disclaimer'].includes(p),
		key: 'titles.legal',
	},
	{
		match: (p) => p === '/forgot-password' || p === '/reset-password' || p === '/verify-email',
		key: 'titles.account',
	},
];

/**
 * Updates document.title per route (rendered once inside BrowserRouter).
 */
function PageTitle() {
	const { pathname } = useLocation();
	const { t, i18n } = useTranslation(['common']);

	useEffect(() => {
		const entry = TITLES.find((e) => e.match(pathname));
		document.title = entry ? `FriendlyBet — ${t(`common:${entry.key}`)}` : 'FriendlyBet';
	}, [pathname, t, i18n.language]);

	return null;
}

export default PageTitle;
