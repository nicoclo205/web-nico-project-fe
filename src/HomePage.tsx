import { FaHome } from "react-icons/fa";
import { GiSoccerField } from "react-icons/gi";
import { MdMeetingRoom } from "react-icons/md";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Get user name from auth context
  const userName = user?.nombre_usuario || user?.username || "Usuario";

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#0e0f11] text-white page-transition-enter">

      {/* Sidebar */}
      <aside className="lg:w-20 w-full flex lg:flex-col flex-row items-center justify-around lg:justify-start py-4 lg:py-6 lg:space-y-8 space-x-4 lg:space-x-0 bg-[#121316]">

		{/* Home icon */}
		<FaHome
			className="
				text-white w-12 h-12
				p-3
				rounded-2xl
        bg-green-600
				"/>


	{/* Soccer icon */}
        <GiSoccerField
		onClick={() => navigate('/soccer-matches')}
			className="
				text-white w-12 h-12
				p-3
				rounded-2xl
				hover:bg-white/10
				transition-all duration-200 ease-in-out
				cursor-pointer"/>

        {/* Rooms icon */}
        <MdMeetingRoom
		onClick={() => navigate('/rooms')}
			className="
				text-white w-12 h-12
				p-3
				rounded-2xl
				hover:bg-white/10
				transition-all duration-200 ease-in-out
				cursor-pointer"/>

        <div className="w-12 h-12 bg-white/10 rounded-2xl" />
      </aside>

      {/* Main panel */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">¡Bienvenido a FriendlyBet, {userName}! </h1>

          <div className="flex items-center space-x-2 md:space-x-4">
            <span className="text-gray-300 text-sm md:text-base">{userName}</span>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-lg md:text-xl">{userName.charAt(0).toUpperCase()}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="btn-danger"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Section header */}
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-base md:text-lg">Accesos Rápidos</h2>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

          {/* Soccer Matches Card */}
          <div
            onClick={() => navigate('/soccer-matches')}
            className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">Partidos de Fútbol</h3>
            <p className="text-sm text-gray-400 mb-4">Ver y apostar</p>
            <p className="text-sm text-gray-300">
              Explora los próximos partidos de fútbol y finalizados. Apuesta en tus equipos favoritos de La Liga y otras competiciones.
            </p>
          </div>

          {/* Rooms Card */}
          <div
            onClick={() => navigate('/rooms')}
            className="rounded-3xl p-6 bg-gradient-to-br from-[#262420] to-[#141414] shadow-xl border border-white/5 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">Salas de Apuestas</h3>
            <p className="text-sm text-gray-400 mb-4">Crear o unirse</p>
            <p className="text-sm text-gray-300">
              Crea tus propias salas privadas o únete a salas existentes. Compite con amigos en apuestas grupales.
            </p>
          </div>

          {/* Tennis Card */}
          <div
            onClick={() => navigate('/tennis-matches')}
            className="rounded-3xl p-6 bg-gradient-to-br from-[#241f26] to-[#141417] shadow-xl border border-white/5 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">Tenis</h3>
            <p className="text-sm text-gray-400 mb-4">Próximamente</p>
            <p className="text-sm text-gray-300">
              Encuentra los mejores partidos de tenis y realiza tus apuestas en los torneos más importantes.
            </p>
          </div>

          {/* Basketball Card */}
          <div
            onClick={() => navigate('/basketball-matches')}
            className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2633] to-[#141518] shadow-xl border border-white/5 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">Baloncesto</h3>
            <p className="text-sm text-gray-400 mb-4">Próximamente</p>
            <p className="text-sm text-gray-300">
              Apuesta en los mejores partidos de baloncesto de la NBA, Euroliga y más competiciones internacionales.
            </p>
          </div>
        </div>
      </main>

      {/* Right sidebar - Future chat/notifications */}
      <aside className="hidden xl:block w-80 bg-[#141518] border-l border-white/5 p-6">
        <h2 className="text-xl font-semibold mb-4">Próximamente</h2>
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">
            Esta sección estará disponible pronto para chats, notificaciones y más funcionalidades.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default HomePage;
