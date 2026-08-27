import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import {
  CalendarDays,
  Clock3,
  Globe2,
  Play,
  RefreshCw,
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
  country?: string | null;
  biodetails?: string | null;
  accountCreatedAt?: string | null;
}

interface VideoItem {
  videoId: number;
  title: string;
  videoUrl: string;
  uploadedAt: string;
}

/* ============================================================
   API
============================================================ */

const API_URL =
  "https://perfect-petronille-deltatech-f6802774.koyeb.app";

/* ============================================================
   COMPONENT
============================================================ */

const PublicProfile = () => {
  const { abc } = useParams<{ abc: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  const [userLoading, setUserLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);

  const [userError, setUserError] = useState<string | null>(null);
  const [videosError, setVideosError] = useState<string | null>(null);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  /* ============================================================
     FETCH USER
  ============================================================ */

  useEffect(() => {
    if (!abc) {
      setUserError("Username is missing.");
      setUserLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        setUserLoading(true);
        setUserError(null);

        const response = await axios.get<User>(
          `${API_URL}/api/userOne/${abc}`,
          {
            signal: controller.signal,
          }
        );

        setUser(response.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        console.error("Error fetching user:", error);
        setUserError("Unable to load this profile.");
      } finally {
        if (!controller.signal.aborted) {
          setUserLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      controller.abort();
    };
  }, [abc]);

  /* ============================================================
     FETCH USER VIDEOS
  ============================================================ */

  useEffect(() => {
    if (!abc) {
      setVideosError("Username is missing.");
      setVideosLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchVideos = async () => {
      try {
        setVideosLoading(true);
        setVideosError(null);

        const response = await axios.get<VideoItem[]>(
          `${API_URL}/api/v4/videos/byOneName/${abc}`,
          {
            signal: controller.signal,
          }
        );

        setVideos(response.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        console.error("Error fetching user videos:", error);
        setVideosError("Unable to load this user's videos.");
      } finally {
        if (!controller.signal.aborted) {
          setVideosLoading(false);
        }
      }
    };

    fetchVideos();

    return () => {
      controller.abort();
    };
  }, [abc]);

  /* ============================================================
     PAUSE OTHER VIDEOS
  ============================================================ */

  const handlePlay = (index: number) => {
    videoRefs.current.forEach((video, currentIndex) => {
      if (video && currentIndex !== index) {
        video.pause();
      }
    });
  };

  /* ============================================================
     NAVIGATION
  ============================================================ */

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

  const formatAccountDate = (dateString?: string | null) => {
    if (!dateString) {
      return "Unknown";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* ============================================================
     TIME AGO
  ============================================================ */

  const getTimeAgo = (dateString: string) => {
    const now = Date.now();
    const past = new Date(dateString).getTime();

    const difference = now - past;

    if (difference < 0) {
      return "just now";
    }

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

  /* ============================================================
     RETRY
  ============================================================ */

  const retry = () => {
    window.location.reload();
  };

  /* ============================================================
     PROFILE ERROR
  ============================================================ */

  if (!userLoading && userError) {
    return (
      <main
        className="
          min-h-screen
          bg-slate-50
          px-4
          py-10
          text-slate-950
          transition-colors
          duration-300

          dark:bg-[#050505]
          dark:text-white
        "
      >
        <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center">
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
                bg-red-100
                text-red-500

                dark:bg-red-950/40
                dark:text-red-500
              "
            >
              <UserRound className="h-7 w-7" />
            </div>

            <h1 className="text-xl font-bold">
              Profile unavailable
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {userError}
            </p>

            <button
              type="button"
              onClick={retry}
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-slate-900
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition-all
                hover:bg-slate-700

                dark:bg-red-600
                dark:hover:bg-red-500
                dark:shadow-[0_0_25px_rgba(220,38,38,0.18)]
              "
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
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

      <div className="mx-auto w-full max-w-[1500px]">

        {/* ======================================================
            PROFILE HERO
        ======================================================= */}

        <section className="relative">

          {userLoading ? (
            <ProfileSkeleton />
          ) : user ? (
            <div>

              {/* ================================================
                  PROFILE COVER
              ================================================= */}

              <div
                className="
                  relative
                  h-40
                  overflow-hidden
                  bg-gradient-to-br
                  from-slate-100
                  via-slate-200
                  to-slate-100

                  dark:from-[#090909]
                  dark:via-[#120606]
                  dark:to-[#050505]

                  sm:h-52
                  lg:h-60
                "
              >

                {/* Light mode subtle background */}

                <div
                  className="
                    absolute
                    inset-0
                    bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.18),transparent_40%)]
                    dark:hidden
                  "
                />

                {/* Dark mode red atmosphere */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-32
                    hidden
                    h-80
                    w-80
                    rounded-full
                    bg-red-600/10
                    blur-3xl

                    dark:block
                  "
                />

                <div
                  className="
                    pointer-events-none
                    absolute
                    -bottom-32
                    left-1/3
                    hidden
                    h-72
                    w-72
                    rounded-full
                    bg-red-600/5
                    blur-3xl

                    dark:block
                  "
                />

                {/* Dark red line */}

                <div
                  className="
                    absolute
                    bottom-0
                    left-0
                    h-px
                    w-full
                    bg-transparent

                    dark:bg-gradient-to-r
                    dark:from-transparent
                    dark:via-red-900/60
                    dark:to-transparent
                  "
                />

              </div>

              {/* ================================================
                  PROFILE CONTENT
              ================================================= */}

              <div
                className="
                  relative
                  px-5
                  pb-7

                  sm:px-8
                  lg:px-12
                "
              >

                {/* PROFILE IMAGE */}

                <div
                  className="
                    -mt-14
                    relative
                    flex
                    w-fit
                    items-center

                    sm:-mt-16
                  "
                >

                  {user.profilePicUrl ? (
                    <img
                      src={user.profilePicUrl}
                      alt={`${user.name} profile`}
                      loading="lazy"
                      className="
                        h-28
                        w-28
                        rounded-full
                        object-cover
                        border-4
                        border-slate-50
                        bg-slate-100
                        shadow-xl

                        dark:border-[#050505]
                        dark:shadow-[0_0_40px_rgba(220,38,38,0.20)]

                        sm:h-32
                        sm:w-32
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-28
                        w-28
                        items-center
                        justify-center
                        rounded-full
                        border-4
                        border-slate-50
                        bg-slate-200
                        text-3xl
                        font-bold
                        text-slate-500
                        shadow-xl

                        dark:border-[#050505]
                        dark:bg-red-950/40
                        dark:text-red-400
                        dark:shadow-[0_0_40px_rgba(220,38,38,0.20)]

                        sm:h-32
                        sm:w-32
                      "
                    >
                      {user.name ? (
                        user.name
                          .charAt(0)
                          .toUpperCase()
                      ) : (
                        <UserRound className="h-10 w-10" />
                      )}
                    </div>
                  )}

                </div>

                {/* ================================================
                    NAME + USERNAME
                ================================================= */}

                <div className="mt-4">

                  <h1
                    className="
                      text-2xl
                      font-bold
                      tracking-tight
                      sm:text-3xl
                    "
                  >
                    {user.name || "Unknown User"}
                  </h1>

                  <p
                    className="
                      mt-1
                      text-sm
                      font-medium
                      text-slate-500

                      dark:text-red-400
                    "
                  >
                    @{user.oneName}
                  </p>

                </div>

                {/* ================================================
                    META INFORMATION
                ================================================= */}

                <div
                  className="
                    mt-5
                    flex
                    flex-wrap
                    items-center
                    gap-x-5
                    gap-y-3
                    text-sm
                    text-slate-500

                    dark:text-slate-400
                  "
                >

                  {user.country && (
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4 dark:text-red-500" />
                      <span>{user.country}</span>
                    </div>
                  )}

                  {user.accountCreatedAt && (
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 dark:text-red-500" />

                      <span>
                        Joined{" "}
                        {formatAccountDate(
                          user.accountCreatedAt
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <VideoIcon className="h-4 w-4 dark:text-red-500" />

                    <span>
                      {videos.length}{" "}
                      {videos.length === 1
                        ? "video"
                        : "videos"}
                    </span>
                  </div>

                </div>

                {/* ================================================
                    BIO
                ================================================= */}

                {user.biodetails && (
                  <div
                    className="
                      mt-5
                      max-w-3xl
                      text-sm
                      leading-6
                      text-slate-600

                      dark:text-slate-400
                    "
                  >
                    {user.biodetails}
                  </div>
                )}

                {/* ================================================
                    MEMBER DATE
                ================================================= */}

                {user.accountCreatedAt && (
                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      gap-2
                      text-xs
                      text-slate-400

                      dark:text-slate-500
                    "
                  >
                    <Clock3 className="h-3.5 w-3.5 dark:text-red-500" />

                    <span>
                      Member for{" "}
                      {getTimeAgo(
                        user.accountCreatedAt
                      )}
                    </span>
                  </div>
                )}

              </div>

              {/* PROFILE DIVIDER */}

              <div
                className="
                  mx-5
                  border-b
                  border-slate-200

                  dark:border-red-950/40

                  sm:mx-8
                  lg:mx-12
                "
              />

            </div>
          ) : null}

        </section>

        {/* ======================================================
            VIDEOS SECTION
        ======================================================= */}

        <section
          className="
            px-5
            py-8

            sm:px-8
            sm:py-10

            lg:px-12
            lg:py-12
          "
        >

          {/* ================================================
              SECTION HEADER
          ================================================= */}

          <div className="mb-7">

            <div className="flex items-center gap-2">

              <div
                className="
                  h-5
                  w-1
                  rounded-full
                  bg-red-600

                  dark:bg-red-500
                  dark:shadow-[0_0_12px_rgba(220,38,38,0.5)]
                "
              />

              <span
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-slate-500

                  dark:text-red-400
                "
              >
                Creator Videos
              </span>

            </div>

            <div className="mt-2 flex items-end justify-between gap-4">

              <h2
                className="
                  text-2xl
                  font-bold
                  tracking-tight

                  sm:text-3xl
                "
              >
                Videos
              </h2>

              {!videosLoading && !videosError && (
                <span
                  className="
                    hidden
                    text-sm
                    text-slate-500

                    dark:text-slate-400

                    sm:block
                  "
                >
                  {videos.length}{" "}
                  {videos.length === 1
                    ? "video"
                    : "videos"}
                </span>
              )}

            </div>

          </div>

          {/* ===================================================
              LOADING
          ==================================================== */}

          {videosLoading && (
            <div
              className="
                grid
                grid-cols-1
                gap-x-5
                gap-y-9

                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <ProfileVideoSkeleton
                    key={index}
                  />
                )
              )}
            </div>
          )}

          {/* ===================================================
              ERROR
          ==================================================== */}

          {!videosLoading && videosError && (
            <div className="flex min-h-[300px] items-center justify-center">

              <div className="text-center">

                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-red-100
                    text-red-500

                    dark:bg-red-950/40
                    dark:text-red-500
                  "
                >
                  <VideoIcon className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-lg font-semibold">
                  Unable to load videos
                </h3>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {videosError}
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
                    dark:hover:bg-red-500
                  "
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>

              </div>

            </div>
          )}

          {/* ===================================================
              EMPTY
          ==================================================== */}

          {!videosLoading &&
            !videosError &&
            videos.length === 0 && (
              <div
                className="
                  flex
                  min-h-[300px]
                  items-center
                  justify-center
                "
              >

                <div className="text-center">

                  <div
                    className="
                      mx-auto
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-full
                      bg-slate-100
                      text-slate-400

                      dark:bg-red-950/30
                      dark:text-red-500
                    "
                  >
                    <VideoIcon className="h-7 w-7" />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold">
                    No videos yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    This user hasn't uploaded any videos.
                  </p>

                </div>

              </div>
            )}

          {/* ===================================================
              VIDEO GRID
          ==================================================== */}

          {!videosLoading &&
            !videosError &&
            videos.length > 0 && (
              <div
                className="
                  grid
                  grid-cols-1
                  gap-x-5
                  gap-y-9

                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                "
              >

                {videos.map((video, index) => (
                  <article
                    key={video.videoId}
                    className="group min-w-0"
                  >

                    {/* ========================================
                        VIDEO
                    ========================================= */}

                    <div
                      className="
                        relative
                        aspect-video
                        cursor-pointer
                        overflow-hidden
                        rounded-2xl
                        bg-slate-200
                        ring-1
                        ring-slate-200
                        transition-all
                        duration-300

                        group-hover:-translate-y-1
                        group-hover:shadow-xl

                        dark:bg-[#0b0b0b]
                        dark:ring-red-950/50
                        dark:shadow-[0_8px_30px_rgba(220,38,38,0.03)]

                        dark:group-hover:ring-red-700/50
                        dark:group-hover:shadow-[0_12px_40px_rgba(220,38,38,0.12)]
                      "
                      onClick={() =>
                        goToVideo(video.videoId)
                      }
                    >

                      <video
                        ref={(element) => {
                          videoRefs.current[index] =
                            element;
                        }}
                        onPlay={() =>
                          handlePlay(index)
                        }
                        preload="metadata"
                        playsInline
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      >
                        <source
                          src={video.videoUrl}
                        />

                        Your browser does not support
                        the video element.
                      </video>

                      {/* ======================================
                          HOVER OVERLAY
                      ======================================= */}

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

                          group-hover:bg-black/25
                        "
                      >

                        <div
                          className="
                            flex
                            h-12
                            w-12
                            scale-90
                            items-center
                            justify-center
                            rounded-full
                            bg-white
                            text-slate-900
                            opacity-0
                            shadow-xl
                            transition-all
                            duration-300

                            group-hover:scale-100
                            group-hover:opacity-100

                            dark:bg-red-600
                            dark:text-white
                            dark:shadow-[0_0_30px_rgba(220,38,38,0.45)]
                          "
                        >
                          <Play className="ml-0.5 h-5 w-5 fill-current" />
                        </div>

                      </div>

                      {/* ======================================
                          TIME
                      ======================================= */}

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
                        "
                      >
                        <Clock3 className="h-3 w-3" />

                        {getTimeAgo(
                          video.uploadedAt
                        )}
                      </div>

                    </div>

                    {/* ========================================
                        VIDEO INFO
                    ========================================= */}

                    <div className="mt-3">

                      <button
                        type="button"
                        onClick={() =>
                          goToVideo(video.videoId)
                        }
                        className="block w-full text-left"
                      >

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
                          {video.title}
                        </h3>

                      </button>

                      <div
                        className="
                          mt-1.5
                          flex
                          items-center
                          gap-2
                          text-xs
                          text-slate-500

                          dark:text-slate-400
                        "
                      >

                        <Clock3 className="h-3 w-3 dark:text-red-500" />

                        <span>
                          {formatDate(
                            video.uploadedAt
                          )}
                        </span>

                      </div>

                    </div>

                  </article>
                ))}

              </div>
            )}

        </section>

      </div>
    </main>
  );
};

/* ================================================================
   PROFILE SKELETON
================================================================ */

const ProfileSkeleton = () => {
  return (
    <div className="animate-pulse">

      {/* COVER */}

      <div
        className="
          h-40
          bg-slate-200

          dark:bg-[#0b0b0b]

          sm:h-52
          lg:h-60
        "
      />

      {/* CONTENT */}

      <div className="px-5 pb-7 sm:px-8 lg:px-12">

        <div
          className="
            -mt-14
            h-28
            w-28
            rounded-full
            border-4
            border-slate-50
            bg-slate-200

            dark:border-[#050505]
            dark:bg-red-950/30

            sm:-mt-16
            sm:h-32
            sm:w-32
          "
        />

        <div className="mt-5 h-7 w-48 rounded-md bg-slate-200 dark:bg-[#171717]" />

        <div className="mt-2 h-4 w-28 rounded-md bg-slate-200 dark:bg-red-950/30" />

        <div className="mt-5 flex gap-4">
          <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-[#171717]" />
          <div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-[#171717]" />
          <div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-[#171717]" />
        </div>

        <div className="mt-5 h-4 w-full max-w-2xl rounded-md bg-slate-200 dark:bg-[#171717]" />

        <div className="mt-2 h-4 w-2/3 max-w-xl rounded-md bg-slate-200 dark:bg-[#171717]" />

      </div>

    </div>
  );
};

/* ================================================================
   VIDEO SKELETON
================================================================ */

const ProfileVideoSkeleton = () => {
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

      <div className="mt-3 h-4 w-11/12 rounded-md bg-slate-200 dark:bg-[#171717]" />

      <div className="mt-2 h-4 w-7/12 rounded-md bg-slate-200 dark:bg-[#171717]" />

      <div className="mt-2 h-3 w-5/12 rounded-md bg-slate-200 dark:bg-red-950/30" />

    </div>
  );
};

export default PublicProfile;