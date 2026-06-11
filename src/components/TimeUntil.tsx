import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function formatRemaining(ms: number): string {
	const totalMins = Math.floor(ms / 60000);
	const days = Math.floor(totalMins / 1440);
	const hours = Math.floor((totalMins % 1440) / 60);
	const mins = totalMins % 60;
	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${mins}m`;
	return `${mins}m`;
}

/**
 * Live countdown to a future date ("Starts in 2h 15m"). Renders nothing once started.
 */
function TimeUntil({ date, className = '' }: { date: string; className?: string }) {
	const { t } = useTranslation(['common']);
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 60000);
		return () => clearInterval(id);
	}, []);

	const ms = new Date(date).getTime() - now;
	if (Number.isNaN(ms) || ms <= 0) return null;

	const text = ms < 60000 ? t('common:startingSoon') : t('common:startsIn', { time: formatRemaining(ms) });
	return <div className={`text-xs text-green-500 font-medium ${className}`}>{text}</div>;
}

export default TimeUntil;
