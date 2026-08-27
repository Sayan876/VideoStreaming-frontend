import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router";

import {
  User,
  Mail,
  MapPin,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
  Camera,
  Trash2,
  Pencil,
  Lock,
  KeyRound,
  X,
  Check,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Upload,
  UserRound,
} from "lucide-react";

// ============================================================
// Types
// ============================================================

interface UserData {
  id: number | string;
  name: string;
  oneName: string;
  email: string;
  country?: string;
  biodetails?: string;
  profilePicUrl?: string | null;
  verified: boolean;
  accountCreatedAt: string;
}

interface ProfileEditData {
  name: string;
  country: string;
  biodetails: string;
}

interface Crop {
  x: number;
  y: number;
}

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================================
// Component
// ============================================================

const AccountSettings: React.FC = () => {
  const api =
    "https://perfect-petronille-deltatech-f6802774.koyeb.app";

  const navigate = useNavigate();

  // ==========================================================
  // User
  // ==========================================================

  const [user, setUser] = useState<UserData | null>(null);

  // ==========================================================
  // Profile picture
  // ==========================================================

  const [profileFile, setProfileFile] =
    useState<File | null>(null);

  const [profileUploading, setProfileUploading] =
    useState<boolean>(false);

  const [profileUploadProgress, setProfileUploadProgress] =
    useState<number>(0);

  // ==========================================================
  // Cropper
  // ==========================================================

  const [showCropper, setShowCropper] =
    useState<boolean>(false);

  const [imageSrc, setImageSrc] =
    useState<string | null>(null);

  const [crop, setCrop] = useState<Crop>({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState<number>(1);

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<CroppedAreaPixels | null>(null);

  // ==========================================================
  // Profile editing
  // ==========================================================

  const [showProfileEdit, setShowProfileEdit] =
    useState<boolean>(false);

  const [profileEditData, setProfileEditData] =
    useState<ProfileEditData>({
      name: "",
      country: "",
      biodetails: "",
    });

  const [profileSaving, setProfileSaving] =
    useState<boolean>(false);

  // ==========================================================
  // Password
  // ==========================================================

  const [showPasswordModal, setShowPasswordModal] =
    useState<boolean>(false);

  const [oldPassword, setOldPassword] =
    useState<string>("");

  const [newPassword, setNewPassword] =
    useState<string>("");

  const [confirmPassword, setConfirmPassword] =
    useState<string>("");

  const [passwordSaving, setPasswordSaving] =
    useState<boolean>(false);

  const [showOldPassword, setShowOldPassword] =
    useState<boolean>(false);

  const [showNewPassword, setShowNewPassword] =
    useState<boolean>(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  // ==========================================================
  // Delete account
  // ==========================================================

  const [showDeleteModal, setShowDeleteModal] =
    useState<boolean>(false);

  const [confirmText, setConfirmText] =
    useState<string>("");

  const [deletingAccount, setDeletingAccount] =
    useState<boolean>(false);

  // ==========================================================
  // General
  // ==========================================================

  const [loading, setLoading] =
    useState<boolean>(true);

  const imageUrlRef =
    useRef<string | null>(null);

  // ==========================================================
  // Fetch authenticated user
  // ==========================================================

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    try {
      const response = await axios.get<UserData>(
        `${api}/api/user/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
    } catch (error) {
      console.error("Cannot fetch user:", error);

      localStorage.clear();
      navigate("/Login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ==========================================================
  // Authentication + JWT expiry
  // ==========================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    try {
      const decoded = jwtDecode<{ exp: number }>(token);

      const expiryTime =
        decoded.exp * 1000 - Date.now();

      if (expiryTime <= 0) {
        localStorage.clear();
        navigate("/Login");
        return;
      }

      const timer = setTimeout(() => {
        localStorage.clear();
        navigate("/Login");
      }, expiryTime);

      fetchUser();

      return () => clearTimeout(timer);
    } catch (error) {
      console.error(error);

      localStorage.clear();
      navigate("/Login");
    }
  }, [navigate, fetchUser]);

  // ==========================================================
  // Profile image selection
  // ==========================================================

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Profile image must be smaller than 10MB.");
      return;
    }

    const objectUrl =
      URL.createObjectURL(file);

    imageUrlRef.current = objectUrl;

    setImageSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setShowCropper(true);

    event.target.value = "";
  };

  // ==========================================================
  // Crop complete
  // ==========================================================

  const onCropComplete = useCallback(
    (
      _croppedArea: unknown,
      croppedPixels: CroppedAreaPixels
    ) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  // ==========================================================
  // Create cropped image
  // ==========================================================

  const getCroppedImg = async (
    source: string,
    cropData: CroppedAreaPixels
  ): Promise<File> => {
    const image = new Image();

    image.src = source;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();

      image.onerror = () =>
        reject(
          new Error("Failed to load image.")
        );
    });

    const canvas =
      document.createElement("canvas");

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Canvas is not supported."
      );
    }

    canvas.width = cropData.width;
    canvas.height = cropData.height;

    ctx.drawImage(
      image,
      cropData.x,
      cropData.y,
      cropData.width,
      cropData.height,
      0,
      0,
      cropData.width,
      cropData.height
    );

    return new Promise<File>(
      (resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                new Error(
                  "Could not create cropped image."
                )
              );
              return;
            }

            const file = new File(
              [blob],
              "profile-picture.jpg",
              {
                type: "image/jpeg",
              }
            );

            resolve(file);
          },
          "image/jpeg",
          0.92
        );
      }
    );
  };

  // ==========================================================
  // Confirm crop
  // ==========================================================

  const handleCropConfirm = async () => {
    if (
      !imageSrc ||
      !croppedAreaPixels
    ) {
      return;
    }

    try {
      const croppedImage =
        await getCroppedImg(
          imageSrc,
          croppedAreaPixels
        );

      setProfileFile(croppedImage);
      setShowCropper(false);

      if (imageUrlRef.current) {
        URL.revokeObjectURL(
          imageUrlRef.current
        );

        imageUrlRef.current = null;
      }

      setImageSrc(null);
    } catch (error) {
      console.error(
        "Cropping failed:",
        error
      );

      alert("Failed to crop image.");
    }
  };

  // ==========================================================
  // Cancel crop
  // ==========================================================

  const handleCropCancel = () => {
    setShowCropper(false);
    setProfileFile(null);

    if (imageUrlRef.current) {
      URL.revokeObjectURL(
        imageUrlRef.current
      );

      imageUrlRef.current = null;
    }

    setImageSrc(null);
  };

  // ==========================================================
  // Upload profile picture
  // ==========================================================

  const uploadProfilePic = async () => {
    if (!profileFile) {
      alert(
        "Please choose and crop a profile picture first."
      );

      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    try {
      setProfileUploading(true);
      setProfileUploadProgress(0);

      const formData = new FormData();

      formData.append(
        "profilePic",
        profileFile
      );

      await axios.patch(
        `${api}/api/user/profile-pic`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          onUploadProgress: (event) => {
            if (!event.total) return;

            const progress = Math.round(
              (event.loaded * 100) /
                event.total
            );

            setProfileUploadProgress(
              progress
            );
          },
        }
      );

      await fetchUser();

      setProfileFile(null);

      alert(
        "Profile picture updated successfully!"
      );
    } catch (error) {
      console.error(
        "Error uploading profile picture:",
        error
      );

      alert(
        "Failed to upload profile picture. Please try again."
      );
    } finally {
      setProfileUploading(false);
      setProfileUploadProgress(0);
    }
  };

  // ==========================================================
  // Delete profile picture
  // ==========================================================

  const deleteProfilePic = async () => {
    if (!user?.profilePicUrl) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete your profile picture?"
      );

    if (!confirmed) return;

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    try {
      await axios.delete(
        `${api}/api/user/profile-pic`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchUser();

      alert("Profile picture deleted.");
    } catch (error) {
      console.error(
        "Error deleting profile picture:",
        error
      );

      alert(
        "Failed to delete profile picture."
      );
    }
  };

  // ==========================================================
  // Edit profile
  // ==========================================================

  const openProfileEdit = () => {
    if (!user) return;

    setProfileEditData({
      name: user.name || "",
      country: user.country || "",
      biodetails:
        user.biodetails || "",
    });

    setShowProfileEdit(true);
  };

  const saveProfileChanges = async () => {
    if (!profileEditData.name.trim()) {
      alert("Name cannot be empty.");
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    try {
      setProfileSaving(true);

      const formData = new FormData();

      formData.append(
        "name",
        profileEditData.name.trim()
      );

      formData.append(
        "country",
        profileEditData.country
      );

      formData.append(
        "biodetails",
        profileEditData.biodetails.trim()
      );

      await axios.patch(
        `${api}/api/user/details`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchUser();

      setShowProfileEdit(false);

      alert(
        "Profile details updated successfully!"
      );
    } catch (error) {
      console.error(
        "Error updating profile:",
        error
      );

      alert(
        "Failed to update profile details."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // ==========================================================
  // Password
  // ==========================================================

  const openPasswordModal = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    if (passwordSaving) return;

    setShowPasswordModal(false);
  };

  const saveNewPassword = async () => {
    if (
      !oldPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      alert(
        "Please fill all password fields."
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      alert(
        "New passwords do not match."
      );

      return;
    }

    if (newPassword.length < 6) {
      alert(
        "New password must contain at least 6 characters."
      );

      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    try {
      setPasswordSaving(true);

      await axios.patch(
        `${api}/api/user/updatePassword`,
        null,
        {
          params: {
            oldPassword,
            newPassword,
          },

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        "Password updated successfully!"
      );

      setShowPasswordModal(false);

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error(
        "Error updating password:",
        error
      );

      if (
        error?.response?.status === 400
      ) {
        alert(
          "Old password is incorrect."
        );
      } else {
        alert(
          "Failed to update password. Please try again."
        );
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  // ==========================================================
  // Verification
  // ==========================================================

  const handleVerifyClick =
    async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/Login");
        return;
      }

      try {
        await axios.post(
          `${api}/api/send-otp`,
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        navigate("/verify-account");
      } catch (error) {
        console.error(
          "Failed to send OTP:",
          error
        );

        alert(
          "Failed to send verification OTP. Please check your email."
        );
      }
    };

  // ==========================================================
  // Delete account
  // ==========================================================

  const deleteAccount = async () => {
    if (
      confirmText !==
      "DeleteMyAccount"
    ) {
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    try {
      setDeletingAccount(true);

      await axios.delete(
        `${api}/api/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        "Your account has been deleted successfully."
      );

      localStorage.clear();

      navigate("/Login");

      window.location.reload();
    } catch (error) {
      console.error(
        "Error deleting account:",
        error
      );

      alert(
        "Failed to delete account. Please try again later."
      );

      setDeletingAccount(false);
    }
  };

  // ==========================================================
  // Date formatting
  // ==========================================================

  const formatAccountDate = (
    dateString?: string
  ) => {
    if (!dateString) return "Unknown";

    const date = new Date(
      dateString
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================================
  // Loading
  // ==========================================================

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-neutral-900 transition-colors dark:bg-[#080808] dark:text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-300 border-t-red-500 dark:border-neutral-700 dark:border-t-red-500" />

          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Loading account...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // Profile image
  // ==========================================================

  const profileImage =
    user.profilePicUrl
      ? `${user.profilePicUrl}?t=${Date.now()}`
      : null;

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-50 px-4 py-8 text-neutral-900 transition-colors dark:bg-[#080808] dark:text-white sm:px-6 lg:px-10">

      {/* ======================================================
          Background
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-red-500/5 blur-[140px] dark:bg-red-600/5" />

        <div className="absolute bottom-[-250px] right-[-150px] h-[500px] w-[500px] rounded-full bg-red-500/5 blur-[150px] dark:bg-red-500/5" />
      </div>

      {/* ======================================================
          Main
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-5xl">

        {/* ====================================================
            Header
        ==================================================== */}

        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
            Account
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Account Settings
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500 dark:text-neutral-500">
            Manage your profile, security and account
            preferences.
          </p>
        </div>

        {/* ====================================================
            Profile Card
        ==================================================== */}

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-neutral-200/40 transition-colors dark:border-neutral-800/80 dark:bg-[#101010]/90 dark:shadow-black/30">

          {/* Red accent */}

          <div className="h-1 w-full bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

          <div className="p-6 sm:p-8">

            {/* =================================================
                Profile top
            ================================================= */}

            <div className="flex flex-col gap-7 sm:flex-row sm:items-center">

              {/* Profile picture */}

              <div className="flex justify-center sm:justify-start">
                <div className="relative h-32 w-32">

                  {/* ============================================
                      UPLOAD PROGRESS CIRCLE
                  ============================================ */}

                  {profileUploading && (
                    <>
                      <svg
                        className="absolute inset-[-7px] h-[142px] w-[142px] -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        {/* Background ring */}

                        <circle
                          cx="50"
                          cy="50"
                          r="46"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-neutral-200 dark:text-neutral-800"
                        />

                        {/* Progress ring */}

                        <circle
                          cx="50"
                          cy="50"
                          r="46"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          className="text-red-500 transition-all duration-300"
                          strokeDasharray={
                            2 * Math.PI * 46
                          }
                          strokeDashoffset={
                            2 *
                            Math.PI *
                            46 *
                            (1 -
                              profileUploadProgress /
                                100)
                          }
                        />
                      </svg>

                      {/* Percentage */}

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-neutral-900 shadow-lg backdrop-blur-sm dark:bg-black/75 dark:text-white">
                          {profileUploadProgress}%
                        </div>
                      </div>
                    </>
                  )}

                  {/* Image */}

                  <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100 shadow-xl shadow-neutral-200/40 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-black/40">

                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-500 to-red-700 text-4xl font-bold text-white dark:from-red-600 dark:to-red-900">
                        {user.name
                          ?.charAt(0)
                          .toUpperCase() ||
                          "U"}
                      </div>
                    )}

                  </div>

                  {/* Camera */}

                  {!profileUploading && (
                    <label
                      htmlFor="profileUpload"
                      className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-red-600 text-white shadow-lg shadow-red-900/20 transition hover:scale-105 hover:bg-red-500 dark:border-[#101010]"
                      title="Change profile picture"
                    >
                      <Camera size={17} />
                    </label>
                  )}

                  <input
                    id="profileUpload"
                    type="file"
                    accept="image/*"
                    onChange={
                      handleFileChange
                    }
                    className="hidden"
                    disabled={
                      profileUploading
                    }
                  />
                </div>
              </div>

              {/* =================================================
                  User information
              ================================================= */}

              <div className="min-w-0 flex-1 text-center sm:text-left">

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                  <h2 className="truncate text-2xl font-bold text-neutral-900 dark:text-white">
                    {user.name}
                  </h2>

                  {user.verified ? (
                    <span className="mx-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400 sm:mx-0">
                      <ShieldCheck size={13} />
                      Verified
                    </span>
                  ) : (
                    <span className="mx-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-600 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400 sm:mx-0">
                      <ShieldAlert size={13} />
                      Unverified
                    </span>
                  )}

                </div>

                <p className="mt-1 text-sm text-neutral-500">
                  @{user.oneName}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400 sm:justify-start">

                  <span className="inline-flex items-center gap-2">
                    <Mail
                      size={15}
                      className="text-neutral-400 dark:text-neutral-600"
                    />

                    {user.email}
                  </span>

                  {user.country && (
                    <span className="inline-flex items-center gap-2">
                      <MapPin
                        size={15}
                        className="text-neutral-400 dark:text-neutral-600"
                      />

                      {user.country}
                    </span>
                  )}

                </div>

              </div>
            </div>

            {/* =================================================
                Selected file actions
            ================================================= */}

            {profileFile &&
              !profileUploading && (
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500">
                      <Upload size={16} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        New profile picture selected
                      </p>

                      <p className="text-xs text-neutral-500">
                        Ready to upload
                      </p>
                    </div>

                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={
                        uploadProfilePic
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
                    >
                      <Upload size={15} />
                      Upload
                    </button>

                    <button
                      onClick={() =>
                        setProfileFile(
                          null
                        )
                      }
                      className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      Cancel
                    </button>

                  </div>
                </div>
              )}

            {/* =================================================
                Profile info
            ================================================= */}

            <div className="mt-8 grid gap-4 border-t border-neutral-200 pt-7 dark:border-neutral-800 sm:grid-cols-3">

              {/* Username */}

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition-colors dark:border-neutral-800 dark:bg-neutral-900/40">

                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  <User size={17} />
                </div>

                <p className="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                  Username
                </p>

                <p className="mt-1 truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  @{user.oneName}
                </p>
              </div>

              {/* Member since */}

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition-colors dark:border-neutral-800 dark:bg-neutral-900/40">

                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  <CalendarDays size={17} />
                </div>

                <p className="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                  Member Since
                </p>

                <p className="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {formatAccountDate(
                    user.accountCreatedAt
                  )}
                </p>
              </div>

              {/* Status */}

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition-colors dark:border-neutral-800 dark:bg-neutral-900/40">

                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  <ShieldCheck size={17} />
                </div>

                <p className="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                  Account Status
                </p>

                <p
                  className={`mt-1 text-sm font-medium ${
                    user.verified
                      ? "text-green-600 dark:text-green-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {user.verified
                    ? "Verified"
                    : "Verification required"}
                </p>
              </div>
            </div>

            {/* =================================================
                About
            ================================================= */}

            <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/40">

              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                About Me
              </p>

              <p className="text-sm leading-7 text-neutral-500 dark:text-neutral-400">
                {user.biodetails?.trim()
                  ? user.biodetails
                  : "You haven't added an introduction yet."}
              </p>
            </div>

            {/* =================================================
                Actions
            ================================================= */}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              <button
                onClick={
                  openProfileEdit
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
              >
                <Pencil size={16} />
                Edit Profile
              </button>

              <button
                onClick={
                  openPasswordModal
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
              >
                <KeyRound size={16} />
                Change Password
              </button>
            </div>

            {/* =================================================
                Delete profile picture
            ================================================= */}

            {user.profilePicUrl && (
              <button
                onClick={
                  deleteProfilePic
                }
                disabled={
                  profileUploading
                }
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 dark:hover:border-red-700/50 dark:hover:bg-red-950/40"
              >
                <Trash2 size={16} />
                Delete Profile Picture
              </button>
            )}
          </div>
        </section>

        {/* ====================================================
            Verification
        ==================================================== */}

        {!user.verified && (
          <section className="mt-6 rounded-3xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-500/20 dark:bg-yellow-500/[0.03] sm:p-7">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400">
                  <ShieldAlert size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    Verify your account
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Verify your email address to unlock
                    account features such as video uploads.
                  </p>
                </div>
              </div>

              <button
                onClick={
                  handleVerifyClick
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
              >
                <ShieldCheck size={16} />
                Verify Account
              </button>
            </div>
          </section>
        )}

        {/* ====================================================
            Danger Zone
        ==================================================== */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-[#100909]">

          <div className="border-b border-red-200 px-6 py-5 dark:border-red-900/30 sm:px-7">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500">
                <AlertTriangle size={18} />
              </div>

              <div>
                <h2 className="font-semibold text-red-600 dark:text-red-400">
                  Danger Zone
                </h2>

                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-600">
                  Actions here can permanently affect your account.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">

            <div>
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Delete your account
              </h3>

              <p className="mt-1 max-w-xl text-sm leading-6 text-neutral-500">
                Permanently delete your account and associated
                data. This action cannot be undone.
              </p>
            </div>

            <button
              onClick={() => {
                setConfirmText("");
                setShowDeleteModal(
                  true
                );
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-100 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-200 dark:border-red-800/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </section>

        {/* Footer */}

        <p className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-700">
          Manage your account securely.
        </p>
      </div>

      {/* ======================================================
          CROP MODAL
      ====================================================== */}

      {showCropper && imageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md dark:bg-black/85">

          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#111111]">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">

              <div>
                <h2 className="font-semibold text-neutral-900 dark:text-white">
                  Crop Profile Picture
                </h2>

                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-600">
                  Position your image inside the circle.
                </p>
              </div>

              <button
                onClick={
                  handleCropCancel
                }
                className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {/* Crop area */}

            <div className="relative h-[330px] w-full bg-black sm:h-[400px]">

              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={
                  setCrop
                }
                onZoomChange={
                  setZoom
                }
                onCropComplete={
                  onCropComplete
                }
              />
            </div>

            {/* Controls */}

            <div className="space-y-5 p-5">

              <div>
                <div className="mb-2 flex justify-between text-xs text-neutral-500">

                  <span>Zoom</span>

                  <span>
                    {zoom.toFixed(1)}x
                  </span>
                </div>

                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(event) =>
                    setZoom(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="w-full accent-red-500"
                />
              </div>

              <div className="flex gap-3">

                <button
                  onClick={
                    handleCropCancel
                  }
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleCropConfirm
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  <Check size={16} />
                  Crop & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          EDIT PROFILE MODAL
      ====================================================== */}

      {showProfileEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md dark:bg-black/80">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#111111]">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">

              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Edit Profile
                </h2>

                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-600">
                  Update your public profile information.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowProfileEdit(
                    false
                  )
                }
                className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {/* Form */}

            <div className="space-y-5 p-6">

              {/* Name */}

              <div>
                <label className="mb-2 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Full Name
                </label>

                <div className="relative">

                  <UserRound
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-600"
                  />

                  <input
                    type="text"
                    value={
                      profileEditData.name
                    }
                    onChange={(event) =>
                      setProfileEditData({
                        ...profileEditData,
                        name: event.target
                          .value,
                      })
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-10 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-700"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Country */}

              <div>
                <label className="mb-2 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Country
                </label>

                <div className="relative">

                  <MapPin
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-600"
                  />

                  <select
                    value={
                      profileEditData.country
                    }
                    onChange={(event) =>
                      setProfileEditData({
                        ...profileEditData,
                        country:
                          event.target
                            .value,
                      })
                    }
                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-10 py-3 text-sm text-neutral-900 outline-none transition focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  >
                    <option value="">
                      Select your country
                    </option>

                    {[
                      "Afghanistan",
                      "Albania",
                      "Algeria",
                      "Argentina",
                      "Australia",
                      "Austria",
                      "Bangladesh",
                      "Belgium",
                      "Brazil",
                      "Canada",
                      "China",
                      "Denmark",
                      "Egypt",
                      "Finland",
                      "France",
                      "Germany",
                      "Greece",
                      "India",
                      "Indonesia",
                      "Ireland",
                      "Israel",
                      "Italy",
                      "Japan",
                      "Malaysia",
                      "Maldives",
                      "Mexico",
                      "Nepal",
                      "Netherlands",
                      "New Zealand",
                      "Nigeria",
                      "Norway",
                      "Pakistan",
                      "Philippines",
                      "Poland",
                      "Portugal",
                      "Qatar",
                      "Russia",
                      "Saudi Arabia",
                      "Singapore",
                      "South Africa",
                      "South Korea",
                      "Spain",
                      "Sri Lanka",
                      "Sweden",
                      "Switzerland",
                      "Thailand",
                      "Turkey",
                      "United Arab Emirates",
                      "United Kingdom",
                      "United States",
                      "Vietnam",
                      "Zimbabwe",
                    ].map(
                      (country) => (
                        <option
                          key={country}
                          value={country}
                        >
                          {country}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Bio */}

              <div>
                <label className="mb-2 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  About Me
                </label>

                <textarea
                  value={
                    profileEditData.biodetails
                  }
                  onChange={(event) =>
                    setProfileEditData({
                      ...profileEditData,
                      biodetails:
                        event.target
                          .value,
                    })
                  }
                  rows={5}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-700"
                  placeholder="Tell people a little about yourself..."
                />

                <p className="mt-1 text-right text-xs text-neutral-400 dark:text-neutral-700">
                  {
                    profileEditData
                      .biodetails
                      .length
                  }
                  /500
                </p>
              </div>

              {/* Buttons */}

              <div className="flex gap-3 pt-2">

                <button
                  onClick={() =>
                    setShowProfileEdit(
                      false
                    )
                  }
                  disabled={
                    profileSaving
                  }
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    saveProfileChanges
                  }
                  disabled={
                    profileSaving ||
                    !profileEditData.name.trim()
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {profileSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          PASSWORD MODAL
      ====================================================== */}

      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md dark:bg-black/80">

          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#111111]">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">

              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Change Password
                </h2>

                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-600">
                  Keep your account secure.
                </p>
              </div>

              <button
                onClick={
                  closePasswordModal
                }
                className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-6">

              {/* Current */}

              <div className="relative">

                <Lock
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-600"
                />

                <input
                  type={
                    showOldPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Current Password"
                  value={
                    oldPassword
                  }
                  onChange={(event) =>
                    setOldPassword(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-10 py-3 pr-12 text-sm text-neutral-900 outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowOldPassword(
                      !showOldPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:text-neutral-600 dark:hover:text-neutral-300"
                >
                  {showOldPassword ? (
                    <EyeOff
                      size={17}
                    />
                  ) : (
                    <Eye
                      size={17}
                    />
                  )}
                </button>
              </div>

              {/* New */}

              <div className="relative">

                <KeyRound
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-600"
                />

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="New Password"
                  value={
                    newPassword
                  }
                  onChange={(event) =>
                    setNewPassword(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-10 py-3 pr-12 text-sm text-neutral-900 outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:text-neutral-600 dark:hover:text-neutral-300"
                >
                  {showNewPassword ? (
                    <EyeOff
                      size={17}
                    />
                  ) : (
                    <Eye
                      size={17}
                    />
                  )}
                </button>
              </div>

              {/* Confirm */}

              <div className="relative">

                <KeyRound
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-600"
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm New Password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target
                        .value
                    )
                  }
                  className={`w-full rounded-xl border bg-neutral-50 px-10 py-3 pr-12 text-sm text-neutral-900 outline-none transition focus:ring-2 dark:bg-neutral-900 dark:text-white ${
                    confirmPassword &&
                    newPassword !==
                      confirmPassword
                      ? "border-red-500/60 focus:ring-red-500/10"
                      : "border-neutral-200 focus:border-red-500/60 focus:ring-red-500/10 dark:border-neutral-800"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:text-neutral-600 dark:hover:text-neutral-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      size={17}
                    />
                  ) : (
                    <Eye
                      size={17}
                    />
                  )}
                </button>
              </div>

              {/* Mismatch */}

              {confirmPassword &&
                newPassword !==
                  confirmPassword && (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    Passwords do not match.
                  </p>
                )}

              {/* Buttons */}

              <div className="flex gap-3 pt-3">

                <button
                  onClick={
                    closePasswordModal
                  }
                  disabled={
                    passwordSaving
                  }
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    saveNewPassword
                  }
                  disabled={
                    passwordSaving ||
                    !oldPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !==
                      confirmPassword
                  }
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {passwordSaving
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          DELETE ACCOUNT MODAL
      ====================================================== */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md dark:bg-black/85">

          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-red-200 bg-white shadow-2xl shadow-red-900/10 dark:border-red-900/40 dark:bg-[#110909] dark:shadow-red-950/20">

            {/* Warning */}

            <div className="flex justify-center pt-7">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500">
                <AlertTriangle
                  size={26}
                />
              </div>
            </div>

            <div className="px-6 pb-6 pt-5 text-center">

              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Delete Account?
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                This action is permanent. Your account
                and associated data may be permanently
                removed.
              </p>

              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-left dark:border-red-900/30 dark:bg-red-950/20">

                <p className="text-xs text-neutral-500">
                  Type the following phrase to confirm:
                </p>

                <p className="mt-2 font-mono text-sm font-bold text-red-500 dark:text-red-400">
                  DeleteMyAccount
                </p>
              </div>

              <input
                type="text"
                value={confirmText}
                onChange={(event) =>
                  setConfirmText(
                    event.target
                      .value
                  )
                }
                placeholder="Type confirmation phrase"
                className="mt-4 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10 dark:border-neutral-800 dark:bg-black/40 dark:text-white dark:placeholder:text-neutral-700"
              />

              <div className="mt-5 flex gap-3">

                <button
                  onClick={() =>
                    setShowDeleteModal(
                      false
                    )
                  }
                  disabled={
                    deletingAccount
                  }
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    deleteAccount
                  }
                  disabled={
                    confirmText !==
                      "DeleteMyAccount" ||
                    deletingAccount
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {deletingAccount ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2
                        size={16}
                      />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;