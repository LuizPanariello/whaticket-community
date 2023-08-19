import React from "react";

import LoggedInLayout from "../layout";
import Dashboard from "../pages/Dashboard/";
import Tickets from "../pages/Tickets/";
import Signup from "../pages/Signup/";
import Login from "../pages/Login/";
import Connections from "../pages/Connections/";
import Settings from "../pages/Settings/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import QuickAnswers from "../pages/QuickAnswers/";
import Queues from "../pages/Queues/";

import { AuthProvider } from "../context/Auth/AuthContext";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";


const Root = () => (
  <AuthProvider>
    <Outlet />
    <ToastContainer autoClose={3000} />
  </AuthProvider>
)

const router = createBrowserRouter([
  {
    path: "/", 
    element: <Root />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { 
        path: "/", 
        element: <LoggedInLayout />,
        children: [
          { path: "/", index: true, element: <Dashboard />}, 
          { path: "/tickets/:ticketId?", element: <Tickets />}, 
          { path: "/connections", element: <Connections />}, 
          { path: "/users", element: <Users />}, 
          { path: "/quickAnswers", element: <QuickAnswers /> },
          { path: "/contacts", element: <Contacts /> },
          { path: "/settings", element: <Settings /> },
          { path: "/queues", element: <Queues /> },
        ]
      }
    ]
  }
]);

const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;
