import { useAuth } from "../context/AuthContext";

export default function SidebarWidget() {
  const { user, logout } = useAuth();

  return (
    <div
      className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 px-4 py-5"
    >
      {/* User info */}
      {user && (
        <div className="mb-4 text-center">
          {/* Avatar */}
          <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
            {user.name}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
        </div>
      )}

      {/* Logout button */}
      <button
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-error-600 dark:hover:text-error-400 transition-colors"
      >
        {/* Logout icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Se déconnecter
      </button>
    </div>
  );
}
