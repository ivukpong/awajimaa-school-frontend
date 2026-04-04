"use client";
import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function NetworkStatusBar() {
  const [online, setOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    // Sync initial state after hydration
    setOnline(navigator.onLine);

    function handleOffline() {
      setOnline(false);
      setJustReconnected(false);
    }

    function handleOnline() {
      setOnline(true);
      setJustReconnected(true);
      // Hide the "back online" banner after 3 seconds
      const timer = setTimeout(() => setJustReconnected(false), 3000);
      return () => clearTimeout(timer);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (online && !justReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white transition-all duration-300 ${
        online ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {online ? (
        <>
          <Wifi className="h-4 w-4 shrink-0" />
          <span>Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>
            You appear to be offline. Please check your internet connection.
          </span>
        </>
      )}
    </div>
  );
}
