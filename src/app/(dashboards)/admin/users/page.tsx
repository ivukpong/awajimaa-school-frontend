import React, { useState } from "react";

// Dummy data for demonstration
const dummyUsers = [
  {
    id: 1,
    name: "Super Admin",
    email: "admin@awajimaa.com",
    role: "superadmin",
    status: "active",
  },
  {
    id: 2,
    name: "Parent A",
    email: "parenta@email.com",
    role: "sponsor",
    status: "active",
  },
  {
    id: 3,
    name: "Teacher B",
    email: "teacherb@email.com",
    role: "teacher",
    status: "suspended",
  },
];

const AdminUsersPage = () => {
  const [users, setUsers] = useState(dummyUsers);

  const handleSuspend = (userId: number) => {
    // TODO: Call API to suspend user
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: "suspended" } : u)),
    );
  };
  const handleActivate = (userId: number) => {
    // TODO: Call API to activate user
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: "active" } : u)),
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="grid gap-3">
        {users.map((user) => (
          <div key={user.id} className="border rounded p-3 flex flex-col gap-1">
            <div className="font-semibold">
              {user.name}{" "}
              <span className="text-xs text-gray-500">({user.role})</span>
            </div>
            <div>Email: {user.email}</div>
            <div>
              Status:{" "}
              <span
                className={
                  user.status === "active" ? "text-green-600" : "text-red-600"
                }
              >
                {user.status}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              {user.status === "active" ? (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleSuspend(user.id)}
                >
                  Suspend
                </button>
              ) : (
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleActivate(user.id)}
                >
                  Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsersPage;
