import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Main from "./components/Main/Main";

const App = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(
    window.innerWidth > 600
  );
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const checkScreenSize = () => {
      const isSmall = window.innerWidth <= 600;
      setIsSmallScreen(isSmall);
      setIsSidebarVisible(!isSmall); 
    };

    checkScreenSize(); 
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    if (!isSidebarVisible) {
      
      setIsSidebarVisible(true);
    } else {
      
      let clickTimer;
      if (clickTimer) {
        clearTimeout(clickTimer);
        setIsSidebarVisible(false); 
      } else {
        clickTimer = setTimeout(() => {
          clickTimer = null;
        }, 300); 
      }
    }
  };

  return (
    <>
      {isSidebarVisible && <Sidebar />}
      <Main isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />
    </>
  );
};

export default App;
