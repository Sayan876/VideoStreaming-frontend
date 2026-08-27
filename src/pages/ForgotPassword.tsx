import { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const api =
    "https://perfect-petronille-deltatech-f6802774.koyeb.app";

  const handleSubmit = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(
        `${api}/api/forgot-password?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const data = await res.text();

      if (res.ok) {
        setMessage(
          "If an account exists, a reset link has been sent"
        );
      } else {
        setMessage(data || "Something went wrong ❌");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setMessage("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-8 text-neutral-900 transition-colors duration-300 dark:bg-[#080808] dark:text-white sm:px-6">
      
      {/* =====================================================
          Background Glow
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top glow */}
        <div className="absolute left-1/2 top-[-220px] h-[450px] w-[650px] -translate-x-1/2 rounded-full bg-red-500/5 blur-[140px] dark:bg-red-600/10" />

        {/* Bottom glow */}
        <div className="absolute bottom-[-250px] right-[-150px] h-[450px] w-[450px] rounded-full bg-red-500/5 blur-[140px] dark:bg-red-600/10" />

        {/* Subtle center glow */}
        <div className="absolute left-[-200px] top-1/2 h-[350px] w-[350px] -translate-y-1/2 rounded-full bg-red-500/[0.03] blur-[120px] dark:bg-red-500/[0.05]" />
      </div>


      {/* =====================================================
          Card
      ===================================================== */}

      <div className="relative z-10 w-full max-w-md">

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white/90 shadow-2xl shadow-neutral-200/50 backdrop-blur-xl transition-colors duration-300 dark:border-neutral-800/80 dark:bg-[#101010]/90 dark:shadow-black/40">

          {/* Red Accent */}
          <div className="h-1 w-full bg-gradient-to-r from-red-700 via-red-500 to-red-700" />


          {/* =================================================
              Content
          ================================================= */}

          <div className="p-6 sm:p-8">

            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-500 shadow-lg shadow-red-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    width="18"
                    height="11"
                    x="3"
                    y="11"
                    rx="2"
                    ry="2"
                  />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>


            {/* Heading */}

            <div className="text-center">

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
                Account Recovery
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Forgot Password?
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                Enter the email address associated with your
                account and we'll send you a password reset link.
              </p>

            </div>


            {/* =================================================
                Form
            ================================================= */}

            <div className="mt-7 space-y-4">

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
                >
                  Email Address
                </label>

                <div className="relative">

                  {/* Mail Icon */}

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-600"
                  >
                    <rect
                      width="20"
                      height="16"
                      x="2"
                      y="4"
                      rx="2"
                    />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>


                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your existing email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setMessage("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSubmit();
                      }
                    }}
                    disabled={loading}
                    autoComplete="email"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-10 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-red-500/60 focus:bg-white focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-white dark:placeholder:text-neutral-600 dark:focus:bg-neutral-900"
                  />

                </div>

              </div>


              {/* =================================================
                  Submit Button
              ================================================= */}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all duration-200 hover:bg-red-500 hover:shadow-red-600/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {/* Subtle hover shine */}

                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />


                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>

                    Reset Password
                  </>
                )}

              </button>


              {/* =================================================
                  Message
              ================================================= */}

              {message && (
                <div
                  className={`rounded-xl border px-4 py-3 text-center text-xs leading-5 transition-all duration-300 ${
                    message.includes("If an account exists")
                      ? "border-green-500/20 bg-green-500/5 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                      : "border-red-500/20 bg-red-500/5 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                  }`}
                >
                  {message}
                </div>
              )}

            </div>


            {/* =================================================
                Security Note
            ================================================= */}

            <div className="mt-6 border-t border-neutral-100 pt-5 dark:border-neutral-800">

              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-500">

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>

                </div>

                <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-600">
                  For your security, we won't reveal whether
                  an email address is associated with an account.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* Footer */}

        <p className="mt-6 text-center text-xs text-neutral-400 dark:text-neutral-700">
          Secure account recovery
        </p>

      </div>

    </div>
  );
};

export default ForgotPassword;