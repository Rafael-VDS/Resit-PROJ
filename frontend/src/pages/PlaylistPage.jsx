import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function PlaylistPage() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState([]);

  const serverIp = process.env.REACT_APP_SERVER_IP;
  const token = localStorage.getItem('token');

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

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchPlaylists();
  }, [token, navigate]);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch(`${serverIp}/api/playlists`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      } else {
        throw new Error('Erreur lors du chargement des playlists');
      }
    } catch (err) {
      console.error('Erreur playlists:', err);
      setError('Erreur lors du chargement des playlists');
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    try {
      const response = await fetch(`${serverIp}/api/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newPlaylistName })
      });

      if (response.ok) {
        setNewPlaylistName('');
        setShowCreateModal(false);
        fetchPlaylists();
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (err) {
      console.error('Erreur création playlist:', err);
      setError('Erreur lors de la création de la playlist');
    }
  };

  const fetchPlaylistVideos = async (playlistId) => {
    try {
      const response = await fetch(`${serverIp}/api/playlists/${playlistId}/videos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylistVideos(data);
      }
    } catch (err) {
      console.error('Erreur vidéos playlist:', err);
    }
  };

  const removeFromPlaylist = async (playlistId, videoId) => {
    try {
      const response = await fetch(`${serverIp}/api/playlists/${playlistId}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchPlaylistVideos(playlistId);
      }
    } catch (err) {
      console.error('Erreur suppression vidéo:', err);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette playlist ?')) return;

    try {
      const response = await fetch(`${serverIp}/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchPlaylists();
        setSelectedPlaylist(null);
        setPlaylistVideos([]);
      }
    } catch (err) {
      console.error('Erreur suppression playlist:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111', color: 'white' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>Chargement des playlists...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111', color: 'white' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '20px', backgroundColor: 'white', color: 'black', overflow: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>Mes Playlists</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                + Créer une playlist
              </button>
            </div>

            {error && (
              <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '30px' }}>
              {/* Liste des playlists */}
              <div style={{ flex: '0 0 300px' }}>
                <h3 style={{ marginBottom: '15px', color: '#333' }}>Vos playlists</h3>
                {playlists.length === 0 ? (
                  <p style={{ color: '#666' }}>Aucune playlist trouvée</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        onClick={() => {
                          setSelectedPlaylist(playlist);
                          fetchPlaylistVideos(playlist.id);
                        }}
                        style={{
                          padding: '15px',
                          backgroundColor: selectedPlaylist?.id === playlist.id ? '#e3f2fd' : '#f8f9fa',
                          border: '1px solid #dee2e6',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' }}>
                              {playlist.name}
                            </h4>
                            <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                              Créée le {new Date(playlist.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {playlist.name !== 'À regarder plus tard' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePlaylist(playlist.id);
                              }}
                              style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '5px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contenu de la playlist sélectionnée */}
              <div style={{ flex: 1 }}>
                {selectedPlaylist ? (
                  <>
                    <h3 style={{ marginBottom: '20px', color: '#333' }}>
                      {selectedPlaylist.name}
                    </h3>
                    {playlistVideos.length === 0 ? (
                      <p style={{ color: '#666', textAlign: 'center', marginTop: '50px' }}>
                        Cette playlist est vide
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {playlistVideos.map((video, index) => (
                          <div
                            key={video.id}
                            style={{
                              display: 'flex',
                              backgroundColor: '#f8f9fa',
                              border: '1px solid #dee2e6',
                              borderRadius: '8px',
                              padding: '15px',
                              alignItems: 'center',
                              gap: '15px'
                            }}
                          >
                            <div style={{ fontSize: '14px', color: '#666', minWidth: '20px' }}>
                              {index + 1}
                            </div>
                            <div
                              onClick={() => navigate(`/video/${video.id}`)}
                              style={{ cursor: 'pointer' }}
                            >
                              <img
                                src={
                                  video.thumbnail_url
                                    ? `${serverIp}/upload/video_image/${video.thumbnail_url}`
                                    : "/no-thumbnail.png"
                                }
                                alt={video.title}
                                style={{
                                  width: '160px',
                                  height: '90px',
                                  objectFit: 'cover',
                                  borderRadius: '4px'
                                }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4
                                onClick={() => navigate(`/video/${video.id}`)}
                                style={{
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  color: '#333',
                                  margin: '0 0 8px 0',
                                  cursor: 'pointer'
                                }}
                              >
                                {video.title}
                              </h4>
                              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                                Publié le {formatDate(video.created_at)}
                              </p>
                              <p style={{ margin: '0', fontSize: '12px', color: '#888' }}>
                                Ajoutée le {new Date(video.added_at).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromPlaylist(selectedPlaylist.id, video.id)}
                              style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Retirer
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
                    <p>Sélectionnez une playlist pour voir son contenu</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal de création de playlist */}
          {showCreateModal && (
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
                minWidth: '400px'
              }}>
                <h3 style={{ marginBottom: '20px', color: '#333' }}>Créer une nouvelle playlist</h3>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Nom de la playlist"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    marginBottom: '20px',
                    boxSizing: 'border-box'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') createPlaylist();
                  }}
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewPlaylistName('');
                    }}
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
                  <button
                    onClick={createPlaylist}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Créer
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
