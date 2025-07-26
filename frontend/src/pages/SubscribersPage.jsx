import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function SubscribersPage() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const serverIp = process.env.REACT_APP_SERVER_IP;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchSubscriptions();
  }, [token, navigate]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`${serverIp}/api/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Récupérer le nombre d'abonnés pour chaque chaîne
        const subscriptionsWithCounts = await Promise.all(
          data.map(async (subscription) => {
            try {
              const countResponse = await fetch(`${serverIp}/api/subscriptions/count/${subscription.channel_id}`);
              if (countResponse.ok) {
                const countData = await countResponse.json();
                return { ...subscription, subscribersCount: countData.count };
              }
              return { ...subscription, subscribersCount: 0 };
            } catch (err) {
              console.error(`Erreur nombre d'abonnés pour ${subscription.username}:`, err);
              return { ...subscription, subscribersCount: 0 };
            }
          })
        );
        
        setSubscriptions(subscriptionsWithCounts);
      } else {
        throw new Error('Erreur lors du chargement des abonnements');
      }
    } catch (err) {
      console.error('Erreur abonnements:', err);
      setError('Erreur lors du chargement des abonnements');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (channelId, channelName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir vous désabonner de ${channelName} ?`)) {
      return;
    }

    try {
      const response = await fetch(`${serverIp}/api/subscriptions/${channelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Retirer l'abonnement de la liste
        setSubscriptions(prev => prev.filter(sub => sub.channel_id !== channelId));
      } else {
        throw new Error('Erreur lors du désabonnement');
      }
    } catch (err) {
      console.error('Erreur désabonnement:', err);
      alert('Erreur lors du désabonnement. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111', color: 'white' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <p style={{ color: '#333' }}>Chargement...</p>
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
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: '0' }}>
                Mes Abonnements
              </h1>
              <span style={{ 
                marginLeft: '15px', 
                fontSize: '16px', 
                color: '#666',
                backgroundColor: '#f0f0f0',
                padding: '4px 12px',
                borderRadius: '20px'
              }}>
                {subscriptions.length} chaîne{subscriptions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #f5c6cb'
              }}>
                {error}
              </div>
            )}

            {subscriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📺</div>
                <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '15px' }}>
                  Aucun abonnement
                </h2>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '25px' }}>
                  Vous n'êtes abonné à aucune chaîne pour le moment.
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
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Découvrir des chaînes
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.channel_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '20px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '12px',
                      border: '1px solid #e0e0e0',
                      transition: 'box-shadow 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Image de profil */}
                    <div style={{ marginRight: '20px' }}>
                      <img
                        src={subscription.image ? `${serverIp}/upload/image/${subscription.image}` : "/default_profile_image.png"}
                        alt={`Profil de ${subscription.username}`}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #007bff',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/channel/@${subscription.username}`)}
                      />
                    </div>

                    {/* Informations de la chaîne */}
                    <div style={{ flex: 1 }}>
                      <h3
                        onClick={() => navigate(`/channel/@${subscription.username}`)}
                        style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#333',
                          margin: '0 0 8px 0',
                          cursor: 'pointer'
                        }}
                      >
                        {subscription.username}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#666',
                        margin: '0 0 8px 0'
                      }}>
                        @{subscription.username.toLowerCase()} • {subscription.subscribersCount || 0} abonné{(subscription.subscribersCount || 0) !== 1 ? 's' : ''}
                      </p>
                      {subscription.description && (
                        <p style={{
                          fontSize: '14px',
                          color: '#555',
                          margin: '0',
                          lineHeight: '1.4'
                        }}>
                          {subscription.description.length > 100
                            ? `${subscription.description.substring(0, 100)}...`
                            : subscription.description
                          }
                        </p>
                      )}
                      <p style={{
                        fontSize: '12px',
                        color: '#888',
                        margin: '8px 0 0 0'
                      }}>
                        Abonné depuis le {new Date(subscription.subscribed_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                      <button
                        onClick={() => navigate(`/channel/@${subscription.username}`)}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        Voir la chaîne
                      </button>
                      <button
                        onClick={() => handleUnsubscribe(subscription.channel_id, subscription.username)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        Se désabonner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
