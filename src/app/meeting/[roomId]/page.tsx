"use client";

import "@livekit/components-styles";
import { LiveKitRoom } from "@livekit/components-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { post } from "@/lib/api";
import toast from "react-hot-toast";
import MeetingRoom from "@/components/meeting/MeetingRoom";
import { useAuthStore } from "@/store/authStore";

export default function MeetingRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  // roomId is used as the LiveKit room name; meetingId is the DB record ID
  const roomId = params.roomId as string;
  const meetingId = searchParams.get("meeting") ?? "";

  const authUser = useAuthStore((s) => s.user);

  const [displayName, setDisplayName] = useState(
    searchParams.get("name") ?? "",
  );
  const [nameInput, setNameInput] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const fetchToken = async (name: string) => {
    setLoading(true);
    try {
      const res = await post<{
        token: string;
        ws_url: string;
        is_host?: boolean;
      }>("/meetings/livekit/token", {
        meeting_id: meetingId,
        participant_name: name,
      });
      if (res.success) {
        setToken(res.data.token);
        setWsUrl(
          res.data.ws_url || process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || "",
        );
        setIsHost(res.data.is_host ?? false);
      } else {
        toast.error("Failed to get meeting token.");
      }
    } catch {
      toast.error("Could not join meeting. Please check your access.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (displayName && meetingId) {
      fetchToken(displayName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setDisplayName(nameInput.trim());
    fetchToken(nameInput.trim());
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-white text-center">
            Join Meeting
          </h1>
          {meetingId ? (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Your display name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {loading ? "Joining…" : "Join Meeting"}
              </button>
            </form>
          ) : (
            <p className="text-gray-400 text-center">
              Invalid meeting link. Please use the link provided to you.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100dvh" }}>
      <LiveKitRoom
        serverUrl={wsUrl}
        token={token}
        connect={true}
        video={true}
        audio={true}
        style={{ height: "100%" }}
      >
        <MeetingRoom
          meetingId={meetingId}
          isHost={isHost}
          onDisconnected={() => window.close()}
        />
      </LiveKitRoom>
    </div>
  );
}
