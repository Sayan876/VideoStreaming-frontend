import React, { useState, useEffect } from "react";
import axios from "axios";

import { jwtDecode } from "jwt-decode";
import { useNavigate,Link } from "react-router";
import {
  UserRound,
  Mail,
  Lock,
  FileText,
  Globe2,
  UserPlus,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";

/* ============================================================
   API
============================================================ */

const API_URL =
  "https://perfect-petronille-deltatech-f6802774.koyeb.app";

/* ============================================================
   COUNTRIES
============================================================ */

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Brazzaville)",
  "Congo (Kinshasa)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

/* ============================================================
   COMPONENT
============================================================ */

const SignUp = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    biodetails: "",
    country: "",
  });

  const [message, setMessage] = useState("");

  /* ==========================================================
     HANDLE INPUT
  ========================================================== */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* ==========================================================
     CHECK EXISTING LOGIN
  ========================================================== */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode<{ exp: number }>(token);

        const isExpired =
          decoded.exp * 1000 < Date.now();

        if (!isExpired) {
          navigate("/Userdetials");
        } else {
          localStorage.removeItem("token");
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setMessage("Passwords do not match!");
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.biodetails ||
      !formData.country
    ) {
      setMessage(
        "Please fill out all required fields including profile picture."
      );
      return;
    }

    const data = new FormData();

    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("biodetails", formData.biodetails);
    data.append("country", formData.country);

    try {
      await axios.post(
        `${API_URL}/api/user`,
        data,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setMessage(
        "Account has been created successfully, you can login now!"
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        biodetails: "",
        country: "",
      });
    } catch (error: any) {
      console.error(
        "Error creating user:",
        error
      );

      if (error.response?.data) {
        const msg =
          error.response.data.message;

        setModalMessage(
          msg || "Something went wrong."
        );
        setShowModal(true);
      } else {
        setModalMessage(
          "Something went wrong. Please try again."
        );
        setShowModal(true);
      }
    }
  };

  /* ==========================================================
     INPUT STYLES
  ========================================================== */

  const inputWrapper =
    `
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
    `;

  const input =
    `
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
    `;

  const label =
    `
      mb-2
      block
      text-[13px]
      font-medium
      text-slate-700

      dark:text-[#d0d0d0]
    `;

  const icon =
    `
      ml-3.5
      h-[17px]
      w-[17px]
      shrink-0
      text-slate-400

      dark:text-[#777777]
    `;

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
        py-10
        text-slate-900
        transition-colors
        duration-300

        dark:bg-[#0b0b0b]
        dark:text-white
      "
    >
      <div className="w-full max-w-[500px]">

        {/* ====================================================
            SIGN UP CARD
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
              <UserPlus className="h-[19px] w-[19px]" />
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
              Create an account
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
              Join{" "}
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
              </span>{" "}
              and start sharing videos.
            </p>

          </div>

          {/* ==================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            {/* =================================================
                NAME
            ================================================= */}

            <div>

              <label
                htmlFor="name"
                className={label}
              >
                Full name
              </label>

              <div className={inputWrapper}>

                <UserRound className={icon} />

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                  className={input}
                />

              </div>

            </div>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div>

              <label
                htmlFor="email"
                className={label}
              >
                Email address
              </label>

              <div className={inputWrapper}>

                <Mail className={icon} />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className={input}
                />

              </div>

            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div>

              <label
                htmlFor="password"
                className={label}
              >
                Password
              </label>

              <div className={inputWrapper}>

                <Lock className={icon} />

                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  className={input}
                />

              </div>

            </div>

            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            <div>

              <label
                htmlFor="confirmPassword"
                className={label}
              >
                Confirm password
              </label>

              <div className={inputWrapper}>

                <Lock className={icon} />

                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                  className={input}
                />

              </div>

            </div>

            {/* =================================================
                BIO
            ================================================= */}

            <div>

              <label
                htmlFor="biodetails"
                className={label}
              >
                Bio details
              </label>

              <div
                className="
                  relative
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

                <FileText
                  className="
                    absolute
                    left-3.5
                    top-3.5
                    h-[17px]
                    w-[17px]
                    text-slate-400

                    dark:text-[#777777]
                  "
                />

                <textarea
                  id="biodetails"
                  name="biodetails"
                  value={
                    formData.biodetails
                  }
                  onChange={handleChange}
                  placeholder="Tell us a little about yourself"
                  rows={4}
                  required
                  className="
                    block
                    min-h-[110px]
                    w-full
                    resize-none
                    bg-transparent
                    px-10
                    py-3
                    text-sm
                    leading-6
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
                COUNTRY
            ================================================= */}

            <div>

              <label
                htmlFor="country"
                className={label}
              >
                Country
              </label>

              <div className="relative">

                <Globe2
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    z-10
                    h-[17px]
                    w-[17px]
                    -translate-y-1/2
                    text-slate-400

                    dark:text-[#777777]
                  "
                />

                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="
                    h-11
                    w-full
                    appearance-none
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    pl-10
                    pr-9
                    text-sm
                    text-slate-900
                    outline-none
                    transition-all
                    duration-200

                    hover:border-slate-400

                    focus:border-red-500
                    focus:ring-1
                    focus:ring-red-500

                    dark:border-[#3a3a3a]
                    dark:bg-[#181818]
                    dark:text-white

                    dark:hover:border-[#555555]

                    dark:focus:border-red-500
                    dark:focus:ring-red-500/40
                  "
                >

                  <option value="">
                    Select your country
                  </option>

                  {countries.map(
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

                {/* CUSTOM ARROW */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    right-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-400

                    dark:text-[#777777]
                  "
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>

              </div>

            </div>

            {/* =================================================
                ERROR / SUCCESS MESSAGE
            ================================================= */}

            {message && (
              <div
                className={`
                  flex
                  items-start
                  gap-2.5
                  rounded-lg
                  border
                  px-3
                  py-2.5
                  text-[13px]
                  leading-5

                  ${
                    message.includes(
                      "successfully"
                    )
                      ? `
                        border-green-200
                        bg-green-50
                        text-green-700

                        dark:border-green-900/50
                        dark:bg-green-950/20
                        dark:text-green-400
                      `
                      : `
                        border-red-200
                        bg-red-50
                        text-red-600

                        dark:border-red-900/50
                        dark:bg-red-950/20
                        dark:text-red-400
                      `
                  }
                `}
              >

                {message.includes(
                  "successfully"
                ) ? (
                  <CheckCircle2
                    className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                    "
                  />
                ) : (
                  <AlertCircle
                    className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                    "
                  />
                )}

                <span>{message}</span>

              </div>
            )}

            {/* =================================================
                SIGN UP BUTTON
            ================================================= */}

            <button
              type="submit"
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

                dark:bg-red-600
                dark:hover:bg-red-500
                dark:active:bg-red-700
              "
            >
              <UserPlus className="h-4 w-4" />

              Create account
            </button>

          </form>

          {/* ==================================================
              LOGIN LINK
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
              Already have an account?{" "}

              <Link
                to="/Login"
                className="
                  font-medium
                  text-red-600
                  transition-colors

                  hover:text-red-500

                  dark:text-red-500
                  dark:hover:text-red-400
                "
              >
                Sign in
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

      {/* ======================================================
          DUPLICATE EMAIL / ERROR MODAL
      ====================================================== */}

      {showModal && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/50
            px-4
            backdrop-blur-[2px]
          "
          onClick={() =>
            setShowModal(false)
          }
        >

          <div
            className="
              w-full
              max-w-[380px]
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-2xl

              dark:border-[#303030]
              dark:bg-[#171717]
              dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  bg-red-50
                  text-red-600

                  dark:bg-red-950/30
                  dark:text-red-500
                "
              >
                <AlertCircle className="h-5 w-5" />
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                aria-label="Close"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition-colors

                  hover:bg-slate-100
                  hover:text-slate-700

                  dark:hover:bg-[#242424]
                  dark:hover:text-white
                "
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="mt-5">

              <h3
                className="
                  text-lg
                  font-semibold
                  text-slate-900

                  dark:text-white
                "
              >
                Unable to create account
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-500

                  dark:text-[#999999]
                "
              >
                {modalMessage}
              </p>

            </div>

            {/* MODAL BUTTON */}

            <button
              type="button"
              onClick={() =>
                setShowModal(false)
              }
              className="
                mt-6
                h-10
                w-full
                rounded-lg
                bg-slate-900
                text-sm
                font-medium
                text-white
                transition-colors

                hover:bg-slate-800

                dark:bg-[#2a2a2a]
                dark:hover:bg-[#353535]
              "
            >
              Got it
            </button>

          </div>

        </div>
      )}
    </main>
  );
};

export default SignUp;