import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./SearchList.module.css"; // Your dark red YouTube-style CSS

const SearchList = () => {
  const obj = useParams();
  const [videos, setVideos] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const videoRefs = useRef([]);

  let navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`https://backendspring-videostreaming.onrender.com/api/v4/videos/searchByTitle/${obj.xyz}`)
      .then(async (resp) => {
        const videosData = resp.data;
        setVideos(videosData);

        const userPromises = videosData.map((vid) =>
          axios
            .get(`https://backendspring-videostreaming.onrender.com/api/v4/videos/getUserByVideo/${vid.videoId}`)
            .then((res) => ({ videoId: vid.videoId, user: res.data }))
            .catch(() => ({ videoId: vid.videoId, user: null }))
        );

        const results = await Promise.all(userPromises);
        const userMap = {};
        results.forEach(({ videoId, user }) => {
          userMap[videoId] = user;
        });
        setUserDetails(userMap);
      })
      .catch((err) => console.error("Error fetching videos:", err));
  }, [obj.xyz]);

  const handlePlay = (index) => {
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) video.pause();
    });
  };

  const handleGotoThePage = (userId) => {
    navigate(`/PublicProfile/${userId}`);
  };

  return (
    <div>
      <h1 className={styles.searchResult}>Search Results: {videos.length}</h1>
      <div className={styles.container}>
        {videos.map((vid, index) => {
          const uploader = userDetails[vid.videoId];
          return (
            <div key={vid.videoId} className={styles.card}>
              <div className={styles.videoWrapper}>
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  className={styles.video}
                  controls
                  onPlay={() => handlePlay(index)}
                >
                  <source src={`${vid.videoUrl}`} type="video/mp4" />
                </video>
              </div>

              <div
                className={styles.details}
                onClick={() => uploader && handleGotoThePage(uploader.id)}
              >
                {/* Profile Image with Fallback */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {uploader?.profilePicUrl ? (
                    <img
                      src={uploader.profilePicUrl}
                      alt={uploader.username || uploader.name || "User"}
                      className={styles.profilePic}
                    />
                  ) : (
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "50%",
                        background: "#555",
                        color: "#b91c1c",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        border: "2px solid #b91c1c",
                      }}
                    >
                      {uploader?.username
                        ? uploader.username.charAt(0).toUpperCase()
                        : uploader?.name
                        ? uploader.name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                  )}
                </div>

                <div className={styles.textContent}>
                  <h3 className={styles.title}>{vid.title}</h3>
                  <p className={styles.username}>
                    {uploader
                      ? uploader.username || uploader.name || "Unknown User"
                      : "Fetching uploader..."}
                  </p>
                  <p className={styles.date}>
                    {new Date(vid.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchList;
