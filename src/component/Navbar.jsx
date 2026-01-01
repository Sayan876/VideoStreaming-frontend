import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import style from "./vids.module.css";

const Navbar = () => {
  const [title, setTitle] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userId = localStorage.getItem("userId");

    if (isLoggedIn && userId) {
      axios.get(`http://localhost:8080/api/user/${userId}`)
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userId");
          setUser(null);
        });
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/SearchList/${title}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/Login");
  };

  return (
    <nav className={style.navbar}>
      <div className={style.leftSection}>
        <h2 className={style.logo}>MyStream</h2>
      </div>

      <form className={style.searchContainer} onSubmit={handleSearch}>
        <input
          className={style.searchBar}
          type="text"
          placeholder="Search title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className={style.searchButton}>Search</button>
      </form>

      <div className={style.rightSection}>
        <Link to="/ListOfVideos" className={style.navLink}>Home</Link>

        {user ? (
          <div className={style.userMenu}>
  <div className={style.profileArea}>
    {/* Profile Image with Fallback */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {user?.profilePicUrl ? (
        <img
          src={user.profilePicUrl}
          alt={user.name || "User"}
          className={style.profilePic}
        />
      ) : (
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#ff0000ff",
            color: "#000000ff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: "0.9rem",
            border: "2px solid #b71c1cff",
            cursor: "pointer",
            transition: "transform 0.3s ease",
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
        </div>
      )}
    </div>

    <span className={style.username}>{user?.name}</span>

    <div className={style.dropdown}>
      <button className={style.dropdownBtn}>▼</button>
      <div className={style.dropdownContent}>
        <Link to={`/Userdetials/${user.id}`}>Profile</Link>
        <button onClick={handleLogout} className={style.logoutBtn}>
          Logout
        </button>
      </div>
    </div>
  </div>
</div>

        ) : (
          <>
            <Link to="/Login" className={style.navLink}>Login</Link>
            <Link to="/SignUp" className={style.signUpBtn}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
