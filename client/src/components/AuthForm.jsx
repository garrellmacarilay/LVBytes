import { useState, useEffect } from "react";
import { signupUser, loginUser, logoutUser } from "../services/userService";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleForm = () => setIsLogin(!isLogin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please fill all fields");

    try {
      const loggedUser = isLogin
        ? await loginUser(email, password)
        : await signupUser(email, password);

      alert(`${isLogin ? "Login" : "Signup"} successful! Welcome ${loggedUser.email}`);
      setEmail("");
      setPassword("");
    } catch (err) {
      // Errors are handled here, not in service
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    alert("Logged out successfully!");
  };

  if (user) {
    return (
      <div style={{ maxWidth: 400, margin: "auto" }}>
        <h2>Welcome, {user.email}</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>{isLogin ? "Login" : "Signup"}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: 10 }}>
          {isLogin ? "Login" : "Signup"}
        </button>
      </form>
      <button onClick={toggleForm} style={{ marginTop: 10 }}>
        {isLogin ? "Go to Signup" : "Go to Login"}
      </button>
    </div>
  );
}
