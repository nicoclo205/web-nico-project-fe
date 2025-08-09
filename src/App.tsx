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

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/start"
					element={<Start />}
				/>
				<Route
					path="/login"
					element={<Login />}
				/>
				<Route
					path="/Home"
					element={<Home />}
				/>
				<Route
					path="/homepage"
					element={<HomePage />}
				/>
				<Route
					path="/"
					element={<Navigate to="/start" />}
				/>
				<Route
					path="/about"
					element={<About />}
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
