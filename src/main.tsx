import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import RootLayout from "./pages/RootLayout.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import VideoPlayer from "./pages/VideoPlayer.tsx";
import PublicProfile from "./pages/PublicProfile.tsx";
import SearchList from "./pages/SearchList.tsx";
import HomePage from "./pages/HomePage.tsx";
import Login from "./pages/Login.tsx";
import UserDetails from "./pages/UserDetails.tsx";
import VerifyAccount from "./pages/VerifyAccount.tsx";
import AccountSettings from "./pages/AccountSettings.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import SignUp from "./pages/SignUp.tsx";


createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem={false}
    disableTransitionOnChange
  >
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<App />} />
          <Route path ="Video-Player/:xyz" element={<VideoPlayer/>} />
          <Route path = "PublicProfile/:abc" element={<PublicProfile/>}/>
          <Route path="SearchList/:xyz" element={<SearchList/>}/>
          <Route path ="home" element={<HomePage/>}/>
          <Route path="/Login" element={<Login/>}/>
          <Route path="/Userdetails" element={<UserDetails/>}/>
          <Route path="/verify-account" element={<VerifyAccount/>}/>
          <Route path="/settings" element={<AccountSettings/>}/>
          <Route path="/ForgotPassword" element={<ForgotPassword/>}/>
          <Route path="/reset-password" element={<ResetPassword/>} />
          <Route path="/SignUp" element={<SignUp></SignUp>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ThemeProvider>,
);