import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdManageAccounts } from "react-icons/md";
import { Modal, message } from "antd";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const key = "updatable";
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    const userL = localStorage.getItem("user");
    const adminL = localStorage.getItem("admin");

    if (userL != null || adminL != null) {
      setIsLoggedIn(true);
    }
    if (userL) {
      setUserLoggedIn(true);
      // console.log(userL)
    } else if (adminL) {
      setAdminLoggedIn(true);
      // console.log(adminL)
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    const userInLocalStorage = localStorage.getItem("user");
    const adminInLocalStorage = localStorage.getItem("admin");

    // Do not perform logout if not logged in
    if (!userInLocalStorage && !adminInLocalStorage) {
      return;
    }

    // Show a confirmation modal
    Modal.confirm({
      title: "Logout Confirmation",
      content: "Are you sure you want to logout?",

      onOk: () => {
        message.open({
          key,
          type: "info",
          content: "Logging out...",
        });
        setTimeout(() => {
          // Clear the user or admin from localStorage on logout
          localStorage.removeItem(userInLocalStorage ? "user" : "admin");

          // Update the login status to reflect the logout
          if (userInLocalStorage) {
            setUserLoggedIn(false);
            localStorage.removeItem("hasSeenWelcome");
          } else if (adminInLocalStorage) {
            setAdminLoggedIn(false);
          }
          message.open({
            key,
            type: "success",
            content: "Logout successful",
            duration: 2,
          });
        }, 500);

        navigate("/");

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      onCancel: () => {
        // Handle cancel if needed
      },
    });
  };

  const handleDashboardClick = () => {
    const userInLocalStorage = localStorage.getItem("user");
    const adminInLocalStorage = localStorage.getItem("admin");

    if (adminInLocalStorage) {
      navigate("/dashboard"); // Replace with your admin dashboard route
    } else if (userInLocalStorage) {
      navigate("/student-activity"); // Replace with your user/student activity route
    }
  };

  return (
    <nav>
      <div className="logo">
        {/* <h3 className="headers">PaintingSimulator</h3> */}
        <img src="pain_sim_icon.png" alt="" />
      </div>

      <div className={show ? "navLinks showmenu" : "navLinks"}>
        <div className="links">
          {adminLoggedIn ? (
            <>
              <Link to="/">HOME</Link>
              <Link to="/dashboard">
                <span onClick={handleDashboardClick}>DASHBOARD</span>
              </Link>
              <Link to="/upload">UPLOAD</Link>
              <Link to="/manage">MANAGE</Link>
            </>
          ) : (
            <>
              <Link to="/">HOME</Link>
              <Link to="/student-activity">ACTIVITY</Link>
              <Link to="/notes">NOTES</Link>
            </>
          )}
        </div>
      </div>
      <div className="logoutIcon">
        {/* <MdManageAccounts  style={{ filter:'invert()', cursor:'pointer'}}  onClick={handleLogout}/> */}
        <img src="logout_icon.png" style={{}} onClick={handleLogout} alt="logout" className="" />
      </div>

      <div className="hamburger" onClick={() => setShow(!show)}>
        <GiHamburgerMenu />
      </div>
    </nav>
  );
};

export default Navbar;
