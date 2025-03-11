import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./Components/Login";
import MainPage from "./Components/MainPage";
import PageLayout from "./PageLayout";
import NotFound from "./Components/404Page";
import ProjectsPage from "./Components/ProjectsPage";
import CampaginsPage from "./Components/CampaginsPage";
import MessagesPage from "./Components/MessagesPage";
import SponsorshipPage from "./Components/SponsorshipsPage";
import DocumentationsPage from "./Components/DocumentationsPage";
import DocumentationPhotos from "./Components/DocumentationPhotos";
import DocumentationVideos from "./Components/DocumentationVideos";
import SettingsComponents from "./Components/SettingsComponents";
import UsersPage from "./Components/UsersPage";
import ProfilePage from "./Components/ProfilePage";
import AdminRoute from "./Components/AdminRoute";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  const router = createBrowserRouter([
    {
      path: "/login",
      element: isAuthenticated ? <Navigate to="/" replace /> : <Login />,
    },
    {
      path: "/",
      element: isAuthenticated ? (
        <PageLayout />
      ) : (
        <Navigate to="/login" replace />
      ),
      children: [
        { path: "/", element: <MainPage /> },
        { path: "/projects", element: <ProjectsPage /> },
        { path: "/sponsorship", element: <SponsorshipPage /> },
        { path: "/campagins", element: <CampaginsPage /> },
        { path: "/messages", element: <MessagesPage /> },
        { path: "/documentations", element: <DocumentationsPage /> },
        {
          path: "/documentation-photos/:docId",
          element: <DocumentationPhotos />,
        },
        {
          path: "/documentation-videos/:docId",
          element: <DocumentationVideos />,
        },
        { path: "/others", element: <SettingsComponents /> },
        { 
          path: "/users", 
          element: <AdminRoute><UsersPage /></AdminRoute> 
        },
        { path: "/profile", element: <ProfilePage /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
