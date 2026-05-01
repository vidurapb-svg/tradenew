import { Bell, User } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 flex-shrink-0 bg-bg border-b border-line flex items-center justify-between px-4 sm:px-6 z-10">
      <div className="flex items-center">
        {/* Mobile menu button could go here */}
      </div>
      <div className="flex items-center space-x-4">
        {/* Status Indicators */}
        <div className="flex items-center space-x-2 mr-4 border-r border-line pr-6 hidden sm:flex">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-buy"></span>
            <span className="text-xs font-mono text-ink-muted uppercase">Engine: Ready</span>
          </div>
        </div>

        <button className="text-ink-muted hover:text-ink transition-colors rounded-full p-1 border border-transparent hover:bg-panel-hover">
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        
        {/* Profile dropdown stub */}
        <div className="relative ml-2">
          <button className="flex items-center justify-center h-8 w-8 rounded-full bg-panel hover:bg-panel-hover transition-colors border border-line">
            <User className="h-4 w-4 text-ink" />
          </button>
        </div>
      </div>
    </header>
  );
}
