import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const serverIp = process.env.REACT_APP_SERVER_IP;
  const token = localStorage.getItem("token");

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

    // Récupérer l'historique de l'utilisateur
    fetch(`${serverIp}/api/history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Historique récupéré:', data);
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur lors du chargement de l\'historique:', err);
        setError('Erreur lors du chargement de l\'historique');
        setLoading(false);
      });
  }, [serverIp, token, navigate]);

  // Supprimer une vidéo de l'historique
  const handleRemoveFromHistory = async (videoId) => {
    try {
      const response = await fetch(`${serverIp}/api/history/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Retirer la vidéo de la liste locale
        setHistory(prev => prev.filter(item => item.video_id !== videoId));
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur suppression historique:', err);
      setError('Erreur lors de la suppression');
    }
  };

  // Supprimer tout l'historique
  const handleClearAllHistory = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer tout votre historique ? Cette action est irréversible.')) {
      return;
    }

    try {
      const response = await fetch(`${serverIp}/api/history`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setHistory([]);
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur suppression historique complet:', err);
      setError('Erreur lors de la suppression de l\'historique');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111', color: 'white' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>Chargement de l'historique...</p>
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
        <main style={{ flex: 1, padding: '20px', backgroundColor: 'white', overflowY: 'auto' }}>
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>
              Mon Historique
            </h1>
            {history.length > 0 && (
              <button
                onClick={handleClearAllHistory}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🗑️ Supprimer tout l'historique
              </button>
            )}
          </div>

          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '15px',
              borderRadius: '5px',
              marginBottom: '20px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h2 style={{ color: '#666', fontSize: '20px', marginBottom: '10px' }}>
                Votre historique est vide
              </h2>
              <p style={{ color: '#888', fontSize: '16px', marginBottom: '20px' }}>
                Les vidéos que vous regardez apparaîtront ici.
              </p>
              <button
                onClick={() => navigate('/')}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Découvrir des vidéos
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {history.map((item, index) => (
                <div
                  key={index}
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
                  {/* Miniature de la vidéo */}
                  <div
                    onClick={() => navigate(`/video/${item.video_id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={
                        item.thumbnail_url
                          ? `${serverIp}/upload/video_image/${item.thumbnail_url}`
                          : "/no-thumbnail.png"
                      }
                      alt={item.title}
                      style={{
                        width: '200px',
                        height: '112px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        e.target.src = "/no-thumbnail.png";
                      }}
                    />
                  </div>

                  {/* Informations de la vidéo */}
                  <div style={{ flex: 1 }}>
                    <h3
                      onClick={() => navigate(`/video/${item.video_id}`)}
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#333',
                        margin: '0 0 8px 0',
                        cursor: 'pointer'
                      }}
                    >
                      {item.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      margin: '0 0 8px 0',
                      lineHeight: '1.4'
                    }}>
                      {item.description ? 
                        (item.description.length > 150 
                          ? `${item.description.substring(0, 150)}...` 
                          : item.description
                        ) : 'Aucune description'
                      }
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        Publié le {formatDate(item.created_at)}
                      </span>
                      <span style={{ fontSize: '12px', color: '#888' }}>
                        Regardée le {new Date(item.watched_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span style={{
                        backgroundColor: item.is_public ? '#28a745' : '#ffc107',
                        color: item.is_public ? 'white' : '#212529',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {item.is_public ? 'Public' : 'Privé'}
                      </span>
                    </div>
                  </div>

                  {/* Bouton de suppression */}
                  <button
                    onClick={() => handleRemoveFromHistory(item.video_id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      alignSelf: 'flex-start'
                    }}
                    title="Supprimer de l'historique"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
