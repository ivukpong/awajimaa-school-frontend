"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  useParticipants,
  useTracks,
  useLocalParticipant,
  useRoomContext,
  VideoTrack,
  RoomAudioRenderer,
  isTrackReference,
} from "@livekit/components-react";
import type {
  TrackReferenceOrPlaceholder,
  TrackReference,
} from "@livekit/components-react";
import {
  Track,
  RoomEvent,
  type RemoteParticipant,
  type Participant,
} from "livekit-client";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  ScreenShareOff,
  MessageSquare,
  Users,
  PhoneOff,
  Copy,
  Hand,
  Circle,
  Square,
  PinIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { post } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

interface MeetingRoomProps {
  meetingId: string;
  isHost?: boolean;
  onDisconnected?: () => void;
}

// ─── Control Button ────────────────────────────────────────────────────────────

interface ControlButtonProps {
  active: boolean;
  onClick: () => void;
  title: string;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
  activeClass?: string;
  inactiveClass?: string;
  badge?: number;
}

function ControlButton({
  active,
  onClick,
  title,
  activeIcon,
  inactiveIcon,
  activeClass = "bg-gray-700 hover:bg-gray-600",
  inactiveClass = "bg-gray-800 hover:bg-gray-700",
  badge,
}: ControlButtonProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        title={title}
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center text-white transition-all",
          active ? activeClass : inactiveClass,
        )}
      >
        {active ? activeIcon : inactiveIcon}
      </button>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center pointer-events-none">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </div>
  );
}

// ─── Participant Tile ──────────────────────────────────────────────────────────

interface ParticipantTileProps {
  trackRef: TrackReferenceOrPlaceholder;
  isSpeaking: boolean;
  isPinned: boolean;
  isLocal: boolean;
  onPin: () => void;
}

function ParticipantTile({
  trackRef,
  isSpeaking,
  isPinned,
  isLocal,
  onPin,
}: ParticipantTileProps) {
  const name = trackRef.participant.name ?? trackRef.participant.identity;
  const hasVideo = isTrackReference(trackRef);
  const initial = (name ?? "?").charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-gray-800 cursor-pointer group select-none",
        "border-2 transition-all duration-200",
        isSpeaking
          ? "border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
          : "border-transparent",
        isPinned && !isSpeaking && "border-blue-500",
      )}
      onClick={onPin}
    >
      {hasVideo ? (
        <VideoTrack
          trackRef={trackRef as TrackReference}
          className="w-full h-full object-cover aspect-video"
        />
      ) : (
        <div className="w-full h-full aspect-video flex items-center justify-center bg-gray-800">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {initial}
            </div>
            <span className="text-sm text-gray-400">{name}</span>
          </div>
        </div>
      )}

      {/* Name tag */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded max-w-[70%] truncate">
          {name}
          {isLocal ? " (You)" : ""}
        </span>
        {isSpeaking && (
          <span className="bg-green-500/90 text-white text-[10px] px-1.5 py-0.5 rounded">
            Speaking
          </span>
        )}
      </div>

      {/* Pin indicator */}
      {isPinned && (
        <div className="absolute top-2 right-2">
          <PinIcon className="w-4 h-4 text-blue-400" />
        </div>
      )}

      {/* Pin on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isPinned && <PinIcon className="w-4 h-4 text-white/60" />}
      </div>
    </div>
  );
}

// ─── Chat Panel ────────────────────────────────────────────────────────────────

interface ChatPanelProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  localIdentity: string;
  endRef: React.RefObject<HTMLDivElement | null>;
}

function ChatPanel({
  messages,
  input,
  onInputChange,
  onSend,
  localIdentity,
  endRef,
}: ChatPanelProps) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No messages yet. Say hello! 👋
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === localIdentity;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-0.5",
                  isOwn ? "items-end" : "items-start",
                )}
              >
                {!isOwn && (
                  <span className="text-xs text-gray-500 px-1">
                    {msg.sender}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[85%] px-3 py-2 rounded-2xl text-sm break-words",
                    isOwn
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-700 text-gray-100 rounded-bl-sm",
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-600 px-1">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={endRef as React.RefObject<HTMLDivElement>} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Message everyone..."
            className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <button
            onClick={onSend}
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 rounded-lg transition text-sm font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Participant List Panel ────────────────────────────────────────────────────

interface ParticipantListPanelProps {
  participants: Participant[];
  localParticipant: Participant;
  speakingSet: Set<string>;
}

function ParticipantListPanel({
  participants,
  localParticipant,
  speakingSet,
}: ParticipantListPanelProps) {
  const allParticipants = [
    localParticipant,
    ...participants.filter((p) => p.identity !== localParticipant.identity),
  ];

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-1">
      {allParticipants.map((p) => {
        const isLocal = p.identity === localParticipant.identity;
        const isSpeaking = speakingSet.has(p.identity);
        const name = p.name ?? p.identity;

        return (
          <div
            key={p.identity}
            className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-800/50"
          >
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0",
                "bg-gradient-to-br from-blue-600 to-purple-600",
                isSpeaking && "ring-2 ring-green-500",
              )}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">
                {name}
                {isLocal && (
                  <span className="ml-1.5 text-xs text-gray-400">(You)</span>
                )}
              </p>
              {isSpeaking && (
                <p className="text-[11px] text-green-400">Speaking…</p>
              )}
            </div>
            {/* Mute indicator */}
            {(p as any).isMicrophoneEnabled === false && (
              <MicOff className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main MeetingRoom ─────────────────────────────────────────────────────────

export default function MeetingRoom({
  meetingId,
  isHost = false,
  onDisconnected,
}: MeetingRoomProps) {
  const room = useRoomContext();
  const participants = useParticipants();
  const {
    localParticipant,
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
  } = useLocalParticipant();

  // All camera + screenshare tracks from every participant
  const allTracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const cameraTracks = allTracks.filter(
    (t) => t.source === Track.Source.Camera,
  );
  const screenShareTracks = allTracks.filter(
    (t) => t.source === Track.Source.ScreenShare && isTrackReference(t),
  ) as TrackReference[];

  const hasScreenShare = screenShareTracks.length > 0;

  // State
  const [sidePanel, setSidePanel] = useState<"chat" | "participants" | null>(
    null,
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLoading, setRecordingLoading] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [pinnedIdentity, setPinnedIdentity] = useState<string | null>(null);
  const [speakingSet, setSpeakingSet] = useState<Set<string>>(new Set());

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // ── Active speaker tracking ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (speakers: Participant[]) => {
      setSpeakingSet(new Set(speakers.map((s) => s.identity)));
    };
    room.on(RoomEvent.ActiveSpeakersChanged, handler);
    return () => {
      room.off(RoomEvent.ActiveSpeakersChanged, handler);
    };
  }, [room]);

  // ── Data channel (chat + reactions) ─────────────────────────────────────
  useEffect(() => {
    const handleData = (
      payload: Uint8Array,
      participant?: RemoteParticipant,
    ) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload)) as {
          type: string;
          text?: string;
        };
        if (msg.type === "chat" && msg.text) {
          const newMsg: ChatMessage = {
            id: `${Date.now()}-${Math.random()}`,
            sender: participant?.name ?? participant?.identity ?? "Unknown",
            senderId: participant?.identity ?? "",
            text: msg.text,
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, newMsg]);
          setSidePanel((current) => {
            if (current !== "chat") {
              setUnreadCount((c) => c + 1);
            }
            return current;
          });
        } else if (msg.type === "raise-hand") {
          toast(`${participant?.name ?? "Someone"} raised their hand ✋`, {
            duration: 3000,
          });
        }
      } catch {
        // ignore malformed data
      }
    };

    type DataHandler = (
      payload: Uint8Array,
      participant?: RemoteParticipant,
    ) => void;
    room.on(RoomEvent.DataReceived, handleData as unknown as DataHandler);
    return () => {
      room.off(RoomEvent.DataReceived, handleData as unknown as DataHandler);
    };
  }, [room]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Clear unread when chat opens
  useEffect(() => {
    if (sidePanel === "chat") setUnreadCount(0);
  }, [sidePanel]);

  // ── Controls ─────────────────────────────────────────────────────────────

  const toggleMic = useCallback(async () => {
    await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  }, [localParticipant, isMicrophoneEnabled]);

  const toggleCamera = useCallback(async () => {
    await localParticipant.setCameraEnabled(!isCameraEnabled);
  }, [localParticipant, isCameraEnabled]);

  const toggleScreenShare = useCallback(async () => {
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
    } catch {
      toast.error("Could not share screen. Check your browser permissions.");
    }
  }, [localParticipant, isScreenShareEnabled]);

  const toggleRaiseHand = useCallback(() => {
    const next = !handRaised;
    setHandRaised(next);
    if (next) {
      const payload = new TextEncoder().encode(
        JSON.stringify({ type: "raise-hand" }),
      );
      localParticipant.publishData(payload, { reliable: true } as any);
      toast("Hand raised ✋", { duration: 2000 });
    }
  }, [localParticipant, handRaised]);

  const sendChatMessage = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    const payload = new TextEncoder().encode(
      JSON.stringify({ type: "chat", text }),
    );
    localParticipant.publishData(payload, { reliable: true } as any);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-local`,
        sender: localParticipant.name ?? "You",
        senderId: localParticipant.identity,
        text,
        timestamp: new Date(),
      },
    ]);
    setChatInput("");
  }, [localParticipant, chatInput]);

  const toggleRecording = useCallback(async () => {
    if (!isHost) {
      toast.error("Only the host can start/stop recording.");
      return;
    }
    setRecordingLoading(true);
    try {
      if (!isRecording) {
        await post(`/meetings/${meetingId}/recording/start`, {});
        setIsRecording(true);
        toast.success("Recording started");
      } else {
        await post(`/meetings/${meetingId}/recording/stop`, {});
        setIsRecording(false);
        toast.success("Recording stopped");
      }
    } catch {
      toast.error(
        "Recording is not available. Please configure LiveKit Egress.",
      );
    } finally {
      setRecordingLoading(false);
    }
  }, [isHost, isRecording, meetingId]);

  const copyMeetingLink = useCallback(() => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("Meeting link copied!"))
      .catch(() => toast.error("Could not copy link"));
  }, []);

  const leaveMeeting = useCallback(async () => {
    await room.disconnect();
    onDisconnected?.();
  }, [room, onDisconnected]);

  // ── Grid layout ───────────────────────────────────────────────────────────

  // If someone is pinned, show them large + others in a row at bottom
  const pinnedTrack = pinnedIdentity
    ? (cameraTracks.find((t) => t.participant.identity === pinnedIdentity) ??
      null)
    : null;
  const unpinnedTracks = pinnedTrack
    ? cameraTracks.filter((t) => t.participant.identity !== pinnedIdentity)
    : cameraTracks;

  const gridColsClass =
    cameraTracks.length <= 1
      ? "grid-cols-1"
      : cameraTracks.length <= 4
        ? "grid-cols-2"
        : cameraTracks.length <= 9
          ? "grid-cols-3"
          : "grid-cols-4";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-200">
              {participants.length + 1} participant
              {participants.length !== 0 ? "s" : ""}
            </span>
            {hasScreenShare && (
              <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full">
                Screen share active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isRecording && (
              <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-900/30 px-2.5 py-1 rounded-full animate-pulse">
                <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                Recording
              </span>
            )}
            <button
              onClick={copyMeetingLink}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full transition"
            >
              <Copy className="w-3 h-3" />
              Copy link
            </button>
          </div>
        </div>

        {/* Video area */}
        <div className="flex-1 flex flex-col overflow-hidden p-2 gap-2 min-h-0">
          {/* Screen share: full-height main view */}
          {hasScreenShare && (
            <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
              <VideoTrack
                trackRef={screenShareTracks[0]}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-xs text-white px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <ScreenShare className="w-3 h-3" />
                {screenShareTracks[0].participant.name ?? "Someone"} is sharing
              </div>
            </div>
          )}

          {/* Pinned participant (large) */}
          {!hasScreenShare && pinnedTrack && (
            <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden">
              <ParticipantTile
                trackRef={pinnedTrack}
                isSpeaking={speakingSet.has(pinnedTrack.participant.identity)}
                isPinned={true}
                isLocal={
                  pinnedTrack.participant.identity === localParticipant.identity
                }
                onPin={() => setPinnedIdentity(null)}
              />
            </div>
          )}

          {/* Camera grid */}
          <div
            className={cn(
              "grid gap-2",
              // When screen sharing: thumbnails in a horizontal row
              hasScreenShare
                ? "h-28 grid-flow-col auto-cols-[minmax(0,160px)] overflow-x-auto"
                : // When someone is pinned: smaller unpinned tiles in a row
                  pinnedTrack
                  ? "h-28 grid-flow-col auto-cols-[minmax(0,160px)] overflow-x-auto"
                  : // Normal grid
                    cn("flex-1", gridColsClass),
            )}
          >
            {(hasScreenShare || pinnedTrack
              ? unpinnedTracks
              : cameraTracks
            ).map((trackRef) => {
              const identity = trackRef.participant.identity;
              return (
                <ParticipantTile
                  key={`${identity}-cam`}
                  trackRef={trackRef}
                  isSpeaking={speakingSet.has(identity)}
                  isPinned={pinnedIdentity === identity}
                  isLocal={identity === localParticipant.identity}
                  onPin={() =>
                    setPinnedIdentity(
                      pinnedIdentity === identity ? null : identity,
                    )
                  }
                />
              );
            })}
          </div>
        </div>

        {/* ── Control bar ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3 py-4 px-6 bg-gray-900 border-t border-gray-800 flex-shrink-0">
          {/* Mic */}
          <ControlButton
            active={isMicrophoneEnabled}
            onClick={toggleMic}
            title={isMicrophoneEnabled ? "Mute mic" : "Unmute mic"}
            activeIcon={<Mic className="w-5 h-5" />}
            inactiveIcon={<MicOff className="w-5 h-5" />}
            activeClass="bg-gray-700 hover:bg-gray-600"
            inactiveClass="bg-red-600 hover:bg-red-700"
          />

          {/* Camera */}
          <ControlButton
            active={isCameraEnabled}
            onClick={toggleCamera}
            title={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
            activeIcon={<Video className="w-5 h-5" />}
            inactiveIcon={<VideoOff className="w-5 h-5" />}
            activeClass="bg-gray-700 hover:bg-gray-600"
            inactiveClass="bg-red-600 hover:bg-red-700"
          />

          {/* Screen share */}
          <ControlButton
            active={isScreenShareEnabled}
            onClick={toggleScreenShare}
            title={isScreenShareEnabled ? "Stop sharing" : "Share screen"}
            activeIcon={<ScreenShareOff className="w-5 h-5" />}
            inactiveIcon={<ScreenShare className="w-5 h-5" />}
            activeClass="bg-green-700 hover:bg-green-800"
            inactiveClass="bg-gray-700 hover:bg-gray-600"
          />

          {/* Raise hand */}
          <ControlButton
            active={handRaised}
            onClick={toggleRaiseHand}
            title={handRaised ? "Lower hand" : "Raise hand"}
            activeIcon={<span className="text-lg leading-none">✋</span>}
            inactiveIcon={<Hand className="w-5 h-5" />}
            activeClass="bg-yellow-600 hover:bg-yellow-700"
            inactiveClass="bg-gray-700 hover:bg-gray-600"
          />

          {/* Chat */}
          <ControlButton
            active={sidePanel === "chat"}
            onClick={() => setSidePanel(sidePanel === "chat" ? null : "chat")}
            title="Chat"
            activeIcon={<MessageSquare className="w-5 h-5" />}
            inactiveIcon={<MessageSquare className="w-5 h-5" />}
            activeClass="bg-blue-700 hover:bg-blue-800"
            inactiveClass="bg-gray-700 hover:bg-gray-600"
            badge={sidePanel !== "chat" ? unreadCount : 0}
          />

          {/* Participants */}
          <ControlButton
            active={sidePanel === "participants"}
            onClick={() =>
              setSidePanel(sidePanel === "participants" ? null : "participants")
            }
            title="Participants"
            activeIcon={<Users className="w-5 h-5" />}
            inactiveIcon={<Users className="w-5 h-5" />}
            activeClass="bg-blue-700 hover:bg-blue-800"
            inactiveClass="bg-gray-700 hover:bg-gray-600"
          />

          {/* Recording (host only) */}
          {isHost && (
            <ControlButton
              active={isRecording}
              onClick={toggleRecording}
              title={
                recordingLoading
                  ? "Please wait…"
                  : isRecording
                    ? "Stop recording"
                    : "Start recording"
              }
              activeIcon={<Square className="w-5 h-5 fill-white" />}
              inactiveIcon={<Circle className="w-5 h-5" />}
              activeClass="bg-red-600 hover:bg-red-700 animate-pulse"
              inactiveClass="bg-gray-700 hover:bg-gray-600"
            />
          )}

          {/* Leave */}
          <button
            onClick={leaveMeeting}
            title="Leave meeting"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-5 py-2.5 rounded-full transition font-semibold text-sm"
          >
            <PhoneOff className="w-4 h-4" />
            Leave
          </button>
        </div>
      </div>

      {/* ── Side panel ──────────────────────────────────────────────────── */}
      {sidePanel !== null && (
        <div className="w-72 flex flex-col bg-gray-900 border-l border-gray-800 flex-shrink-0">
          {/* Tabs */}
          <div className="flex items-stretch border-b border-gray-800 flex-shrink-0">
            <button
              onClick={() => setSidePanel("chat")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition border-b-2",
                sidePanel === "chat"
                  ? "text-white border-blue-500"
                  : "text-gray-400 hover:text-gray-200 border-transparent",
              )}
            >
              Chat
            </button>
            <button
              onClick={() => setSidePanel("participants")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition border-b-2",
                sidePanel === "participants"
                  ? "text-white border-blue-500"
                  : "text-gray-400 hover:text-gray-200 border-transparent",
              )}
            >
              People ({participants.length + 1})
            </button>
            <button
              onClick={() => setSidePanel(null)}
              className="px-3 text-gray-500 hover:text-gray-300 transition text-lg leading-none"
              title="Close"
            >
              ×
            </button>
          </div>

          {sidePanel === "chat" ? (
            <ChatPanel
              messages={chatMessages}
              input={chatInput}
              onInputChange={setChatInput}
              onSend={sendChatMessage}
              localIdentity={localParticipant.identity}
              endRef={chatEndRef}
            />
          ) : (
            <ParticipantListPanel
              participants={participants}
              localParticipant={localParticipant}
              speakingSet={speakingSet}
            />
          )}
        </div>
      )}

      {/* Audio renderer (renders all remote audio) */}
      <RoomAudioRenderer />
    </div>
  );
}
