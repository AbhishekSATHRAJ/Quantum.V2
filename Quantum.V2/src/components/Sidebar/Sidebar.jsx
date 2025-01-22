import { useContext, useState } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";

function Sidebar() {
  const [extended, setExtended] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [activityLog, setActivityLog] = useState([
    { message: "Logged in", timestamp: new Date() },
  ]);
  const { onSent, prevPrompts, setRecentPrompt, newChat } = useContext(Context);

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const debounceAction = (callback, delay) => {
    let timer;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => callback(...args), delay);
    };
  };

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  const toggleActivityLog = () => {
    setShowActivityLog(!showActivityLog);
    setExtended(false);
    setShowSettings(false);
  };
  const toggleSettings = () => {
    setShowSettings(!showSettings);
    setExtended(false);
    setShowActivityLog(false);
  };
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    addLog(`Notifications ${!notificationsEnabled ? "Enabled" : "Disabled"}`);
  };
  const toggleDarkMode = () => {
    setDarkModeEnabled(!darkModeEnabled);
    document.body.style.backgroundColor = !darkModeEnabled ? "#333" : "#fff";
    document.body.style.color = !darkModeEnabled ? "#fff" : "#000";
    addLog(`Dark Mode ${!darkModeEnabled ? "Enabled" : "Disabled"}`);
  };
  // Log activity
  const addLog = (message) => {
    setActivityLog((prevLogs) => [
      ...prevLogs,
      { message, timestamp: new Date() },
    ]);
  };

  const loadPrompt = debounceAction(async (prompt) => {
    setRecentPrompt(prompt);
    await onSent(prompt);
    addLog(`Loaded prompt: "${prompt.slice(0, 18)}..."`);
  }, 1000);
  const handleNewChat = debounceAction(() => {
    newChat();
    addLog("Started a new chat");
  }, 1000);

  return (
    <div className={`sidebar${sidebarVisible ? "show" : ""}`}>
      <div className="top">
        <img
          onClick={() => {
            setExtended((prev) => !prev);
            toggleSidebar;
          }}
          className="menu"
          title="Menu"
          src={assets.menu_icon}
          alt="Menu_Icon"
        />
        <div onClick={handleNewChat} className="new-chat">
          <img src={assets.plus_icon} alt="Plus" title="new-chat" />
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended ? (
          <div className="recent">
            <p className="recent-title">Recent</p>
            {prevPrompts.map((item, index) => (
              <div
                key={index}
                onClick={() => loadPrompt(item)}
                className="recent-entry"
              >
                <img src={assets.message_icon} alt="Message Icon" />
                <p>{item.slice(0, 18)}...</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {showHelp ? (
        <div className="help-modal">
          <h3>Help</h3>
          <p>
            Here you can add some help content, tips, or instructions for the
            user.
          </p>
          <button onClick={() => setShowHelp(false)}>Close Help</button>
        </div>
      ) : showActivityLog ? (
        <div className="activity-log">
          <h3>Activity Log</h3>
          <ul>
            {activityLog.map((log, index) => (
              <li key={index}>
                {log.message} at {log.timestamp.toLocaleTimeString()},{" "}
                {log.timestamp.toLocaleDateString()}
              </li>
            ))}
          </ul>
          <button onClick={() => setShowActivityLog(false)}>
            Back to Sidebar
          </button>
        </div>
      ) : showSettings ? (
        <div className="settings">
          <h3>Settings</h3>
          <div>
            <label>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={toggleNotifications}
              />
              Enable Notifications
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={darkModeEnabled}
                onChange={toggleDarkMode}
              />
              Enable Dark Mode
            </label>
          </div>
          <button onClick={() => setShowSettings(false)}>
            Back to Sidebar
          </button>
        </div>
      ) : (
        <div className="bottom">
          <div className="bottom-item recent-entry" onClick={toggleHelp}>
            <img
              src={assets.question_icon}
              alt="Help"
              title="Help"
              onClick={toggleHelp}
            />
            {extended ? <p>Help</p> : null}
          </div>
          <div className="bottom-item recent-entry" onClick={toggleActivityLog}>
            <img
              src={assets.history_icon}
              onClick={toggleActivityLog}
              alt="Activity"
              title="Activity"
            />
            {extended ? <p>Activity</p> : null}
          </div>
          <div className="bottom-item recent-entry" onClick={toggleSettings}>
            <img
              src={assets.setting_icon}
              alt="Settings"
              title="Settings"
              onClick={toggleSettings}
            />
            {extended ? <p>Settings</p> : null}
          </div>
        </div>
      )}
    </div>
  );
}
export default Sidebar;
