import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../../App";
import { LoginPage } from "../../pages/LoginPage/LoginPage";
import { RegisterPage } from "../../pages/RegisterPage/RegisterPage";
import WebPushComponent from "../../pages/webPush";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/about",
    element: <div>About Page</div>,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/web-push",
    element: <WebPushComponent />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);
