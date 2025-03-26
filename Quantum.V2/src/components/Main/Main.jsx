import React, { useState, useContext, useEffect } from "react";
import { auth } from "../../server/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Context } from "../../context/Context";
import "./Main.css";
import { assets } from "../../assets/assets";

const MainUser = ({ isSidebarVisible, toggleSidebar, menuIcon }) => {
  const {
    onSent,
    recentPrompt,
    showResult,
    loading: contextLoading,
    resultData,
    setInput,
    input,
  } = useContext(Context);

  const [isRegistered, setIsRegistered] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUserAuth, setShowUserAuth] = useState(false);
  const [userIcon, setUserIcon] = useState(assets.user_icon);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);

  const handleMicrophoneClick = async () => {
    if (!isRecording) {
      try {
        const recognition = new (window.SpeechRecognition ||
          window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
        recognition.interimResults = false;

        recognition.start();
        setIsRecording(true);

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log("Transcribed Text:", transcript);

          onSent(transcript);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
        };
      } catch (error) {
        console.error("Speech recognition not supported:", error);
        setIsRecording(false);
      }
    } else {
      setIsRecording(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
        setUserIcon(currentUser.photoURL || assets.user_icon);
        logActivity("User Signed in");
        toast.success("User signed in successfully!");
      } else {
        setUser(null);
        setUserIcon(assets.user_icon);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageSelection = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setInput(file.name);
      onSent(file.name);
      return () => URL.revokeObjectURL(imageUrl);
    } else {
      setSelectedImage(null);
    }
  };
  const handleImageIconClick = () => {
    document.getElementById("file-input").click();
  };

  const updateUserProfile = async () => {
    setError("");
    if (!auth.currentUser) {
      setError("No user is signed in.");
      return;
    }

    try {
      await updateProfile(auth.currentUser, {
        displayName: username,
        photoURL: selectedImage || userIcon,
      });
      setUser((prev) => ({
        ...prev,
        displayName: username,
        photoURL: selectedImage || userIcon,
      }));
      setUserIcon(selectedImage || userIcon);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const register = async () => {
    setError("");
    setLoading(true);

    if (!email || !password || !username || !validateEmail(email)) {
      setError("Please fill in all fields with valid details.");
      toast.error("Please fill in all fields with valid details.");
      setLoading(false);
      return;
    }

    try {
      const newUser = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(newUser.user);
      toast.success("Verification email sent! Check your inbox.");
      setEmail("");
      setPassword("");
      setUsername("");
      setIsRegistered(true);
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
      toast.error("Please provide valid email and password.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const loggedInUser = userCredential.user;

      if (!loggedInUser.emailVerified) {
        await signOut(auth);
        toast.error("Please verify your email before logging in.");
        setUser(null);
        setUserIcon(assets.user_icon);
      } else {
        setUser({
          email: loggedInUser.email,
          displayName: loggedInUser.displayName || "User",
          photoURL: loggedInUser.photoURL,
        });
        setUserIcon(loggedInUser.photoURL || assets.user_icon);
        toast.success("Login successful!");
        setShowUserAuth(false);
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
      setUserIcon(assets.user_icon);
      toast.info("Logged out successfully.");
    } catch (err) {
      setError(err.message || "Logout failed.");
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      toast.error("No user is signed in.");
      setError("No user is signed in.");
      return;
    }

    try {
      await sendEmailVerification(auth.currentUser);
      toast.success("Verification email resent successfully!");
    } catch (err) {
      setError(err.message || "Failed to resend verification email.");
    }
  };

  // Toggle user authentication UI
  const toggleUserAuth = () => {
    setShowUserAuth(!showUserAuth);
    setError("");
  };

  return (
    <div className="main-user">
      <ToastContainer position="top-right" autoClose={3000} />
      {showUserAuth ? (
        <div className="user-auth">
          <h1>User Authentication</h1>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!user ? (
            <div className="user">
             {!isRegistered &&( <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />)}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button  onClick={register} disabled={loading}>
                Register
              </button>
              <button className="Signin" onClick={login} disabled={loading}>
                Sign In
              </button>
            </div>
          ) : (
            <div className="welcome">
              <h2>Welcome, {user.displayName || user.email}</h2>
              <div>
                <button onClick={updateUserProfile}>Update Profile</button>
              </div>
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
          <button className="BacktoMain" onClick={toggleUserAuth}>Back to Main</button>
        </div>
      ) : (
        <div className="main">
          <div className="nav">
             <img
              onClick={toggleSidebar}
              className="menu"
              title="Menu"
              src={menuIcon}
              alt="Menu_Icon"
            />
          
            
            <p>Quantum.V2</p>
            <img
              src={user ? userIcon || assets.user_icon : assets.user}
              alt="User_Icon"
              title="User_Icon"
              onClick={toggleUserAuth}
              onError={(e) => {
                e.target.src = assets.user;
              }}
            />
          </div>
          <div className="main-container">
            {!showResult ? (
              <>
                <div className="greet">
                  <p>
                    <span>
                      Hello, {user ? user.displayName || "NewUser"  : "Guest"}.
                    </span>
                  </p>
                  <p>How can I help today?</p>
                </div>
                <div className="cards">
                  <div
                    className="card"
                    onClick={() =>
                      onSent(
                        "Suggest beautiful places to see on an upcoming road trip"
                      )
                    }
                  >
                    <p>
                      Suggest beautiful places to see on an upcoming road trip
                    </p>
                    <img src={assets.compass_icon} alt="" />
                  </div>
                  <div
                    className="card"
                    onClick={() =>
                      onSent("Briefly summarize this concept: urban planning")
                    }
                  >
                    <p>Briefly summarize this concept: urban planning</p>
                    <img src={assets.bulb_icon} alt="" />
                  </div>
                  <div
                    className="card"
                    onClick={() =>
                      onSent(
                        "Brainstorm team bonding activities for our work retreat"
                      )
                    }
                  >
                    <p>
                      Brainstorm team bonding activities for our work retreat
                    </p>
                    <img src={assets.message_icon} alt="" />
                  </div>
                  <div
                    className="card"
                    onClick={() =>
                      onSent("Improve the readability of the following code")
                    }
                  >
                    <p>Improve the readability of the following code</p>
                    <img src={assets.code_icon} alt="Code_Icon" />
                  </div>
                </div>
              </>
            ) : (
              <div className="result">
                <div className="result-title">
                  <img
                    src={assets.user_icon}
                    alt="user_icon"
                    title="user_icon"
                  />
                  <p>{recentPrompt}</p>
                </div>
                <div className="result-data">
                  <img
                    src={assets.science}
                    alt="Quantum.V2"
                    title="Quantum.V2"
                  />
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSent();
                    }
                  }}
                  placeholder="Enter a prompt here..."
                />
                <div>
                  <img
                    onClick={handleImageIconClick}
                    src={assets.gallery_icon}
                    alt="Gallery_icon"
                    title="Gallery_icon"
                  />
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageSelection}
                  />
                  <img
                    onClick={handleMicrophoneClick}
                    src={
                      isRecording ? assets.mic_recording_icon : assets.mic_icon
                    }
                    alt="Mic_icon"
                    title="Mic_icon"
                  />
                  {input ? (
                    <img
                      onClick={() => onSent()}
                      src={assets.send_icon}
                      alt="Send_Icon"
                      title="Send_Icon"
                    />
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
