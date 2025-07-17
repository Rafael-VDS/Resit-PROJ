import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); // redirige vers l'accueil
    window.location.reload(); // force le rafraîchissement si besoin
  };

  return (
    <header style={{
      height: '50px',
      backgroundColor: '#333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 10px'
    }}>
      <input
        type="text"
        placeholder="Rechercher..."
        style={{ width: '400px', height: '30px' }}
      />

      <div style={{ display: 'flex', gap: '10px' }}>
        {isLoggedIn ? (
          <>
            <Link
              to="/channel"
              style={{
                color: 'white',
                backgroundColor: 'gray',
                padding: '5px 10px',
                textDecoration: 'none'
              }}
            >
              Compte
            </Link>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'red',
                color: 'white',
                padding: '5px 10px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Déconnexion
            </button>
          </>
        ) : (
          <Link
            to="/login"
            style={{
              color: 'white',
              backgroundColor: 'gray',
              padding: '5px 10px',
              textDecoration: 'none'
            }}
          >
            Connexion
          </Link>
        )}
      </div>
    </header>
  );
}
