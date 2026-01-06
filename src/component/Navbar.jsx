import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./navbar.module.css";

const Navbar = () => {
  const [title, setTitle] = useState("");
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setTitle("");
    setMenuOpen(false);
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
      {/* LEFT */}
      <Link to="/ListOfVideos" className={styles.logo}>
        MyStream
      </Link>

      {/* SEARCH (DESKTOP ONLY) */}
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

      {/* RIGHT */}
      <div className={styles.rightSection}>
        {/* HAMBURGER */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* MENU */}
        <div className={`${styles.menu} ${menuOpen ? styles.open : ""}`}>
          <Link to="/ListOfVideos" className={styles.navLink}>
            Home
          </Link>

          {!user ? (
            <>
              <Link to="/Login" className={styles.navLink}>
                Login
              </Link>
              <Link to="/SignUp" className={styles.signUpBtn}>
                Sign Up
              </Link>
            </>
          ) : (
            <div className={styles.profileArea}>
              {user.profilePicUrl ? (
                <img
                  src={user.profilePicUrl}
                  alt={user.name}
                  className={styles.profilePic}
                />
              ) : (
                <div className={styles.fallbackPic}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}

              <span className={styles.username}>{user.name}</span>

              <button
                className={styles.dropdownBtn}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                ▼
              </button>

              {dropdownOpen && (
                <div className={styles.dropdownContent}>
                  <Link to={`/Userdetials/${user.id}`}>Profile</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
