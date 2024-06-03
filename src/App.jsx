import "./App.css";
import Navbar from "./components/Navbar";
import PageNotFound from "./pages/404/PageNotFound";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import LoginRegister from "./components/LoginRegister/LoginRegister";
import WelcomePage from "./components/Welcome";
import InstructorComp from "./components/InstructorComp";
import AdminAccess from "./components/AdminAccess";
import Dashboard from "./components/Dashboard";
import DeleteBatch from "./components/DeleteBatch";
import StudentActivity from "./components/StudentActivity";
import Books from "./components/Books";
import Profile from "./components/Profile";

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const myArmyId = localStorage.getItem("user");

  const apiUrl = "http://127.0.0.1:5000";

  useEffect(() => {
    const isUser = localStorage.getItem("user");
    const isAdmin = localStorage.getItem("admin");

    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");

    if (isUser || isAdmin) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    if (!hasSeenWelcome) {
      setShowWelcome(true);
    } else setShowWelcome(false);
  }, [isLoggedIn]);
  const handleDismissWelcome = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setShowWelcome(false);
  };

  return (
    <>
      {showWelcome ? (
        <WelcomePage onDismiss={handleDismissWelcome} />
      ) : (
        <Router>
          {isLoggedIn ? <Navbar /> : <></>}
          <Routes>
            {isLoggedIn ? (
              <>
                <Route path="/" element={<Profile apiUrl={apiUrl} myArmyId={myArmyId} />} />

      
                <Route path="/" element={<AdminAccess />}>
                  <Route
                    path="/upload"
                    element={<InstructorComp apiUrl={apiUrl} />}
                  />
                  <Route
                    path="/dashboard"
                    element={<Dashboard apiUrl={apiUrl} />}
                  />
                  <Route
                    path="/manage"
                    element={<DeleteBatch apiUrl={apiUrl} />}
                  />
                </Route>
                <Route
                  path="/student-activity"
                  element={
                    <StudentActivity myArmyId={myArmyId} apiUrl={apiUrl} />
                  }
                />
                <Route path="/notes" element={<Books apiUrl={apiUrl} />} />

                <Route path="*" element={<PageNotFound />} />
              </>
            ) : (
              <>
                <Route path="*" element={<LoginRegister apiUrl={apiUrl} />} />
              </>
            )}
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;
