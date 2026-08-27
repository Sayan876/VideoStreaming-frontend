import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  Clock3,
  Mail,
  RefreshCw,
  ShieldCheck,
  ArrowLeft,
  LockKeyhole,
} from "lucide-react";

interface User {
  name: string;
  email: string;
  oneName: string;
  verified: boolean;
  profilePicUrl?: string | null;
}

const API_URL =
  "https://perfect-petronille-deltatech-f6802774.koyeb.app";

const VerifyAccount = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  /* ============================================================
     FETCH CURRENT USER
  ============================================================ */

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    try {
      const response = await axios.get<User>(
        `${API_URL}/api/user/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);

      /*
       * If the account is already verified,
       * there is no reason to continue the OTP flow.
       */
      if (response.data.verified) {
        setTimeLeft(0);
      }
    } catch (error) {
      console.error("Cannot fetch user data:", error);

      localStorage.clear();
      navigate("/Login");
    }
  }, [navigate]);

  /* ============================================================
     INITIAL USER CHECK
  ============================================================ */

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /* ============================================================
     COUNTDOWN TIMER
  ============================================================ */

  useEffect(() => {
    if (timeLeft <= 0 || user?.verified) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [timeLeft, user?.verified]);

  /* ============================================================
     FORMAT TIMER
  ============================================================ */

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  /* ============================================================
     OTP INPUT
  ============================================================ */

  const handleOtpChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    /*
     * Only allow numbers.
     * Maximum OTP length = 6.
     */
    const numericValue = value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(numericValue);
    setError("");
  };

  /* ============================================================
     VERIFY OTP
  ============================================================ */

  const handleVerify = async () => {
    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must contain 6 digits.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(
        `${API_URL}/api/verify-otp`,
        null,
        {
          params: {
            otp: otp.trim(),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /*
       * Fetch updated user.
       * This changes user.verified to true.
       */
      await fetchUser();
    } catch (error) {
      console.error("OTP verification failed:", error);

      setError("Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     RESEND OTP
  ============================================================ */

  const handleResend = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/Login");
      return;
    }

    setResending(true);
    setError("");

    try {
      await axios.post(
        `${API_URL}/api/send-otp`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /*
       * Restart 10-minute countdown.
       */
      setTimeLeft(600);

      /*
       * Clear previously entered OTP.
       */
      setOtp("");
    } catch (error) {
      console.error("Failed to resend OTP:", error);

      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (!user) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50
          px-4
          dark:bg-[#050505]
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-6
            py-5
            shadow-xl

            dark:border-red-950/40
            dark:bg-[#0c0c0c]
          "
        >
          <div
            className="
              h-5
              w-5
              animate-spin
              rounded-full
              border-2
              border-slate-200
              border-t-red-600
              dark:border-red-950
              dark:border-t-red-500
            "
          />

          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Checking your account...
          </span>
        </div>
      </main>
    );
  }

  /* ============================================================
     VERIFIED SCREEN
  ============================================================ */

  if (user.verified) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50
          px-4
          py-10

          dark:bg-[#050505]
        "
      >
        <section
          className="
            relative
            w-full
            max-w-md
            overflow-hidden
            rounded-3xl
            border
            border-emerald-200
            bg-white
            p-8
            text-center
            shadow-2xl

            dark:border-emerald-900/40
            dark:bg-[#0b0b0b]
          "
        >
          {/* Decorative glow */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-0
              h-40
              w-40
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-emerald-500/10
              blur-3xl
            "
          />

          {/* Icon */}

          <div
            className="
              relative
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              bg-emerald-100
              ring-8
              ring-emerald-50

              dark:bg-emerald-950/40
              dark:ring-emerald-950/20
            "
          >
            <CheckCircle2
              className="
                h-10
                w-10
                text-emerald-600
                dark:text-emerald-400
              "
            />
          </div>

          {/* Content */}

          <div className="relative mt-7">
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.2em]
                text-emerald-600

                dark:text-emerald-400
              "
            >
              Account Security
            </p>

            <h1
              className="
                mt-2
                text-2xl
                font-extrabold
                tracking-tight
                text-slate-950

                dark:text-white
              "
            >
              Account Verified
            </h1>

            <p
              className="
                mx-auto
                mt-3
                max-w-sm
                text-sm
                leading-6
                text-slate-500

                dark:text-slate-400
              "
            >
              Your MyStream account has been successfully
              verified. You can now upload and manage your
              videos.
            </p>

            {/* User */}

            <div
              className="
                mt-6
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3

                dark:border-red-950/40
                dark:bg-[#111111]
              "
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {user.name}
              </p>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                {user.email}
              </p>
            </div>

            {/* Button */}

            <button
              type="button"
              onClick={() => navigate("/Userdetails")}
              className="
                mt-6
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-red-600
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-red-600/20
                transition-all
                duration-200

                hover:bg-red-500
                hover:shadow-red-600/30
                active:scale-[0.98]
              "
            >
              Go to Profile
            </button>
          </div>
        </section>
      </main>
    );
  }

  /* ============================================================
     OTP VERIFICATION SCREEN
  ============================================================ */

  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-50
        px-4
        py-10

        dark:bg-[#050505]
      "
    >
      <section
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-2xl

          dark:border-red-950/50
          dark:bg-[#0b0b0b]
        "
      >
        {/* ======================================================
            TOP ACCENT
        ====================================================== */}

        <div
          className="
            h-1
            w-full
            bg-gradient-to-r
            from-red-700
            via-red-500
            to-red-700
          "
        />

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <div className="p-6 sm:p-8">
          {/* Back */}

          <button
            type="button"
            onClick={() => navigate("/Userdetails")}
            className="
              mb-7
              flex
              items-center
              gap-2
              text-xs
              font-semibold
              text-slate-500
              transition-colors

              hover:text-red-600

              dark:text-slate-500
              dark:hover:text-red-500
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </button>

          {/* Icon */}

          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-red-50
              ring-1
              ring-red-100

              dark:bg-red-950/30
              dark:ring-red-900/40
            "
          >
            <ShieldCheck
              className="
                h-8
                w-8
                text-red-600

                dark:text-red-500
              "
            />
          </div>

          {/* Heading */}

          <div className="mt-6">
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.2em]
                text-red-600

                dark:text-red-500
              "
            >
              Secure your account
            </p>

            <h1
              className="
                mt-2
                text-2xl
                font-extrabold
                tracking-tight
                text-slate-950

                dark:text-white
              "
            >
              Verify Your Account
            </h1>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-500

                dark:text-slate-400
              "
            >
              We've sent a verification code to your
              registered email address.
            </p>
          </div>

          {/* Email */}

          <div
            className="
              mt-6
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-4

              dark:border-red-950/40
              dark:bg-[#111111]
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-white
                text-red-600
                shadow-sm

                dark:bg-[#181818]
                dark:text-red-500
              "
            >
              <Mail className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-400">
                Verification email
              </p>

              <p
                className="
                  truncate
                  text-sm
                  font-semibold
                  text-slate-800

                  dark:text-slate-200
                "
              >
                {user.email}
              </p>
            </div>
          </div>

          {/* ====================================================
              OTP INPUT
          ==================================================== */}

          <div className="mt-7">
            <label
              htmlFor="otp"
              className="
                mb-2
                block
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-slate-600

                dark:text-slate-400
              "
            >
              Enter verification code
            </label>

            <div className="relative">
              <LockKeyhole
                className="
                  absolute
                  left-4
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400

                  dark:text-slate-600
                "
              />

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                disabled={loading}
                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  py-4
                  pl-11
                  pr-4
                  text-center
                  text-xl
                  font-bold
                  tracking-[0.5em]
                  text-slate-950
                  outline-none
                  transition-all

                  placeholder:text-slate-300
                  placeholder:tracking-[0.5em]

                  focus:border-red-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-red-500/10

                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  dark:border-red-950/50
                  dark:bg-[#111111]
                  dark:text-white
                  dark:placeholder:text-slate-700

                  dark:focus:border-red-600
                  dark:focus:bg-[#151515]
                  dark:focus:ring-red-600/10
                "
              />
            </div>

            {/* Error */}

            {error && (
              <p
                className="
                  mt-2
                  text-xs
                  font-medium
                  text-red-600

                  dark:text-red-400
                "
              >
                {error}
              </p>
            )}
          </div>

          {/* ====================================================
              VERIFY BUTTON
          ==================================================== */}

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-red-600
              px-5
              py-3.5
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-red-600/20
              transition-all
              duration-200

              hover:bg-red-500
              hover:shadow-red-600/30

              active:scale-[0.98]

              disabled:cursor-not-allowed
              disabled:bg-slate-300
              disabled:shadow-none

              dark:disabled:bg-red-950
              dark:disabled:text-red-700
            "
          >
            {loading ? (
              <>
                <div
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/30
                    border-t-white
                  "
                />

                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Verify Account
              </>
            )}
          </button>

          {/* ====================================================
              TIMER
          ==================================================== */}

          <div
            className="
              mt-6
              flex
              items-center
              justify-center
              gap-2
              text-xs
              text-slate-500

              dark:text-slate-500
            "
          >
            <Clock3 className="h-3.5 w-3.5" />

            {timeLeft > 0 ? (
              <span>
                New OTP available in{" "}
                <strong
                  className="
                    font-bold
                    text-slate-700

                    dark:text-slate-300
                  "
                >
                  {formatTime(timeLeft)}
                </strong>
              </span>
            ) : (
              <span>You can request a new OTP now</span>
            )}
          </div>

          {/* ====================================================
              RESEND
          ==================================================== */}

          <button
            type="button"
            onClick={handleResend}
            disabled={timeLeft > 0 || resending}
            className="
              mx-auto
              mt-4
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-red-600
              transition-all

              hover:text-red-500

              disabled:cursor-not-allowed
              disabled:text-slate-300

              dark:text-red-500
              dark:hover:text-red-400
              dark:disabled:text-slate-700
            "
          >
            <RefreshCw
              className={`h-4 w-4 ${
                resending ? "animate-spin" : ""
              }`}
            />

            {resending ? "Sending..." : "Resend OTP"}
          </button>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div
          className="
            border-t
            border-slate-200
            bg-slate-50
            px-6
            py-4
            text-center

            dark:border-red-950/40
            dark:bg-[#080808]
          "
        >
          <p
            className="
              text-[11px]
              text-slate-400

              dark:text-slate-600
            "
          >
            MyStream • Account verification
          </p>
        </div>
      </section>
    </main>
  );
};

export default VerifyAccount;