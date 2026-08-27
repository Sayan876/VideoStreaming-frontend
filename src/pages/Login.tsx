import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

interface JwtPayload {
  exp: number;
}

/* ============================================================
   API
============================================================ */

const API_URL =
  "https://perfect-petronille-deltatech-f6802774.koyeb.app";

/* ============================================================
   COMPONENT
============================================================ */

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ==========================================================
     CHECK EXISTING LOGIN
  ========================================================== */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      const isExpired =
        decoded.exp * 1000 < Date.now();

      if (!isExpired) {
        navigate("/Userdetials");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("isLoggedIn");
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
    }
  }, [navigate]);

  /* ==========================================================
     LOGIN
  ========================================================== */

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post<string>(
        `${API_URL}/api/auth/login`,
        {
          email: email.trim(),
          password,
        }
      );

      const token = response.data;

      if (!token) {
        throw new Error("No token received");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("isLoggedIn", "true");

      navigate("/Userdetails");

      window.location.reload();
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     JSX
  ========================================================== */

  return (
    <main
      className="
        flex
        min-h-[calc(100vh-4rem)]
        items-center
        justify-center
        bg-[#f8f8f8]
        px-4
        py-12
        text-slate-900
        transition-colors
        duration-300

        dark:bg-[#0b0b0b]
        dark:text-white
      "
    >
      <div className="w-full max-w-[420px]">

        {/* ====================================================
            LOGIN CARD
        ==================================================== */}

        <section
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-6
            py-8
            shadow-[0_8px_30px_rgba(0,0,0,0.06)]

            sm:px-8
            sm:py-9

            dark:border-[#2b2b2b]
            dark:bg-[#121212]
            dark:shadow-[0_10px_35px_rgba(0,0,0,0.35)]
          "
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="text-center">

            {/* LOGO MARK */}

            <div
              className="
                mx-auto
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-red-600
                text-white
              "
            >
              <LogIn className="h-[19px] w-[19px]" />
            </div>

            <h1
              className="
                mt-5
                text-[25px]
                font-semibold
                tracking-[-0.02em]
                text-slate-900

                dark:text-white
              "
            >
              Sign in
            </h1>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500

                dark:text-[#9a9a9a]
              "
            >
              Sign in to continue to{" "}
              <span
                className="
                  font-medium
                  text-slate-800

                  dark:text-[#d5d5d5]
                "
              >
                My
                <span className="text-red-500">
                  Stream
                </span>
              </span>
            </p>

          </div>

          {/* ==================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >

            {/* =================================================
                EMAIL
            ================================================= */}

            <div>

              <label
                htmlFor="email"
                className="
                  mb-2
                  block
                  text-[13px]
                  font-medium
                  text-slate-700

                  dark:text-[#d0d0d0]
                "
              >
                Email address
              </label>

              <div
                className="
                  flex
                  h-11
                  items-center
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  transition-all
                  duration-200

                  hover:border-slate-400

                  focus-within:border-red-500
                  focus-within:ring-1
                  focus-within:ring-red-500

                  dark:border-[#3a3a3a]
                  dark:bg-[#181818]

                  dark:hover:border-[#555555]

                  dark:focus-within:border-red-500
                  dark:focus-within:ring-red-500/40
                "
              >

                <Mail
                  className="
                    ml-3.5
                    h-[17px]
                    w-[17px]
                    shrink-0
                    text-slate-400

                    dark:text-[#777777]
                  "
                />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  required
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    px-3
                    text-sm
                    text-slate-900
                    outline-none

                    placeholder:text-slate-400

                    dark:text-white
                    dark:placeholder:text-[#666666]
                  "
                />

              </div>

            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div>

              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                "
              >

                <label
                  htmlFor="password"
                  className="
                    text-[13px]
                    font-medium
                    text-slate-700

                    dark:text-[#d0d0d0]
                  "
                >
                  Password
                </label>

                <Link
                  to="/ForgotPassword"
                  className="
                    text-[12px]
                    font-medium
                    text-red-600
                    transition-colors

                    hover:text-red-500

                    dark:text-red-500
                    dark:hover:text-red-400
                  "
                >
                  Forgot password?
                </Link>

              </div>

              <div
                className="
                  flex
                  h-11
                  items-center
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  transition-all
                  duration-200

                  hover:border-slate-400

                  focus-within:border-red-500
                  focus-within:ring-1
                  focus-within:ring-red-500

                  dark:border-[#3a3a3a]
                  dark:bg-[#181818]

                  dark:hover:border-[#555555]

                  dark:focus-within:border-red-500
                  dark:focus-within:ring-red-500/40
                "
              >

                <Lock
                  className="
                    ml-3.5
                    h-[17px]
                    w-[17px]
                    shrink-0
                    text-slate-400

                    dark:text-[#777777]
                  "
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    px-3
                    text-sm
                    text-slate-900
                    outline-none

                    placeholder:text-slate-400

                    dark:text-white
                    dark:placeholder:text-[#666666]
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="
                    mr-1.5
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    text-slate-400
                    transition-colors

                    hover:bg-slate-100
                    hover:text-slate-700

                    dark:hover:bg-[#242424]
                    dark:hover:text-[#d0d0d0]
                  "
                >
                  {showPassword ? (
                    <EyeOff className="h-[17px] w-[17px]" />
                  ) : (
                    <Eye className="h-[17px] w-[17px]" />
                  )}
                </button>

              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className="
                  flex
                  items-start
                  gap-2.5
                  rounded-lg
                  border
                  border-red-200
                  bg-red-50
                  px-3
                  py-2.5
                  text-[13px]
                  leading-5
                  text-red-600

                  dark:border-red-900/50
                  dark:bg-red-950/20
                  dark:text-red-400
                "
              >
                <AlertCircle
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                  "
                />

                <span>{error}</span>
              </div>
            )}

            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-red-600
                px-5
                text-sm
                font-semibold
                text-white
                transition-all
                duration-200

                hover:bg-red-700

                active:bg-red-800

                disabled:cursor-not-allowed
                disabled:opacity-60

                dark:bg-red-600
                dark:hover:bg-red-500
                dark:active:bg-red-700
              "
            >

              {loading ? (
                <>
                  <Loader2
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                  />

                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />

                  Sign in
                </>
              )}

            </button>

          </form>

          {/* ==================================================
              SIGN UP
          ================================================== */}

          <div
            className="
              mt-7
              border-t
              border-slate-200
              pt-6
              text-center

              dark:border-[#2b2b2b]
            "
          >

            <p
              className="
                text-sm
                text-slate-500

                dark:text-[#909090]
              "
            >
              Don't have an account?{" "}

              <Link
                to="/SignUp"
                className="
                  font-medium
                  text-red-600
                  transition-colors

                  hover:text-red-500

                  dark:text-red-500
                  dark:hover:text-red-400
                "
              >
                Create one
              </Link>
            </p>

          </div>

        </section>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <p
          className="
            mt-5
            text-center
            text-[11px]
            text-slate-400

            dark:text-[#555555]
          "
        >
          MyStream • Video Streaming Platform
        </p>

      </div>
    </main>
  );
};

export default Login;