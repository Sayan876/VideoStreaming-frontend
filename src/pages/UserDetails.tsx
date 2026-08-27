import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router";

import {
  CheckCircle2,
  Clock3,
  Edit3,
  FileVideo,
  Lock,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

interface JwtPayload {
  exp: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  oneName: string;
  profilePicUrl?: string | null;
  country?: string | null;
  biodetails?: string | null;
  accountCreatedAt?: string | null;
  verified: boolean;
}

interface VideoItem {
  videoId: number;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  uploadedAt: string;
  contentType?: string;
}

/* ============================================================
   API
============================================================ */

const API_URL =
  "https://perfect-petronille-deltatech-f6802774.koyeb.app";

/* ============================================================
   COMPONENT
============================================================ */

const UserDetails = () => {
  const navigate = useNavigate();

  /* ==========================================================
     STATE
  ========================================================== */

  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const [isVerified, setIsVerified] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    category: "Other",
  });

  const [uploadData, setUploadData] = useState<{
    title: string;
    description: string;
    category: string;
    file: File | null;
  }>({
    title: "",
    description: "",
    category: "Other",
    file: null,
  });

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  /* ==========================================================
     FETCH USER
  ========================================================== */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    let decoded: JwtPayload;

    try {
      decoded = jwtDecode<JwtPayload>(token);
    } catch {
      localStorage.clear();
      navigate("/Login");
      return;
    }

    const expiryTime = decoded.exp * 1000 - Date.now();

    if (expiryTime <= 0) {
      localStorage.clear();
      navigate("/Login");
      return;
    }

    const timer = window.setTimeout(() => {
      localStorage.clear();
      navigate("/Login");
      window.location.reload();
    }, expiryTime);

    const fetchUser = async () => {
      try {
        setLoadingUser(true);

        const response = await axios.get<User>(
          `${API_URL}/api/user/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data);
        setIsVerified(response.data.verified);
      } catch (error) {
        console.error("Cannot fetch user data:", error);

        localStorage.clear();
        navigate("/Login");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();

    return () => {
      clearTimeout(timer);
    };
  }, [navigate]);

  /* ==========================================================
     FETCH VIDEOS
  ========================================================== */

  const fetchVideos = useCallback(async () => {
    if (!user?.id) return;

    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      setLoadingVideos(true);

      const response = await axios.get<VideoItem[]>(
        `${API_URL}/api/v4/videos/byUserId/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVideos(response.data);
    } catch (error) {
      console.error("Cannot fetch videos:", error);
    } finally {
      setLoadingVideos(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  /* ==========================================================
     VIDEO PLAY CONTROL
  ========================================================== */

  const handlePlay = (index: number) => {
    videoRefs.current.forEach((video, currentIndex) => {
      if (video && currentIndex !== index) {
        video.pause();
      }
    });
  };

  /* ==========================================================
     VERIFY ACCOUNT
  ========================================================== */

  const handleVerifyClick = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/Login");
        return;
      }

      await axios.post(
        `${API_URL}/api/send-otp`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/verify-account");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      alert("Unable to send verification email. Please try again.");
    }
  };

  /* ==========================================================
     VIDEO FILE
  ========================================================== */

  const handleVideoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;

    setUploadData((previous) => ({
      ...previous,
      file,
    }));
  };

  /* ==========================================================
     UPLOAD VIDEO
  ========================================================== */

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.title.trim()) {
      alert("Please select a video file and enter a title.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();

      formData.append("file", uploadData.file);
      formData.append("title", uploadData.title.trim());
      formData.append(
        "description",
        uploadData.description.trim()
      );
      formData.append(
        "category",
        uploadData.category.trim()
      );

      await axios.post(
        `${API_URL}/api/v4/videos`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },

          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;

            const progress = Math.round(
              (progressEvent.loaded * 100) /
                progressEvent.total
            );

            setUploadProgress(progress);
          },
        }
      );

      setUploadData({
        title: "",
        description: "",
        category: "Other",
        file: null,
      });

      setUploadProgress(0);

      await fetchVideos();

      alert("Video uploaded successfully!");
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to upload video.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  /* ==========================================================
     EDIT VIDEO
  ========================================================== */

  const startEdit = (index: number) => {
    const video = videos[index];

    setEditingIndex(index);

    setEditData({
      title: video.title,
      description: video.description,
      category: video.category || "Other",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setEditingIndex(null);

    setEditData({
      title: "",
      description: "",
      category: "Other",
    });
  };

  /* ==========================================================
     SAVE VIDEO EDIT
  ========================================================== */

  const saveEdit = async (videoId: number) => {
    if (!editData.title.trim()) {
      alert("Video title cannot be empty.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    try {
      const formData = new FormData();

      formData.append(
        "title",
        editData.title.trim()
      );

      formData.append(
        "description",
        editData.description.trim()
      );

      formData.append(
        "category",
        editData.category.trim()
      );

      await axios.patch(
        `${API_URL}/api/v4/videos/${videoId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchVideos();

      cancelEdit();
    } catch (error) {
      console.error("Error updating video:", error);
      alert("Failed to update video.");
    }
  };

  /* ==========================================================
     DELETE VIDEO
  ========================================================== */

  const deleteVideo = async (videoId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this video?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/v4/videos/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVideos((previous) =>
        previous.filter(
          (video) => video.videoId !== videoId
        )
      );

      if (editingIndex !== null) {
        cancelEdit();
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video.");
    }
  };

  /* ==========================================================
     DATE FORMAT
  ========================================================== */

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";

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

  /* ==========================================================
     ACCOUNT DATE
  ========================================================== */

  const formatAccountDate = (
    dateString?: string | null
  ) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* ==========================================================
     TIME AGO
  ========================================================== */

  const getTimeAgo = (dateString?: string | null) => {
    if (!dateString) return "unknown";

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

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-[#050505] dark:text-white">
        <div className="mx-auto max-w-6xl animate-pulse">

          <div className="h-72 rounded-3xl bg-slate-200 dark:bg-[#111111]" />

          <div className="mt-10 h-8 w-48 rounded bg-slate-200 dark:bg-[#111111]" />

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="aspect-video rounded-2xl bg-slate-200 dark:bg-[#111111]"
              />
            ))}
          </div>

        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  /* ==========================================================
     MAIN
  ========================================================== */

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

      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* ====================================================
            PROFILE HERO
        ==================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-slate-200
            bg-white
            shadow-sm

            dark:border-red-950/50
            dark:bg-[#0a0a0a]
            dark:shadow-[0_20px_80px_rgba(220,38,38,0.07)]
          "
        >

          {/* Background decoration */}

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-red-500/5
              blur-3xl

              dark:bg-red-600/10
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              left-1/3
              h-72
              w-72
              rounded-full
              bg-slate-100
              blur-3xl

              dark:bg-red-950/10
            "
          />

          <div className="relative p-6 sm:p-8 lg:p-10">

            {/* TOP */}

            <div className="flex flex-col gap-8 md:flex-row md:items-center">

              {/* PROFILE IMAGE */}

              <div className="shrink-0">

                {user.profilePicUrl ? (
                  <img
                    src={`${user.profilePicUrl}?t=${Date.now()}`}
                    alt={`${user.name} profile`}
                    className="
                      h-28
                      w-28
                      rounded-full
                      object-cover
                      ring-4
                      ring-slate-100
                      shadow-lg

                      dark:ring-red-950
                      dark:shadow-[0_0_40px_rgba(220,38,38,0.15)]

                      sm:h-36
                      sm:w-36
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
                      bg-slate-100
                      text-4xl
                      font-bold
                      text-slate-500
                      ring-4
                      ring-slate-200

                      dark:bg-red-950/40
                      dark:text-red-400
                      dark:ring-red-950

                      sm:h-36
                      sm:w-36
                      sm:text-5xl
                    "
                  >
                    {user.name?.charAt(0).toUpperCase() || (
                      <UserRound />
                    )}
                  </div>
                )}

              </div>

              {/* PROFILE INFORMATION */}

              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-3">

                  <h1
                    className="
                      text-3xl
                      font-bold
                      tracking-tight
                      sm:text-4xl
                    "
                  >
                    {user.name}
                  </h1>

                  {user.verified && (
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-emerald-200
                        bg-emerald-50
                        px-2.5
                        py-1
                        text-xs
                        font-semibold
                        text-emerald-600

                        dark:border-emerald-900/50
                        dark:bg-emerald-950/30
                        dark:text-emerald-400
                      "
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}

                </div>

                <p
                  className="
                    mt-1
                    text-sm
                    font-medium
                    text-red-600

                    dark:text-red-500
                  "
                >
                  @{user.oneName}
                </p>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {user.biodetails ||
                    "No bio has been added yet."}
                </p>

                {/* STATS */}

                <div className="mt-6 flex flex-wrap gap-3">

                  <div
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-2.5

                      dark:border-red-950/40
                      dark:bg-[#111111]
                    "
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Videos
                    </p>

                    <p className="mt-0.5 text-sm font-bold">
                      {videos.length}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-2.5

                      dark:border-red-950/40
                      dark:bg-[#111111]
                    "
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Country
                    </p>

                    <p className="mt-0.5 text-sm font-bold">
                      {user.country || "Not specified"}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-2.5

                      dark:border-red-950/40
                      dark:bg-[#111111]
                    "
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Member Since
                    </p>

                    <p className="mt-0.5 text-sm font-bold">
                      {formatAccountDate(
                        user.accountCreatedAt
                      )}
                    </p>
                  </div>

                </div>

              </div>

              {/* VERIFICATION */}

              <div className="shrink-0 md:self-start">

                {user.verified ? (
                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-emerald-200
                      bg-emerald-50
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-emerald-600

                      dark:border-emerald-900/50
                      dark:bg-emerald-950/20
                      dark:text-emerald-400
                    "
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Account verified
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyClick}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-red-600
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      shadow-lg
                      shadow-red-600/10
                      transition-all
                      hover:bg-red-500
                      hover:shadow-red-600/20
                      active:scale-[0.98]
                    "
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Verify Account
                  </button>
                )}

              </div>

            </div>

            {/* FOOTER INFO */}

            <div
              className="
                mt-8
                flex
                flex-wrap
                items-center
                gap-x-5
                gap-y-2
                border-t
                border-slate-100
                pt-5
                text-xs
                text-slate-400

                dark:border-red-950/30
                dark:text-slate-500
              "
            >
              <span>{user.email}</span>

              <span className="hidden sm:block">•</span>

              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                Joined{" "}
                {formatAccountDate(
                  user.accountCreatedAt
                )}
              </span>

              <span className="hidden sm:block">•</span>

              <span>
                {getTimeAgo(user.accountCreatedAt)}
              </span>
            </div>

          </div>
        </section>

        {/* ====================================================
            UPLOAD SECTION
        ==================================================== */}

        <section className="mt-10">

          <div className="mb-5">

            <div className="flex items-center gap-2">

              <div className="h-5 w-1 rounded-full bg-red-600 dark:bg-red-500" />

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-red-600

                  dark:text-red-500
                "
              >
                Creator Studio
              </p>

            </div>

            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Upload a video
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Share your next video with the MyStream community.
            </p>

          </div>

          <div
            className={`
              relative
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              sm:p-7

              dark:border-red-950/50
              dark:bg-[#0a0a0a]
              dark:shadow-[0_15px_60px_rgba(220,38,38,0.05)]

              ${!isVerified ? "opacity-90" : ""}
            `}
          >

            {/* LOCK OVERLAY */}

            {!isVerified && (
              <div
                className="
                  absolute
                  inset-0
                  z-20
                  flex
                  items-center
                  justify-center
                  bg-white/75
                  backdrop-blur-[3px]

                  dark:bg-black/70
                "
              >

                <div className="px-6 text-center">

                  <div
                    className="
                      mx-auto
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-red-50
                      text-red-600

                      dark:bg-red-950/40
                      dark:text-red-500
                    "
                  >
                    <Lock className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-lg font-bold">
                    Verification required
                  </h3>

                  <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                    Verify your account before uploading videos.
                  </p>

                  <button
                    type="button"
                    onClick={handleVerifyClick}
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-red-600
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-red-500
                    "
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Verify Account
                  </button>

                </div>

              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">

              {/* LEFT */}

              <div className="space-y-5">

                <div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Video title
                  </label>

                  <input
                    type="text"
                    placeholder="Give your video a title..."
                    value={uploadData.title}
                    onChange={(event) =>
                      setUploadData({
                        ...uploadData,
                        title: event.target.value,
                      })
                    }
                    disabled={!isVerified}
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      text-sm
                      outline-none
                      transition
                      placeholder:text-slate-400

                      focus:border-red-500
                      focus:ring-4
                      focus:ring-red-500/10

                      disabled:cursor-not-allowed
                      disabled:opacity-60

                      dark:border-red-950/50
                      dark:bg-[#111111]
                      dark:text-white
                      dark:placeholder:text-slate-600
                      dark:focus:border-red-600
                    "
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Description
                  </label>

                  <textarea
                    placeholder="Tell viewers what your video is about..."
                    value={uploadData.description}
                    onChange={(event) =>
                      setUploadData({
                        ...uploadData,
                        description:
                          event.target.value,
                      })
                    }
                    disabled={!isVerified}
                    className="
                      min-h-36
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      p-4
                      text-sm
                      leading-6
                      outline-none
                      transition
                      placeholder:text-slate-400

                      focus:border-red-500
                      focus:ring-4
                      focus:ring-red-500/10

                      disabled:cursor-not-allowed
                      disabled:opacity-60

                      dark:border-red-950/50
                      dark:bg-[#111111]
                      dark:text-white
                      dark:placeholder:text-slate-600
                      dark:focus:border-red-600
                    "
                  />

                </div>

              </div>

              {/* RIGHT */}

              <div className="flex flex-col gap-5">

                <div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </label>

                  <select
                    value={uploadData.category}
                    onChange={(event) =>
                      setUploadData({
                        ...uploadData,
                        category:
                          event.target.value,
                      })
                    }
                    disabled={!isVerified}
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      text-sm
                      outline-none
                      transition

                      focus:border-red-500
                      focus:ring-4
                      focus:ring-red-500/10

                      disabled:cursor-not-allowed
                      disabled:opacity-60

                      dark:border-red-950/50
                      dark:bg-[#111111]
                      dark:text-white
                    "
                  >
                    <option value="Other">Other</option>
                    <option value="Entertainment">
                      Entertainment
                    </option>
                    <option value="Education">
                      Education
                    </option>
                    <option value="Gaming">Gaming</option>
                    <option value="Sports">Sports</option>
                    <option value="Technology">
                      Technology
                    </option>
                    <option value="Anime">Anime</option>
                    <option value="AMV">AMV</option>
                    <option value="Music">Music</option>
                    <option value="Sport">Sport</option>
                  </select>

                </div>

                {/* FILE */}

                <label
                  className={`
                    flex
                    min-h-36
                    cursor-pointer
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border-2
                    border-dashed
                    border-slate-200
                    bg-slate-50
                    px-5
                    text-center
                    transition-all

                    hover:border-red-300
                    hover:bg-red-50/30

                    dark:border-red-950/50
                    dark:bg-[#101010]
                    dark:hover:border-red-800
                    dark:hover:bg-red-950/10

                    ${!isVerified
                      ? "pointer-events-none opacity-60"
                      : ""}
                  `}
                >

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      bg-red-50
                      text-red-600

                      dark:bg-red-950/40
                      dark:text-red-500
                    "
                  >
                    {uploadData.file ? (
                      <FileVideo className="h-6 w-6" />
                    ) : (
                      <Upload className="h-6 w-6" />
                    )}
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    {uploadData.file
                      ? uploadData.file.name
                      : "Choose a video file"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    MP4, WebM, MOV • Max 100MB
                  </p>

                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    disabled={!isVerified}
                    className="hidden"
                  />

                </label>

                {/* UPLOAD BUTTON */}

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={
                    uploading || !isVerified
                  }
                  className="
                    flex
                    h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-red-600
                    px-5
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-red-600/10
                    transition-all

                    hover:bg-red-500
                    hover:shadow-red-600/20

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <Upload className="h-4 w-4" />

                  {uploading
                    ? `Uploading ${uploadProgress}%`
                    : "Upload Video"}
                </button>

                {/* PROGRESS */}

                {uploading && (
                  <div>

                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">
                        Upload progress
                      </span>

                      <span className="font-bold text-red-600 dark:text-red-500">
                        {uploadProgress}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[#181818]">

                      <div
                        className="
                          h-full
                          rounded-full
                          bg-red-600
                          transition-all
                          duration-200

                          dark:bg-red-500
                        "
                        style={{
                          width: `${uploadProgress}%`,
                        }}
                      />

                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>
        </section>

        {/* ====================================================
            VIDEOS SECTION
        ==================================================== */}

        <section className="mt-12">

          {/* HEADER */}

          <div className="mb-6 flex items-end justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="h-5 w-1 rounded-full bg-red-600 dark:bg-red-500" />

                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-red-600

                    dark:text-red-500
                  "
                >
                  Your Library
                </p>

              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Your videos
              </h2>

            </div>

            <div
              className="
                hidden
                items-center
                gap-2
                rounded-full
                border
                border-slate-200
                bg-white
                px-3
                py-1.5
                text-xs
                font-semibold
                text-slate-500

                dark:border-red-950/40
                dark:bg-[#0b0b0b]
                dark:text-slate-400

                sm:flex
              "
            >
              <FileVideo className="h-3.5 w-3.5 text-red-600 dark:text-red-500" />

              {videos.length}{" "}
              {videos.length === 1
                ? "video"
                : "videos"}
            </div>

          </div>

          {/* LOADING */}

          {loadingVideos && (
            <div
              className="
                grid
                grid-cols-1
                gap-x-5
                gap-y-8

                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {[1, 2, 3, 4, 5, 6].map(
                (item) => (
                  <div
                    key={item}
                    className="animate-pulse"
                  >
                    <div className="aspect-video rounded-2xl bg-slate-200 dark:bg-[#111111]" />

                    <div className="mt-3 h-5 w-4/5 rounded bg-slate-200 dark:bg-[#111111]" />

                    <div className="mt-2 h-4 w-2/5 rounded bg-slate-200 dark:bg-[#111111]" />
                  </div>
                )
              )}
            </div>
          )}

          {/* EMPTY */}

          {!loadingVideos &&
            videos.length === 0 && (
              <div
                className="
                  flex
                  min-h-[360px]
                  flex-col
                  items-center
                  justify-center
                  rounded-3xl
                  border
                  border-dashed
                  border-slate-200
                  bg-white
                  px-6
                  text-center

                  dark:border-red-950/50
                  dark:bg-[#0a0a0a]
                "
              >

                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-slate-100
                    text-slate-400

                    dark:bg-red-950/30
                    dark:text-red-500
                  "
                >
                  <FileVideo className="h-7 w-7" />
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  No videos yet
                </h3>

                <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Your uploaded videos will appear here.
                  Start by uploading your first video above.
                </p>

              </div>
            )}

          {/* VIDEO GRID */}

          {!loadingVideos &&
            videos.length > 0 && (
              <div
                className="
                  grid
                  grid-cols-1
                  gap-x-5
                  gap-y-10

                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >

                {videos.map((video, index) => {

                  const isEditing =
                    editingIndex === index;

                  return (
                    <article
                      key={video.videoId}
                      className="group min-w-0"
                    >

                      {/* VIDEO */}

                      <div
                        className="
                          relative
                          aspect-video
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
                          dark:ring-red-950/50
                          dark:shadow-[0_8px_30px_rgba(220,38,38,0.04)]

                          dark:group-hover:ring-red-700/50
                          dark:group-hover:shadow-[0_15px_45px_rgba(220,38,38,0.12)]
                        "
                      >

                        <video
                          ref={(element) => {
                            videoRefs.current[index] =
                              element;
                          }}
                          preload="metadata"
                          playsInline
                          controls
                          onPlay={() =>
                            handlePlay(index)
                          }
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

                        {/* CATEGORY */}

                        {video.category && (
                          <div
                            className="
                              pointer-events-none
                              absolute
                              left-2.5
                              top-2.5
                              rounded-md
                              bg-black/70
                              px-2
                              py-1
                              text-[10px]
                              font-semibold
                              uppercase
                              tracking-wide
                              text-white
                              backdrop-blur-sm
                            "
                          >
                            {video.category}
                          </div>
                        )}

                      </div>

                      {/* INFORMATION */}

                      {!isEditing ? (
                        <div className="mt-3">

                          <h3
                            className="
                              line-clamp-2
                              text-sm
                              font-bold
                              leading-5
                              text-slate-900

                              dark:text-slate-100
                            "
                          >
                            {video.title}
                          </h3>

                          {video.description && (
                            <p
                              className="
                                mt-1
                                line-clamp-2
                                text-xs
                                leading-5
                                text-slate-500

                                dark:text-slate-400
                              "
                            >
                              {video.description}
                            </p>
                          )}

                          <div
                            className="
                              mt-2
                              flex
                              items-center
                              gap-2
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

                            <span>•</span>

                            <span>
                              {getTimeAgo(
                                video.uploadedAt
                              )}
                            </span>
                          </div>

                          {/* ACTIONS */}

                          <div className="mt-4 flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                startEdit(index)
                              }
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-600
                                transition

                                hover:border-red-200
                                hover:bg-red-50
                                hover:text-red-600

                                dark:border-red-950/50
                                dark:bg-[#0c0c0c]
                                dark:text-slate-400
                                dark:hover:border-red-800
                                dark:hover:bg-red-950/20
                                dark:hover:text-red-500
                              "
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteVideo(
                                  video.videoId
                                )
                              }
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-600
                                transition

                                hover:border-red-200
                                hover:bg-red-50
                                hover:text-red-600

                                dark:border-red-950/50
                                dark:bg-[#0c0c0c]
                                dark:text-slate-400
                                dark:hover:border-red-800
                                dark:hover:bg-red-950/20
                                dark:hover:text-red-500
                              "
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>

                          </div>

                        </div>
                      ) : (

                        /* =================================================
                           EDIT PANEL
                        ================================================= */

                        <div
                          className="
                            mt-3
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50/50
                            p-4

                            dark:border-red-950/60
                            dark:bg-red-950/10
                          "
                        >

                          <div className="mb-3 flex items-center justify-between">

                            <div className="flex items-center gap-2">

                              <Edit3 className="h-4 w-4 text-red-600 dark:text-red-500" />

                              <span className="text-sm font-bold">
                                Edit video
                              </span>

                            </div>

                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="
                                rounded-lg
                                p-1.5
                                text-slate-400
                                transition

                                hover:bg-white
                                hover:text-slate-900

                                dark:hover:bg-[#111]
                                dark:hover:text-white
                              "
                            >
                              <X className="h-4 w-4" />
                            </button>

                          </div>

                          <div className="space-y-3">

                            <input
                              type="text"
                              value={editData.title}
                              onChange={(event) =>
                                setEditData({
                                  ...editData,
                                  title:
                                    event.target.value,
                                })
                              }
                              placeholder="Video title"
                              className="
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                outline-none

                                focus:border-red-500
                                focus:ring-4
                                focus:ring-red-500/10

                                dark:border-red-950/50
                                dark:bg-[#0d0d0d]
                                dark:text-white
                              "
                            />

                            <textarea
                              value={
                                editData.description
                              }
                              onChange={(event) =>
                                setEditData({
                                  ...editData,
                                  description:
                                    event.target.value,
                                })
                              }
                              placeholder="Description"
                              className="
                                min-h-24
                                w-full
                                resize-none
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                outline-none

                                focus:border-red-500
                                focus:ring-4
                                focus:ring-red-500/10

                                dark:border-red-950/50
                                dark:bg-[#0d0d0d]
                                dark:text-white
                              "
                            />

                            <select
                              value={
                                editData.category
                              }
                              onChange={(event) =>
                                setEditData({
                                  ...editData,
                                  category:
                                    event.target.value,
                                })
                              }
                              className="
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                outline-none

                                focus:border-red-500

                                dark:border-red-950/50
                                dark:bg-[#0d0d0d]
                                dark:text-white
                              "
                            >
                              <option value="Other">
                                Other
                              </option>

                              <option value="Entertainment">
                                Entertainment
                              </option>

                              <option value="Education">
                                Education
                              </option>

                              <option value="Gaming">
                                Gaming
                              </option>

                              <option value="Sports">
                                Sports
                              </option>

                              <option value="Technology">
                                Technology
                              </option>

                              <option value="Anime">
                                Anime
                              </option>

                              <option value="AMV">
                                AMV
                              </option>

                              <option value="Music">
                                Music
                              </option>

                              <option value="Sport">
                                Sport
                              </option>
                            </select>

                          </div>

                          {/* EDIT BUTTONS */}

                          <div className="mt-4 flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                saveEdit(
                                  video.videoId
                                )
                              }
                              className="
                                inline-flex
                                flex-1
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-red-600
                                px-4
                                py-2.5
                                text-xs
                                font-bold
                                text-white
                                transition

                                hover:bg-red-500
                              "
                            >
                              <Save className="h-3.5 w-3.5" />
                              Save Changes
                            </button>

                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-4
                                py-2.5
                                text-xs
                                font-bold
                                text-slate-600

                                hover:bg-slate-50

                                dark:border-red-950/50
                                dark:bg-[#0d0d0d]
                                dark:text-slate-400
                                dark:hover:bg-[#151515]
                              "
                            >
                              <X className="h-3.5 w-3.5" />
                              Cancel
                            </button>

                          </div>

                        </div>
                      )}

                    </article>
                  );
                })}

              </div>
            )}

        </section>

      </div>
    </main>
  );
};

export default UserDetails;