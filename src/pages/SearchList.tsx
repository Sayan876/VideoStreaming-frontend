import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import {
  Clock3,
  Play,
  RefreshCw,
  Search,
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
  contentType?: string;
  uploadedAt: string;
  user: User;
}

/* ============================================================
   API
============================================================ */

const API_URL =
  "https://perfect-petronille-deltatech-f6802774.koyeb.app";

/* ============================================================
   COMPONENT
============================================================ */

const SearchList = () => {
  const { xyz } = useParams<{ xyz: string }>();
  const navigate = useNavigate();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  /* ============================================================
     FETCH SEARCH RESULTS
  ============================================================ */

  useEffect(() => {
    if (!xyz) {
      setVideos([]);
      setLoading(false);
      setError("No search query was provided.");
      return;
    }

    const controller = new AbortController();

    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<VideoItem[]>(
          `${API_URL}/api/v4/videos/searchByTitle/${encodeURIComponent(
            xyz
          )}`,
          {
            signal: controller.signal,
          }
        );

        setVideos(response.data);
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }

        console.error("Error fetching videos:", err);
        setError("Unable to load search results.");
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
  }, [xyz]);

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

  const goToProfile = (oneName: string) => {
    navigate(`/PublicProfile/${oneName}`);
  };

  const goToPlayer = (videoId: number) => {
    navigate(`/Video-Player/${videoId}`);
  };

  /* ============================================================
     FORMAT DATE
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
     ERROR
  ============================================================ */

  if (!loading && error) {
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
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-red-100
                text-red-600

                dark:bg-red-950/40
                dark:text-red-500
              "
            >
              <Search className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-xl font-bold">
              Search unavailable
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {error}
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
                hover:bg-red-600

                dark:bg-red-600
                dark:hover:bg-red-500
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

      <div
        className="
          mx-auto
          w-full
          max-w-[1500px]
          px-4
          py-7

          sm:px-6
          sm:py-9

          lg:px-8
          lg:py-10
        "
      >

        {/* ======================================================
            HEADER
        ====================================================== */}

        <section className="mb-8">

          <div className="flex items-center gap-3">

            <div
              className="
                h-7
                w-1
                rounded-full
                bg-red-600

                dark:bg-red-500
              "
            />

            <div>

              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-red-600

                  dark:text-red-500
                "
              >
                Search
              </p>

              <h1
                className="
                  mt-0.5
                  text-2xl
                  font-bold
                  tracking-tight

                  sm:text-3xl
                "
              >
                Search Results
              </h1>

            </div>

          </div>

          {/* SEARCH QUERY + COUNT */}

          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-2
              text-sm
              text-slate-500

              dark:text-slate-400
            "
          >

            <Search className="h-4 w-4 text-red-600 dark:text-red-500" />

            <span>
              Results for
            </span>

            <span
              className="
                font-semibold
                text-slate-900

                dark:text-white
              "
            >
              "{xyz}"
            </span>

            {!loading && (
              <>
                <span className="text-slate-300 dark:text-slate-700">
                  •
                </span>

                <span>
                  {videos.length}{" "}
                  {videos.length === 1
                    ? "video"
                    : "videos"}
                </span>
              </>
            )}

          </div>

        </section>

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading && (
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
                <SearchVideoSkeleton
                  key={index}
                />
              )
            )}
          </div>
        )}

        {/* ======================================================
            EMPTY
        ====================================================== */}

        {!loading &&
          !error &&
          videos.length === 0 && (
            <div className="flex min-h-[55vh] items-center justify-center">

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
                  <Search className="h-7 w-7" />
                </div>

                <h2 className="mt-5 text-xl font-bold">
                  No videos found
                </h2>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-sm
                    text-sm
                    leading-6
                    text-slate-500

                    dark:text-slate-400
                  "
                >
                  We couldn't find any videos matching
                  your search. Try using a different title.
                </p>

              </div>

            </div>
          )}

        {/* ======================================================
            VIDEO GRID
        ====================================================== */}

        {!loading &&
          !error &&
          videos.length > 0 && (
            <div
              className="
                grid
                grid-cols-1
                gap-x-5
                gap-y-10

                sm:grid-cols-2

                lg:grid-cols-3

                xl:grid-cols-4
              "
            >

              {videos.map((video, index) => {

                const user = video.user;

                return (
                  <article
                    key={video.videoId}
                    className="
                      group
                      min-w-0
                    "
                  >

                    {/* ==================================================
                        VIDEO THUMBNAIL
                    ================================================== */}

                    <div
                      onClick={() =>
                        goToPlayer(video.videoId)
                      }
                      className="
                        relative
                        aspect-video
                        cursor-pointer
                        overflow-hidden
                        rounded-2xl
                        bg-slate-200
                        ring-1
                        ring-slate-200
                        shadow-sm
                        transition-all
                        duration-300

                        group-hover:-translate-y-1
                        group-hover:shadow-xl
                        group-hover:ring-slate-300

                        dark:bg-[#0b0b0b]
                        dark:ring-red-950/50
                        dark:shadow-[0_8px_30px_rgba(220,38,38,0.04)]

                        dark:group-hover:ring-red-800/60
                        dark:group-hover:shadow-[0_12px_40px_rgba(220,38,38,0.12)]
                      "
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
                          type={video.contentType}
                        />

                        Your browser does not support
                        the video element.
                      </video>

                      {/* ==================================================
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

                          group-hover:bg-black/30
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
                            shadow-2xl
                            transition-all
                            duration-300

                            group-hover:scale-100
                            group-hover:opacity-100

                            dark:bg-red-600
                            dark:text-white
                            dark:shadow-[0_0_35px_rgba(220,38,38,0.45)]
                          "
                        >
                          <Play
                            className="
                              ml-0.5
                              h-5
                              w-5
                              fill-current
                            "
                          />
                        </div>

                      </div>

                      {/* ==================================================
                          UPLOAD TIME BADGE
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
                          text-[10px]
                          font-medium
                          text-white
                          backdrop-blur-md
                        "
                      >

                        <Clock3 className="h-3 w-3" />

                        {getTimeAgo(
                          video.uploadedAt
                        )}

                      </div>

                    </div>

                    {/* ==================================================
                        VIDEO DETAILS
                    ================================================== */}

                    <div className="mt-3 flex gap-3">

                      {/* PROFILE */}

                      <button
                        type="button"
                        onClick={() =>
                          goToProfile(
                            user.oneName
                          )
                        }
                        className="
                          shrink-0
                          rounded-full
                          outline-none
                          transition-transform
                          duration-200
                          hover:scale-105
                          focus-visible:ring-2
                          focus-visible:ring-red-500
                          focus-visible:ring-offset-2

                          dark:focus-visible:ring-offset-[#050505]
                        "
                      >

                        {user.profilePicUrl ? (
                          <img
                            src={user.profilePicUrl}
                            alt={`${user.name} profile`}
                            loading="lazy"
                            className="
                              h-10
                              w-10
                              rounded-full
                              object-cover
                              ring-2
                              ring-slate-100

                              dark:ring-red-950
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
                              bg-slate-100
                              text-sm
                              font-bold
                              text-slate-500
                              ring-2
                              ring-slate-200

                              dark:bg-red-950/40
                              dark:text-red-400
                              dark:ring-red-950
                            "
                          >
                            {user.name
                              ?.charAt(0)
                              .toUpperCase() || (
                              <UserRound className="h-4 w-4" />
                            )}
                          </div>
                        )}

                      </button>

                      {/* TEXT */}

                      <div className="min-w-0 flex-1">

                        <button
                          type="button"
                          onClick={() =>
                            goToPlayer(
                              video.videoId
                            )
                          }
                          className="
                            block
                            w-full
                            text-left
                          "
                        >

                          <h2
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
                          </h2>

                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            goToProfile(
                              user.oneName
                            )
                          }
                          className="
                            mt-1
                            block
                            max-w-full
                            truncate
                            text-left
                            text-xs
                            font-medium
                            text-slate-500
                            transition-colors
                            hover:text-red-600

                            dark:text-slate-400
                            dark:hover:text-red-500
                          "
                        >
                          {user.name}
                        </button>

                        <div
                          className="
                            mt-1
                            flex
                            items-center
                            gap-1.5
                            text-[11px]
                            text-slate-400

                            dark:text-slate-500
                          "
                        >

                          <Clock3 className="h-3 w-3" />

                          <span>
                            {formatDate(
                              video.uploadedAt
                            )}
                          </span>

                        </div>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

      </div>
    </main>
  );
};

/* ================================================================
   SEARCH VIDEO SKELETON
================================================================ */

const SearchVideoSkeleton = () => {
  return (
    <div className="animate-pulse">

      {/* VIDEO */}

      <div
        className="
          aspect-video
          w-full
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

      {/* DETAILS */}

      <div className="mt-3 flex gap-3">

        <div
          className="
            h-10
            w-10
            shrink-0
            rounded-full
            bg-slate-200

            dark:bg-[#171717]
          "
        />

        <div className="flex-1">

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
              mt-2
              h-3
              w-5/12
              rounded-md
              bg-slate-200

              dark:bg-[#171717]
            "
          />

          <div
            className="
              mt-2
              h-3
              w-7/12
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

export default SearchList;