import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';
import VoidPage from './pages/VoidPage';
import ChannelPage from './pages/ChannelPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/video/:id" element={<VideoPage />} />
        <Route path="/void" element={<VoidPage />} />
        <Route path="/channel" element={<ChannelPage />} />
      </Routes>
    </Router>
  );
}

export default App;
