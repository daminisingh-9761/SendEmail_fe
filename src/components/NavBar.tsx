import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, History, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useDraftStore } from "@/store/applicationStore";
import { useResumeStore } from "@/store/resumeStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavBar() {
  const { user, logout } = useAuthStore();
  const { openLogin, incrementSessionKey } = useUiStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const resetDraft = useDraftStore((s) => s.reset);
  const clearSelectedResume = useResumeStore((s) => s.clearSelectedResume);

  const handleNewApplication = (e: React.MouseEvent) => {
    e.preventDefault();
    resetDraft();
    clearSelectedResume();
    incrementSessionKey();
    if (pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Mail className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Mailjob</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <a href="/" onClick={handleNewApplication}>
            <Button variant={pathname === "/" ? "secondary" : "ghost"} size="sm" className="px-2 sm:px-3">
              <span className="hidden sm:inline">New application</span>
              <span className="sm:hidden">New</span>
            </Button>
          </a>
          <Link to="/history">
            <Button variant={pathname === "/history" ? "secondary" : "ghost"} size="sm" className="gap-1.5 px-2 sm:px-3">
              <History className="h-3.5 w-3.5" /> <span className="hidden sm:inline">History</span>
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-2 flex items-center gap-2 rounded-full border border-border pl-1 pr-3 py-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-sm font-semibold text-slate-700">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{user.name.split(" ")[0]}</span>
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
