import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AddVideoPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const serverIp = process.env.REACT_APP_SERVER_IP;
  const token = localStorage.getItem("token");

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier que c'est un fichier vidéo
      if (!file.type.startsWith('video/')) {
        setError('Veuillez sélectionner un fichier vidéo valide');
        return;
      }
      // Vérifier la taille (par exemple, max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Le fichier vidéo est trop volumineux (max 100MB)');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image valide pour la miniature');
        return;
      }
      // Vérifier la taille (par exemple, max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier image est trop volumineux (max 5MB)');
        return;
      }
      setThumbnailFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }
    
    if (!videoFile) {
      setError('Veuillez sélectionner un fichier vidéo');
      return;
    }

    if (!token) {
      setError('Vous devez être connecté pour ajouter une vidéo');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('file', videoFile); // Changé de 'video' à 'file'
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      formData.append('is_public', isPublic);

      console.log('Données envoyées:', {
        title: title.trim(),
        description: description.trim(),
        fileName: videoFile.name,
        fileSize: videoFile.size,
        thumbnailName: thumbnailFile?.name,
        isPublic
      });

      const response = await fetch(`${serverIp}/api/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Réponse serveur:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Vidéo ajoutée avec succès:', result);
        
        // Récupérer le username pour la redirection
        if (token) {
          try {
            const userInfo = JSON.parse(atob(token.split('.')[1]));
            // On devrait avoir le username dans le token, sinon on récupère les infos utilisateur
            navigate(`/channel/@${userInfo.username || 'me'}`);
          } catch (err) {
            console.error("Erreur décodage token:", err);
            navigate('/'); // Fallback vers la page d'accueil
          }
        }
      } else {
        let errorMessage = 'Erreur lors de l\'ajout de la vidéo';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // Si la réponse n'est pas du JSON, utiliser le status
          errorMessage = `Erreur serveur (${response.status}): ${response.statusText}`;
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Erreur réseau:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111', color: 'white' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>Vous devez être connecté pour ajouter une vidéo</p>
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
        <main style={{ 
          flex: 1, 
          padding: '20px', 
          backgroundColor: 'white', 
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{ maxWidth: '800px', width: '100%' }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#333', 
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              Ajouter une nouvelle vidéo
            </h1>

            {error && (
              <div style={{
                backgroundColor: '#ffebee',
                color: '#c62828',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ffcdd2'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{
              backgroundColor: '#f5f5f5',
              padding: '30px',
              borderRadius: '10px',
              border: '1px solid #ddd'
            }}>
              {/* Titre */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Titre de la vidéo *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entrez le titre de votre vidéo"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '16px',
                    color: '#333'
                  }}
                  maxLength={255}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre vidéo (optionnel)"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '16px',
                    color: '#333',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Fichier vidéo */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Fichier vidéo *
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '16px',
                    color: '#333',
                    backgroundColor: 'white'
                  }}
                />
                <small style={{ color: '#666', fontSize: '14px' }}>
                  Formats acceptés: MP4, AVI, MOV, etc. Taille max: 100MB
                </small>
              </div>

              {/* Miniature */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Miniature (optionnel)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '16px',
                    color: '#333',
                    backgroundColor: 'white'
                  }}
                />
                <small style={{ color: '#666', fontSize: '14px' }}>
                  Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
                </small>
              </div>

              {/* Visibilité */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Visibilité
                </label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', color: '#333' }}>
                    <input
                      type="radio"
                      value={true}
                      checked={isPublic === true}
                      onChange={() => setIsPublic(true)}
                      style={{ marginRight: '8px' }}
                    />
                    Publique
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', color: '#333' }}>
                    <input
                      type="radio"
                      value={false}
                      checked={isPublic === false}
                      onChange={() => setIsPublic(false)}
                      style={{ marginRight: '8px' }}
                    />
                    Privée
                  </label>
                </div>
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => navigate(-1)} // Retour à la page précédente
                  style={{
                    padding: '12px 30px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '12px 30px',
                    backgroundColor: isSubmitting ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? 'Ajout en cours...' : 'Ajouter la vidéo'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
