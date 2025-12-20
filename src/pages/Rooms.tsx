import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import { GiSoccerField } from "react-icons/gi";
import { FiSearch, FiPlus, FiUsers, FiSettings } from "react-icons/fi";
import { MdMeetingRoom } from "react-icons/md";
import { useAuth } from '../hooks/useAuth';
import { useRoom } from '../hooks/useRoom';
import { CreateRoomData, apiService } from '../services/apiService';
import { registerRoomHash } from '../utils/roomHash';

const Rooms: React.FC = () => {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const {
		rooms,
		loading,
		error,
		createRoom,
		joinRoom,
		reload
	} = useRoom();

	const [searchTerm, setSearchTerm] = useState('');
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showJoinModal, setShowJoinModal] = useState(false);
	const [userAvatar, setUserAvatar] = useState<string | null>(null);
	const [leagues, setLeagues] = useState<any[]>([]);
	const [selectedLeagues, setSelectedLeagues] = useState<number[]>([]);

	// Create room form state
	const [newRoom, setNewRoom] = useState<CreateRoomData>({
		nombre: '',
		descripcion: '',
		max_miembros: 10
	});

	// Join room state
	const [joinCode, setJoinCode] = useState('');

	const userName = user?.nombre_usuario || user?.username || "Usuario";
	const currentUserId = user?.id_usuario || user?.id;

	useEffect(() => {
		const fetchUserAvatar = async () => {
			try {
				const token = localStorage.getItem('authToken');
				if (token) {
					const response = await fetch('http://localhost:8000/api/usuario/me', {
						headers: {
							'Authorization': `Token ${token}`
						}
					});
					if (response.ok) {
						const data = await response.json();
						if (data.foto_perfil) {
							setUserAvatar(data.foto_perfil);
						}
					}
				}
			} catch (error) {
				console.error('Error fetching user avatar', error);
			}
		};

		const fetchLeagues = async () => {
			const response = await apiService.getLeaguesBySport(1); // Fútbol
			if (response.success && response.data) {
				// Filtrar para mostrar solo ligas con logo
				// Para La Liga específicamente, solo mantener la que tiene logo
				const filteredLeagues = response.data.filter((league: any) => {
					// Si es La Liga, solo mantener la que tiene logo
					if (league.nombre === 'La Liga' || league.nombre.toLowerCase().includes('la liga')) {
						return league.logo_url && league.logo_url.trim() !== '';
					}
					// Para otras ligas, mantenerlas todas
					return true;
				});

				// Eliminar duplicados basados en nombre para La Liga
				const uniqueLeagues = filteredLeagues.filter((league: any, index: number, self: any[]) => {
					if (league.nombre === 'La Liga' || league.nombre.toLowerCase().includes('la liga')) {
						// Solo mantener la primera La Liga que tenga logo
						return index === self.findIndex(l =>
							(l.nombre === 'La Liga' || l.nombre.toLowerCase().includes('la liga')) &&
							l.logo_url && l.logo_url.trim() !== ''
						);
					}
					return true;
				});

				setLeagues(uniqueLeagues);
			}
		};

		fetchUserAvatar();
		fetchLeagues();
	}, []);

	// Register room hashes when rooms change
	useEffect(() => {
		if (rooms.length > 0) {
			rooms.forEach(room => registerRoomHash(room.id_sala));
		}
	}, [rooms]);

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	const handleCreateRoom = async () => {
		if (!newRoom.nombre.trim()) {
			alert('Por favor ingresa un nombre para la sala');
			return;
		}

		if (selectedLeagues.length === 0) {
			alert('Por favor selecciona al menos una competición');
			return;
		}

		console.log('Creating room with data:', newRoom);
		const result = await createRoom(newRoom);
		if (result.success && result.data) {
			// Agregar las ligas seleccionadas a la sala
			const salaId = result.data.id_sala;
			console.log('Room created with ID:', salaId);
			console.log('Adding leagues:', selectedLeagues);
			console.log('League details:', leagues.filter(l => selectedLeagues.includes(l.id_liga)));

			for (const ligaId of selectedLeagues) {
				const addResult = await apiService.addSalaLiga(salaId, ligaId);
				console.log(`Added league ${ligaId} to room:`, addResult);
			}

			setShowCreateModal(false);
			setNewRoom({
				nombre: '',
				descripcion: '',
				max_miembros: 10
			});
			setSelectedLeagues([]);
			reload();
		} else {
			alert(result.error || 'Error al crear la sala');
		}
	};

	const handleJoinRoom = async () => {
		if (!joinCode.trim()) {
			alert('Por favor ingresa el código de la sala');
			return;
		}

		// Según el backend, necesitamos pasar cualquier ID (usaremos 1) y el código
		// El backend buscará la sala por código, no por ID
		const result = await joinRoom(1, joinCode);
		if (result.success) {
			setShowJoinModal(false);
			setJoinCode('');
			reload();
		} else {
			alert(result.error || 'Error al unirse a la sala');
		}
	};

	// Filtrar solo las salas del usuario (creador o miembro)
	const filteredRooms = rooms.filter((room) => {
		const matchesSearch = searchTerm === '' ||
			room.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(room.descripcion && room.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

		// Solo mostrar salas donde el usuario es creador o miembro
		const isUserRoom = room.id_usuario === currentUserId ||
			(room.miembros && room.miembros.some(m => m.id_usuario === currentUserId));

		return matchesSearch && isUserRoom;
	});

	return (
		<div className="flex flex-col lg:flex-row h-screen bg-[#0e0f11] text-white page-transition-enter">
			{/* Sidebar */}
			<aside className="lg:w-20 w-full flex lg:flex-col flex-row items-center justify-around lg:justify-start py-4 lg:py-6 lg:space-y-8 space-x-4 lg:space-x-0 bg-[#121316]">
				<FaHome
					onClick={() => navigate('/homepage')}
					className="text-white w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer"
				/>
				<GiSoccerField
					onClick={() => navigate('/soccer-matches')}
					className="text-white w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer"
				/>
				<MdMeetingRoom
					className="text-white w-12 h-12 p-3 rounded-2xl bg-green-600"
				/>
				<FiSettings
					onClick={() => navigate('/settings')}
					className="text-white w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer"
				/>
			</aside>

			{/* Main Content Wrapper */}
			<div className="flex-1 flex flex-col h-screen overflow-hidden">

				{/* Header */}
				<header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 lg:px-12 bg-[#0e0f11]/95 backdrop-blur-sm z-10 sticky top-0">
					<div>
						<h1 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
							<span className="text-3xl md:text-4xl">🎮</span>
							<span className="hidden sm:inline">Salas de Apuestas</span>
							<span className="sm:hidden">Salas</span>
						</h1>
					</div>
					<div className="flex items-center space-x-2 md:space-x-4">
						<div
							onClick={() => navigate('/settings')}
							className="hidden sm:flex items-center space-x-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
						>
							<span className="text-sm font-medium text-gray-300">{userName}</span>
							{userAvatar ? (
								<img
									src={userAvatar}
									alt="Profile"
									className="w-8 h-8 rounded-full object-cover border border-white/20"
								/>
							) : (
								<div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white font-bold">
									{userName.charAt(0).toUpperCase()}
								</div>
							)}
						</div>
						<button
							onClick={handleLogout}
							className="btn-danger text-xs md:text-sm px-3 md:px-4"
						>
							<span className="hidden sm:inline">Cerrar sesión</span>
							<span className="sm:hidden">Salir</span>
						</button>
					</div>
				</header>

				{/* Main Content Area */}
				<div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 pb-12 flex flex-col lg:flex-row gap-6 md:gap-8">

					{/* Main Panel */}
					<main className="flex-1 max-w-5xl">

				{/* Error Display */}
				{error && (
					<div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl">
						<p className="text-red-200 text-sm">{error}</p>
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-3 mb-6">
					<button
						onClick={() => setShowCreateModal(true)}
						className="btn-primary btn-icon"
					>
						<FiPlus className="text-xl" />
						<span>Crear Sala</span>
					</button>
					<button
						onClick={() => setShowJoinModal(true)}
						className="btn-info btn-icon"
					>
						<FiUsers className="text-xl" />
						<span>Unirse con Código</span>
					</button>
				</div>

				{/* Search */}
				<div className="flex items-center bg-white/10 px-3 md:px-4 py-2 rounded-xl mb-6">
					<FiSearch className="text-gray-400 mr-2 md:mr-3" />
					<input
						type="text"
						placeholder="Buscar salas..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="bg-transparent outline-none w-full text-sm md:text-base"
					/>
				</div>

				{/* Rooms Grid */}
				{loading ? (
					<div className="flex justify-center items-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
						{filteredRooms.length === 0 ? (
							<div className="col-span-full text-center py-12 bg-gradient-to-br from-[#1f2126] to-[#141518] rounded-3xl border border-white/5">
								<span className="text-6xl mb-4 block">🔍</span>
								<p className="text-gray-400 text-lg">No tienes salas</p>
								<p className="text-gray-500 text-sm mt-2">Crea una sala o únete con un código</p>
							</div>
						) : (
							filteredRooms.map((room) => {
								const isOwner = room.id_usuario === currentUserId;
								const memberCount = room.miembros_count || 0;
								const maxMembers = room.max_miembros || 10;
								const roomHash = registerRoomHash(room.id_sala);

								return (
									<div
										key={room.id_sala}
										className="rounded-3xl p-4 md:p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5 transition-all hover:scale-[1.02] cursor-pointer"
										onClick={() => navigate(`/room/${roomHash}`)}
									>
										{/* Room Header */}
										<div className="flex justify-between items-start mb-4">
											<div className="flex-1">
												<h3 className="text-lg md:text-xl font-bold mb-2">{room.nombre}</h3>
												{room.descripcion && (
													<p className="text-sm text-gray-400 line-clamp-2">{room.descripcion}</p>
												)}
											</div>
											{isOwner && (
												<span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-600">
													Admin
												</span>
											)}
										</div>

										{/* Room Info */}
										<div className="flex items-center justify-between text-sm text-gray-400 mb-4">
											<div className="flex items-center gap-2">
												<FiUsers />
												<span>{memberCount} / {maxMembers} miembros</span>
											</div>
											<div className="text-xs">
												{new Date(room.fecha_creacion).toLocaleDateString('es-ES')}
											</div>
										</div>

										{/* Room Code */}
										<div className="mb-4 p-3 bg-white/5 rounded-xl">
											<p className="text-xs text-gray-400 mb-1">Código de sala</p>
											<p className="text-lg font-mono font-bold text-green-400">{room.codigo_sala}</p>
										</div>

										{/* Progress Bar */}
										<div className="mt-4 bg-white/10 h-2 rounded-full overflow-hidden">
											<div
												className="h-full bg-green-400 rounded-full transition-all"
												style={{
													width: `${(memberCount / maxMembers) * 100}%`
												}}
											/>
										</div>
									</div>
								);
							})
						)}
					</div>
				)}
					</main>

					{/* Right Sidebar */}
					<aside className="w-full lg:w-80 flex flex-col gap-4 md:gap-6 flex-shrink-0">

						{/* Statistics Card */}
						<div className="bg-[#181b21] rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/5 shadow-sm">
							<h3 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4">Estadísticas</h3>
							<div className="space-y-2 md:space-y-3">
								<div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-[#0f1115] border border-white/5">
									<span className="text-xs md:text-sm font-medium text-gray-400">Total Salas</span>
									<span className="text-base md:text-lg font-bold text-green-500">{rooms.length}</span>
								</div>
								<div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-[#0f1115] border border-white/5">
									<span className="text-xs md:text-sm font-medium text-gray-400">Mis Salas</span>
									<span className="text-base md:text-lg font-bold text-blue-500">
										{rooms.filter(r =>
											r.id_usuario === currentUserId ||
											(r.miembros && r.miembros.some(m => m.id_usuario === currentUserId))
										).length}
									</span>
								</div>
							</div>
						</div>

						{/* Quick Links Card */}
						<div className="bg-gradient-to-br from-[#181b21] to-[#0f1115] rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/5 relative overflow-hidden flex-1 min-h-[200px] md:min-h-[250px] flex flex-col justify-center">
							<div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500 opacity-10 blur-3xl rounded-full"></div>
							<h3 className="text-base md:text-lg font-bold text-white mb-2 relative z-10">Accesos Rápidos</h3>
							<p className="text-xs md:text-sm text-gray-400 relative z-10 leading-relaxed mb-4 md:mb-6">
								Navega rápidamente a otras secciones de la aplicación.
							</p>
							<div className="space-y-2 relative z-10">
								<button
									onClick={() => navigate('/homepage')}
									className="w-full text-left px-3 md:px-4 py-2.5 md:py-3 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl transition border border-white/5"
								>
									<span className="text-xs md:text-sm">🏠 Inicio</span>
								</button>
								<button
									onClick={() => navigate('/soccer-matches')}
									className="w-full text-left px-3 md:px-4 py-2.5 md:py-3 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl transition border border-white/5"
								>
									<span className="text-xs md:text-sm">⚽ Partidos</span>
								</button>
							</div>
						</div>

					</aside>

				</div>
			</div>

			{/* Create Room Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowCreateModal(false)}>
					<div className="bg-gradient-to-br from-[#1f2126] to-[#16181d] rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-white/10 shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
								Crear Nueva Sala
							</h2>
							<button
								onClick={() => setShowCreateModal(false)}
								className="text-gray-400 hover:text-white transition-colors"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Nombre de la Sala *</label>
								<input
									type="text"
									value={newRoom.nombre}
									onChange={(e) => setNewRoom({ ...newRoom, nombre: e.target.value })}
									className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
									placeholder="Mi sala de apuestas"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
								<textarea
									value={newRoom.descripcion}
									onChange={(e) => setNewRoom({ ...newRoom, descripcion: e.target.value })}
									className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
									placeholder="Descripción de la sala..."
									rows={3}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Máximo de Miembros</label>
								<select
									value={newRoom.max_miembros}
									onChange={(e) => setNewRoom({ ...newRoom, max_miembros: parseInt(e.target.value) })}
									className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
								>
									<option value={5} className="bg-[#1f2126]">5 miembros</option>
									<option value={10} className="bg-[#1f2126]">10 miembros</option>
									<option value={15} className="bg-[#1f2126]">15 miembros</option>
									<option value={20} className="bg-[#1f2126]">20 miembros</option>
									<option value={30} className="bg-[#1f2126]">30 miembros</option>
									<option value={50} className="bg-[#1f2126]">50 miembros</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
									<span className="text-green-400">⚽</span>
									Competiciones *
									<span className="text-xs text-gray-500">({selectedLeagues.length} seleccionadas)</span>
								</label>
								<div className="max-h-64 overflow-y-auto bg-white/5 rounded-xl p-3 border border-white/10">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
										{leagues.map((league) => (
											<label
												key={league.id_liga}
												className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
													selectedLeagues.includes(league.id_liga)
														? 'bg-green-600/20 border-2 border-green-500 shadow-lg'
														: 'bg-white/5 border-2 border-transparent hover:bg-white/10 hover:border-white/20'
												}`}
											>
												<input
													type="checkbox"
													checked={selectedLeagues.includes(league.id_liga)}
													onChange={(e) => {
														if (e.target.checked) {
															setSelectedLeagues([...selectedLeagues, league.id_liga]);
														} else {
															setSelectedLeagues(selectedLeagues.filter(id => id !== league.id_liga));
														}
													}}
													className="w-5 h-5 rounded border-white/20 bg-white/10 text-green-600 focus:ring-green-500 focus:ring-offset-0"
												/>
												{league.logo_url && (
													<img
														src={league.logo_url}
														alt={league.nombre}
														className="w-8 h-8 object-contain flex-shrink-0"
														onError={(e) => {
															e.currentTarget.style.display = 'none';
														}}
													/>
												)}
												<span className="text-sm font-medium text-gray-200 truncate">{league.nombre}</span>
											</label>
										))}
									</div>
								</div>
								<p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
									</svg>
									Solo verás partidos de las competiciones seleccionadas
								</p>
							</div>

							<p className="text-xs text-gray-400">
								Se generará automáticamente un código único para tu sala que podrás compartir con tus amigos.
							</p>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								onClick={() => setShowCreateModal(false)}
								className="btn-secondary flex-1"
							>
								Cancelar
							</button>
							<button
								onClick={handleCreateRoom}
								className="btn-primary flex-1"
							>
								Crear Sala
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Join Room Modal */}
			{showJoinModal && (
				<div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowJoinModal(false)}>
					<div className="bg-[#1f2126] rounded-3xl p-6 md:p-8 max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
						<h2 className="text-2xl font-bold mb-6">Unirse a una Sala</h2>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Código de Sala</label>
								<input
									type="text"
									value={joinCode}
									onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
									className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-lg text-center"
									placeholder="ABC123XY"
									maxLength={8}
								/>
							</div>

							<p className="text-xs text-gray-400 text-center">
								Ingresa el código de 8 caracteres que te proporcionó el creador de la sala
							</p>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								onClick={() => {
									setShowJoinModal(false);
									setJoinCode('');
								}}
								className="btn-secondary flex-1"
							>
								Cancelar
							</button>
							<button
								onClick={handleJoinRoom}
								className="btn-info flex-1"
							>
								Unirse
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Rooms;
