import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function ChannelPage() {
  const { username } = useParams(); // Username dans l'URL (avec ou sans @)
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [isOwnChannel, setIsOwnChannel] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  
  // États pour l'édition
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  
  // États pour l'édition des vidéos
  const [editingVideo, setEditingVideo] = useState(null);
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoDescription, setEditVideoDescription] = useState('');
  const [editVideoIsPublic, setEditVideoIsPublic] = useState(true);
  const [editVideoThumbnail, setEditVideoThumbnail] = useState(null);
  const [isUpdatingVideo, setIsUpdatingVideo] = useState(false);
  const [videoUpdateError, setVideoUpdateError] = useState('');
  
  // États pour les abonnements
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  // États pour l'édition de l'image de profil
  const [editProfileImage, setEditProfileImage] = useState(null);
  
  // États pour le changement de mot de passe
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1); // 1: vérifier ancien, 2: nouveau mot de passe
  
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
        ? `${serverIp}/api/subscriptions/${user.id}` 
        : `${serverIp}/api/subscriptions`;
      
      const options = {
        method: isSubscribed ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: isSubscribed ? null : JSON.stringify({ channel_id: user.id })
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

  useEffect(() => {
    if (username) {
      // Reset des états
      setUserNotFound(false);
      setUser(null);
      setVideos([]);
      
      // Nettoyer le username (enlever le @ s'il existe)
      const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
      
      // Récupérer les informations de l'utilisateur par username
      fetch(`${serverIp}/api/users/by-username/${cleanUsername}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setUser(data);
          setLoading(false);
          
          // Vérifier si c'est sa propre chaîne
          let currentUserIsOwner = false;
          if (token) {
            try {
              const currentUserId = JSON.parse(atob(token.split('.')[1])).id;
              currentUserIsOwner = currentUserId === data.id;
              setIsOwnChannel(currentUserIsOwner);
              
              // Récupérer les infos d'abonnement pour tous (sauf l'état d'abonnement pour le propriétaire)
              if (!currentUserIsOwner) {
                fetchSubscriptionInfo(data.id);
              } else {
                // Pour le propriétaire, récupérer seulement le nombre d'abonnés
                fetch(`${serverIp}/api/subscriptions/count/${data.id}`)
                  .then(res => res.ok ? res.json() : Promise.reject())
                  .then(countData => setSubscribersCount(countData.count))
                  .catch(err => console.error('Erreur nombre d\'abonnés:', err));
              }
            } catch (err) {
              console.error("Erreur décodage token:", err);
            }
          }
          
          // Récupérer les vidéos de cet utilisateur
          setLoadingVideos(true);
          
          // Si c'est sa propre chaîne et qu'il est connecté, récupérer toutes ses vidéos
          if (token && currentUserIsOwner) {
            fetch(`${serverIp}/api/videos/user/all`, {
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
              .then(videosData => {
                console.log("Toutes les vidéos de l'utilisateur:", videosData);
                setVideos(videosData);
                setLoadingVideos(false);
              })
              .catch(videoErr => {
                console.error("Erreur lors du chargement des vidéos de l'utilisateur :", videoErr);
                setLoadingVideos(false);
              });
          } else {
            // Pour les autres utilisateurs, récupérer seulement les vidéos publiques
            fetch(`${serverIp}/api/videos/public`)
              .then(res => {
                if (!res.ok) {
                  throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
              })
              .then(videosData => {
                // Filtrer les vidéos pour ne garder que celles de cet utilisateur
                const userVideos = videosData.filter(video => video.user_id === data.id);
                setVideos(userVideos);
                setLoadingVideos(false);
              })
              .catch(videoErr => {
                console.error("Erreur lors du chargement des vidéos publiques :", videoErr);
                setLoadingVideos(false);
              });
          }
        })
        .catch(err => {
          console.error("Erreur lors du chargement de l'utilisateur :", err);
          
          // Si c'est une erreur 404, l'utilisateur n'existe pas
          if (err.message.includes('404')) {
            setUserNotFound(true);
          }
          
          setLoading(false);
          setLoadingVideos(false);
        });
    } else {
      setLoading(false);
    }
  }, [username, serverIp, token]);

  // Fonctions pour gérer l'édition
  const handleEditClick = () => {
    setEditUsername(user.username);
    setEditDescription(user.description || '');
    setIsEditing(true);
    setUpdateError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditUsername('');
    setEditDescription('');
    setUpdateError('');
  };

  const handleSaveEdit = async () => {
    if (!editUsername.trim()) {
      setUpdateError('Le nom d\'utilisateur ne peut pas être vide');
      return;
    }

    setIsUpdating(true);
    setUpdateError('');

    try {
      const formData = new FormData();
      formData.append('username', editUsername.trim());
      formData.append('description', editDescription.trim());
      
      // Ajouter l'image de profil si elle a été modifiée
      if (editProfileImage) {
        formData.append('profileImage', editProfileImage);
      }

      const response = await fetch(`${serverIp}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const updatedUser = await response.json();

      // Mettre à jour les données utilisateur localement
      setUser(prev => ({
        ...prev,
        username: editUsername.trim(),
        description: editDescription.trim(),
        image: updatedUser.image || prev.image // Utiliser 'image' au lieu de 'profile_image'
      }));

      setIsEditing(false);
      setEditProfileImage(null); // Réinitialiser l'état de l'image
      
      // Si le username a changé, rediriger vers la nouvelle URL
      if (editUsername.trim() !== user.username) {
        navigate(`/channel/@${editUsername.trim()}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setUpdateError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Fonctions pour gérer l'édition des vidéos
  const handleVideoEditClick = (video) => {
    setEditingVideo(video);
    setEditVideoTitle(video.title);
    setEditVideoDescription(video.description || '');
    setEditVideoIsPublic(video.is_public === 1);
    setEditVideoThumbnail(null);
    setVideoUpdateError('');
  };

  const handleVideoEditCancel = () => {
    setEditingVideo(null);
    setEditVideoTitle('');
    setEditVideoDescription('');
    setEditVideoIsPublic(true);
    setEditVideoThumbnail(null);
    setVideoUpdateError('');
  };

  const handleVideoSaveEdit = async () => {
    if (!editVideoTitle.trim()) {
      setVideoUpdateError('Le titre ne peut pas être vide');
      return;
    }

    setIsUpdatingVideo(true);
    setVideoUpdateError('');

    try {
      const formData = new FormData();
      formData.append('title', editVideoTitle.trim());
      formData.append('description', editVideoDescription.trim());
      formData.append('is_public', editVideoIsPublic ? '1' : '0');
      
      if (editVideoThumbnail) {
        formData.append('thumbnail', editVideoThumbnail);
      }

      const response = await fetch(`${serverIp}/api/videos/${editingVideo.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la vidéo');
      }

      // Mettre à jour la vidéo dans la liste
      setVideos(prev => prev.map(video => 
        video.id === editingVideo.id 
          ? { 
              ...video, 
              title: editVideoTitle.trim(), 
              description: editVideoDescription.trim(),
              is_public: editVideoIsPublic ? 1 : 0,
              thumbnail_url: editVideoThumbnail ? `${Date.now()}-${editVideoThumbnail.name}` : video.thumbnail_url
            }
          : video
      ));

      setEditingVideo(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la vidéo:', error);
      setVideoUpdateError(error.message);
    } finally {
      setIsUpdatingVideo(false);
    }
  };

  const handleVideoDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ? Cette action est irréversible.')) {
      return;
    }

    setIsUpdatingVideo(true);
    setVideoUpdateError('');

    try {
      const response = await fetch(`${serverIp}/api/videos/${editingVideo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de la vidéo');
      }

      // Retirer la vidéo de la liste
      setVideos(prev => prev.filter(video => video.id !== editingVideo.id));
      setEditingVideo(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la vidéo:', error);
      setVideoUpdateError(error.message);
    } finally {
      setIsUpdatingVideo(false);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        setVideoUpdateError('Veuillez sélectionner un fichier image valide');
        return;
      }
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setVideoUpdateError('Le fichier image est trop volumineux (max 5MB)');
        return;
      }
      setEditVideoThumbnail(file);
      setVideoUpdateError('');
    }
  };

  // Fonction pour gérer le changement d'image de profil
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        setUpdateError('Veuillez sélectionner un fichier image valide');
        return;
      }
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUpdateError('Le fichier image est trop volumineux (max 5MB)');
        return;
      }
      setEditProfileImage(file);
      setUpdateError('');
    }
  };

  // Fonction pour vérifier le mot de passe actuel
  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword.trim()) {
      setPasswordError('Veuillez saisir votre mot de passe actuel');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError('');

    try {
      const response = await fetch(`${serverIp}/api/users/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: currentPassword })
      });

      if (response.ok) {
        setPasswordStep(2);
      } else {
        const errorData = await response.json();
        setPasswordError(errorData.error || 'Mot de passe incorrect');
      }
    } catch (error) {
      console.error('Erreur vérification mot de passe:', error);
      setPasswordError('Erreur lors de la vérification du mot de passe');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Fonction pour changer le mot de passe
  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setPasswordError('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError('');

    try {
      const response = await fetch(`${serverIp}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (response.ok) {
        alert('Mot de passe modifié avec succès !');
        handleCancelPasswordChange();
      } else {
        const errorData = await response.json();
        setPasswordError(errorData.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      setPasswordError('Erreur lors du changement de mot de passe');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Fonction pour annuler le changement de mot de passe
  const handleCancelPasswordChange = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordStep(1);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111', color: 'white' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>Chargement...</p>
          </main>
        </div>
      </div>
    );
  }

  if (!username) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111', color: 'white' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p>URL invalide</p>
              <p style={{ fontSize: '14px', color: '#ccc' }}>
                Utilisez le format: /channel/@username
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'a pas été trouvé (erreur 404)
  if (userNotFound && !loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111', color: 'white' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '64px', color: '#ff4444', marginBottom: '20px' }}>404</h1>
              <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Utilisateur non trouvé</h2>
              <p style={{ fontSize: '16px', color: '#ccc', marginBottom: '5px' }}>
                L'utilisateur <strong>@{username}</strong> n'existe pas.
              </p>
              <p style={{ fontSize: '14px', color: '#888', marginTop: '20px' }}>
                Vérifiez l'orthographe du nom d'utilisateur dans l'URL.
              </p>
              <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                  onClick={() => window.history.back()}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#555'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#444'}
                >
                  ← Retour
                </button>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0055aa'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#0066cc'}
                >
                  Accueil
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas chargé pour d'autres raisons
  if (!user && !loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111', color: 'white' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p>@{username}</p>
              <p style={{ fontSize: '14px', color: '#ccc', marginTop: '10px' }}>
                La visualisation des chaînes d'autres utilisateurs n'est pas encore disponible.
              </p>
              <p style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                Fonctionnalité en développement.
              </p>
            </div>
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
          {/* En-tête de la chaîne */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '10px',
            border: '1px solid #ddd'
          }}>
            {/* Image de profil */}
            <img
              src={user.image ? `${serverIp}/upload/image/${user.image}` : "/default_profile_image.png"}
              alt={`Profil de ${user.username}`}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #333'
              }}
            />
            
            {/* Informations utilisateur */}
            <div style={{ flex: 1, position: 'relative' }}>
              {/* Icône d'édition - visible seulement pour le propriétaire */}
              {isOwnChannel && !isEditing && (
                <button
                  onClick={handleEditClick}
                  style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#666',
                    padding: '5px'
                  }}
                  title="Modifier les informations"
                >
                  ✏️
                </button>
              )}

              {!isEditing ? (
                <>
                  <h1 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#333',
                    margin: '0 0 10px 0'
                  }}>
                    {isOwnChannel ? `Ma Chaîne - ${user.username}` : user.username}
                  </h1>
                  
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    margin: '0 0 15px 0'
                  }}>
                    @{user.username.toLowerCase()}
                  </p>
                  
                  {user.description && (
                    <p style={{
                      fontSize: '16px',
                      color: '#444',
                      lineHeight: '1.5',
                      margin: '0'
                    }}>
                      {user.description}
                    </p>
                  )}
                  
                  {!user.description && (
                    <p style={{
                      fontSize: '16px',
                      color: '#888',
                      fontStyle: 'italic',
                      margin: '0'
                    }}>
                      Aucune description disponible
                    </p>
                  )}

                  {/* Informations d'abonnement */}
                  <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      {subscribersCount} abonné{subscribersCount !== 1 ? 's' : ''}
                    </span>
                    {!isOwnChannel && token && (
                      <button
                        onClick={handleSubscriptionToggle}
                        disabled={isSubscribing}
                        style={{
                          backgroundColor: isSubscribed ? '#dc3545' : '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          cursor: isSubscribing ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
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
                  </div>
                </>
              ) : (
                <>
                  {/* Mode édition */}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                      Nom d'utilisateur :
                    </label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '16px',
                        color: '#333',
                        backgroundColor: 'white'
                      }}
                      placeholder="Nom d'utilisateur"
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                      Description :
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        minHeight: '80px',
                        resize: 'vertical',
                        color: '#333',
                        backgroundColor: 'white'
                      }}
                      placeholder="Description de votre chaîne (optionnel)"
                    />
                  </div>

                  {/* Section pour modifier l'image de profil */}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                      Image de profil :
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        style={{ display: 'none' }}
                        id="profileImageInput"
                      />
                      <label
                        htmlFor="profileImageInput"
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'inline-block'
                        }}
                      >
                        Choisir une nouvelle image
                      </label>
                      {editProfileImage && (
                        <span style={{ fontSize: '14px', color: '#666' }}>
                          {editProfileImage.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bouton pour changer le mot de passe */}
                  <div style={{ marginBottom: '15px' }}>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      style={{
                        backgroundColor: '#ffc107',
                        color: '#212529',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      Modifier le mot de passe
                    </button>
                  </div>

                  {updateError && (
                    <p style={{ color: '#ff4444', fontSize: '14px', marginBottom: '10px' }}>
                      {updateError}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isUpdating}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        opacity: isUpdating ? 0.6 : 1
                      }}
                    >
                      {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        opacity: isUpdating ? 0.6 : 1
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Contenu principal de la chaîne */}
          <div style={{ color: '#333' }}>
            {/* Section des vidéos */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>{isOwnChannel ? 'Mes Vidéos' : `Vidéos de ${user.username}`}</h2>
              {isOwnChannel && (
                <button 
                  onClick={() => navigate('/add-video')}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  + Ajouter une vidéo
                </button>
              )}
            </div>
            
            {/* Affichage des vidéos */}
            {loadingVideos ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#666' }}>Chargement des vidéos...</p>
              </div>
            ) : videos.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {videos.map((video, index) => (
                  <div
                    key={index}
                    onClick={() => navigate(`/video/${video.id}`)}
                    style={{
                      backgroundColor: '#333',
                      width: '300px',
                      textDecoration: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    {/* Icône crayon pour l'édition (visible seulement si le mode édition est activé) */}
                    {isOwnChannel && isEditing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Empêche la navigation vers la vidéo
                          handleVideoEditClick(video);
                        }}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10
                        }}
                        title="Modifier cette vidéo"
                      >
                        ✏️
                      </button>
                    )}
                    
                    <img
                      src={
                        video.thumbnail_url
                          ? `${serverIp}/upload/video_image/${video.thumbnail_url}`
                          : "/no-thumbnail.png"
                      }
                      alt={video.title}
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      onError={(e) => {
                        console.log("Erreur chargement image:", e.target.src);
                        e.target.src = "/no-thumbnail.png";
                      }}
                    />
                    <div style={{ padding: '5px' }}>
                      <h2 style={{ fontSize: '14px', margin: '0 0 5px 0' }}>{video.title}</h2>
                      <p style={{ fontSize: '10px', color: '#ccc', margin: '0 0 5px 0' }}>
                        {formatDate(video.created_at)}
                      </p>
                      {isOwnChannel && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            backgroundColor: video.is_public ? '#4caf50' : '#ff9800',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '10px'
                          }}>
                            {video.is_public ? 'Public' : 'Privé'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#ccc' }}>
                            {formatDate(video.created_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>
                  {isOwnChannel 
                    ? 'Vous n\'avez pas encore ajouté de vidéos' 
                    : `${user.username} n'a pas encore ajouté de vidéos`
                  }
                </p>
                {isOwnChannel && (
                  <button 
                    onClick={() => navigate('/add-video')}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginTop: '10px'
                    }}
                  >
                    Ajouter ma première vidéo
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Popup d'édition des vidéos */}
      {editingVideo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            color: '#333'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>Modifier la vidéo</h2>
            
            {/* Titre */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                Titre :
              </label>
              <input
                type="text"
                value={editVideoTitle}
                onChange={(e) => setEditVideoTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  color: '#333',
                  backgroundColor: 'white'
                }}
                placeholder="Titre de la vidéo"
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                Description :
              </label>
              <textarea
                value={editVideoDescription}
                onChange={(e) => setEditVideoDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical',
                  color: '#333',
                  backgroundColor: 'white'
                }}
                placeholder="Description de la vidéo"
              />
            </div>

            {/* Statut public/privé */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                Visibilité :
              </label>
              <select
                value={editVideoIsPublic ? 'public' : 'private'}
                onChange={(e) => setEditVideoIsPublic(e.target.value === 'public')}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#333',
                  backgroundColor: 'white'
                }}
              >
                <option value="public">Public</option>
                <option value="private">Privé</option>
              </select>
            </div>

            {/* Miniature */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                Nouvelle miniature (optionnel) :
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#333',
                  backgroundColor: 'white'
                }}
              />
              {editVideoThumbnail && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Fichier sélectionné: {editVideoThumbnail.name}
                </p>
              )}
            </div>

            {/* Message d'erreur */}
            {videoUpdateError && (
              <p style={{ color: '#ff4444', fontSize: '14px', marginBottom: '15px' }}>
                {videoUpdateError}
              </p>
            )}

            {/* Boutons de validation/annulation */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={handleVideoSaveEdit}
                disabled={isUpdatingVideo}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: isUpdatingVideo ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: isUpdatingVideo ? 0.6 : 1
                }}
              >
                {isUpdatingVideo ? 'Sauvegarde...' : 'Valider modifications'}
              </button>
              <button
                onClick={handleVideoEditCancel}
                disabled={isUpdatingVideo}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: isUpdatingVideo ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: isUpdatingVideo ? 0.6 : 1
                }}
              >
                Annuler
              </button>
            </div>

            {/* Ligne de séparation */}
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />

            {/* Bouton de suppression */}
            <button
              onClick={handleVideoDelete}
              disabled={isUpdatingVideo}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: isUpdatingVideo ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                width: '100%',
                opacity: isUpdatingVideo ? 0.6 : 1
              }}
            >
              {isUpdatingVideo ? 'Suppression...' : '🗑️ Supprimer la vidéo'}
            </button>
          </div>
        </div>
      )}

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: '1000'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333',
              textAlign: 'center'
            }}>
              Modifier le mot de passe
            </h3>

            {passwordStep === 1 ? (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    color: '#333'
                  }}>
                    Mot de passe actuel :
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px',
                      color: '#333'
                    }}
                    placeholder="Saisissez votre mot de passe actuel"
                  />
                </div>

                {passwordError && (
                  <p style={{ color: '#ff4444', fontSize: '14px', marginBottom: '15px' }}>
                    {passwordError}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleVerifyCurrentPassword}
                    disabled={isUpdatingPassword}
                    style={{
                      flex: '1',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '4px',
                      cursor: isUpdatingPassword ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: isUpdatingPassword ? 0.6 : 1
                    }}
                  >
                    {isUpdatingPassword ? 'Vérification...' : 'Continuer'}
                  </button>
                  <button
                    onClick={handleCancelPasswordChange}
                    disabled={isUpdatingPassword}
                    style={{
                      flex: '1',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '4px',
                      cursor: isUpdatingPassword ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: isUpdatingPassword ? 0.6 : 1
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    color: '#333'
                  }}>
                    Nouveau mot de passe :
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px',
                      color: '#333'
                    }}
                    placeholder="Nouveau mot de passe (min. 6 caractères)"
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    color: '#333'
                  }}>
                    Confirmer le mot de passe :
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px',
                      color: '#333'
                    }}
                    placeholder="Confirmez le nouveau mot de passe"
                  />
                </div>

                {passwordError && (
                  <p style={{ color: '#ff4444', fontSize: '14px', marginBottom: '15px' }}>
                    {passwordError}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleChangePassword}
                    disabled={isUpdatingPassword}
                    style={{
                      flex: '1',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '4px',
                      cursor: isUpdatingPassword ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: isUpdatingPassword ? 0.6 : 1
                    }}
                  >
                    {isUpdatingPassword ? 'Modification...' : 'Modifier'}
                  </button>
                  <button
                    onClick={handleCancelPasswordChange}
                    disabled={isUpdatingPassword}
                    style={{
                      flex: '1',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '4px',
                      cursor: isUpdatingPassword ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: isUpdatingPassword ? 0.6 : 1
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
