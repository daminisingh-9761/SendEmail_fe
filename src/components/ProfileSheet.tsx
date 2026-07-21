import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { BottomSheet, ActionSheetItem } from "@/components/ui/bottom-sheet";
import { FileText, LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import { authApi, resumeApi } from "@/lib/api";
import { useResumeStore } from "@/store/resumeStore";
import { toast } from "@/components/ui/toaster";

import { ProfileSheetProps } from "@/types";

export default function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { user, logout, setSession } = useAuthStore();
  const { openResumeModal } = useUiStore();
  const { setResumes } = useResumeStore();

  const login = useGoogleLogin({
    flow: "auth-code",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/gmail.send",
    ].join(" "),
    onSuccess: async (codeResponse) => {
      try {
        const { user, token } = await authApi.googleLogin({ code: codeResponse.code });
        setSession(user, token);
        toast({ title: `Welcome, ${user.name?.split(" ")[0] || "User"}`, variant: "success" });
        const resumes = await resumeApi.list();
        setResumes(resumes);
      } catch {
        toast({ title: "Sign-in failed", description: "Please try again.", variant: "error" });
      }
    },
    onError: () => toast({ title: "Sign-in failed", variant: "error" }),
  });

  function handleSignOut() {
    if (navigator.vibrate) navigator.vibrate(10);
    logout();
    onOpenChange(false);
  }

  function handleManageResumes() {
    onOpenChange(false);

    setTimeout(() => openResumeModal(), 200);
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Profile">
      {user ? (
        <div className="space-y-1">

          <div className="flex items-center gap-3 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-accent text-lg font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[15px] truncate">{user.name || "User"}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email || "No email"}</p>
            </div>
          </div>

          <div className="h-px bg-border my-1" />

          <ActionSheetItem
            icon={<FileText className="h-5 w-5" />}
            label="Manage Resumes"
            subtitle="Upload, view, or change your default resume"
            onClick={handleManageResumes}
          />

          <div className="h-px bg-border my-1" />

          <ActionSheetItem
            icon={<LogOut className="h-5 w-5" />}
            label="Sign out"
            destructive
            onClick={handleSignOut}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Mail className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[15px]">Sign in to get started</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
              We use your Google account to send emails and save your history.
            </p>
          </div>
          <Button
            onClick={() => login()}
            variant="outline"
            className="rounded-full px-6 gap-2 press-scale"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>
          <p className="text-center text-[11px] text-muted-foreground px-4">
            By continuing you agree to let Mailjob send email on your behalf via your Google account.
          </p>
        </div>
      )}
    </BottomSheet>
  );
}
