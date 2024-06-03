import React, { useState } from "react";
import "./LRstyle.css";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import Sparkles from 'react-sparkle';

const LoginRegister = ({apiUrl}) => {
  const [isActive, setIsActive] = useState(false);
  const [myArmyId, setMyArmyId] = useState("");

  const [loginArmyId, setLoginArmyId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerBatchNo, setRegisterBatchNo] = useState("");
  const [registerMyArmyId, setRegisterMyArmyId] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const navigate = useNavigate();
  const key = "updatable";

  const handleRegisterClick = () => {
    setIsActive(true);
  };

  const handleLoginClick = () => {
    setIsActive(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      message.open({
        key,
        type: "info",
        content: "Logging in...",
        // duration:3,
      });
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          myArmyId: loginArmyId,
          myPassword: loginPassword,

        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTimeout(() => {
        if (data.message === "Login successful") {
          console.log("Success");
          message.open({
            key,
            type: "success",
            content: "Login successful",
            duration: 2,
          });

          if (loginArmyId === "admin") {
            localStorage.setItem("admin", loginArmyId);
            navigate("/dashboard", { replace: true }); // Navigate to Dashboard
          } else {
            localStorage.setItem("user", loginArmyId);
            navigate("/student-activity", { replace: true }); // Navigate to StudentActivity
          }
          setTimeout(() => {
            window.location.reload();
          }, 1800);

          // Perform any additional actions on successful login
        } else {
          message.open({
            key,
            type: "error",
            content: "Login Failed: Enter valid credentials",
            duration: 2,
          });
        }
      }, 500);
    } catch (error) {
      message.open({
        key,
        type: "error",
        content: "Login Failed: Enter valid credentials",
        duration: 2,
      });
    }
  };
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      message.open({
        key,
        type: "info",
        content: "Registering...",
      });
      const response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          myName : registerName,
          myArmyId: registerMyArmyId,
          myBatchNo:registerBatchNo,
          mySetPassword: registerPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTimeout(() => {
        if (data.message === "Registration successful") {
          console.log("Success");
          message.open({
            key,
            type: "success",
            content: "Registration successful",
            duration: 2,
          });
          // localStorage.setItem("user", loginArmyId);
          navigate("/login", {replace : 'true'});
          setTimeout(() => {
            window.location.reload();
          }, 1800);

          // Perform any additional actions on successful login
        }else if(data.message === "Army ID already exists"){
          message.open({
            key,
            type: "warning",
            content: "Already registered with this Army ID.",
            duration: 2,
          });
        } else {
          message.open({
            key,
            type: "error",
            content: "Registration Failed",
            duration: 2,
          });
        }
      }, 500);
    } catch (error) {
      message.open({
        key,
        type: "error",
        content: "Login Failed: Enter valid credentials",
        duration: 2,
      });
    }
  };

  return (
    <div className="LRbody">
      <div
        className={`LRcontainer ${isActive ? "active" : ""}`}
        id="LRcontainer"
      >
        <div className="form-container sign-up">
          <form onSubmit={handleRegisterSubmit}>
            <h1>Create Account</h1>
            <span>use your email for registration</span>
            <input
              type="text"
              placeholder="Name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Army ID"
              value={registerMyArmyId}
              onChange={(e) => setRegisterMyArmyId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Batch"
              value={registerBatchNo}
              onChange={(e) => setRegisterBatchNo(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
            <button type="submit">Sign Up</button>
          </form>
        </div>
        <div className="form-container sign-in">
          <form onSubmit={handleLoginSubmit}>
            <h1>Sign In</h1>
            <span>use your Army ID for login</span>
            <input
              type="text"
              placeholder="Army ID"
              value={loginArmyId}
              onChange={(e) => setLoginArmyId(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            {/* <a href="#">Forget Your Password?</a> */}
            <button type="submit">Sign In</button>
          </form>
        </div>
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use Painting Simulator</p>
              <button className="hidden" onClick={handleLoginClick} id="login">
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, User!</h1>
              <p>
                Register with your personal details to use Painting Simulator
              </p>
              <button
                className="hidden"
                onClick={handleRegisterClick}
                id="register"
              >
                Sign Up
              </button>
            </div>
          </div>
          <Sparkles count={15}
                // minSize={7}
                // maxSize={12}
                // overflowPx={80}
                fadeOutSpeed={30}
                flicker={false}/>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
