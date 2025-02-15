import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
// import "./navBar.css";
import MainPage from "./Components/MainPage";
import PageLayout from "./PageLayout";
import NotFound from "./Components/404Page";
import ProjectsPage from "./Components/ProjectsPage";
import CampaginsPage from "./Components/CampaginsPage";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <PageLayout />,
      children: [
        { path: "/", element: <MainPage /> },
        { path: "/projects", element: <ProjectsPage /> },
        { path: "/campagins", element: <CampaginsPage /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
