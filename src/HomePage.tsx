import { FaHome } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from './config/api';
import { GiSoccerField } from "react-icons/gi";
import { MdMeetingRoom, MdSportsTennis, MdSportsBasketball } from "react-icons/md";
import { FiSettings, FiInfo } from "react-icons/fi";
import { IoIosChatbubbles, IoMdNotifications, IoMdTrophy } from "react-icons/io";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useRoom } from "./hooks/useRoom";
import { registerRoomHash } from "./utils/roomHash";

const HomePage = () => {
	const { t } = useTranslation(['home', 'common', 'sports']);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const { rooms } = useRoom();

  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await fetch(`${API_BASE_URL}/api/usuario/me`, {
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

    fetchUserAvatar();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Get user name from auth context
  const userName = user?.nombre_usuario || user?.username || t('common:user');
  const currentUserId = user?.id_usuario || user?.id;

  // Filter rooms where user is a member (creator or joined)
  const userRooms = rooms.filter((room) => {
    const isOwner = room.id_usuario === currentUserId;
    const isMember = room.miembros && room.miembros.some(m => m.id_usuario === currentUserId);
    return isOwner || isMember;
  });

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#0e0f11] text-white page-transition-enter">

      {/* Sidebar */}
      <aside className="lg:w-20 w-full flex lg:flex-col flex-row items-center justify-around lg:justify-start py-4 lg:py-6 lg:space-y-8 space-x-4 lg:space-x-0 bg-[#121316]">
        <FaHome
          className="text-white w-12 h-12 p-3 rounded-2xl bg-green-600"
        />
        <GiSoccerField
          onClick={() => navigate('/soccer-matches')}
          className="text-white w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer"
        />
        <MdMeetingRoom
          onClick={() => navigate('/rooms')}
          className="text-white w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer"
        />
        <FiSettings
          onClick={() => navigate('/settings')}
          className="text-white w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer"
        />
        <FiInfo
          onClick={() => navigate('/about')}
          className="text-white w-12 h-12 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 ease-in-out cursor-pointer"
        />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 lg:px-12 bg-[#0e0f11]/95 backdrop-blur-sm z-10 sticky top-0">
          <h1 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-white">
            <span className="hidden md:inline">{t('home:welcomeFriendlyBet')}</span>
            <span className="md:hidden">{t('home:hey')}</span>
            <span className="text-green-500">{userName}</span>!
          </h1>
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
              <span className="hidden sm:inline">{t('common:logout')}</span>
              <span className="sm:hidden">{t('common:out')}</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 pb-12 flex flex-col lg:flex-row gap-6 md:gap-8">

          {/* Main Panel */}
          <main className="flex-1 max-w-5xl">
            <h2 className="text-lg md:text-xl font-medium text-gray-300 mb-4 md:mb-6 flex items-center gap-2">
              <span className="text-green-500">⚡</span>
              {t('home:quickAccess')}
            </h2>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

              {/* Soccer Matches Card */}
              <div
                onClick={() => navigate('/soccer-matches')}
                className="group relative rounded-2xl p-6 bg-[#1f232b] border border-white/5 hover:border-green-500/50 transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <GiSoccerField className="text-8xl text-green-500 transform rotate-12" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-1">{t('home:soccerCardTitle')}</h3>
                  <p className="text-sm text-green-500 font-medium mb-4 flex items-center gap-1">
                    {t('home:soccerCardTagline')}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {t('home:soccerCardDesc')}
                  </p>
                  <button className="w-full py-2.5 rounded-lg bg-gray-800 text-white font-medium text-sm hover:bg-green-600 hover:text-white transition-colors">
                    {t('home:exploreMatches')}
                  </button>
                </div>
              </div>

              {/* Rooms Card */}
              <div
                onClick={() => navigate('/rooms')}
                className="group relative rounded-2xl p-6 bg-[#1f232b] border border-white/5 hover:border-green-500/50 transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <MdMeetingRoom className="text-8xl text-yellow-500 transform -rotate-12" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-1">{t('home:bettingRoomsTitle')}</h3>
                  <p className="text-sm text-yellow-500 font-medium mb-4 flex items-center gap-1">
                    {t('home:bettingRoomsTagline')}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {t('home:bettingRoomsDesc')}
                  </p>
                  <div className="flex gap-3">
                    <button className="flex-1 py-2.5 rounded-lg bg-gray-800 text-white font-medium text-sm hover:bg-green-600 hover:text-white transition-colors">
                      {t('home:join')}
                    </button>
                    <button className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-300 font-medium text-sm hover:border-green-500 hover:text-green-500 transition-colors">
                      {t('home:createRoom')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tennis Card */}
              <div className="group relative rounded-2xl p-6 bg-[#0f1115]/50 border border-white/5 overflow-hidden">
                <div className="relative z-10 opacity-75">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-gray-300">{t('sports:tennis')}</h3>
                    <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded font-medium uppercase tracking-wider">{t('home:comingSoon')}</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mb-4">{t('home:inDevelopment')}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Find the best tennis matches and place your bets on the world's biggest tournaments.
                  </p>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <MdSportsTennis className="text-8xl text-gray-500" />
                </div>
              </div>

              {/* Basketball Card */}
              <div className="group relative rounded-2xl p-6 bg-[#0f1115]/50 border border-white/5 overflow-hidden">
                <div className="relative z-10 opacity-75">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-gray-300">{t('sports:basketball')}</h3>
                    <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded font-medium uppercase tracking-wider">{t('home:comingSoon')}</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mb-4">{t('home:inDevelopment')}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Bet on the best basketball games from the NBA, EuroLeague, and more international competitions.
                  </p>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <MdSportsBasketball className="text-8xl text-gray-500" />
                </div>
              </div>

            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-80 flex flex-col gap-4 md:gap-6 flex-shrink-0 order-first lg:order-last">

            {/* My Rooms Section */}
            {userRooms.length > 0 && (
              <div className="bg-[#181b21] rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/5 shadow-sm">
                <h3 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4">{t('home:myRoomsSection')}</h3>
                <div className="space-y-2">
                  {userRooms.map((room) => {
                    const roomHash = registerRoomHash(room.id_sala);

                    // Get admin name - find the member with 'admin' role
                    const adminMember = room.miembros?.find(m => m.rol === 'admin');
                    const adminName = adminMember?.usuario_nombre ||
                                     adminMember?.nombre_usuario ||
                                     room.creador_nombre ||
                                     'Admin';
                    // Get real member count
                    const memberCount = room.miembros?.length || 1;

                    return (
                      <button
                        key={room.id_sala}
                        onClick={() => navigate(`/room/${roomHash}`)}
                        className="w-full text-left p-2.5 md:p-3 rounded-lg bg-[#0f1115] border border-white/5 hover:border-green-500/50 hover:bg-green-500/10 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Room Avatar */}
                          {room.avatar_sala && (
                            <img
                              src={room.avatar_sala}
                              alt={room.nombre}
                              className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-white truncate group-hover:text-green-400 transition-colors">
                              {room.nombre}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-gray-500">
                                {memberCount} {memberCount === 1 ? 'member' : 'members'}
                              </p>
                              <span className="text-gray-600">•</span>
                              <p className="text-xs text-gray-500 truncate">
                                Admin: {adminName}
                              </p>
                            </div>
                          </div>
                          <svg
                            className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-all group-hover:translate-x-1 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Coming Soon Card */}
            <div className="bg-gradient-to-br from-[#181b21] to-[#0f1115] rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/5 relative overflow-hidden flex-1 min-h-[200px] md:min-h-[250px] flex flex-col justify-center text-center">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500 opacity-10 blur-3xl rounded-full"></div>
              <h3 className="text-base md:text-lg font-bold text-white mb-2 relative z-10">{t('home:comingSoon')}</h3>
              <p className="text-xs md:text-sm text-gray-400 relative z-10 leading-relaxed mb-4 md:mb-6">
                This section is coming soon — chats, notifications, and more social features are on the way!
              </p>
              <div className="flex justify-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 shadow-sm border border-white/5">
                  <IoIosChatbubbles className="text-sm" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 shadow-sm border border-white/5">
                  <IoMdNotifications className="text-sm" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 shadow-sm border border-white/5">
                  <IoMdTrophy className="text-sm" />
                </div>
              </div>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
