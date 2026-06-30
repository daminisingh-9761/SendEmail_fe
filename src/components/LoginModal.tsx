import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { authApi, resumeApi } from "@/lib/api";
import { useResumeStore } from "@/store/resumeStore";
import { toast } from "@/components/ui/toaster";
import { Mail } from "lucide-react";

export default function LoginModal() {
  const { loginModalOpen, closeLogin, pendingAction, openResumeModal, clearPending } = useUiStore();
  const { setSession } = useAuthStore();
  const { setResumes } = useResumeStore();

  async function handleSuccess(cred: CredentialResponse) {
    if (!cred.credential) return;
    try {
      // Backend verifies the Google ID token, creates/finds the user,
      // and returns our own session token.
      const { user, token } = await authApi.googleLogin(cred.credential);
      setSession(user, token);
      closeLogin();
      toast({ title: `Welcome, ${user.name.split(" ")[0]}`, variant: "success" });

      const resumes = await resumeApi.list();
      setResumes(resumes);

      if (pendingAction === "generate") {
        if (resumes.length === 0) {
          openResumeModal("generate");
        } else {
          clearPending();
        }
      }
    } catch {
      toast({ title: "Sign-in failed", description: "Please try again.", variant: "error" });
    }
  }

  return (
    <Dialog open={loginModalOpen} onOpenChange={(o) => !o && closeLogin()}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Mail className="h-5 w-5" />
          </div>
          <DialogTitle className="font-display text-xl">Sign in to continue</DialogTitle>
          <DialogDescription>
            We use your Google account to send the application email from your own address,
            and to save your resume and application history.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast({ title: "Sign-in failed", variant: "error" })}
            shape="pill"
            theme="outline"
            text="continue_with"
          />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to let Mailjob send email on your behalf via your Google account.
        </p>
      </DialogContent>
    </Dialog>
  );
}
