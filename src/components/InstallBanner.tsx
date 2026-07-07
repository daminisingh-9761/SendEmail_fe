import { useState, useEffect } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function InstallBanner() {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  // If the user already dismissed it in a previous session, we could persist it in localStorage,
  // but for now, we just dismiss it for the current session.
  useEffect(() => {
    const isDismissed = localStorage.getItem("pwa-install-dismissed");
    if (isDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!canInstall || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-card border border-border shadow-lg rounded-lg p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="font-semibold text-sm">Install Mailjob</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Install Mailjob for a better experience and easy access.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors -mt-1 -mr-1 p-1 rounded-md"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 justify-end mt-1">
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-xs h-8">
            Later
          </Button>
          <Button size="sm" onClick={install} className="text-xs h-8">
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
