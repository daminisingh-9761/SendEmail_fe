import { useLocation, useNavigate } from "react-router-dom";

import { useDraftStore } from "@/store/applicationStore";
import { useResumeStore } from "@/store/resumeStore";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ProfileSheet from "@/components/ProfileSheet";

import { BOTTOM_NAV_TABS as tabs } from "@/lib/constants";

export default function BottomTabBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const resetDraft = useDraftStore((s) => s.reset);
  const clearSelectedResume = useResumeStore((s) => s.clearSelectedResume);
  const { incrementSessionKey } = useUiStore();
  const [profileOpen, setProfileOpen] = useState(false);

  function handleTabPress(tab: (typeof tabs)[number]) {

    if (navigator.vibrate) navigator.vibrate(10);

    if (tab.id === "profile") {
      setProfileOpen(true);
      return;
    }

    if (tab.id === "new") {
      resetDraft();
      clearSelectedResume();
      incrementSessionKey();
      if (pathname !== "/") {
        navigate("/");
      }
      return;
    }

    if (tab.path && pathname !== tab.path) {
      navigate(tab.path);
    }
  }

  function getIsActive(tab: (typeof tabs)[number]) {
    if (tab.id === "profile") return profileOpen;
    if (tab.id === "new") return pathname === "/" && !profileOpen;
    if (tab.id === "history") return pathname.startsWith("/history") || pathname.startsWith("/applications");
    return false;
  }

  return (
    <>
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40",
          "bg-card/95 backdrop-blur-xl",
          "border-t border-border",
          "safe-bottom"
        )}
        role="tablist"
        aria-label="Main navigation"
      >
        <div className="flex items-stretch justify-around max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = getIsActive(tab);
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-label={tab.label}
                onClick={() => handleTabPress(tab)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5",
                  "flex-1 min-h-[48px] py-2",
                  "transition-colors duration-150",
                  "active:scale-[0.92] active:opacity-80",
                  isActive ? "text-accent" : "text-muted-foreground"
                )}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className={cn("text-[10px] leading-tight", isActive ? "font-semibold" : "font-medium")}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
