import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111', color: 'white' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '10px' }}>
        </main>
      </div>
    </div>
  );
}
