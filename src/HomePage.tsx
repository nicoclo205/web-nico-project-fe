import { FiSearch, FiFilter } from "react-icons/fi";
import { FaHome } from "react-icons/fa";
import { GiSoccerField } from "react-icons/gi";
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
    <div className="flex flex-col lg:flex-row h-screen bg-[#0e0f11] text-white">

      {/* Sidebar */}
      <aside className="lg:w-20 w-full flex lg:flex-col flex-row items-center justify-around lg:justify-start py-4 lg:py-6 lg:space-y-8 space-x-4 lg:space-x-0 bg-[#121316]">

		{/* Home icon */}
		<FaHome
			className="
				text-white w-12 h-12
				p-3
				rounded-2xl
				hover:bg-white/10
				transition-all duration-200 ease-in-out
				cursor-pointer"/>


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

        <div className="w-12 h-12 bg-white/10 rounded-2xl" />
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
              className="px-3 py-1.5 md:px-4 md:py-2 bg-red-700 hover:bg-red-400 transition rounded-2xl text-xs md:text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Section header */}
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-base md:text-lg">Juntate con tus amigos y gana</h2>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
          <div className="flex items-center bg-white/10 px-3 md:px-4 py-2 rounded-xl flex-1">
            <FiSearch className="text-gray-400 mr-2 md:mr-3" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none w-full text-sm md:text-base"
            />
          </div>
          <button className="flex items-center justify-center bg-white/10 px-4 py-2 rounded-xl text-sm md:text-base">
            <FiFilter className="mr-2" /> Filter
          </button>
        </div>

        {/* Project cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

          {/* Card */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
            <p className="text-sm text-gray-400 mb-2">Feb 2, 2021</p>
            <h3 className="text-xl font-bold">Web Designing</h3>
            <p className="text-sm text-gray-400">Prototyping</p>

            <div className="mt-4 bg-white/10 h-2 rounded-full">
              <div className="h-full bg-green-400 rounded-full w-[90%]" />
            </div>

            <p className="text-sm text-gray-400 mt-3">2 days left</p>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-[#262420] to-[#141414] shadow-xl border border-white/5">
            <p className="text-sm text-gray-400 mb-2">Feb 05, 2021</p>
            <h3 className="text-xl font-bold">Mobile App</h3>
            <p className="text-sm text-gray-400">Shopping</p>

            <div className="mt-4 bg-white/10 h-2 rounded-full">
              <div className="h-full bg-yellow-400 rounded-full w-[30%]" />
            </div>

            <p className="text-sm text-gray-400 mt-3">3 weeks left</p>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-[#241f26] to-[#141417] shadow-xl border border-white/5">
            <p className="text-sm text-gray-400 mb-2">March 03, 2021</p>
            <h3 className="text-xl font-bold">Dashboard</h3>
            <p className="text-sm text-gray-400">Medical</p>

            <div className="mt-4 bg-white/10 h-2 rounded-full">
              <div className="h-full bg-blue-400 rounded-full w-[50%]" />
            </div>

            <p className="text-sm text-gray-400 mt-3">2 weeks left</p>
          </div>

          {/* Card 4 */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2633] to-[#141518] shadow-xl border border-white/5">
            <p className="text-sm text-gray-400 mb-2">March 08, 2021</p>
            <h3 className="text-xl font-bold">Web Designing</h3>
            <p className="text-sm text-gray-400">Wireframing</p>

            <div className="mt-4 bg-white/10 h-2 rounded-full">
              <div className="h-full bg-cyan-400 rounded-full w-[20%]" />
            </div>

            <p className="text-sm text-gray-400 mt-3">1 week left</p>
          </div>
        </div>
      </main>

      {/* Right panel */}
      <aside className="hidden xl:block w-96 bg-[#141518] border-l border-white/5 p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Client Messages</h2>

        <div className="space-y-4">

          <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-white/20" />
            <div>
              <p className="font-semibold">David</p>
              <p className="text-gray-400 text-sm">
                Hey tell me about progress of project?
              </p>
              <span className="text-xs text-gray-500">21 July</span>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-[#00c896]/20 rounded-2xl border border-green-500/30">
            <div className="w-10 h-10 rounded-full bg-green-500" />
            <div>
              <p className="font-semibold">Stephanie</p>
              <p className="text-gray-300 text-sm">
                I got your first assignment. It was good!
              </p>
              <span className="text-xs text-gray-500">19 July</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default HomePage;
