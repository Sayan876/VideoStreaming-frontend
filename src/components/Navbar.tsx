import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import {
  Search,
  Menu,
  X,
  UserRound,
  Settings,
  LogOut,
  Home,
  UserPlus,
  LogIn,
} from "lucide-react";

import ThemeToggle from "./ThemeToggle";

/* ============================================================
   TYPES
============================================================ */

interface User {
  name: string;
  oneName: string;
  profilePicUrl?: string | null;
}

/* ============================================================
   API
============================================================ */

const API_URL =
  "https://perfect-petronille-deltatech-f6802774.koyeb.app";

/* ============================================================
   COMPONENT
============================================================ */

const Navbar = () => {
  const [title, setTitle] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  /* ==========================================================
     FETCH LOGGED-IN USER
  ========================================================== */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    axios
      .get<User>(`${API_URL}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        localStorage.clear();
        setUser(null);
      });
  }, []);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const searchValue = title.trim();

    if (!searchValue) {
      return;
    }

    navigate(`/SearchList/${encodeURIComponent(searchValue)}`);

    setTitle("");
    setMenuOpen(false);
  };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();

    navigate("/Login");

    window.location.reload();
  };

  /* ==========================================================
     PUBLIC PROFILE
  ========================================================== */

  const goToPublicProfile = () => {
    if (!user?.oneName) {
      return;
    }

    navigate(`/PublicProfile/${user.oneName}`);
    setMenuOpen(false);
  };

  /* ==========================================================
     CLOSE MENU
  ========================================================== */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /* ==========================================================
     JSX
  ========================================================== */

  return (
    <>
      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          w-full
          border-b
          border-slate-200
          bg-white/95
          backdrop-blur-xl
          transition-colors
          duration-300

          dark:border-[#303030]
          dark:bg-[#0f0f0f]/95
        "
      >
        <nav
          className="
            mx-auto
            flex
            h-16
            w-full
            max-w-[1500px]
            items-center
            gap-3
            px-3

            sm:gap-4
            sm:px-6

            lg:px-8
          "
        >
          {/* ==================================================
              LOGO
          ================================================== */}

          <Link
            to="/Home"
            className="
              hidden
              shrink-0
              text-xl
              font-extrabold
              tracking-tight
              text-slate-950
              transition-colors
              duration-200

              hover:text-red-600

              dark:text-white
              dark:hover:text-red-500

              sm:block
              sm:text-2xl
            "
          >
            My<span className="text-red-600 dark:text-red-500">Stream</span>
          </Link>

          {/* ==================================================
              SEARCH
          ================================================== */}

          <div
            className="
              flex
              min-w-0
              flex-1
              justify-center

              sm:px-2
              md:px-4
            "
          >
            <form
              onSubmit={handleSearch}
              className="
    group
    flex
    w-full
    max-w-[680px]
    items-center
    overflow-hidden
    rounded-full
    border
    border-slate-300
    bg-white
    shadow-sm
    transition-all
    duration-200

    hover:border-slate-400

    focus-within:border-slate-500
    focus-within:shadow-md

    dark:border-[#303030]
    dark:bg-[#121212]
    dark:hover:border-[#4a4a4a]

    dark:focus-within:border-red-600/70
    dark:focus-within:shadow-[0_0_12px_rgba(220,38,38,0.18)]
  "
            >
              {/* SEARCH ICON */}

              <Search
                className="
                  ml-4
                  h-[19px]
                  w-[19px]
                  shrink-0
                  text-slate-500

                  dark:text-[#aaaaaa]

                  sm:ml-5
                "
              />

              {/* SEARCH INPUT */}

              <input
                type="text"
                placeholder="Search"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-3
                  py-2.5
                  text-sm
                  text-slate-900
                  outline-none
                  placeholder:text-slate-500

                  sm:px-4
                  sm:text-[15px]

                  dark:text-white
                  dark:placeholder:text-[#aaaaaa]
                "
              />

              {/* SEARCH BUTTON */}

              <button
                type="submit"
                aria-label="Search"
                className="
                  mr-0
                  flex
                  h-10
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  border-l
                  border-slate-200
                  bg-slate-100
                  text-slate-700
                  transition-all
                  duration-200

                  hover:bg-slate-200
                  hover:text-slate-950

                  dark:border-[#303030]
                  dark:bg-[#222222]
                  dark:text-[#f1f1f1]
                  dark:hover:bg-[#303030]

                  sm:w-[64px]
                "
              >
                <Search className="h-[19px] w-[19px]" />

                <span className="sr-only">
                  Search
                </span>
              </button>
            </form>
          </div>

          {/* ==================================================
              RIGHT ACTIONS
          ================================================== */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-1.5

              sm:gap-2
            "
          >
            {/* THEME TOGGLE */}

            <ThemeToggle />

            {/* MENU BUTTON */}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-700
                transition-all
                duration-200

                hover:border-slate-300
                hover:bg-slate-100
                hover:text-slate-950

                dark:border-[#303030]
                dark:bg-[#181818]
                dark:text-[#aaaaaa]
                dark:hover:border-[#454545]
                dark:hover:bg-[#272727]
                dark:hover:text-white

                sm:h-9
                sm:w-9
              "
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* ======================================================
          BACKDROP
      ====================================================== */}

      <div
        className={`
          fixed
          inset-0
          z-[60]
          bg-black/50
          backdrop-blur-[2px]
          transition-opacity
          duration-300

          ${
            menuOpen
              ? "visible opacity-100"
              : "invisible opacity-0"
          }
        `}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* ======================================================
          RIGHT DRAWER
      ====================================================== */}

      <aside
        className={`
          fixed
          right-0
          top-0
          z-[70]
          flex
          h-full
          w-[min(88vw,380px)]
          flex-col
          border-l
          border-slate-200
          bg-white
          shadow-2xl
          transition-transform
          duration-300
          ease-out

          dark:border-[#303030]
          dark:bg-[#0f0f0f]

          ${
            menuOpen
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >
        {/* ====================================================
            DRAWER HEADER
        ==================================================== */}

        <div
          className="
            flex
            h-16
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-200
            px-5

            dark:border-[#303030]
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-red-600

                dark:text-red-500
              "
            >
              MyStream
            </p>

            <h2
              className="
                mt-0.5
                text-lg
                font-bold
                text-slate-900

                dark:text-white
              "
            >
              Menu
            </h2>
          </div>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-slate-500
              transition-all
              duration-200

              hover:bg-slate-100
              hover:text-slate-900

              dark:text-[#aaaaaa]
              dark:hover:bg-[#272727]
              dark:hover:text-white
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ====================================================
            DRAWER CONTENT
        ==================================================== */}

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {/* ==================================================
              USER PROFILE
          ================================================== */}

          {user && (
            <div
              className="
                mb-5
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-4

                dark:border-[#303030]
                dark:bg-[#181818]
              "
            >
              <button
                type="button"
                onClick={goToPublicProfile}
                className="
                  group
                  flex
                  w-full
                  items-center
                  gap-3
                  text-left
                "
              >
                {/* PROFILE IMAGE */}

                {user.profilePicUrl ? (
                  <img
                    src={user.profilePicUrl}
                    alt={`${user.name} profile`}
                    className="
                      h-11
                      w-11
                      shrink-0
                      rounded-full
                      object-cover
                      ring-2
                      ring-slate-200
                      transition-all
                      duration-200

                      group-hover:ring-red-500

                      dark:ring-[#3a3a3a]
                      dark:group-hover:ring-[#606060]
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-red-100
                      text-sm
                      font-bold
                      text-red-600
                      ring-2
                      ring-red-100

                      dark:bg-[#292929]
                      dark:text-[#dddddd]
                      dark:ring-[#404040]
                    "
                  >
                    {user.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}

                {/* USER INFO */}

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-slate-900

                      dark:text-white
                    "
                  >
                    {user.name}
                  </p>

                  <p
                    className="
                      truncate
                      text-xs
                      text-slate-500

                      dark:text-[#aaaaaa]
                    "
                  >
                    @{user.oneName}
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* ==================================================
              NAVIGATION
          ================================================== */}

          <div className="space-y-1">
            <DrawerLink
              to="/Home"
              icon={<Home className="h-4 w-4" />}
              label="Home"
              onClick={closeMenu}
            />

            {user ? (
              <>
                <DrawerLink
                  to="/Userdetails"
                  icon={<UserRound className="h-4 w-4" />}
                  label="Profile"
                  onClick={closeMenu}
                />

                <DrawerLink
                  to="/settings"
                  icon={<Settings className="h-4 w-4" />}
                  label="Account Settings"
                  onClick={closeMenu}
                />

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    group
                    mt-3
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-slate-600
                    transition-all
                    duration-200

                    hover:bg-slate-100
                    hover:text-red-600

                    dark:text-[#aaaaaa]
                    dark:hover:bg-[#272727]
                    dark:hover:text-white
                  "
                >
                  <LogOut
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-200

                      group-hover:-translate-x-0.5
                    "
                  />

                  Logout
                </button>
              </>
            ) : (
              <>
                <DrawerLink
                  to="/Login"
                  icon={<LogIn className="h-4 w-4" />}
                  label="Login"
                  onClick={closeMenu}
                />

                <DrawerLink
                  to="/SignUp"
                  icon={<UserPlus className="h-4 w-4" />}
                  label="Sign Up"
                  onClick={closeMenu}
                />
              </>
            )}
          </div>
        </div>

        {/* ====================================================
            DRAWER FOOTER
        ==================================================== */}

        <div
          className="
            shrink-0
            border-t
            border-slate-200
            px-5
            py-4

            dark:border-[#303030]
          "
        >
          <p
            className="
              text-center
              text-[11px]
              text-slate-400

              dark:text-[#666666]
            "
          >
            MyStream • Video Streaming Platform
          </p>
        </div>
      </aside>
    </>
  );
};

/* ================================================================
   DRAWER LINK
================================================================ */

interface DrawerLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const DrawerLink = ({
  to,
  icon,
  label,
  onClick,
}: DrawerLinkProps) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="
        group
        flex
        items-center
        gap-3
        rounded-xl
        px-4
        py-3
        text-sm
        font-medium
        text-slate-600
        transition-all
        duration-200

        hover:bg-slate-100
        hover:text-slate-950

        dark:text-[#aaaaaa]
        dark:hover:bg-[#272727]
        dark:hover:text-white
      "
    >
      <span
        className="
          text-slate-400
          transition-colors
          duration-200

          group-hover:text-red-600

          dark:text-[#777777]
          dark:group-hover:text-[#dddddd]
        "
      >
        {icon}
      </span>

      {label}
    </Link>
  );
};

export default Navbar;