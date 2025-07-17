import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header style={{ height: '50px', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
      <input type="text" placeholder="Rechercher..." style={{ width: '400px', height: '30px' }} />
      <Link to="/login" style={{ color: 'white', backgroundColor: 'gray', padding: '5px 10px', textDecoration: 'none' }}>Connexion</Link>
    </header>
  );
}