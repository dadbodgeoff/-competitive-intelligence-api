import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function DashboardHeader() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userInitials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-obsidian/95 backdrop-blur supports-[backdrop-filter]:bg-obsidian/60">
      <div className="flex h-16 items-center gap-4 px-4">
        <SidebarTrigger />
        
        {/* Welcome message */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">
            Welcome back, {user?.first_name || 'there'}! 👋
          </h2>
        </div>

        {/* Right side - Notifications and User */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-emerald-500/10 text-emerald-400">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-850 border-white/10">
              <DropdownMenuLabel className="text-white">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-slate-800">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
