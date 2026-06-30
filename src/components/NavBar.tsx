import { Link, useLocation } from "react-router-dom";
import { Mail, History, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavBar() {
  const { user, logout } = useAuthStore();
  const { openLogin } = useUiStore();
  const { pathname } = useLocation();

  return (
    <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Mail className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Mailjob</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link to="/">
            <Button variant={pathname === "/" ? "secondary" : "ghost"} size="sm">
              New application
            </Button>
          </Link>
          <Link to="/history">
            <Button variant={pathname === "/history" ? "secondary" : "ghost"} size="sm" className="gap-1.5">
              <History className="h-3.5 w-3.5" /> History
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-2 flex items-center gap-2 rounded-full border border-border pl-1 pr-3 py-1">
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    className="h-7 w-7 rounded-full"
                    alt={user.name}
                  />
                  <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="gap-2 text-destructive">
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" variant="accent" className="ml-2" onClick={() => openLogin()}>
              Sign in
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
