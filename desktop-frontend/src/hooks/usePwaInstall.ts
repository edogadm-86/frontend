import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isInStandaloneMode() {
  // iOS Safari
  const iosStandalone = (window.navigator as any).standalone === true;
  // Other browsers
  const displayModeStandalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
  return iosStandalone || displayModeStandalone;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isInStandaloneMode());

    const onBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar (Chrome on mobile)
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const canPromptInstall = useMemo(
    () => !!deferredPrompt && !installed,
    [deferredPrompt, installed]
  );

  const showInstallPrompt = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    // `appinstalled` event will handle state if accepted
  };

  return {
    installed,
    canPromptInstall, // true on Android/Chrome when prompt is available
    showInstallPrompt,
    isIOS: isIOS(),
    isStandalone: installed,
  };
}
