import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Clock, LogOut, FileText } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useDraftStore } from "@/store/applicationStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TopNavBar() {
  const { user, logout } = useAuthStore();
  const { openLogin, openResumeModal, incrementSessionKey } = useUiStore();
  const resetDraft = useDraftStore((s) => s.reset);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleNew = () => {
    resetDraft();
    incrementSessionKey();
    if (pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-background flex-shrink-0 z-30">
      <Link to="/" className="flex items-center gap-2 press-scale no-select">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Mail className="h-4 w-4" />
        </div>
        <span className="font-display text-xl font-semibold tracking-tight text-foreground">
          Mailjob
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <button
          onClick={handleNew}
          className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-[14px] font-medium transition-colors"
        >
          New application
        </button>
        
        {user && (
          <Link 
            to="/history" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-[14px] font-medium transition-colors"
          >
            <Clock className="h-4 w-4" />
            History
          </Link>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-9 pl-2 pr-3 rounded-full hover:bg-secondary transition-colors press-scale">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent font-medium text-xs">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground">{user.name?.split(" ")[0] || "User"}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email || "No email"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openResumeModal()}>
                <FileText className="mr-2 h-4 w-4" /> Resumes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            onClick={() => openLogin()}
            className="px-5 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground text-[14px] font-semibold transition-colors shadow-sm"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
