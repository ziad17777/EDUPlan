import { createBrowserRouter } from "react-router";
import Landing from "./layouts/Landing.out";
import Home from "./pages/Home.page";
import Service from "./pages/Service.page";
import Support from "./pages/Support.page";
import Auth from "./layouts/Auth.out";
import App from "./layouts/App.out";
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
        path: "service",
        element: <Service />,
      },
      {
        path: "support",
        element: <Support />,
      },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
    children: [

      {
        path: "signin",
        element: <div>signin</div>,
      },
            {
        path: "signup",
        element: <div>signup</div>,
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
        element: <div>Chat</div>,
      },
      {
        path: "setting",
        element: <div>setting</div>,
      },
      {
        path: "profile",
        element: <div>profile</div>,
      },
    ],
  },
]);

export default router;
