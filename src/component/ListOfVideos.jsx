import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import style from "./vids.module.css";

const ListOfVideos = () => {
  const [videos, setVideos] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const videoRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideosAndUsers = async () => {
      try {
        const videoResponse = await axios.get("https://backendspring-videostreaming.onrender.com/api/v4/videos");
        const videoList = videoResponse.data;
        setVideos(videoList);

        const userDataPromises = videoList.map(async (vid) => {
          try {
            const userIdResp = await axios.get(
              `https://backendspring-videostreaming.onrender.com/api/v4/videos/getUserIdByVideoId/${vid.videoId}`
            );
            const userId = userIdResp.data;

            const userResp = await axios.get(`https://backendspring-videostreaming.onrender.com/api/user/${userId}`);

const userName = userResp.data.name || "Unknown User";
const profilePicUrl = userResp.data.profilePicUrl || "";

return { videoId: vid.videoId, userId, userName, profilePicUrl };

          } catch (err) {
            console.error("Error fetching user for video:", vid.videoId);
            return { videoId: vid.videoId, userId: "N/A", userName: "Unknown", userImage: null };
          }
        });

        const userResults = await Promise.all(userDataPromises);

        const userMap = {};
        userResults.forEach(({ videoId, userId, userName, profilePicUrl }) => {
  userMap[videoId] = { userId, userName, profilePicUrl };
});


        setUserDetails(userMap);
      } catch (err) {
        console.error("Error fetching videos:", err);
      }
    };

    fetchVideosAndUsers();
  }, []);

  const handlePlay = (index) => {
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) video.pause();
    });
  };

  // ✅ Navigate to user's public profile
  const handleUserClick = (userId) => {
    navigate(`/PublicProfile/${userId}`);
  };

  return (
    <div className={style.pageContainer}>
      <h1 className={style.header}>🎬 Explore Latest Videos here</h1>
      <div className={style.videoGrid}>
        {videos.map((vid, index) => (
          <div key={vid.videoId} className={style.videoCard}>
            <div className={style.videoWrapper}>
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                onPlay={() => handlePlay(index)}
                controls
                className={style.videoPlayer}
              >
                <source src={`${vid.videoUrl}`} />
              </video>
            </div>

            <div className={style.videoInfo}>
              <div
                className={style.userSection}
                onClick={() => handleUserClick(userDetails[vid.videoId]?.userId)}
                style={{ cursor: "pointer" }}
              >
                <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}}>
  {userDetails[vid.videoId]?.profilePicUrl ? (
    <img
      src={userDetails[vid.videoId]?.profilePicUrl}
      alt={`${userDetails[vid.videoId]?.userName || "User"} profile`}
      className={style.userImage}
    />
  ) : (
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: '#555',
      color: '#ff4444',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 'bold',
      fontSize: '1rem',
      border: '2px solid #ff4444',
    }}>
      {userDetails[vid.videoId]?.userName ? userDetails[vid.videoId].userName.charAt(0).toUpperCase() : "?"}
    </div>
  )}
</div>
                <div>
                  <p className={style.userName}>{userDetails[vid.videoId]?.userName || "Loading..."}</p>
                  <p className={style.videoTitle}>{vid.title}</p>
                </div>
              </div>

              <p className={style.videoDescription}>{vid.description}</p>
              <p className={style.uploadedAt}>Uploaded: {new Date(vid.uploadedAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListOfVideos;
