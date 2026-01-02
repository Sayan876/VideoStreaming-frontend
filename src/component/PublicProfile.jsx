import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

const PublicProfile = () => {
  const { abc } = useParams();
  const [user, setUser] = useState({});
  const [vids, setVids] = useState([]);
  const videoRefs = useRef([]);

  // Fetch user data
  useEffect(() => {
    axios.get(`https://backendspring-videostreaming.onrender.com/api/user/${abc}`)
      .then(resp => setUser(resp.data))
      .catch(err => console.log(err));
  }, [abc]);

  // Fetch videos
  useEffect(() => {
    axios.get(`https://backendspring-videostreaming.onrender.com/api/v4/videos/byUserId/${abc}`)
      .then(resp => setVids(resp.data))
      .catch(err => console.log(err));
  }, [abc]);

  // Handle playing only one video at a time
  const handlePlay = (index) => {
    videoRefs.current.forEach((vid, i) => {
      if (vid && i !== index) vid.pause();
    });
  };

  return (
    <div style={styles.page}>
      {/* ---------- User Info ---------- */}
      <div style={styles.profileCard}>
  {/* Profile Picture with Centering and Fallback */}
  <div style={styles.profileImageWrapper}>
    {user.profilePicUrl ? (
      <img
        src={user.profilePicUrl}
        alt={user.name || "Profile"}
        style={styles.profileImage}
      />
    ) : (
      <div style={styles.profileFallback}>
        {user.name ? user.name.charAt(0).toUpperCase() : "?"}
      </div>
    )}
  </div>

  <h2 style={styles.userName}>{user.name}</h2>
  <p style={styles.userEmail}>{user.email}</p>
  <p style={styles.userCountry}>🌐 {user.country}</p>
  <p style={styles.userBio}>{user.biodetails}</p>
  <p style={styles.userSince}>
    Member since: {user.accountCreatedAt ? new Date(user.accountCreatedAt).toLocaleDateString() : "-"}
  </p>
</div>

      {/* ---------- Videos ---------- */}
      <div style={styles.videosContainer}>
        {vids.map((vid, index) => (
          <div key={vid.videoId} style={styles.videoCard}>
            <video
              width="100%"
              controls
              ref={el => videoRefs.current[index] = el}
              onPlay={() => handlePlay(index)}
              style={styles.videoPlayer}
            >
              <source src={`${vid.videoUrl}`} />
            </video>
            <div style={styles.videoInfo}>
              <h3 style={styles.videoTitle}>{vid.title}</h3>
              <p style={styles.videoDesc}>{vid.description}</p>
              <p style={styles.uploadedAt}>Uploaded: {new Date(vid.uploadedAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Styles ----------
/* ===== Page Layout ===== */
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f0f, #1a1a1a);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-sizing: border-box;
}

/* ===== Profile Card ===== */
.profile-card {
  background: linear-gradient(145deg, #1e1e1e, #2a2a2a);
  border-radius: 20px;
  padding: 2.2rem;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8);
  margin-bottom: 3rem;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

/* ===== Profile Image ===== */
.profile-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}

.profile-image {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid #f39c12;
  object-fit: cover;
  box-shadow: 0 0 20px rgba(243, 156, 18, 0.7);
}

/* ===== Profile Fallback ===== */
.profile-fallback {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid #f39c12;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #555;
  color: #f39c12;
  font-size: 3rem;
  font-weight: bold;
  box-shadow: 0 0 20px rgba(243, 156, 18, 0.7);
}

/* ===== Profile Text ===== */
.user-name {
  font-size: 1.8rem;
  color: #f39c12;
  margin: 0.5rem 0;
}

.user-email,
.user-country {
  color: #ccc;
  margin: 0.2rem 0;
}

.user-bio {
  color: #aaa;
  margin: 0.6rem 0;
}

.user-since {
  color: #888;
  font-size: 0.85rem;
  margin-top: 0.6rem;
}

/* ===== Videos Grid ===== */
.videos-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  box-sizing: border-box;
}

/* ===== Video Card ===== */
.video-card {
  background: #222;
  border-radius: 15px;
  padding: 1rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7);
}

/* ===== Video Player ===== */
.video-player {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 0.8rem;
}

/* ===== Video Info ===== */
.video-info {
  padding: 0 0.5rem;
}

.video-title {
  font-size: 1.2rem;
  color: #f39c12;
  margin-bottom: 0.3rem;
}

.video-desc {
  font-size: 0.95rem;
  color: #ccc;
  margin-bottom: 0.3rem;
}

.uploaded-at {
  font-size: 0.8rem;
  color: #aaa;
}

/* ===== Mobile Tweaks ===== */
@media (max-width: 480px) {
  .page {
    padding: 1rem;
  }

  .profile-card {
    padding: 1.6rem;
  }

  .user-name {
    font-size: 1.6rem;
  }

  .video-title {
    font-size: 1.1rem;
  }
}

export default PublicProfile;
