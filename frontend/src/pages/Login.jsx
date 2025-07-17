import { useState } from "react";
import { Link, useNavigate  } from "react-router-dom";
import Sidebar from '../components/Sidebar';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const serverIp = process.env.REACT_APP_SERVER_IP;

  const handleLogin = async () => {
    const res = await fetch(`${serverIp}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert("Connexion réussie !");
      navigate("/");
    } else {
      alert(data.error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${serverIp}/api/users/google`;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111', color: 'white' }}>
      <Sidebar />
        <main style={{ flex: 1, padding: '10px', backgroundColor: 'white'  }}>
          <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: 'white',
              padding: '20px',
              border: '1px solid gray'
            }}>
              <h2 style={{ fontSize: '18px', marginBottom: '20px', textAlign: 'center' }}>Connexion</h2>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  border: '1px solid #ccc',
                  color: 'black'
                }}
              />

              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  border: '1px solid #ccc',
                  color: 'black'
                }}
              />

              <button
                onClick={handleLogin}
                style={{
                  width: '100%',
                  backgroundColor: 'gray',
                  color: 'white',
                  padding: '8px',
                  border: 'none',
                  marginBottom: '10px'
                }}
              >
                Se connecter
              </button>

              <button
                onClick={handleGoogleLogin}
                style={{
                  width: '100%',
                  backgroundColor: 'white',
                  color: '#444',
                  padding: '8px',
                  border: '1px solid #ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
                  alt="Google Logo"
                  style={{ width: '20px', height: '20px' }}
                />
                Connexion avec Google
              </button>

              <p style={{ color: 'black', textAlign: 'center', fontSize: '13px', marginTop: '15px' }}>
                Pas de compte ?{" "}
                <Link to="/register" style={{ color: 'blue', textDecoration: 'underline' }}>
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </main>
    </div>
  );
}
