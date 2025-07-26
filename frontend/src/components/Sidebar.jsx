import { FaHome, FaList, FaPlay, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside style={{ width: '200px', backgroundColor: '#222', padding: '10px' }}>
      <h1 style={{ fontSize: '18px', marginBottom: '20px' }}>FreeTube</h1>
      <SidebarItem icon={<FaHome />} label="Accueil" to="/" />
      <SidebarItem icon={<FaPlay />} label="Playlists" to="/playlists" />
      <SidebarItem icon={<FaList />} label="Historique" to="/history" />
      <SidebarItem icon={<FaUsers />} label="Abonnements" to="/subscriptions" />
    </aside>
  );
}

function SidebarItem({ icon, label, to = "#" }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', cursor: 'pointer' }}>
        <div>{icon}</div>
        <span style={{ fontSize: '14px' }}>{label}</span>
      </div>
    </Link>
  );
}