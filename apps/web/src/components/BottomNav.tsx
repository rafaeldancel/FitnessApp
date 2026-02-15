import { LayoutDashboard, Calendar, Plus, TrendingUp } from 'lucide-react'

interface BottomNavProps {
  currentPage: 'dashboard' | 'plan' | 'log' | 'progress'
  onNavigate: (page: 'dashboard' | 'plan' | 'log' | 'progress') => void
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'plan' as const, label: 'Plan', Icon: Calendar },
    { id: 'log' as const, label: 'Log', Icon: Plus },
    { id: 'progress' as const, label: 'Progress', Icon: TrendingUp },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                currentPage === id
                  ? 'text-violet-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
