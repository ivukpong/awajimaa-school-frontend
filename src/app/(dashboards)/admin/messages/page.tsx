import React, { useState } from "react";

const dummyMessages = [
  {
    id: 1,
    from: "System",
    subject: "Dispute Alert",
    body: "A new dispute has been opened for English Tutor gig.",
    read: false,
  },
  {
    id: 2,
    from: "Sponsor A",
    subject: "Account Inquiry",
    body: "Please review my account status.",
    read: true,
  },
];

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState(dummyMessages);
  const [selected, setSelected] = useState<any>(null);
  const handleMarkRead = (id: number) => {
    setMessages(messages.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Messages</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`border rounded p-3 cursor-pointer ${msg.read ? "bg-gray-100" : "bg-white"}`}
              onClick={() => setSelected(msg)}
            >
              <div className="font-semibold">{msg.subject}</div>
              <div className="text-xs text-gray-500">From: {msg.from}</div>
              {!msg.read && (
                <span className="text-xs text-blue-600">Unread</span>
              )}
            </div>
          ))}
        </div>
        <div>
          {selected ? (
            <div className="border rounded p-4">
              <div className="font-bold text-lg mb-2">{selected.subject}</div>
              <div className="mb-2 text-gray-700">From: {selected.from}</div>
              <div className="mb-4">{selected.body}</div>
              {!selected.read && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    handleMarkRead(selected.id);
                    setSelected({ ...selected, read: true });
                  }}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Select a message to view</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessagesPage;
