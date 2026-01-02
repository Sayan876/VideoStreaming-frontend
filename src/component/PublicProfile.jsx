import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

const PublicProfile = () => {
  const { abc } = useParams();
  const [user, setUser] = useState({});
  const [vids, setVids] = useState([]);
  const videoRefs = useRef([]);

  useEffect(() => {
    axios
      .get(`https://backendspring-videostreaming.onrender.com/api/user/${abc}`)
      .then(resp => setUser(resp.data))
      .catch(err => console.log(err));
  }, [abc]);

  useEffect(() => {
    axios
      .get(`https://backendspring-videostreaming.onrender.com/api/v4/videos/byUserId/${abc}`)
      .then(resp => setVids(resp.data))
      .catch(err => console.log(err));
  }, [abc]);

  const handlePlay = (index) => {
    videoRefs.current.forEach((vid, i) => {
      if (vid && i !== index) vid.pause();
    });
  };

  return (
    <div style={styles.page}>
      {/* Profile */}
      <div style={styles.profileCard}>
        <div style={styles.profileImageWrapper}>
          {user.profilePicUrl ? (
            <img
              src={user.profilePicUrl}
              alt="profile"
              style={styles.profileImage}
            />
          ) : (
            <div style={styles.profileFallback}>
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
        </div>

        <h2 style={styles.userName}>{user.name}</h2>
        <p style={styles.text}>{user.email}</p>
        <p style={styles.text}>Country: {user.country}</p>
        <p style={styles.bio}>{user.biodetails}</p>
        <p style={styles.since}>
          Member since:{' '}
          {user.accountCreatedAt
            ? new Date(user.accountCreatedAt).toLocaleDateString()
            : '-'}
        </p>
      </div>

      {/* Videos */}
      <div style={styles.videosContainer}>
        {vids.map((vid, index) => (
          <div key={vid.videoId} style={styles.videoCard}>
            <video
              controls
              ref={el => (videoRefs.current[index] = el)}
              onPlay={() => handlePlay(index)}
              style={styles.videoPlayer}
            >
              <source src={vid.videoUrl} />
            </video>

            <h3 style={styles.videoTitle}>{vid.title}</h3>
            <p style={styles.videoDesc}>{vid.description}</p>
            <p style={styles.uploadedAt}>
              Uploaded: {new Date(vid.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1.5rem',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
  },

  profileCard: {
    background: 'linear-gradient(145deg, #1e1e1e, #2a2a2a)',
    borderRadius: '20px',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
    marginBottom: '3rem',
    maxWidth: '400px',
    width: '100%'
  },

  profileImageWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem'
  },

  profileImage: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    border: '4px solid #f39c12',
    objectFit: 'cover'
  },

  profileFallback: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    border: '4px solid #f39c12',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#f39c12',
    background: '#555'
  },

  userName: {
    color: '#f39c12',
    margin: '0.5rem 0'
  },

  text: {
    color: '#ccc',
    margin: '0.2rem 0'
  },

  bio: {
    color: '#aaa',
    margin: '0.6rem 0'
  },

  since: {
    color: '#888',
    fontSize: '0.85rem'
  },

  videosContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    width: '100%',
    maxWidth: '1200px'
  },

  videoCard: {
    background: '#222',
    borderRadius: '15px',
    padding: '1rem',
    boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
  },

  videoPlayer: {
    width: '100%',
    borderRadius: '12px',
    marginBottom: '0.8rem'
  },

  videoTitle: {
    color: '#f39c12'
  },

  videoDesc: {
    color: '#ccc'
  },

  uploadedAt: {
    fontSize: '0.8rem',
    color: '#aaa'
  }
};

export default PublicProfile;
        
