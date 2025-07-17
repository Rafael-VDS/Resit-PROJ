import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const serverIp = process.env.REACT_APP_SERVER_IP;

  useEffect(() => {
    fetch(`${serverIp}/api/videos/public`)
      .then((res) => res.json())
      .then((data) => setVideos(data))
      .catch((err) => console.error('Erreur fetch vidéos publiques :', err));
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111', color: 'white' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '10px', backgroundColor: 'white'  }}>
          {videos.length === 0 ? (
            <p>Aucune vidéo trouvée.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {videos.map((video, index) => (
                <Link
                  key={index}
                  to={`/video/${video.id}`}
                  style={{
                    backgroundColor: '#333',
                    width: '300px',
                    textDecoration: 'none',
                    color: 'white',
                  }}
                >
                  <img
                    src={
                      video.thumbnail_url
                        ? `${serverIp}/upload/video_image/${video.thumbnail_url}`
                        : "/no-thumbnail.png"
                    }
                    alt={video.title}
                    style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '5px' }}>
                    <h2 style={{ fontSize: '14px' }}>{video.title}</h2>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
