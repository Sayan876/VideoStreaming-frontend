import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const api =
    "https://perfect-petronille-deltatech-f6802774.koyeb.app";

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match ❌");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(
        `${api}/api/reset-password?token=${token}&newPassword=${password}`,
        {
          method: "POST", // change if backend uses GET
        }
      );

      const data = await res.text();

      if (res.ok) {
        setMessage("Password reset successful ✅");

        // redirect after 2 sec
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(data || "Invalid or expired token ❌");
      }
    } catch (err) {
      setMessage("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  // Helper to apply error styling if message contains error keywords
  const isErrorMessage = (msg: string) =>
    msg.toLowerCase().includes("error") ||
    msg.toLowerCase().includes("invalid") ||
    msg.toLowerCase().includes("expired") ||
    msg.toLowerCase().includes("do not match");

  return (
    <div
      className="
        flex
        min-h-[calc(100vh-4rem)]
        w-full
        items-center
        justify-center
        bg-slate-50
        px-4
        py-10
        transition-colors
        duration-300

        dark:bg-[#0f0f0f]
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-xl
          transition-all
          duration-300

          sm:p-8

          dark:border-[#303030]
          dark:bg-[#181818]
          dark:shadow-2xl
        "
      >
        {/* ==================================================
            TITLE
        ================================================== */}

        <div className="mb-7 text-center">
          <h2
            className="
              text-2xl
              font-bold
              tracking-tight
              text-slate-900

              dark:text-white
            "
          >
            Reset Password
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-500

              dark:text-[#aaaaaa]
            "
          >
            Enter your new password below.
          </p>
        </div>

        {/* ==================================================
            INVALID TOKEN
        ================================================== */}

        {!token ? (
          <p
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-center
              text-sm
              font-medium
              text-red-600

              dark:border-red-900/50
              dark:bg-red-950/20
              dark:text-red-400
            "
          >
            Invalid reset link ❌
          </p>
        ) : (
          <>
            {/* ==================================================
                NEW PASSWORD
            ================================================== */}

            <div className="space-y-2">
              <label
                htmlFor="new-password"
                className="
                  block
                  text-sm
                  font-medium
                  text-slate-700

                  dark:text-[#dddddd]
                "
              >
                New password
              </label>

              <input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-slate-900
                  outline-none
                  transition-all
                  duration-200

                  placeholder:text-slate-400

                  hover:border-slate-400

                  focus:border-red-500
                  focus:ring-4
                  focus:ring-red-500/10

                  dark:border-[#3a3a3a]
                  dark:bg-[#101010]
                  dark:text-white
                  dark:placeholder:text-[#777777]

                  dark:hover:border-[#505050]

                  dark:focus:border-red-500
                  dark:focus:ring-red-500/10
                "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* ==================================================
                CONFIRM PASSWORD
            ================================================== */}

            <div className="mt-4 space-y-2">
              <label
                htmlFor="confirm-password"
                className="
                  block
                  text-sm
                  font-medium
                  text-slate-700

                  dark:text-[#dddddd]
                "
              >
                Confirm password
              </label>

              <input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-slate-900
                  outline-none
                  transition-all
                  duration-200

                  placeholder:text-slate-400

                  hover:border-slate-400

                  focus:border-red-500
                  focus:ring-4
                  focus:ring-red-500/10

                  dark:border-[#3a3a3a]
                  dark:bg-[#101010]
                  dark:text-white
                  dark:placeholder:text-[#777777]

                  dark:hover:border-[#505050]

                  dark:focus:border-red-500
                  dark:focus:ring-red-500/10
                "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* ==================================================
                RESET BUTTON
            ================================================== */}

            <button
              className="
                mt-6
                w-full
                rounded-xl
                bg-red-600
                px-4
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-all
                duration-200

                hover:bg-red-700
                hover:shadow-lg
                hover:shadow-red-600/20

                active:scale-[0.99]

                disabled:cursor-not-allowed
                disabled:opacity-60
                disabled:hover:bg-red-600
                disabled:hover:shadow-sm

                dark:bg-red-600
                dark:hover:bg-red-500
                dark:hover:shadow-red-500/20
              "
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            {/* ==================================================
                MESSAGE
            ================================================== */}

            {message && (
              <p
                className={`
                  mt-4
                  rounded-xl
                  border
                  px-4
                  py-3
                  text-center
                  text-sm
                  font-medium

                  ${
                    isErrorMessage(message)
                      ? `
                        border-red-200
                        bg-red-50
                        text-red-600

                        dark:border-red-900/50
                        dark:bg-red-950/20
                        dark:text-red-400
                      `
                      : `
                        border-green-200
                        bg-green-50
                        text-green-600

                        dark:border-green-900/50
                        dark:bg-green-950/20
                        dark:text-green-400
                      `
                  }
                `}
              >
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;