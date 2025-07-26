import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(false);
  const serverIp = process.env.REACT_APP_SERVER_IP;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const token = localStorage.getItem("token");

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [isCreatorHovered, setIsCreatorHovered] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  
  // États pour les abonnements
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isOwnVideo, setIsOwnVideo] = useState(false);
  
  // États pour la barre de progression sur hover
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handlePlayEvent = () => setIsPlaying(true);
    const handlePauseEvent = () => setIsPlaying(false);
    const handleLoadedMetadata = () => setVideoDuration(videoEl.duration);
    const handleTimeUpdate = () => {
      if (videoEl.duration) {
        setVideoProgress((videoEl.currentTime / videoEl.duration) * 100);
      }
    };

    videoEl.addEventListener('play', handlePlayEvent);
    videoEl.addEventListener('pause', handlePauseEvent);
    videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoEl.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoEl.removeEventListener('play', handlePlayEvent);
      videoEl.removeEventListener('pause', handlePauseEvent);
      videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoEl.removeEventListener('timeupdate', handleTimeUpdate);
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
        
        // Vérifier si c'est sa propre vidéo
        if (token) {
          try {
            const currentUserId = JSON.parse(atob(token.split('.')[1])).id;
            const isOwn = currentUserId === data.user_id;
            setIsOwnVideo(isOwn);
            
            // Si ce n'est pas sa propre vidéo, récupérer les infos d'abonnement
            if (!isOwn) {
              fetchSubscriptionInfo(data.user_id);
            }
          } catch (err) {
            console.error("Erreur décodage token:", err);
          }
        }
      })
      .catch((err) => {
        console.error("Erreur chargement vidéo :", err);
      });

    fetch(`${serverIp}/api/likes/count/${id}`)
      .then(res => res.json())
      .then(data => setLikesCount(data.totalLikes || 0));

    if (token) {
      fetch(`${serverIp}/api/likes/user/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok && res.json())
        .then(data => setIsLiked(data.liked));

      // Ajouter la vidéo à l'historique de l'utilisateur connecté
      fetch(`${serverIp}/api/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ video_id: id })
      })
        .then(res => {
          if (res.ok) {
            console.log('Vidéo ajoutée à l\'historique');
          }
        })
        .catch(err => console.error('Erreur ajout historique:', err));
    }

    fetch(`${serverIp}/api/comments/${id}`)
      .then(res => res.json())
      .then(data => setComments(data));
  }, [id, token, serverIp]);

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

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        // Safari
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.mozRequestFullScreen) {
        // Firefox
        videoRef.current.mozRequestFullScreen();
      } else if (videoRef.current.msRequestFullscreen) {
        // IE/Edge
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide';
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fonctions pour la barre de progression sur hover
  const handleVideoMouseMove = (e) => {
    if (!videoRef.current || !videoDuration) return;
    
    const videoElement = videoRef.current;
    const rect = videoElement.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * videoDuration;
    
    setHoverTime(Math.max(0, Math.min(time, videoDuration)));
  };

  const handleVideoClick = (e) => {
    if (!videoRef.current || !videoDuration) return;
    
    const videoElement = videoRef.current;
    const rect = videoElement.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * videoDuration;
    
    videoRef.current.currentTime = Math.max(0, Math.min(time, videoDuration));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fonction pour récupérer les informations d'abonnement
  const fetchSubscriptionInfo = async (userId) => {
    if (!token) return;
    
    try {
      // Vérifier si on est abonné
      const subResponse = await fetch(`${serverIp}/api/subscriptions/status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setIsSubscribed(subData.isSubscribed);
      }

      // Récupérer le nombre d'abonnés
      const countResponse = await fetch(`${serverIp}/api/subscriptions/count/${userId}`);
      if (countResponse.ok) {
        const countData = await countResponse.json();
        setSubscribersCount(countData.count);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des infos d\'abonnement:', err);
    }
  };

  // Fonction pour gérer l'abonnement/désabonnement
  const handleSubscriptionToggle = async () => {
    if (!token) {
      alert('Vous devez être connecté pour vous abonner');
      return;
    }

    setIsSubscribing(true);
    try {
      const url = isSubscribed 
        ? `${serverIp}/api/subscriptions/${video.user_id}` 
        : `${serverIp}/api/subscriptions`;
      
      const options = {
        method: isSubscribed ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: isSubscribed ? null : JSON.stringify({ channel_id: video.user_id })
      };

      const response = await fetch(url, options);
      if (response.ok) {
        setIsSubscribed(!isSubscribed);
        setSubscribersCount(prev => isSubscribed ? prev - 1 : prev + 1);
      } else {
        throw new Error('Erreur lors de l\'abonnement');
      }
    } catch (err) {
      console.error('Erreur abonnement:', err);
      alert('Erreur lors de l\'abonnement. Veuillez réessayer.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!token) return alert("Vous devez être connecté pour liker cette vidéo.");

    const url = isLiked ? `${serverIp}/api/likes/${id}` : `${serverIp}/api/likes`;
    const options = {
      method: isLiked ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: isLiked ? null : JSON.stringify({ id_video: id })
    };

    const res = await fetch(url, options);
    if (res.ok) {
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } else {
      const err = await res.json();
      console.error("Erreur lors du like :", err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`${serverIp}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ video_id: id, content: commentText })
      });

      if (res.ok) {
        setCommentText('');
        const updated = await fetch(`${serverIp}/api/comments/${id}`);
        const newComments = await updated.json();
        setComments(newComments);
      } else {
        const err = await res.json();
        console.error("Erreur commentaire :", err);
      }
    } catch (err) {
      console.error("Erreur réseau commentaire :", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const res = await fetch(`${serverIp}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      setComments(comments.filter(c => c.id_comment !== commentId));
    } else {
      const err = await res.json();
      console.error("Erreur suppression :", err);
    }
  };

  // Récupérer les playlists de l'utilisateur
  const fetchUserPlaylists = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${serverIp}/api/playlists`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const playlists = await response.json();
        setUserPlaylists(playlists);
      }
    } catch (err) {
      console.error('Erreur récupération playlists:', err);
    }
  };

  // Ajouter la vidéo à une playlist
  const addToPlaylist = async (playlistId) => {
    try {
      const response = await fetch(`${serverIp}/api/playlists/${playlistId}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ video_id: id })
      });

      if (response.ok) {
        alert('Vidéo ajoutée à la playlist !');
        setShowPlaylistModal(false);
      } else {
        alert('Erreur lors de l\'ajout à la playlist');
      }
    } catch (err) {
      console.error('Erreur ajout playlist:', err);
      alert('Erreur lors de l\'ajout à la playlist');
    }
  };

  // Ouvrir le modal des playlists
  const handlePlaylistButtonClick = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserPlaylists();
    setShowPlaylistModal(true);
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
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'white' }}>
          <h1 style={{ fontSize: '20px', marginBottom: '10px', color: 'black' }}>{video.title}</h1>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            Publié le {formatDate(video.created_at)}
          </p>
          {/* Container vidéo avec barre de progression */}
          <div 
            style={{ 
              position: 'relative', 
              width: '80%', 
              maxWidth: '600px', 
              marginBottom: '20px',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setIsVideoHovered(true)}
            onMouseLeave={() => setIsVideoHovered(false)}
            onMouseMove={handleVideoMouseMove}
            onClick={handleVideoClick}
          >
            <video
              ref={videoRef}
              controls={false}
              style={{ 
                width: '100%', 
                backgroundColor: 'black', 
                display: 'block'
              }}
            >
              <source src={`${serverIp}/upload/video/${video.video_url}`} type="video/mp4" />
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
            
            {/* Barre de progression sur hover */}
            {isVideoHovered && videoDuration > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  right: '10px',
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}
              >
                {/* Barre de progression actuelle */}
                <div
                  style={{
                    width: `${videoProgress}%`,
                    height: '100%',
                    backgroundColor: '#ff0000',
                    borderRadius: '3px'
                  }}
                />
                
                {/* Indicateur de position au hover */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${(hoverTime / videoDuration) * 100}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#ff0000',
                    borderRadius: '50%',
                    border: '2px solid white'
                  }}
                />
              </div>
            )}
            
            {/* Affichage du temps au hover */}
            {isVideoHovered && videoDuration > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '25px',
                  left: `${(hoverTime / videoDuration) * 100}%`,
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none'
                }}
              >
                {formatTime(hoverTime)} / {formatTime(videoDuration)}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
            <img onClick={handleBackward} src="https://cdn-icons-png.flaticon.com/512/8466/8466936.png" alt="Back" style={{ width: '40px', height: '40px', transform: 'scaleX(-1)', cursor: 'pointer' }} />
            {isPlaying ? (
              <img onClick={handlePause} src="https://cdn-icons-png.flaticon.com/512/17879/17879794.png" alt="Pause" style={{ width: '40px', height: '40px', cursor: 'pointer' }} />
            ) : (
              <img onClick={handlePlay} src="https://cdn-icons-png.flaticon.com/512/5690/5690573.png" alt="Play" style={{ width: '40px', height: '40px', cursor: 'pointer' }} />
            )}
            <img onClick={handleForward} src="https://cdn-icons-png.flaticon.com/512/8466/8466936.png" alt="Forward" style={{ width: '40px', height: '40px', cursor: 'pointer' }} />
            
            {/* Bouton plein écran */}
            <img 
              onClick={handleFullscreen} 
              src="https://cdn-icons-png.flaticon.com/512/3413/3413667.png" 
              alt="Fullscreen" 
              style={{ width: '40px', height: '40px', cursor: 'pointer' }}
              title="Plein écran"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img
                src={isLiked ? "https://cdn-icons-png.flaticon.com/512/739/739231.png" : "https://cdn-icons-png.flaticon.com/512/126/126473.png"}
                alt="Like"
                onClick={handleLikeToggle}
                style={{ width: '30px', height: '30px', cursor: 'pointer' }}
              />
              <span style={{ color: 'black' }}>{likesCount}</span>
            </div>
            
            <button
              onClick={handlePlaylistButtonClick}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              📝 Ajouter à une playlist
            </button>
          </div>

          <p style={{ maxWidth: '600px', textAlign: 'center', fontSize: '14px', color: 'black' }}>
            {video.description}
          </p>

          {/* Section créateur */}
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '15px',
              margin: '15px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <img
              src={video.creator_image ? `${serverIp}/upload/image/${video.creator_image}` : "/default_profile_image.png"}
              alt={`Profil de ${video.username}`}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #ddd',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/channel/@${video.username}`)}
            />
            <div 
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={() => navigate(`/channel/@${video.username}`)}
            >
              <h4 style={{
                margin: '0 0 4px 0',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                {video.username}
              </h4>
              <p style={{
                margin: '0',
                fontSize: '12px',
                color: '#666'
              }}>
                {subscribersCount} abonné{subscribersCount !== 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Boutons d'action */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {!isOwnVideo && token && (
                <button
                  onClick={handleSubscriptionToggle}
                  disabled={isSubscribing}
                  style={{
                    backgroundColor: isSubscribed ? '#dc3545' : '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '15px',
                    cursor: isSubscribing ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    opacity: isSubscribing ? 0.6 : 1,
                    transition: 'background-color 0.3s'
                  }}
                >
                  {isSubscribing 
                    ? (isSubscribed ? 'Désabonnement...' : 'Abonnement...') 
                    : (isSubscribed ? 'Se désabonner' : 'S\'abonner')
                  }
                </button>
              )}
              
              <button
                onClick={() => navigate(`/channel/@${video.username}`)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#007bff',
                  border: '1px solid #007bff',
                  padding: '6px 12px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                Voir la chaîne
              </button>
            </div>
          </div>

          {token && (
            <div style={{
              marginBottom: '20px',
              maxWidth: '600px',
              width: '100%',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Ajouter un commentaire..."
                style={{
                  flex: 1,
                  padding: '8px',
                  color: 'black', // Assurez-vous que le texte est noir
                  backgroundColor: 'white', // Assurez-vous que le fond est blanc
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  zIndex: 1 // Priorité pour éviter les conflits
                }}
              />
              <button
                onClick={handleCommentSubmit}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Envoyer
              </button>
            </div>
          )}

          <div style={{ maxWidth: '600px', width: '100%' }}>
            {Array.isArray(comments) && comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={comment.id || comment.id_comment || index} style={{
                  backgroundColor: '#f0f0f0',
                  color: 'black',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <img
                    src={comment.user_image || "/no-user-profil.png"}
                    alt="profil"
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                  />
                  <div style={{ flex: 1 }}>
                    <strong>{comment.username}</strong>
                    <p>{comment.content}</p>
                  </div>
                  {token && comment.user_id === JSON.parse(atob(token.split('.')[1])).id && (
                    <button onClick={() => handleDeleteComment(comment.id || comment.id_comment)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                      ✖
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: 'black' }}>Aucun commentaire pour cette vidéo.</p>
            )}
          </div>

          {/* Modal de sélection de playlist */}
          {showPlaylistModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                minWidth: '400px',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                <h3 style={{ marginBottom: '20px', color: '#333' }}>
                  Ajouter à une playlist
                </h3>
                
                {userPlaylists.length === 0 ? (
                  <p style={{ color: '#666', textAlign: 'center', margin: '20px 0' }}>
                    Aucune playlist trouvée.{' '}
                    <button
                      onClick={() => {
                        setShowPlaylistModal(false);
                        navigate('/playlists');
                      }}
                      style={{
                        color: '#007bff',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Créer une playlist
                    </button>
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {userPlaylists.map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => addToPlaylist(playlist.id)}
                        style={{
                          padding: '15px',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#e9ecef';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#f8f9fa';
                        }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                          {playlist.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Créée le {new Date(playlist.created_at).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowPlaylistModal(false)}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
