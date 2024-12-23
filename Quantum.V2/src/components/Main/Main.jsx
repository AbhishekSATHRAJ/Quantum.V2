import React, { useState, useContext } from "react";
import { auth } from "../../server/firebase"; // Ensure Firebase is configured properly
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { Context } from "../../context/Context";
import "./Main.css";
import { assets } from "../../assets/assets";


const MainUser = () => {
  const {
    onSent,
    recentPrompt,
    showResult,
    loading: contextLoading,
    resultData,
    setInput,
    input,
  } = useContext(Context);

  // Authentication states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null); // Logged-in user state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUserAuth, setShowUserAuth] = useState(false);
  const [userIcon, setUserIcon] = useState(assets.user_icon); // Dynamic user icon

  // Validate email format
  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  // Register function
  const register = async () => {
    setError("");
    setLoading(true);

    if (!email || !password || !username || !validateEmail(email)) {
      setError("Please fill in all fields with valid details.");
      setLoading(false);
      return;
    }

    try {
      const newUser = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(newUser.user);
      alert("Verification email sent! Please check your inbox.");
      setEmail("");
      setPassword("");
      setUsername("");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async () => {
    setError("");
    setLoading(true);

    if (!email || !password || !validateEmail(email)) {
      setError("Please provide valid email and password.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      if (!loggedInUser.emailVerified) {
        alert("Please verify your email before signing in.");
        await signOut(auth);
        setUser(null);
        setUserIcon(assets.user_icon); // Default icon
      } else {
        setUser({ email: loggedInUser.email, displayName: username });
        setUserIcon(assets.logged_in_user_icon); // Update to logged-in icon
        alert("Signed in successfully!");
        setShowUserAuth(false); // Navigate to main view
      }
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserIcon(assets.user_icon); // Reset to default icon
      alert("Signed out successfully!");
    } catch (err) {
      setError(err.message || "Logout failed.");
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      setError("No user is signed in.");
      return;
    }

    try {
      await sendEmailVerification(auth.currentUser);
      alert("Verification email resent.");
    } catch (err) {
      setError(err.message || "Failed to resend verification email.");
    }
  };

  // Toggle user authentication UI
  const toggleUserAuth = () => {
    setShowUserAuth(!showUserAuth);
  };

  return (
    <div className="main-user">
      {showUserAuth ? (
        <div className="user-auth">
          <h1>User Authentication</h1>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!user ? (
            <div className="user">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={register} disabled={loading}>
                Register
              </button>
              <button onClick={login} disabled={loading}>
                Sign In
              </button>
            </div>
          ) : (
            <div className="welcome">
              <h2>Welcome, {user.displayName || user.email}</h2>
              {!user.emailVerified && (
                <button onClick={resendVerificationEmail}>
                  Resend Verification Email
                </button>
              )}
              <button onClick={logout} disabled={loading}>
                Sign Out
              </button>
            </div>
          )}
          <button onClick={toggleUserAuth}>Back to Main</button>
        </div>
      ) : (
        <div className="main">
          <div className="nav">
            <p>Quantum.V2</p>
            <img
              src={userIcon} // Dynamic icon source
              alt="User_Icon"
              onClick={toggleUserAuth}
            />
          </div>
          <div className="main-container">
            {!showResult ? (
              <>
                <div className="greet">
                  <p>
                    <span>
                      Hello, {user ? user.displayName || user.email : "Guest"}.
                    </span>
                  </p>
                  <p>How can I help today?</p>
                </div>
                <div className="cards">
                  <div className="card">
                    <p>Suggest beautiful places to see on an upcoming road trip</p>
                    <img src={assets.compass_icon} alt="" />
                  </div>
                  <div className="card">
                    <p>Briefly summarize this concept: urban planning</p>
                    <img src={assets.bulb_icon} alt="" />
                  </div>
                  <div className="card">
                    <p>Brainstorm team bonding activities for our work retreat</p>
                    <img src={assets.message_icon} alt="" />
                  </div>
                  <div className="card">
                    <p>Improve the readability of the following code</p>
                    <img src={assets.code_icon} alt="" />
                  </div>
                </div>
              </>
            ) : (
              <div className="result">
                <div className="result-title">
                  <img src={assets.user_icon} alt="" />
                  <p>{recentPrompt}</p>
                </div>
                <div className="result-data">
                  <img src={assets.gemini_icon} alt="" />
                  {contextLoading ? (
                    <div className="loader">
                      <hr />
                      <hr />
                      <hr />
                    </div>
                  ) : (
                    <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
                  )}
                </div>
              </div>
            )}
            <div className="main-bottom">
              <div className="search-box">
                <input
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  type="text"
                  placeholder="Enter a prompt here..."
                />
                <div>
                  <img  onClick={() => onSent()}  src={assets.gallery_icon} alt="" />
                  <img src={assets.mic_icon} alt="" />
                  {input ? (
                    <img onClick={() => onSent()} src={assets.send_icon} alt="" />
                  ) : null}
                </div>
              </div>
              <p className="bottom-info">
                Quantum.V2 may display inaccurate info, including about people,
                so double-check its responses. Your privacy and Quantum.V2
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainUser;
