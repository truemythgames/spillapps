import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { CmsAppProvider } from "./lib/cms-app-context";
import { isCmsAppGateComplete } from "./lib/cms-app";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { SelectApp } from "./pages/SelectApp";
import { Dashboard } from "./pages/Dashboard";
import { Stories } from "./pages/Stories";
import { StoryEditor } from "./pages/StoryEditor";
import { Seasons } from "./pages/Seasons";
import { Speakers } from "./pages/Speakers";
import { Playlists } from "./pages/Playlists";
import { Characters } from "./pages/Characters";
import { Upload } from "./pages/Upload";
import "./index.css";

function AuthenticatedRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (location.pathname === "/select-app") return;
    if (isCmsAppGateComplete()) return;
    navigate("/select-app", { replace: true });
  }, [isAuthenticated, location.pathname, navigate]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/select-app" element={<SelectApp />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="stories" element={<Stories />} />
        <Route path="stories/new" element={<StoryEditor />} />
        <Route path="stories/:id" element={<StoryEditor />} />
        <Route path="seasons" element={<Seasons />} />
        <Route path="speakers" element={<Speakers />} />
        <Route path="playlists" element={<Playlists />} />
        <Route path="characters" element={<Characters />} />
        <Route path="upload" element={<Upload />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CmsAppProvider>
      <AuthProvider>
        <BrowserRouter>
          <AuthenticatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </CmsAppProvider>
  </React.StrictMode>
);
