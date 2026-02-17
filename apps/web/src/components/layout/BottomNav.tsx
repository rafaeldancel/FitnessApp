interface BottomNavProps {
  currentPage: 'dashboard' | 'plan' | 'log' | 'progress'
  onNavigate: (page: 'dashboard' | 'plan' | 'log' | 'progress') => void
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: (active: boolean) => (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={active ? '0' : '2'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      id: 'plan' as const,
      label: 'Plan',
      icon: (active: boolean) => (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={active ? '0' : '2'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="5" y="2" width="14" height="20" rx="2" />
          {!active && (
            <>
              <line x1="9" y1="7" x2="15" y2="7" />
              <line x1="9" y1="11" x2="15" y2="11" />
              <line x1="9" y1="15" x2="12" y2="15" />
            </>
          )}
          {active && (
            <>
              <rect x="5" y="2" width="14" height="20" rx="2" fill="currentColor" />
              <line x1="9" y1="7" x2="15" y2="7" stroke="white" strokeWidth="2" />
              <line x1="9" y1="11" x2="15" y2="11" stroke="white" strokeWidth="2" />
              <line x1="9" y1="15" x2="12" y2="15" stroke="white" strokeWidth="2" />
            </>
          )}
        </svg>
      ),
    },
    {
      id: 'log' as const,
      label: 'Log',
      icon: (active: boolean) => (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={active ? '0' : '2'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="3" width="16" height="18" rx="2" />
          {!active && (
            <>
              <path d="M9 1v4M15 1v4" />
              <line x1="8" y1="11" x2="16" y2="11" />
              <line x1="8" y1="15" x2="13" y2="15" />
            </>
          )}
          {active && (
            <>
              <rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" />
              <path d="M9 1v4M15 1v4" stroke="currentColor" strokeWidth="2" />
              <line x1="8" y1="11" x2="16" y2="11" stroke="white" strokeWidth="2" />
              <line x1="8" y1="15" x2="13" y2="15" stroke="white" strokeWidth="2" />
            </>
          )}
        </svg>
      ),
    },
    {
      id: 'progress' as const,
      label: 'Progress',
      icon: (active: boolean) => (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {active ? (
            <>
              <rect x="4" y="12" width="4" height="8" rx="1" fill="currentColor" stroke="none" />
              <rect x="10" y="6" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
              <rect x="16" y="2" width="4" height="18" rx="1" fill="currentColor" stroke="none" />
            </>
          ) : (
            <>
              <rect x="4" y="12" width="4" height="8" rx="1" />
              <rect x="10" y="6" width="4" height="14" rx="1" />
              <rect x="16" y="2" width="4" height="18" rx="1" />
            </>
          )}
        </svg>
      ),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-[430px] mx-auto bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex justify-around items-center pt-2 pb-1">
          {navItems.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              aria-current={currentPage === id ? 'page' : undefined}
              aria-label={label}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                currentPage === id ? 'text-violet-600' : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <span className="mb-0.5" aria-hidden="true">
                {icon(currentPage === id)}
              </span>
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
        {/* iOS-style home indicator */}
        <div className="flex justify-center pb-2 pt-1">
          <div className="w-32 h-1 bg-gray-900 rounded-full opacity-20" />
        </div>
      </div>
    </nav>
  )
}
