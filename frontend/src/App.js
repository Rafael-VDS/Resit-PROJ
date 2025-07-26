import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';
import VoidPage from './pages/VoidPage';
import ChannelPage from './pages/ChannelPage';
import AddVideoPage from './pages/AddVideoPage';
import HistoryPage from './pages/HistoryPage';
import PlaylistPage from './pages/PlaylistPage';
import SubscribersPage from './pages/SubscribersPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/video/:id" element={<VideoPage />} />
        <Route path="/void" element={<VoidPage />} />
        <Route path="/channel/:username" element={<ChannelPage />} />
        <Route path="/add-video" element={<AddVideoPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/playlists" element={<PlaylistPage />} />
        <Route path="/subscriptions" element={<SubscribersPage />} />
      </Routes>
    </Router>
  );
}

export default App;
