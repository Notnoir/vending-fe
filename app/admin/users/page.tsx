"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  roleColor: string;
  roleIcon: string;
  status: "active" | "locked" | "inactive";
  lastLogin: string;
  lastLoginTime: string;
  avatar?: string;
  initials?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
    }
  }, [router]);

  const users: User[] = [
    {
      id: 1,
      name: "Dr. Sarah Jenkins",
      email: "sarah.j@medivend.com",
      role: "Super Admin",
      roleColor: "bg-primary/10 text-primary-dark",
      roleIcon: "admin_panel_settings",
      status: "active",
      lastLogin: "Today",
      lastLoginTime: "09:30 AM",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      name: "Mike Ross",
      email: "mike.r@medivend.com",
      role: "Technician",
      roleColor: "bg-orange-100 text-orange-700",
      roleIcon: "engineering",
      status: "active",
      lastLogin: "Yesterday",
      lastLoginTime: "04:15 PM",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      id: 3,
      name: "Lisa Chang",
      email: "lisa.c@medivend.com",
      role: "Inv. Manager",
      roleColor: "bg-blue-100 text-blue-700",
      roleIcon: "inventory",
      status: "locked",
      lastLogin: "Oct 24, 2023",
      lastLoginTime: "11:02 AM",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    {
      id: 4,
      name: "John Doe",
      email: "john.d@medivend.com",
      role: "Auditor",
      roleColor: "bg-gray-100 text-gray-700",
      roleIcon: "fact_check",
      status: "inactive",
      lastLogin: "Sep 15, 2023",
      lastLoginTime: "--:--",
      initials: "JD",
    },
  ];

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "active":
        return (
          <div className="flex items-center gap-2">
            <span className="relative flex size-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-[#111718]">Active</span>
          </div>
        );
      case "locked":
        return (
          <div className="flex items-center gap-2">
            <span className="relative inline-flex rounded-full size-3 bg-red-500"></span>
            <span className="text-sm font-medium text-[#111718]">
              Locked Out
            </span>
          </div>
        );
      case "inactive":
        return (
          <div className="flex items-center gap-2">
            <span className="relative inline-flex rounded-full size-3 bg-gray-400"></span>
            <span className="text-sm font-medium text-[#618689]">Inactive</span>
          </div>
        );
      default:
        return null;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "" ||
      user.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex h-screen bg-[#f6f8f8]">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex flex-col w-full max-w-[1400px] mx-auto p-8 gap-8">
          {/* Breadcrumbs & Header */}
          <div className="flex flex-col gap-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[#618689] text-sm font-medium">
              <span className="hover:text-[#13daec] cursor-pointer transition-colors">
                Admin
              </span>
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
              <span className="text-[#111718]">User Management</span>
            </div>

            {/* Page Heading */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-2 max-w-2xl">
                <h2 className="text-4xl font-black tracking-tight text-[#111718]">
                  User Management
                </h2>
                <p className="text-lg text-[#618689]">
                  Manage access permissions, roles, and security settings for
                  MediVend personnel.
                </p>
              </div>
              <button className="flex items-center gap-2 h-14 px-8 rounded-xl bg-[#13daec] hover:bg-[#0ea5b3] text-black font-bold text-base shadow-lg shadow-[#13daec]/20 transition-all hover:scale-105 active:scale-95">
                <span className="material-symbols-outlined">add</span>
                Add New Admin
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#618689] text-2xl">
                search
              </span>
              <input
                className="w-full h-16 pl-14 pr-4 rounded-xl border border-[#dbe5e6] bg-white text-lg placeholder:text-[#618689]/50 focus:border-[#13daec] focus:ring-4 focus:ring-[#13daec]/10 transition-all outline-none"
                placeholder="Search users by name, email or ID..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="md:col-span-4 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#618689] text-2xl">
                filter_list
              </span>
              <select
                className="w-full h-16 pl-14 pr-10 rounded-xl border border-[#dbe5e6] bg-white text-lg text-[#111718] appearance-none focus:border-[#13daec] focus:ring-4 focus:ring-[#13daec]/10 transition-all outline-none cursor-pointer"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Super Admin</option>
                <option value="tech">Technician</option>
                <option value="inventory">Inventory Manager</option>
                <option value="auditor">Auditor</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#618689] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Users Table */}
          <div className="flex flex-col rounded-2xl border border-[#dbe5e6] bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#dbe5e6] bg-[#f6f8f8]/50">
                    <th className="p-6 text-sm font-bold text-[#618689] uppercase tracking-wider w-1/4">
                      User Info
                    </th>
                    <th className="p-6 text-sm font-bold text-[#618689] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="p-6 text-sm font-bold text-[#618689] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="p-6 text-sm font-bold text-[#618689] uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="p-6 text-sm font-bold text-[#618689] uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dbe5e6]">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="group hover:bg-[#f6f8f8] transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          {user.avatar ? (
                            <div
                              className="size-12 rounded-full bg-cover bg-center shadow-sm border border-white"
                              style={{ backgroundImage: `url(${user.avatar})` }}
                            ></div>
                          ) : (
                            <div className="flex items-center justify-center size-12 rounded-full bg-[#13daec]/20 text-[#0ea5b3] font-black text-lg shadow-sm border border-white">
                              {user.initials}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-base font-bold text-[#111718]">
                              {user.name}
                            </span>
                            <span className="text-sm text-[#618689]">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${user.roleColor} text-sm font-bold`}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {user.roleIcon}
                          </span>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-6">{getStatusIndicator(user.status)}</td>
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[#111718]">
                            {user.lastLogin}
                          </span>
                          <span className="text-xs text-[#618689]">
                            {user.lastLoginTime}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="size-10 flex items-center justify-center rounded-lg hover:bg-[#f6f8f8] text-[#618689] hover:text-[#13daec] transition-colors"
                            title="Edit User"
                          >
                            <span className="material-symbols-outlined">
                              edit
                            </span>
                          </button>
                          <button
                            className="size-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#618689] hover:text-red-500 transition-colors"
                            title="Delete User"
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-6 border-t border-[#dbe5e6] bg-white">
              <span className="text-sm text-[#618689]">
                Showing{" "}
                <span className="font-bold text-[#111718]">
                  1-{filteredUsers.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#111718]">{users.length}</span>{" "}
                users
              </span>
              <div className="flex gap-2">
                <button
                  className="flex items-center justify-center size-10 rounded-lg border border-[#dbe5e6] text-[#618689] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f6f8f8] transition-colors"
                  disabled
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>
                <button className="flex items-center justify-center size-10 rounded-lg border border-[#dbe5e6] text-[#618689] hover:bg-[#f6f8f8] transition-colors">
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
