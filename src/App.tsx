import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import Start from './pages/Start';
import About from './pages/About';
import SoccerMatches from './pages/SoccerMatches';
import WorldCupBoard from './pages/WorldCupBoard';
import TennisMatches from './pages/TennisMatches';
import BasketballMatches from './pages/BasketballMatches';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Settings from './pages/Settings';
import { VerifyEmail } from './pages/VerifyEmail';
import { ResetPassword } from './pages/ResetPassword';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import NotFound from './pages/NotFound';
import F1Races from './pages/F1Races';
import StreakPong from './pages/StreakPong';
import PageTitle from './components/PageTitle';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';

function App() {
	return (
		<BrowserRouter>
			<PageTitle />
			<Routes>
				{/* Public only Routes */}
				<Route
					path="/start"
					element={
						<PublicOnlyRoute>
							<Start />
						</PublicOnlyRoute>}
				/>
				<Route
					path="/login"
					element={<PublicOnlyRoute>
						<Login />
					</PublicOnlyRoute>}
				/>
				<Route
					path="/forgot-password"
					element={<PublicOnlyRoute>
						<ForgotPasswordPage />
					</PublicOnlyRoute>}
				/>
				<Route
					path="/verify-email"
					element={<VerifyEmail />}
				/>
				<Route
					path="/reset-password"
					element={<ResetPassword />}
				/>
				<Route
					path="/"
					element={
						<PublicOnlyRoute>
							<Navigate to="/start" />
						</PublicOnlyRoute>}
				/>
				<Route
					path="/about"
					element={<About />}
				/>

				{/* Protected Routes */}
				<Route
					path="/homepage"
					element={
						<ProtectedRoute>
							<HomePage />
						</ProtectedRoute>
					}
				/>


				{/* Sports Matches Routes */}
				<Route
					path="/soccer-matches"
					element={
						<ProtectedRoute>
							<SoccerMatches />
						</ProtectedRoute>}
				/>
				<Route
					path="/world-cup"
					element={
						<ProtectedRoute>
							<WorldCupBoard />
						</ProtectedRoute>}
				/>
				<Route
					path="/tennis-matches"
					element={
						<ProtectedRoute>
							<TennisMatches />
						</ProtectedRoute>}
				/>
				<Route
					path="/basketball-matches"
					element={
						<ProtectedRoute>
							<BasketballMatches />
						</ProtectedRoute>}
				/>
				<Route
					path="/f1-races"
					element={
						<ProtectedRoute>
							<F1Races />
						</ProtectedRoute>}
				/>

				{/* Rooms Routes */}
				<Route
					path="/rooms"
					element={
						<ProtectedRoute>
							<Rooms />
						</ProtectedRoute>}
				/>
				<Route
					path="/room/:roomHash"
					element={
						<ProtectedRoute>
							<RoomDetail />
						</ProtectedRoute>}
				/>
				<Route
					path="/settings"
					element={
						<ProtectedRoute>
							<Settings />
						</ProtectedRoute>}
				/>

				{/* Mini-game */}
				<Route
					path="/streak-pong"
					element={
						<ProtectedRoute>
							<StreakPong />
						</ProtectedRoute>}
				/>

				{/* 404 catch-all */}
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
