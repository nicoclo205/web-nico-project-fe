import { useNavigate, useLocation } from 'react-router-dom';
import type { IconType } from 'react-icons';
import { FaHome } from 'react-icons/fa';
import { GiSoccerField } from 'react-icons/gi';
import { MdMeetingRoom } from 'react-icons/md';
import { FiSettings, FiInfo } from 'react-icons/fi';
import NotificationBell from './NotificationBell';

const BASE_CLASS =
	'text-white w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer';
const ACTIVE_CLASS = 'text-white w-12 h-12 p-3 rounded-2xl bg-green-600';

interface NavItem {
	icon: IconType;
	path: string;
	isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
	{ icon: FaHome, path: '/homepage', isActive: (p) => p === '/homepage' },
	{
		icon: GiSoccerField,
		path: '/soccer-matches',
		isActive: (p) =>
			p === '/soccer-matches' || p === '/tennis-matches' || p === '/basketball-matches',
	},
	{
		icon: MdMeetingRoom,
		path: '/rooms',
		isActive: (p) => p === '/rooms' || p.startsWith('/room/'),
	},
	{ icon: FiSettings, path: '/settings', isActive: (p) => p === '/settings' },
	{ icon: FiInfo, path: '/about', isActive: (p) => p === '/about' },
];

/**
 * Shared left navigation sidebar used by every page inside the app shell.
 * Highlights the icon matching the current route automatically.
 */
function AppSidebar() {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	return (
		<aside className="lg:w-20 w-full flex lg:flex-col flex-row items-center justify-around lg:justify-start py-4 lg:py-6 lg:space-y-8 space-x-4 lg:space-x-0 bg-[#121316]">
			{NAV_ITEMS.map(({ icon: Icon, path, isActive }) =>
				isActive(pathname) ? (
					<Icon key={path} className={ACTIVE_CLASS} />
				) : (
					<Icon key={path} onClick={() => navigate(path)} className={BASE_CLASS} />
				)
			)}
			<NotificationBell />
		</aside>
	);
}

export default AppSidebar;
