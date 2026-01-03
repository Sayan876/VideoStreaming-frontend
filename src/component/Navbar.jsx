import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./navbar.module.css";

const Navbar = () => {
  const [title, setTitle] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  /* =========================
     FETCH LOGGED-IN USER
  ========================= */
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userId = localStorage.getItem("userId");

    if (isLoggedIn && userId) {
      axios
        .get(`http://localhost:8080/api/user/${userId}`)
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.clear();
          setUser(null);
        });
    }
  }, []);

  /* =========================
     HANDLERS
  ========================= */
  const handleSearch = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    navigate(`/SearchList/${title}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/Login");
  };

  /* =========================
     JSX
  ========================= */
  return (
    <nav className={styles.navbar}>
      {/* LEFT : LOGO */}
      <div className={styles.leftSection}>
        <h2 className={styles.logo}>MyStream</h2>
      </div>

      {/* CENTER : SEARCH */}
      <form className={styles.searchContainer} onSubmit={handleSearch}>
        <input
          className={styles.searchBar}
          type="text"
          placeholder="Search title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className={styles.searchButton}>Search</button>
      </form>

      {/* RIGHT : NAV / USER */}
      <div className={styles.rightSection}>
        <Link to="/ListOfVideos" className={styles.navLink}>
          Home
        </Link>

        {user ? (
          <div className={styles.userMenu}>
            <div className={styles.profileArea}>
              {/* PROFILE IMAGE / FALLBACK */}
              {user.profilePicUrl ? (
                <img
                  src={user.profilePicUrl}
                  alt={user.name}
                  className={styles.profilePic}
                />
              ) : (
                <div
                  className={styles.profilePic}
                  style={{
                    background: "#b91c1c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}

              {/* USER NAME */}
              <span className={styles.username}>{user.name}</span>

              {/* DROPDOWN */}
              <div>
                <button className={styles.dropdownBtn}>▼</button>

                <div className={styles.dropdownContent}>
                  <Link to={`/Userdetials/${user.id}`}>Profile</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Link to="/Login" className={styles.navLink}>
              Login
            </Link>
            <Link to="/SignUp" className={styles.signUpBtn}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
