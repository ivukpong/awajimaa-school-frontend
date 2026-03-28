"use client";
import React, { useState } from "react";

// Dummy data for demonstration
const dummyNotifications = [
  {
    id: 1,
    message: "Your gig has received a new proposal.",
    read: false,
    created_at: "2026-03-28T10:00:00Z",
  },
  {
    id: 2,
    message: "Payment received for English Tutor gig.",
    read: true,
    created_at: "2026-03-27T15:30:00Z",
  },
];

const SponsorNotificationsPage = () => {
  const [notifications, setNotifications] = useState(dummyNotifications);

  const handleMarkRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="grid gap-3">
        {notifications.length === 0 ? (
          <div className="text-gray-500">No notifications.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`border rounded p-3 flex items-center justify-between ${n.read ? "bg-gray-100" : "bg-white"}`}
            >
              <div>
                <div className="text-sm">{n.message}</div>
                <div className="text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
              {!n.read && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleMarkRead(n.id)}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SponsorNotificationsPage;
