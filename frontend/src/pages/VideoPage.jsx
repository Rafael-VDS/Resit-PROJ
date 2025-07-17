import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function VideoPage() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(false);
  const serverIp = process.env.REACT_APP_SERVER_IP;
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
  const videoEl = videoRef.current;
  if (!videoEl) return;

  const handlePlayEvent = () => setIsPlaying(true);
  const handlePauseEvent = () => setIsPlaying(false);

  videoEl.addEventListener('play', handlePlayEvent);
  videoEl.addEventListener('pause', handlePauseEvent);

  return () => {
    videoEl.removeEventListener('play', handlePlayEvent);
    videoEl.removeEventListener('pause', handlePauseEvent);
  };
}, [video]);


  useEffect(() => {
    fetch(`${serverIp}/api/videos/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) setError(true);
          throw new Error(`Erreur HTTP ${res.status}`);
        }
        const data = await res.json();
        setVideo(data);
      })
      .catch((err) => {
        console.error("Erreur chargement vidéo :", err);
      });
  }, [id]);

  const handlePlay = () => videoRef.current?.play();
  const handlePause = () => videoRef.current?.pause();
  const handleBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
    }
  };
  const handleForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration,
        videoRef.current.currentTime + 5
      );
    }
  };

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#222', color: 'white', padding: '20px' }}>
        <h1 style={{ fontSize: '30px', color: 'red' }}>Erreur 404</h1>
        <p>La vidéo demandée n'existe pas ou a été supprimée.</p>
      </div>
    );
  }

  if (!video) return <p style={{ color: 'white', padding: '20px' }}>Chargement...</p>;

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111', color: 'white' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ fontSize: '20px', marginBottom: '20px' }}>{video.title}</h1>
                <video
                    ref={videoRef}
                    controls={false}
                    style={{ width: '80%', maxWidth: '600px', backgroundColor: 'black', marginBottom: '20px' }}
                >
                    <source src={`${serverIp}/upload/video/${video.video_url}`} type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture vidéo.
                </video>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
                    <img
                        onClick={handleBackward}
                        src="https://cdn-icons-png.flaticon.com/512/8466/8466936.png"
                        alt="Back Logo"
                        style={{ width: '40px', height: '40px', transform: 'scaleX(-1)', cursor: 'pointer' }}
                    />
                    {isPlaying ? (
                        <img
                            onClick={handlePause}
                            src="https://cdn-icons-png.flaticon.com/512/17879/17879794.png"
                            alt="Pause Logo"
                            style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                        />
                        ) : (
                        <img
                            onClick={handlePlay}
                            src="https://cdn-icons-png.flaticon.com/512/5690/5690573.png"
                            alt="Play Logo"
                            style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                        />
                        )}
                    <img
                        onClick={handleForward}
                        src="https://cdn-icons-png.flaticon.com/512/8466/8466936.png"
                        alt="Forward Logo"
                        style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                    />
                </div>

                <p style={{ maxWidth: '600px', textAlign: 'center', fontSize: '14px', color: '#ccc' }}>
                    {video.description}
                </p>
                </main>
            </div>
        </div>
    );
}
