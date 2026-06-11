import React from 'react';
import AppSidebar from './AppSidebar';

interface AppShellProps {
	children: React.ReactNode;
}

/**
 * Unified app shell: dark background + shared navigation sidebar.
 * Wrap every authenticated page's content with this component.
 */
function AppShell({ children }: AppShellProps) {
	return (
		<div className="flex flex-col lg:flex-row h-screen bg-app text-white page-transition-enter">
			<AppSidebar />
			{children}
		</div>
	);
}

export default AppShell;
