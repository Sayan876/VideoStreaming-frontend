import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import {
  Clock3,
  Play,
  RefreshCw,
  UserRound,
  Video,
} from "lucide-react";

interface User {
  name: string;
  oneName: string;
  profilePicUrl?: string | null;
}

interface VideoItem {
  videoId: number;
  title: string;
  videoUrl: string;
  uploadedAt: string;
  user: User;
}

const API_URL =
  "https://perfect-petronille-deltatech-f6802774.koyeb.app";

const HomePage = () => {
  const navigate = useNavigate();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<VideoItem[]>(
          `${API_URL}/api/v4/videos/feed`,
          {
            signal: controller.signal,
          }
        );

        setVideos(response.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        console.error("Error fetching video feed:", error);
        setError("Unable to load videos right now.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchVideos();

    return () => {
      controller.abort();
    };
  }, []);

  /*
   * Pause every other video when one starts playing.
   */
  const handlePlay = (index: number) => {
    videoRefs.current.forEach((video, currentIndex) => {
      if (video && currentIndex !== index) {
        video.pause();
      }
    });
  };

  /*
   * Navigate to public profile.
   */
  const handleUserClick = (oneName: string) => {
    navigate(`/PublicProfile/${oneName}`);
  };

  /*
   * Navigate to video player.
   */
  const handleVideoClick = (videoId: number) => {
    navigate(`/Video-Player/${videoId}`);
  };

  /*
   * Format upload date.
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  /*
   * Generate relative upload time.
   */
  const getTimeAgo = (dateString: string) => {
    const now = Date.now();
    const past = new Date(dateString).getTime();

    const difference = now - past;

    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (minutes < 1) return "just now";

    if (minutes < 60) {
      return `${minutes}${minutes === 1 ? " min" : " mins"} ago`;
    }

    if (hours < 24) {
      return `${hours}${hours === 1 ? " hr" : " hrs"} ago`;
    }

    if (days < 7) {
      return `${days}${days === 1 ? " day" : " days"} ago`;
    }

    if (weeks < 4) {
      return `${weeks}${weeks === 1 ? " week" : " weeks"} ago`;
    }

    if (months < 12) {
      return `${months}${months === 1 ? " month" : " months"} ago`;
    }

    return `${years}${years === 1 ? " year" : " years"} ago`;
  };

  /*
   * Retry loading the feed.
   */
  const retry = () => {
    window.location.reload();
  };

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        text-slate-950
        transition-colors
        duration-300

        dark:bg-[#050505]
        dark:text-white
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1500px]
          px-4
          py-6
          sm:px-6
          lg:px-8
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <section className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {/* Feed badge */}

              <div
                className="
                  mb-3
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-slate-600
                  shadow-sm

                  dark:border-red-900/50
                  dark:bg-red-950/20
                  dark:text-red-400
                "
              >
                <Video className="h-3.5 w-3.5" />

                Video Feed
              </div>

              {/* Heading */}

              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  sm:text-3xl
                  lg:text-4xl

                  dark:text-white
                "
              >
                Explore Latest Videos
              </h1>

              {/* Description */}

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  text-slate-500
                  sm:text-base

                  dark:text-slate-400
                "
              >
                Discover the latest videos from the community.
              </p>
            </div>

            {/* Video count */}

            {!loading && !error && videos.length > 0 && (
              <div
                className="
                  hidden
                  items-center
                  gap-2
                  text-sm
                  text-slate-500
                  sm:flex

                  dark:text-slate-400
                "
              >
                <Video className="h-4 w-4 dark:text-red-500" />

                {videos.length}{" "}
                {videos.length === 1 ? "video" : "videos"}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            LOADING SKELETON
        ====================================================== */}

        {loading && (
          <div
            className="
              grid
              grid-cols-1
              gap-x-6
              gap-y-8
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <VideoSkeleton key={index} />
            ))}
          </div>
        )}

        {/* =====================================================
            ERROR STATE
        ====================================================== */}

        {!loading && error && (
          <div className="flex min-h-[450px] items-center justify-center">
            <div className="flex max-w-md flex-col items-center text-center">
              {/* Icon */}

              <div
                className="
                  mb-5
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-red-100
                  text-red-500

                  dark:bg-red-950/40
                  dark:text-red-500
                  dark:ring-1
                  dark:ring-red-900/50
                "
              >
                <Video className="h-7 w-7" />
              </div>

              <h2 className="text-lg font-semibold">
                Something went wrong
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {error}
              </p>

              <button
                type="button"
                onClick={retry}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-slate-900
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-slate-700

                  dark:bg-red-600
                  dark:text-white
                  dark:hover:bg-red-500
                  dark:shadow-[0_0_25px_rgba(220,38,38,0.25)]
                "
              >
                <RefreshCw className="h-4 w-4" />

                Try Again
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {!loading && !error && videos.length === 0 && (
          <div className="flex min-h-[450px] items-center justify-center">
            <div className="text-center">
              <div
                className="
                  mx-auto
                  mb-5
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-100
                  text-slate-400

                  dark:bg-red-950/20
                  dark:text-red-500
                  dark:ring-1
                  dark:ring-red-900/40
                "
              >
                <Video className="h-7 w-7" />
              </div>

              <h2 className="text-lg font-semibold">
                No videos yet
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Be the first person to upload a video.
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            VIDEO GRID
        ====================================================== */}

        {!loading && !error && videos.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              gap-x-6
              gap-y-9
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {videos.map((video, index) => (
              <article
                key={video.videoId}
                className="group min-w-0"
              >
                {/* =================================================
                    VIDEO CONTAINER
                ================================================== */}

                <div
                  className="
                    relative
                    aspect-video
                    cursor-pointer
                    overflow-hidden
                    rounded-2xl
                    bg-slate-200
                    shadow-sm
                    ring-1
                    ring-slate-200
                    transition-all
                    duration-300

                    group-hover:-translate-y-1
                    group-hover:shadow-xl

                    dark:bg-[#0b0b0b]
                    dark:ring-red-950/60
                    dark:group-hover:ring-red-600/50
                    dark:group-hover:shadow-[0_12px_45px_rgba(220,38,38,0.15)]
                  "
                  onClick={() =>
                    handleVideoClick(video.videoId)
                  }
                >
                  <video
                    ref={(element) => {
                      videoRefs.current[index] = element;
                    }}
                    onPlay={() => handlePlay(index)}
                    className="h-full w-full object-cover"
                    preload="metadata"
                    playsInline
                  >
                    <source src={video.videoUrl} />

                    Your browser does not support the video element.
                  </video>

                  {/* =================================================
                      HOVER OVERLAY
                  ================================================== */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                      bg-black/0
                      transition-all
                      duration-300

                      group-hover:bg-black/20
                      dark:group-hover:bg-red-950/10
                    "
                  >
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        scale-90
                        items-center
                        justify-center
                        rounded-full
                        bg-white/95
                        text-slate-900
                        opacity-0
                        shadow-xl
                        transition-all
                        duration-300

                        group-hover:scale-100
                        group-hover:opacity-100

                        dark:bg-red-600
                        dark:text-white
                        dark:shadow-[0_0_35px_rgba(220,38,38,0.45)]
                      "
                    >
                      <Play className="ml-0.5 h-5 w-5 fill-current" />
                    </div>
                  </div>

                  {/* =================================================
                      TIME BADGE
                  ================================================== */}

                  <div
                    className="
                      absolute
                      bottom-2.5
                      right-2.5
                      flex
                      items-center
                      gap-1
                      rounded-md
                      bg-black/75
                      px-2
                      py-1
                      text-[11px]
                      font-medium
                      text-white
                      backdrop-blur-sm

                      dark:bg-black/90
                      dark:text-red-100
                      dark:ring-1
                      dark:ring-red-900/50
                    "
                  >
                    <Clock3 className="h-3 w-3 dark:text-red-500" />

                    {getTimeAgo(video.uploadedAt)}
                  </div>
                </div>

                {/* =================================================
                    VIDEO INFORMATION
                ================================================== */}

                <div className="mt-3 flex gap-3">
                  {/* =================================================
                      AVATAR
                  ================================================== */}

                  <button
                    type="button"
                    onClick={() =>
                      handleUserClick(video.user.oneName)
                    }
                    className="shrink-0"
                    aria-label={`View ${video.user.name}'s profile`}
                  >
                    {video.user.profilePicUrl ? (
                      <img
                        src={video.user.profilePicUrl}
                        alt={`${video.user.name} profile`}
                        loading="lazy"
                        className="
                          h-10
                          w-10
                          rounded-full
                          object-cover
                          ring-2
                          ring-transparent
                          transition-all
                          duration-300

                          group-hover:ring-slate-200

                          dark:group-hover:ring-red-600/50
                          dark:group-hover:shadow-[0_0_15px_rgba(220,38,38,0.25)]
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-full
                          bg-slate-200
                          text-sm
                          font-bold
                          text-slate-600

                          dark:bg-red-950/40
                          dark:text-red-400
                          dark:ring-1
                          dark:ring-red-900/60
                        "
                      >
                        {video.user.name ? (
                          video.user.name
                            .charAt(0)
                            .toUpperCase()
                        ) : (
                          <UserRound className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* =================================================
                      TEXT
                  ================================================== */}

                  <div className="min-w-0 flex-1">
                    {/* Title */}

                    <button
                      type="button"
                      onClick={() =>
                        handleVideoClick(video.videoId)
                      }
                      className="block w-full text-left"
                    >
                      <h2
                        className="
                          line-clamp-2
                          text-sm
                          font-semibold
                          leading-5
                          text-slate-900
                          transition-colors
                          duration-200

                          group-hover:text-red-600

                          dark:text-white
                          dark:group-hover:text-red-500
                        "
                      >
                        {video.title}
                      </h2>
                    </button>

                    {/* Username */}

                    <button
                      type="button"
                      onClick={() =>
                        handleUserClick(video.user.oneName)
                      }
                      className="
                        mt-1
                        block
                        text-left
                        text-xs
                        font-medium
                        text-slate-500
                        transition-colors

                        hover:text-slate-900

                        dark:text-slate-400
                        dark:hover:text-red-400
                      "
                    >
                      {video.user.name || "Unknown user"}
                    </button>

                    {/* Date */}

                    <p
                      className="
                        mt-1
                        truncate
                        text-[11px]
                        text-slate-400

                        dark:text-slate-500
                      "
                      title={formatDate(video.uploadedAt)}
                    >
                      {formatDate(video.uploadedAt)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

/* =========================================================
   VIDEO SKELETON
========================================================= */

const VideoSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Video skeleton */}

      <div
        className="
          aspect-video
          overflow-hidden
          rounded-2xl
          bg-slate-200

          dark:bg-[#0b0b0b]
          dark:ring-1
          dark:ring-red-950/40
        "
      >
        <div
          className="
            h-full
            w-full
            bg-gradient-to-r
            from-slate-200
            via-slate-100
            to-slate-200

            dark:from-[#0b0b0b]
            dark:via-[#171717]
            dark:to-[#0b0b0b]
          "
        />
      </div>

      {/* Details skeleton */}

      <div className="mt-3 flex gap-3">
        {/* Avatar */}

        <div
          className="
            h-10
            w-10
            shrink-0
            rounded-full
            bg-slate-200

            dark:bg-red-950/30
          "
        />

        {/* Text */}

        <div className="min-w-0 flex-1 space-y-2">
          <div
            className="
              h-4
              w-11/12
              rounded-md
              bg-slate-200

              dark:bg-[#171717]
            "
          />

          <div
            className="
              h-4
              w-7/12
              rounded-md
              bg-slate-200

              dark:bg-[#171717]
            "
          />

          <div
            className="
              h-3
              w-5/12
              rounded-md
              bg-slate-200

              dark:bg-red-950/30
            "
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;