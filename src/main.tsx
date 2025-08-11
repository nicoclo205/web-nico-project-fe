import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './hooks/useAuth'; // 👈 importa tu AuthProvider
import './i18n'; // Initialize i18n
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AuthProvider>
			{' '}
			{/* 👈 envuelve toda la app */}
			<App />
		</AuthProvider>
	</StrictMode>
);
