import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import videojs from "video.js";

import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
import "videojs-hls-quality-selector";

import {
  ChevronDown,
  ChevronUp,
  Clock3,
  Play,
  UserRound,
  Video as VideoIcon,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

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
  description?: string | null;
  category?: string | null;
  user: User;
}

/*
 * We don't import VideoJsPlayer from video.js because
 * some Video.js versions don't expose that type correctly.
 *
 * This local type only describes the plugin method we use.
 */
type VideoPlayerInstance = ReturnType<typeof videojs> & {
  hlsQualitySelector?: (options?: {
    displayCurrentQuality?: boolean;
  }) => void;
};

/* ============================================================
   API
============================================================ */

const API_URL =
  "https://perfect-petronille-deltatech-f6802774.koyeb.app";

/* ============================================================
   COMPONENT
============================================================ */

const VideoPlayer = () => {
  const { xyz } = useParams<{ xyz: string }>();
  const navigate = useNavigate();

  const [video, setVideo] = useState<VideoItem | null>(null);
  const [recVideos, setRecVideos] = useState<VideoItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] =
    useState(false);

  const [error, setError] = useState<string | null>(null);
  const [openDesc, setOpenDesc] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const playerRef = useRef<VideoPlayerInstance | null>(null);

  /* ============================================================
     FETCH VIDEO
  ============================================================ */

  useEffect(() => {
    if (!xyz) {
      setError("Video ID is missing.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<VideoItem>(
          `${API_URL}/api/v4/videos/byVideoId/${xyz}`,
          {
            signal: controller.signal,
          }
        );

        setVideo(response.data);
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }

        console.error("Error fetching video:", err);

        setError("Unable to load this video.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchVideo();

    return () => {
      controller.abort();
    };
  }, [xyz]);

  /* ============================================================
     FETCH RECOMMENDED VIDEOS
  ============================================================ */

  useEffect(() => {
    if (!video?.category) {
      setRecVideos([]);
      return;
    }

    const controller = new AbortController();

    const fetchRecommendedVideos = async () => {
      try {
        setRecommendationsLoading(true);

        const response = await axios.get<VideoItem[]>(
          `${API_URL}/api/v4/videos/category/${video.category}`,
          {
            signal: controller.signal,
          }
        );

        const filteredVideos = response.data.filter(
          (item) => item.videoId !== video.videoId
        );

        setRecVideos(filteredVideos);
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }

        console.error(
          "Error fetching recommended videos:",
          err
        );
      } finally {
        if (!controller.signal.aborted) {
          setRecommendationsLoading(false);
        }
      }
    };

    fetchRecommendedVideos();

    return () => {
      controller.abort();
    };
  }, [video]);

  /* ============================================================
     INITIALIZE VIDEO.JS
  ============================================================ */

  useEffect(() => {
    if (!video || !videoRef.current) {
      return;
    }

    /*
     * If Video.js is already initialized,
     * update its source.
     */
    if (playerRef.current) {
      playerRef.current.src({
        src: video.videoUrl,
        type: "video/mp4",
      });

      return;
    }

    /*
     * Create Video.js player.
     */
    const player = videojs(videoRef.current, {
      controls: true,
      responsive: true,
      fluid: true,

      playbackRates: [
        0.25,
        0.5,
        0.75,
        1,
        1.25,
        1.5,
        1.75,
        2,
      ],

      sources: [
        {
          src: video.videoUrl,
          type: "video/mp4",
        },
      ],

      controlBar: {
        pictureInPictureToggle: true,
        fullscreenToggle: true,
      },
    }) as VideoPlayerInstance;

    playerRef.current = player;

    /*
     * HLS quality selector.
     *
     * This won't hurt your current MP4 setup.
     * It becomes useful if your backend supplies .m3u8
     * streams with multiple quality levels.
     */
    if (typeof player.hlsQualitySelector === "function") {
      player.hlsQualitySelector({
        displayCurrentQuality: true,
      });
    }
  }, [video]);

  /* ============================================================
     DISPOSE VIDEO.JS
  ============================================================ */

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const goToProfile = (oneName: string) => {
    navigate(`/PublicProfile/${oneName}`);
  };

  const goToVideo = (videoId: number) => {
    navigate(`/Video-Player/${videoId}`);
  };

  /* ============================================================
     DATE FORMAT
  ============================================================ */

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

  /* ============================================================
     TIME AGO
  ============================================================ */

  const getTimeAgo = (dateString: string) => {
    const now = Date.now();
    const past = new Date(dateString).getTime();

    const difference = now - past;

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (minutes < 1) {
      return "just now";
    }

    if (minutes < 60) {
      return `${minutes}${
        minutes === 1 ? " min" : " mins"
      } ago`;
    }

    if (hours < 24) {
      return `${hours}${
        hours === 1 ? " hr" : " hrs"
      } ago`;
    }

    if (days < 7) {
      return `${days}${
        days === 1 ? " day" : " days"
      } ago`;
    }

    if (weeks < 4) {
      return `${weeks}${
        weeks === 1 ? " week" : " weeks"
      } ago`;
    }

    if (months < 12) {
      return `${months}${
        months === 1 ? " month" : " months"
      } ago`;
    }

    return `${years}${
      years === 1 ? " year" : " years"
    } ago`;
  };

  /* ============================================================
     ERROR
  ============================================================ */

  if (!loading && error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 transition-colors duration-300 dark:bg-[#050505] dark:text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center">
          <div className="text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-950/40 dark:text-red-500">
              <VideoIcon className="h-7 w-7" />
            </div>

            <h1 className="text-xl font-bold">
              Video unavailable
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-red-600 dark:hover:bg-red-500"
            >
              Back to Home
            </button>

          </div>
        </div>
      </main>
    );
  }

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-[#050505] dark:text-white">

      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">

          {/* ====================================================
              MAIN VIDEO
          ==================================================== */}

          <section className="min-w-0">

            {loading ? (
              <VideoPlayerSkeleton />
            ) : (
              <>

                {/* VIDEO PLAYER */}

                <div
                  className="
                    overflow-hidden
                    rounded-2xl
                    bg-black
                    shadow-xl
                    ring-1
                    ring-slate-200

                    dark:ring-red-950/60
                    dark:shadow-[0_15px_60px_rgba(220,38,38,0.10)]
                  "
                >
                  <div data-vjs-player>

                    <video
                      ref={videoRef}
                      className="video-js vjs-default-skin"
                      playsInline
                    />

                  </div>
                </div>

                {/* VIDEO INFORMATION */}

                <div className="mt-5">

                  {/* TITLE */}

                  <h1 className="text-xl font-bold leading-tight sm:text-2xl">
                    {video?.title}
                  </h1>

                  {/* DATE */}

                  {video?.uploadedAt && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">

                      <Clock3 className="h-3.5 w-3.5 dark:text-red-500" />

                      <span>
                        {formatDate(video.uploadedAt)}
                      </span>

                      <span>•</span>

                      <span>
                        {getTimeAgo(video.uploadedAt)}
                      </span>

                    </div>
                  )}

                  {/* USER */}

                  <div className="mt-5 flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-red-950/40">

                    <button
                      type="button"
                      onClick={() =>
                        video?.user &&
                        goToProfile(video.user.oneName)
                      }
                      className="shrink-0"
                    >

                      {video?.user?.profilePicUrl ? (
                        <img
                          src={video.user.profilePicUrl}
                          alt={`${video.user.name} profile`}
                          loading="lazy"
                          className="
                            h-11
                            w-11
                            rounded-full
                            object-cover
                            ring-2
                            ring-transparent
                            transition-all
                            hover:ring-red-500
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-full
                            bg-slate-200
                            text-sm
                            font-bold
                            text-slate-600

                            dark:bg-red-950/50
                            dark:text-red-400
                            dark:ring-1
                            dark:ring-red-900
                          "
                        >
                          {video?.user?.name ? (
                            video.user.name
                              .charAt(0)
                              .toUpperCase()
                          ) : (
                            <UserRound className="h-4 w-4" />
                          )}
                        </div>
                      )}

                    </button>

                    <div className="min-w-0">

                      <button
                        type="button"
                        onClick={() =>
                          video?.user &&
                          goToProfile(video.user.oneName)
                        }
                        className="
                          text-sm
                          font-semibold
                          transition-colors
                          hover:text-red-600
                          dark:hover:text-red-500
                        "
                      >
                        {video?.user?.name}
                      </button>

                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        @{video?.user?.oneName}
                      </p>

                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  <div
                    className="
                      mt-5
                      overflow-hidden
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white

                      dark:border-red-950/40
                      dark:bg-[#0b0b0b]
                    "
                  >

                    <button
                      type="button"
                      onClick={() =>
                        setOpenDesc(
                          (previous) => !previous
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        px-4
                        py-4
                        text-left
                        transition-colors

                        hover:bg-slate-50
                        dark:hover:bg-red-950/10
                      "
                    >

                      <span className="text-sm font-semibold">
                        Description
                      </span>

                      {openDesc ? (
                        <ChevronUp className="h-4 w-4 text-slate-500 dark:text-red-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-500 dark:text-red-500" />
                      )}

                    </button>

                    {openDesc && (
                      <div className="border-t border-slate-200 px-4 py-4 dark:border-red-950/40">

                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {video?.description ||
                            "No description available."}
                        </p>

                      </div>
                    )}

                  </div>

                </div>

              </>
            )}

          </section>

          {/* ====================================================
              RECOMMENDED VIDEOS
          ==================================================== */}

          <aside className="min-w-0">

            <div className="mb-4 flex items-center gap-2">

              <div className="h-5 w-1 rounded-full bg-red-600 dark:bg-red-500" />

              <h2 className="text-lg font-bold">
                Recommended Videos
              </h2>

            </div>

            {loading || recommendationsLoading ? (

              <div className="space-y-4">

                {Array.from({ length: 5 }).map(
                  (_, index) => (
                    <RecommendedSkeleton
                      key={index}
                    />
                  )
                )}

              </div>

            ) : recVideos.length === 0 ? (

              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  text-center

                  dark:border-red-950/40
                  dark:bg-[#0b0b0b]
                "
              >

                <VideoIcon className="mx-auto h-7 w-7 text-slate-400 dark:text-red-500" />

                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  No recommended videos available.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {recVideos.map((recommended) => (

                  <button
                    key={recommended.videoId}
                    type="button"
                    onClick={() =>
                      goToVideo(
                        recommended.videoId
                      )
                    }
                    className="
                      group
                      flex
                      w-full
                      gap-3
                      rounded-xl
                      text-left
                      transition-all
                      duration-200

                      hover:bg-slate-100
                      dark:hover:bg-red-950/10
                    "
                  >

                    {/* THUMBNAIL */}

                    <div
                      className="
                        relative
                        aspect-video
                        w-36
                        shrink-0
                        overflow-hidden
                        rounded-xl
                        bg-slate-200
                        ring-1
                        ring-slate-200

                        dark:bg-[#0b0b0b]
                        dark:ring-red-950/50
                        dark:group-hover:ring-red-600/50

                        sm:w-40
                      "
                    >

                      <video
                        src={recommended.videoUrl}
                        muted
                        preload="metadata"
                        playsInline
                        className="h-full w-full object-cover"
                      />

                      <div
                        className="
                          absolute
                          inset-0
                          flex
                          items-center
                          justify-center
                          bg-black/0
                          transition-all
                          group-hover:bg-black/30
                        "
                      >

                        <div
                          className="
                            flex
                            h-9
                            w-9
                            scale-90
                            items-center
                            justify-center
                            rounded-full
                            bg-white
                            text-black
                            opacity-0
                            shadow-lg
                            transition-all

                            group-hover:scale-100
                            group-hover:opacity-100

                            dark:bg-red-600
                            dark:text-white
                            dark:shadow-[0_0_25px_rgba(220,38,38,0.4)]
                          "
                        >
                          <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                        </div>

                      </div>

                    </div>

                    {/* INFORMATION */}

                    <div className="min-w-0 flex-1 py-0.5">

                      <h3
                        className="
                          line-clamp-2
                          text-sm
                          font-semibold
                          leading-5
                          text-slate-900
                          transition-colors

                          group-hover:text-red-600

                          dark:text-slate-100
                          dark:group-hover:text-red-500
                        "
                      >
                        {recommended.title}
                      </h3>

                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                        {recommended.user?.name}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        {getTimeAgo(
                          recommended.uploadedAt
                        )}
                      </p>

                    </div>

                  </button>

                ))}

              </div>

            )}

          </aside>

        </div>
      </div>
    </main>
  );
};

/* ============================================================
   VIDEO PLAYER SKELETON
============================================================ */

const VideoPlayerSkeleton = () => {
  return (
    <div className="animate-pulse">

      <div
        className="
          aspect-video
          w-full
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
            rounded-2xl
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

      <div className="mt-5 h-6 w-3/4 rounded-md bg-slate-200 dark:bg-[#171717]" />

      <div className="mt-3 h-3 w-40 rounded-md bg-slate-200 dark:bg-red-950/30" />

      <div className="mt-5 flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-red-950/40">

        <div className="h-11 w-11 rounded-full bg-slate-200 dark:bg-red-950/30" />

        <div className="space-y-2">

          <div className="h-3 w-28 rounded-md bg-slate-200 dark:bg-[#171717]" />

          <div className="h-3 w-20 rounded-md bg-slate-200 dark:bg-[#171717]" />

        </div>

      </div>

      <div className="mt-5 h-14 rounded-2xl bg-slate-200 dark:bg-[#0b0b0b]" />

    </div>
  );
};

/* ============================================================
   RECOMMENDED SKELETON
============================================================ */

const RecommendedSkeleton = () => {
  return (
    <div className="flex animate-pulse gap-3">

      <div
        className="
          aspect-video
          w-36
          shrink-0
          rounded-xl
          bg-slate-200

          dark:bg-[#0b0b0b]
          dark:ring-1
          dark:ring-red-950/40

          sm:w-40
        "
      />

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">

        <div className="h-4 w-full rounded-md bg-slate-200 dark:bg-[#171717]" />

        <div className="h-3 w-2/3 rounded-md bg-slate-200 dark:bg-[#171717]" />

        <div className="h-3 w-1/3 rounded-md bg-slate-200 dark:bg-red-950/30" />

      </div>

    </div>
  );
};

export default VideoPlayer;