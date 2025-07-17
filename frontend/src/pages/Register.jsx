import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const serverIp = process.env.REACT_APP_SERVER_IP;
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    const res = await fetch(`${serverIp}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Inscription réussie !");
      navigate("/login");
    } else {
      alert(data.error);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#eee'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        padding: '20px',
        border: '1px solid gray'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', textAlign: 'center' }}>Inscription</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          maxLength={50}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            border: '1px solid #ccc'
          }}
        />

        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          maxLength={50}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            border: '1px solid #ccc'
          }}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          maxLength={50}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            border: '1px solid #ccc'
          }}
        />

        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          maxLength={50}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            border: '1px solid #ccc'
          }}
        />

        <button
          onClick={handleRegister}
          style={{
            width: '100%',
            backgroundColor: 'gray',
            color: 'white',
            padding: '8px',
            border: 'none'
          }}
        >
          S'inscrire
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', marginTop: '15px' }}>
          Déjà un compte ?{" "}
          <Link to="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
