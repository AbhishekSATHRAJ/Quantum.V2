import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Main from "./components/Main/Main";
import home from "./assets/home-page.png";
import lock from "./assets/lock.png";

const App = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(
    window.innerWidth > 600
  );
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 600);
  const [menuIcon, setMenuIcon] = useState(home);
  let clickTimer = null;

  useEffect(() => {
    const checkScreenSize = () => {
      const isSmall = window.innerWidth <= 600;
      setIsSmallScreen(isSmall);
      setIsSidebarVisible(!isSmall); 
      setMenuIcon(home);
    };

    checkScreenSize(); 
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      setIsSidebarVisible(false);
      setMenuIcon(home);
    }else {
      clickTimer = setTimeout(() => {
        clickTimer = null;
        setIsSidebarVisible((prev) => !prev);
        setMenuIcon((prevIcon) =>
          prevIcon === home ? lock : home
        );
      }, 300);
       
      }
    }
  

  return (
    <>
      {isSidebarVisible && <Sidebar />}
      <Main isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} menuIcon={menuIcon} />
    </>
  );
};

export default App;
