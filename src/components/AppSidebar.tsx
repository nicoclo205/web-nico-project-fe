import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { IconType } from 'react-icons';
import { FaHome, FaTrophy, FaHeart } from 'react-icons/fa';
import { GiSoccerField } from 'react-icons/gi';
import { MdMeetingRoom } from 'react-icons/md';
import { FiSettings, FiInfo } from 'react-icons/fi';
import NotificationBell from './NotificationBell';
import DonateModal from './DonateModal';

const BASE_CLASS =
	'w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer';
const ACTIVE_CLASS = 'w-12 h-12 p-3 rounded-2xl bg-green-600';

interface NavItem {
	icon: IconType;
	path: string;
	labelKey: string;
	/** Color llamativo para destacar el item mas importante */
	accent?: boolean;
	isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
	{
		icon: FaHome,
		path: '/homepage',
		labelKey: 'common:nav.home',
		isActive: (p) => p === '/homepage',
	},
	{
		icon: GiSoccerField,
		path: '/soccer-matches',
		labelKey: 'common:nav.sports',
		isActive: (p) =>
			p === '/soccer-matches' || p === '/tennis-matches' || p === '/basketball-matches' || p === '/f1-races',
	},
	{
		icon: FaTrophy,
		path: '/world-cup',
		labelKey: 'common:nav.worldcup',
		isActive: (p) => p === '/world-cup',
	},
	{
		icon: MdMeetingRoom,
		path: '/rooms',
		labelKey: 'common:nav.rooms',
		accent: true,
		isActive: (p) => p === '/rooms' || p.startsWith('/room/'),
	},
	{
		icon: FiSettings,
		path: '/settings',
		labelKey: 'common:nav.settings',
		isActive: (p) => p === '/settings',
	},
	{
		icon: FiInfo,
		path: '/about',
		labelKey: 'common:nav.about',
		isActive: (p) => p === '/about',
	},
];

/**
 * Shared left navigation sidebar used by every page inside the app shell.
 * Highlights the icon matching the current route automatically.
 * Each icon shows a tooltip on hover (desktop) or on tap/focus (mobile).
 * On mobile the bar becomes a swipeable carousel (scroll-snap) so the user
 * can slide left/right through the icons.
 */
function AppSidebar() {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { t } = useTranslation(['common', 'donate']);
	const [donateOpen, setDonateOpen] = useState(false);

	return (
		<>
		<aside className="lg:w-20 w-full lg:h-full relative bg-sidebar">
			{/* Pistas visuales de desplazamiento (solo movil) */}
			<div className="lg:hidden pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-sidebar to-transparent z-10" />
			<div className="lg:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-sidebar to-transparent z-10" />

			{/* Carrusel en movil / columna en PC */}
			<div className="flex lg:flex-col flex-row items-center lg:justify-start lg:h-full overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none scrollbar-hide gap-5 lg:gap-0 lg:space-y-8 px-8 lg:px-0 py-3 lg:py-6">
				{NAV_ITEMS.map(({ icon: Icon, path, labelKey, accent, isActive }) => {
					const active = isActive(pathname);
					const color = accent ? 'text-amber-400' : 'text-white';
					const label = t(labelKey);
					return (
						<div key={path} className="relative group flex-shrink-0 snap-center">
							<button
								type="button"
								onClick={() => !active && navigate(path)}
								aria-label={label}
								className="focus:outline-none block"
							>
								<Icon className={`${active ? ACTIVE_CLASS : BASE_CLASS} ${color}`} />
							</button>
							{/* Tooltip: hover en PC, tap/focus en movil */}
							<span
								className="pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-black/90 border border-white/10 text-white text-xs px-2.5 py-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100
									top-full mt-1.5 left-1/2 -translate-x-1/2
									lg:top-1/2 lg:-translate-y-1/2 lg:left-full lg:ml-2 lg:mt-0 lg:translate-x-0"
							>
								{label}
							</span>
						</div>
					);
				})}
				<div className="flex-shrink-0 snap-center">
					<NotificationBell />
				</div>

				{/* Donaciones: evidente pero discreto, al fondo en PC */}
				<div className="relative group flex-shrink-0 snap-center lg:!mt-auto">
					<button
						type="button"
						onClick={() => setDonateOpen(true)}
						aria-label={t('donate:nav')}
						className="focus:outline-none block"
					>
						<FaHeart className={`${BASE_CLASS} animate-heartbeat text-rose-400/80 hover:text-rose-300`} />
					</button>
					<span
						className="pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-black/90 border border-white/10 text-white text-xs px-2.5 py-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100
							top-full mt-1.5 left-1/2 -translate-x-1/2
							lg:top-1/2 lg:-translate-y-1/2 lg:left-full lg:ml-2 lg:mt-0 lg:translate-x-0"
					>
						{t('donate:nav')}
					</span>
				</div>
			</div>
		</aside>

		<DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} />
		</>
	);
}

export default AppSidebar;
