import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App.tsx';
import { AuthProvider } from './hooks/useAuth';
import './i18n'; // Initialize i18n
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AuthProvider>
			<App />
		</AuthProvider>
		<Analytics />
	</StrictMode>
);
