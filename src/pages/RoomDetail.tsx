import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaHome, FaArrowLeft } from "react-icons/fa";
import { GiSoccerField } from "react-icons/gi";
import { MdMeetingRoom } from "react-icons/md";
import { FiUsers, FiLock, FiUnlock, FiCopy, FiUserMinus, FiSettings, FiTrash2, FiTrendingUp, FiTarget } from "react-icons/fi";
import { useAuth } from '../hooks/useAuth';
import { useRoom } from '../hooks/useRoom';
import { getRoomIdFromHash } from '../utils/roomHash';
import RoomBets from '../components/RoomBets';
import RoomRanking from '../components/RoomRanking';

type TabType = 'info' | 'bets' | 'ranking';

const RoomDetail: React.FC = () => {
	const navigate = useNavigate();
	const { roomHash } = useParams<{ roomHash: string }>();
	const { user} = useAuth();
	const {
		selectedRoom,
		loading,
		error,
		fetchRoomById,
		getRoomMembers,
		leaveRoom,
		deleteRoom,
		updateRoom
	} = useRoom();

	const [members, setMembers] = useState<any[]>([]);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editForm, setEditForm] = useState({
		nombre: '',
		descripcion: '',
		max_miembros: 10
	});
	const [activeTab, setActiveTab] = useState<TabType>('info');

	const userName = user?.nombre_usuario || user?.username || "Usuario";
	const currentUserId = user?.id_usuario || user?.id;
	const [roomId, setRoomId] = useState<number | null>(null);
	const [localError, setLocalError] = useState<string | null>(null);

	useEffect(() => {
		if (roomHash) {
			const id = getRoomIdFromHash(roomHash);
			if (id) {
				setRoomId(id);
				setLocalError(null);
			} else {
				setLocalError('Código de sala inválido');
			}
		}
	}, [roomHash]);

	useEffect(() => {
		if (roomId) {
			loadRoomData();
		}
	}, [roomId]);

	const loadRoomData = async () => {
		if (!roomId) return;

		await fetchRoomById(roomId);

		const result = await getRoomMembers(roomId);
		if (result.success && result.data) {
			setMembers(result.data);
		}
	};

	const handleCopyCode = () => {
		if (selectedRoom?.codigo_sala) {
			navigator.clipboard.writeText(selectedRoom.codigo_sala);
			alert('Código copiado al portapapeles!');
		}
	};

	const handleLeaveRoom = async () => {
		if (!roomId) return;
		if (window.confirm('¿Estás seguro de que quieres salir de esta sala?')) {
			const result = await leaveRoom(roomId);
			if (result.success) {
				navigate('/rooms');
			} else {
				alert(result.error || 'Error al salir de la sala');
			}
		}
	};

	const handleDeleteRoom = async () => {
		if (!roomId) return;
		if (window.confirm('¿Estás seguro de que quieres eliminar esta sala? Esta acción no se puede deshacer.')) {
			const result = await deleteRoom(roomId);
			if (result.success) {
				navigate('/rooms');
			} else {
				alert(result.error || 'Error al eliminar la sala');
			}
		}
	};

	const handleEditRoom = async () => {
		if (!roomId) return;
		const result = await updateRoom(roomId, editForm);
		if (result.success) {
			setShowEditModal(false);
			loadRoomData();
		} else {
			alert(result.error || 'Error al actualizar la sala');
		}
	};

	const openEditModal = () => {
		if (selectedRoom) {
			setEditForm({
				nombre: selectedRoom.nombre,
				descripcion: selectedRoom.descripcion || '',
				max_miembros: selectedRoom.max_miembros || 10
			});
			setShowEditModal(true);
		}
	};

	const displayError = localError || error;

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-[#0e0f11]">
				<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
			</div>
		);
	}

	if (displayError) {
		return (
			<div className="flex flex-col items-center justify-center h-screen bg-[#0e0f11] text-white">
				<span className="text-6xl mb-4">⚠️</span>
				<h1 className="text-2xl font-bold mb-4">{displayError}</h1>
				<button onClick={() => navigate('/rooms')} className="btn-primary">
					Volver a Salas
				</button>
			</div>
		);
	}

	if (!selectedRoom) {
		return (
			<div className="flex flex-col items-center justify-center h-screen bg-[#0e0f11] text-white">
				<h1 className="text-2xl font-bold mb-4">Sala no encontrada</h1>
				<button onClick={() => navigate('/rooms')} className="btn-primary">
					Volver a Salas
				</button>
			</div>
		);
	}

	const isOwner = selectedRoom.id_usuario === currentUserId;
	const memberCount = members.length;

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
					onClick={() => navigate('/rooms')}
					className="text-white w-12 h-12 p-3 rounded-2xl bg-green-600"
				/>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-4 md:p-8 overflow-y-auto">
				{/* Header */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
					<div className="flex items-center gap-4">
						<button
							onClick={() => navigate('/rooms')}
							className="btn-secondary btn-icon"
						>
							<FaArrowLeft />
						</button>
						<div>
							<div className="flex items-center gap-3">
								<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">{selectedRoom.nombre}</h1>
								{selectedRoom.es_privada ? (
									<FiLock className="text-yellow-500 text-xl" />
								) : (
									<FiUnlock className="text-green-500 text-xl" />
								)}
								{isOwner && (
									<span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-600">
										Admin
									</span>
								)}
							</div>
							{selectedRoom.descripcion && (
								<p className="text-gray-400 text-sm mt-1">{selectedRoom.descripcion}</p>
							)}
						</div>
					</div>

					<div className="flex items-center gap-3">
						<span className="text-gray-300 text-sm md:text-base">{userName}</span>
						<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center">
							<span className="text-lg md:text-xl">{userName.charAt(0).toUpperCase()}</span>
						</div>
					</div>
				</div>

				{/* Error Display */}
				{error && (
					<div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl">
						<p className="text-red-200 text-sm">{error}</p>
					</div>
				)}

				{/* Tabs Navigation */}
				<div className="mb-6">
					<div className="flex flex-wrap gap-2 p-2 bg-[#1f2126] rounded-2xl border border-white/5">
						<button
							onClick={() => setActiveTab('info')}
							className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
								activeTab === 'info'
									? 'bg-green-600 text-white shadow-lg'
									: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
							}`}
						>
							<FiUsers className="text-lg" />
							Información
						</button>
						<button
							onClick={() => setActiveTab('bets')}
							className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
								activeTab === 'bets'
									? 'bg-green-600 text-white shadow-lg'
									: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
							}`}
						>
							<FiTarget className="text-lg" />
							Apuestas
						</button>
						<button
							onClick={() => setActiveTab('ranking')}
							className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
								activeTab === 'ranking'
									? 'bg-green-600 text-white shadow-lg'
									: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
							}`}
						>
							<FiTrendingUp className="text-lg" />
							Ranking
						</button>
					</div>
				</div>

				{/* Tab Content */}
				<div className="tab-content-transition">
					{activeTab === 'info' && (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Room Info Panel */}
					<div className="lg:col-span-2 space-y-6">
						{/* Stats Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
								<FiUsers className="text-3xl text-green-500 mb-3" />
								<p className="text-gray-400 text-sm">Miembros</p>
								<p className="text-2xl font-bold">{memberCount} / {selectedRoom.max_miembros || '∞'}</p>
							</div>

							<div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
								<FiLock className="text-3xl text-blue-500 mb-3" />
								<p className="text-gray-400 text-sm">Tipo</p>
								<p className="text-2xl font-bold">{selectedRoom.es_privada ? 'Privada' : 'Pública'}</p>
							</div>

							<div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
								<FiSettings className="text-3xl text-yellow-500 mb-3" />
								<p className="text-gray-400 text-sm">Creada</p>
								<p className="text-lg font-bold">
									{new Date(selectedRoom.fecha_creacion).toLocaleDateString('es-ES')}
								</p>
							</div>
						</div>

						{/* Room Code */}
						<div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
							<h3 className="text-xl font-bold mb-4">Código de Sala</h3>
							<div className="flex items-center gap-3">
								<div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10">
									<p className="text-3xl font-mono font-bold text-green-400 text-center tracking-wider">
										{selectedRoom.codigo_sala}
									</p>
								</div>
								<button
									onClick={handleCopyCode}
									className="btn-secondary btn-icon h-full px-6"
								>
									<FiCopy className="text-xl" />
								</button>
							</div>
							<p className="text-gray-400 text-sm mt-3">
								Comparte este código para que otros se unan a la sala
							</p>
						</div>

						{/* Admin Actions */}
						{isOwner && (
							<div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
								<h3 className="text-xl font-bold mb-4">Administración</h3>
								<div className="flex flex-col sm:flex-row gap-3">
									<button
										onClick={openEditModal}
										className="btn-info btn-icon flex-1"
									>
										<FiSettings /> Editar Sala
									</button>
									<button
										onClick={handleDeleteRoom}
										className="btn-danger btn-icon flex-1"
									>
										<FiTrash2 /> Eliminar Sala
									</button>
								</div>
							</div>
						)}

						{/* Leave Room Button */}
						{!isOwner && (
							<div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
								<button
									onClick={handleLeaveRoom}
									className="btn-warning btn-icon w-full"
								>
									<FiUserMinus /> Salir de la Sala
								</button>
							</div>
						)}
					</div>

					{/* Members Panel */}
					<div className="lg:col-span-1">
						<div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5 sticky top-4">
							<h3 className="text-xl font-bold mb-4 flex items-center gap-2">
								<FiUsers /> Miembros ({memberCount})
							</h3>

							<div className="space-y-3 max-h-[600px] overflow-y-auto">
								{members.length === 0 ? (
									<p className="text-gray-400 text-center py-8">No hay miembros</p>
								) : (
									members.map((member) => {
										const memberName = member.nombre_usuario || member.username || 'Usuario';
										return (
											<div
												key={member.id_usuario_sala}
												className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
											>
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
														<span className="font-bold">
															{memberName.charAt(0).toUpperCase()}
														</span>
													</div>
													<div>
														<p className="font-semibold">{memberName}</p>
														<p className="text-xs text-gray-400">
															{member.rol === 'admin' ? '👑 Admin' : '👤 Miembro'}
														</p>
													</div>
												</div>
												{member.id_usuario === currentUserId && (
													<span className="text-xs bg-green-700 px-2 py-1 rounded-full">Tú</span>
												)}
											</div>
										);
									})
								)}
							</div>
						</div>
					</div>
				</div>
				)}

				{activeTab === 'bets' && roomId && (
					<RoomBets roomId={roomId} isAdmin={isOwner} />
				)}

				{activeTab === 'ranking' && roomId && (
					<RoomRanking roomId={roomId} />
				)}
			</div>
		</main>

			{/* Edit Room Modal */}
			{showEditModal && (
				<div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowEditModal(false)}>
					<div className="bg-[#1f2126] rounded-3xl p-6 md:p-8 max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
						<h2 className="text-2xl font-bold mb-6">Editar Sala</h2>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Nombre de la Sala *</label>
								<input
									type="text"
									value={editForm.nombre}
									onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
									className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
								<textarea
									value={editForm.descripcion}
									onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
									rows={3}
									className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Máximo de Miembros</label>
								<input
									type="number"
									min="2"
									max="100"
									value={editForm.max_miembros}
									onChange={(e) => setEditForm({ ...editForm, max_miembros: Number(e.target.value) })}
									className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</div>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								onClick={() => setShowEditModal(false)}
								className="btn-secondary flex-1"
							>
								Cancelar
							</button>
							<button
								onClick={handleEditRoom}
								className="btn-primary flex-1"
							>
								Guardar Cambios
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RoomDetail;
