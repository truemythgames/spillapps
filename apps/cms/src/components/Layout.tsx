import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useCmsApp } from "../lib/cms-app-context";

const nav = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/stories", label: "Stories", icon: "📖" },
  { path: "/seasons", label: "Seasons", icon: "📚" },
  { path: "/speakers", label: "Speakers", icon: "🎙️" },
  { path: "/playlists", label: "Playlists", icon: "🎵" },
  { path: "/characters", label: "Characters", icon: "👤" },
  { path: "/upload", label: "Upload", icon: "📤" },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, picture, logout } = useAuth();
  const { appId, setAppId, allowedAppIds } = useCmsApp();

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-surface border-r border-white/5 flex flex-col p-4">
        <div className="mb-8">
          <h1 className="text-primary font-bold text-xl leading-tight">Spill</h1>
          <p className="text-gray-500 text-xs mt-1">Admin</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-bg/80 px-2 py-1.5">
            <span className="text-[10px] uppercase text-gray-500 shrink-0">App</span>
            {allowedAppIds.length > 1 ? (
              <select
                value={appId}
                onChange={(e) => {
                  setAppId(e.target.value);
                  navigate("/");
                }}
                className="min-w-0 flex-1 bg-transparent text-sm font-mono text-primary border-0 focus:ring-0 cursor-pointer"
                title="X-App-Id"
              >
                {allowedAppIds.map((id) => (
                  <option key={id} value={id} className="bg-bg text-white">
                    {id}
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-mono text-xs text-primary truncate" title="X-App-Id">
                {appId}
              </span>
            )}
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 px-3 py-2">
            {picture && (
              <img src={picture} alt="" className="w-7 h-7 rounded-full" />
            )}
            <span className="text-xs text-gray-400 truncate flex-1">{email}</span>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
