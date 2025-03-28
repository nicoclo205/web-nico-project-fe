import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Home from './Home'
import Start from './Start'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/start" element={<Start />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
