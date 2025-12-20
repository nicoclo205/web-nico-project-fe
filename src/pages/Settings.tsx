import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import { GiSoccerField } from "react-icons/gi";
import { MdMeetingRoom, MdSettings } from "react-icons/md";
import { FiUser, FiPhone, FiImage, FiTrash2, FiSave, FiCheck } from "react-icons/fi";
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const AVATARS = [
    '/avatars/messi_avatar.svg',
    '/avatars/lebron_avatar.svg',
    '/avatars/nadal_avatar.svg',
    '/avatars/verstappen_avatar.svg',
];

const Settings = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [userData, setUserData] = useState({
        nombre: '',
        apellido: '',
        celular: '',
        foto_perfil: '',
        id_usuario: null
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [userAvatar, setUserAvatar] = useState<string | null>(null);

    const userName = user?.nombre_usuario || user?.username || "Usuario";

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/api/usuario/me');

            if (response.data.foto_perfil) {
                setUserAvatar(response.data.foto_perfil);
            }

            if (response.data.id_usuario) {
                const profileResponse = await api.get(`/api/usuarios/${response.data.id_usuario}/`);
                setUserData(profileResponse.data);
            }

        } catch (error) {
            console.error('Error fetching user data:', error);
            setErrorMsg('Error al cargar los datos del usuario');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
    };

    const handleAvatarSelect = (avatarPath: string) => {
        setUserData({
            ...userData,
            foto_perfil: avatarPath
        });
    };

    const handleSave = async () => {
        try {
            setSuccessMsg('');
            setErrorMsg('');
            setIsSaving(true);
            if (!userData.id_usuario) return;

            await api.patch(`/api/usuarios/${userData.id_usuario}/`, {
                nombre: userData.nombre,
                apellido: userData.apellido,
                celular: userData.celular,
                foto_perfil: userData.foto_perfil
            });
            setSuccessMsg('¡Configuración guardada correctamente!');
            setUserAvatar(userData.foto_perfil);
        } catch (error) {
            console.error('Error updating settings:', error);
            setErrorMsg('Error al guardar la configuración.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            return;
        }

        setIsDeleting(true);
        try {
            if (!userData.id_usuario) return;
            await api.delete(`/api/usuarios/${userData.id_usuario}/`);

            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            navigate('/start');
        } catch (error) {
            console.error('Error deleting account:', error);
            setErrorMsg('Error al eliminar la cuenta.');
            setIsDeleting(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

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
                    className="text-white w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer"
                />
                <MdSettings
                    className="text-white w-12 h-12 p-3 rounded-2xl bg-green-600"
                />
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 lg:px-12 bg-[#0e0f11]/95 backdrop-blur-sm z-10 sticky top-0">
                    <div>
                        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
                            <span className="text-3xl md:text-4xl">⚙️</span>
                            <span className="hidden sm:inline">Configuración</span>
                            <span className="sm:hidden">Config</span>
                        </h1>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <div className="hidden sm:flex items-center space-x-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
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
                    <main className="flex-1 max-w-3xl">
                        {/* Success Message */}
                        {successMsg && (
                            <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-xl flex items-center gap-3">
                                <FiCheck className="text-green-400 text-xl flex-shrink-0" />
                                <p className="text-green-200 text-sm">{successMsg}</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {errorMsg && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl">
                                <p className="text-red-200 text-sm">{errorMsg}</p>
                            </div>
                        )}

                        {/* Personal Info Card */}
                        <div className="rounded-3xl p-4 md:p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5 mb-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <FiUser className="text-blue-400 text-xl" />
                                </div>
                                <h2 className="text-lg md:text-xl font-bold">Información Personal</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={userData.nombre || ''}
                                        onChange={handleChange}
                                        placeholder="Tu nombre"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Apellido</label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        value={userData.apellido || ''}
                                        onChange={handleChange}
                                        placeholder="Tu apellido"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                        <FiPhone className="text-gray-500" />
                                        Número de Teléfono
                                    </label>
                                    <input
                                        type="text"
                                        name="celular"
                                        value={userData.celular || ''}
                                        onChange={handleChange}
                                        placeholder="+57 300 123 4567"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Avatar Selection Card */}
                        <div className="rounded-3xl p-4 md:p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5 mb-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <FiImage className="text-purple-400 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-lg md:text-xl font-bold">Elige tu Avatar</h2>
                                    <p className="text-sm text-gray-400">Selecciona un avatar para tu perfil</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {AVATARS.map((avatar) => (
                                    <button
                                        key={avatar}
                                        onClick={() => handleAvatarSelect(avatar)}
                                        className={`relative rounded-2xl p-3 md:p-4 border-2 transition-all duration-300 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 ${
                                            userData.foto_perfil === avatar
                                                ? 'border-green-500 ring-2 ring-green-500/30 scale-105'
                                                : 'border-transparent hover:border-gray-600'
                                        }`}
                                    >
                                        <img
                                            src={avatar}
                                            alt="Avatar"
                                            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                                        />
                                        {userData.foto_perfil === avatar && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                <FiCheck className="text-white text-sm" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {userData.foto_perfil && (
                                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                                    <p className="text-sm text-green-400 flex items-center gap-2">
                                        <FiCheck />
                                        Avatar seleccionado
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 btn-primary btn-icon justify-center py-3"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="text-xl" />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </main>

                    {/* Right Sidebar */}
                    <aside className="w-full lg:w-80 flex flex-col gap-4 md:gap-6 flex-shrink-0">
                        {/* Profile Preview Card */}
                        <div className="bg-[#181b21] rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/5 shadow-sm">
                            <h3 className="text-base md:text-lg font-bold text-white mb-4">Vista Previa</h3>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-green-500 to-blue-500 p-1 mb-4">
                                    {userData.foto_perfil ? (
                                        <img
                                            src={userData.foto_perfil}
                                            alt="Avatar"
                                            className="w-full h-full rounded-full object-cover bg-[#181b21]"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-[#181b21] flex items-center justify-center">
                                            <span className="text-4xl font-bold text-gray-400">
                                                {userName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-lg font-bold">
                                    {userData.nombre || userData.apellido
                                        ? `${userData.nombre || ''} ${userData.apellido || ''}`.trim()
                                        : userName
                                    }
                                </h4>
                                <p className="text-sm text-gray-400">@{userName}</p>
                                {userData.celular && (
                                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                        <FiPhone className="text-xs" />
                                        {userData.celular}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Danger Zone Card */}
                        <div className="bg-gradient-to-br from-red-900/20 to-[#0f1115] rounded-xl md:rounded-2xl p-4 md:p-6 border border-red-500/20 shadow-sm">
                            <h3 className="text-base md:text-lg font-bold text-red-400 mb-2">Zona de Peligro</h3>
                            <p className="text-xs md:text-sm text-gray-400 mb-4">
                                Una vez eliminada tu cuenta, no hay vuelta atrás. Por favor, asegúrate.
                            </p>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="w-full py-2.5 md:py-3 px-4 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                                        Eliminando...
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 />
                                        Eliminar Cuenta
                                    </>
                                )}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Settings;
