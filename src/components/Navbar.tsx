import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const userName = localStorage.getItem('user')
		? JSON.parse(localStorage.getItem('user')!).nombre_usuario || 'Usuario'
		: 'Usuario';

	const handleLogout = () => {
		localStorage.removeItem('authToken');
		localStorage.removeItem('user');
		navigate('/login');
	};

	const isActive = (path: string) => location.pathname === path;

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const sportOptions = [
		{
			name: 'Fútbol',
			icon: '⚽',
			path: '/soccer-matches',
			color: 'hover:bg-green-700',
		},
		{
			name: 'Tenis',
			icon: '🎾',
			path: '/tennis-matches',
			color: 'hover:bg-yellow-700',
		},
		{
			name: 'Baloncesto',
			icon: '🏀',
			path: '/basketball-matches',
			color: 'hover:bg-orange-700',
		},
	];

	return (
		<nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo and Brand */}
					<div className="flex items-center">
						<button
							onClick={() => navigate('/homepage')}
							className="flex items-center space-x-3"
						>
							<span className="text-3xl">🎲</span>
							<span className="text-xl font-bold text-white">FriendlyBet</span>
						</button>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:block">
						<div className="ml-10 flex items-baseline space-x-4">
							<button
								onClick={() => navigate('/homepage')}
								className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
									isActive('/homepage')
										? 'bg-gray-800 text-white'
										: 'text-gray-300 hover:bg-gray-700 hover:text-white'
								}`}
							>
								Inicio
							</button>

							{/* Partidos Dropdown */}
							<div
								className="relative"
								ref={dropdownRef}
							>
								<button
									onMouseEnter={() => setIsDropdownOpen(true)}
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
									className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
										location.pathname.includes('matches')
											? 'bg-gray-800 text-white'
											: 'text-gray-300 hover:bg-gray-700 hover:text-white'
									}`}
								>
									Partidos
									<svg
										className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>

								{/* Dropdown Menu */}
								{isDropdownOpen && (
									<div
										className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5"
										onMouseLeave={() => setIsDropdownOpen(false)}
									>
										<div className="py-1">
											{sportOptions.map((sport) => (
												<button
													key={sport.path}
													onClick={() => {
														navigate(sport.path);
														setIsDropdownOpen(false);
													}}
													className={`w-full text-left px-4 py-2 text-sm text-gray-300 ${sport.color} hover:text-white flex items-center gap-2 transition-colors`}
												>
													<span className="text-lg">{sport.icon}</span>
													{sport.name}
												</button>
											))}
										</div>
									</div>
								)}
							</div>

							<button
								onClick={() => navigate('/rooms')}
								className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
									isActive('/rooms')
										? 'bg-gray-800 text-white'
										: 'text-gray-300 hover:bg-gray-700 hover:text-white'
								}`}
							>
								Salas
							</button>
							<button
								onClick={() => navigate('/my-bets')}
								className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
									isActive('/my-bets')
										? 'bg-gray-800 text-white'
										: 'text-gray-300 hover:bg-gray-700 hover:text-white'
								}`}
							>
								Mis Apuestas
							</button>
							<button
								onClick={() => navigate('/rankings')}
								className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
									isActive('/rankings')
										? 'bg-gray-800 text-white'
										: 'text-gray-300 hover:bg-gray-700 hover:text-white'
								}`}
							>
								Rankings
							</button>
						</div>
					</div>

					{/* User Menu */}
					<div className="hidden md:flex items-center space-x-4">
						<div className="flex items-center space-x-2 text-white">
							<span className="text-2xl">👤</span>
							<span className="text-sm">{userName}</span>
						</div>
						<button
							onClick={handleLogout}
							className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
						>
							Cerrar Sesión
						</button>
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
						>
							<span className="sr-only">Abrir menú</span>
							{isMenuOpen ? (
								<span className="text-2xl">✖</span>
							) : (
								<span className="text-2xl">☰</span>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Menu */}
			{isMenuOpen && (
				<div className="md:hidden">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
						<button
							onClick={() => {
								navigate('/homepage');
								setIsMenuOpen(false);
							}}
							className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
						>
							Inicio
						</button>

						{/* Mobile Sports Options */}
						<div className="space-y-1">
							<div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
								Partidos
							</div>
							{sportOptions.map((sport) => (
								<button
									key={sport.path}
									onClick={() => {
										navigate(sport.path);
										setIsMenuOpen(false);
									}}
									className="block w-full text-left px-5 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
								>
									<span>{sport.icon}</span>
									{sport.name}
								</button>
							))}
						</div>

						<button
							onClick={() => {
								navigate('/rooms');
								setIsMenuOpen(false);
							}}
							className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
						>
							Salas
						</button>
						<button
							onClick={() => {
								navigate('/my-bets');
								setIsMenuOpen(false);
							}}
							className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
						>
							Mis Apuestas
						</button>
						<button
							onClick={() => {
								navigate('/rankings');
								setIsMenuOpen(false);
							}}
							className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
						>
							Rankings
						</button>
					</div>
					<div className="pt-4 pb-3 border-t border-gray-700">
						<div className="flex items-center px-5">
							<span className="text-2xl mr-2">👤</span>
							<span className="text-base font-medium text-white">
								{userName}
							</span>
						</div>
						<div className="mt-3 px-2">
							<button
								onClick={() => {
									handleLogout();
									setIsMenuOpen(false);
								}}
								className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700"
							>
								Cerrar Sesión
							</button>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
