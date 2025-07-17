import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage'; // 👈 Assure-toi que ce fichier existe
import VideoPage from './pages/VideoPage';
import VoidPage from './pages/VoidPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/video/:id" element={<VideoPage />} />
        <Route path="/void" element={<VoidPage />} />
      </Routes>
    </Router>
  );
}

export default App;
