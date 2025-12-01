import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import HomePage from './HomePage';
import Start from './Start';
import About from './About';
import SoccerMatches from './pages/SoccerMatches';
import TennisMatches from './pages/TennisMatches';
import BasketballMatches from './pages/BasketballMatches';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Public Routes */}
				<Route
					path="/start"
					element={<Start />}
				/>
				<Route
					path="/login"
					element={<Login />}
				/>
				<Route
					path="/"
					element={<Navigate to="/start" />}
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

				{/* Old Home route (unprotected) */}
				<Route
					path="/Home"
					element={<Home />}
				/>

				{/* Sports Matches Routes */}
				<Route
					path="/soccer-matches"
					element={<SoccerMatches />}
				/>
				<Route
					path="/tennis-matches"
					element={<TennisMatches />}
				/>
				<Route
					path="/basketball-matches"
					element={<BasketballMatches />}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
