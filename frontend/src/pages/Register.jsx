import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const serverIp = process.env.REACT_APP_SERVER_IP
  const navigate = useNavigate();

  const handleRegister = async () => {
    const res = await fetch(`${serverIp}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Inscription réussie !");
      navigate("/");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Inscription</h2>
        <input
          className="w-full mb-4 p-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-4 p-2 border rounded"
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full mb-4 p-2 border rounded"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
          onClick={handleRegister}
        >
          S'inscrire
        </button>
        <p className="text-center text-sm mt-4">
          Déjà un compte ?{" "}
          <Link to="/" className="text-blue-500 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
