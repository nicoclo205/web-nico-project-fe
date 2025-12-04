import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import HomePage from './HomePage';
import Start from './Start';
import About from './About';
import SoccerMatches from './pages/SoccerMatches';
import TennisMatches from './pages/TennisMatches';
import BasketballMatches from './pages/BasketballMatches';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';

function App() {
	return (
		<BrowserRouter>
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
			</Routes>
		</BrowserRouter>
	);
}

export default App;
