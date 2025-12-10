import { createBrowserRouter } from "react-router";
import Landing from "./layouts/Landing.out";
import Home from "./pages/Home.page";
import Service from "./pages/Pricing.page";
import Support from "./pages/Contact.page";
import Auth from "./layouts/Auth.out";
import App from "./layouts/App.out";
import SignIn from "./pages/SignIn.page";
import SignUp from "./pages/SignUp.page";
import Pricing from "./pages/Pricing.page";
import Contact from "./pages/Contact.page";
import AppPage from "./pages/App.page";
import ProfilePage from "./pages/Profile.page";
import SettingPage from "./pages/Setting.page";
import HistoryPage from "./pages/History.page";
const router = createBrowserRouter([
  // { path: '/', element: <LoginPage /> },
  {
    path: "/",
    element: <Landing />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "pricing",
        element: <Pricing />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
    children: [

      {
        path: "signin",
        element: <SignIn/>,
      },
            {
        path: "signup",
        element: <SignUp/>,
      },
            {
        path: "forget-password",
        element: <div>forget password</div>,
      },
            {
        path: "rest-password",
        element: <div>rest password</div>,
      },
     
    ],
  },
  {
    path: "/app",
    element: <App />,
    children: [
      {
        index: true,
        element: <AppPage/>,
      },
      {
        path: "setting",
        element: <SettingPage />,
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "profile",
        element: <ProfilePage/>,
      },
    ],
  },
]);

export default router;
