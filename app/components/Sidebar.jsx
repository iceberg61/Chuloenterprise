"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ShoppingBag,
  BookOpen,
  HelpCircle,
  Info,
  LogIn,
  LogOut,
  User,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/fund", label: "Fund My Account", icon: DollarSign },
    { href: "/orders", label: "Orders", icon: ShoppingBag },
    { href: "/rules", label: "Rules", icon: BookOpen },
    { href: "/why-buy", label: "Why Buy Accounts", icon: Info },
    { href: "/customer-care", label: "Customer Care", icon: HelpCircle },
  ];

  const handleNavigate = (href) => {
    onClose?.(); 
    router.push(href);
  };

  const handleLogout = () => {
    logout();
    onClose?.(); 
    router.push("/login");
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-60 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center md:block">
        <h2 className="text-xl font-bold text-blue-600">Chuloenterprise</h2>
      </div>

      {/* User */}
      {user && (
        <div className="flex items-center space-x-3 px-6 py-4 border-b border-gray-200 bg-blue-50">
          <User className="text-blue-600 w-5 h-5" />
          <span className="font-medium text-gray-800">
            Welcome, {user.username || "User"}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-6 flex flex-col space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <button
            key={href}
            onClick={() => handleNavigate(href)}
            className={`flex items-center px-6 py-3 text-left w-full hover:bg-blue-50 transition-colors ${
              pathname === href
                ? "bg-blue-100 text-blue-600 font-medium"
                : "text-gray-700"
            }`}
          >
            <Icon className="w-5 h-5 mr-3" />
            {label}
          </button>
        ))}

        {/* Login / Logout */}
        <div className="mt-6 border-t pt-4 px-6">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center text-red-600 hover:bg-red-50 w-full px-3 py-2 rounded-lg"
            >
              <LogOut className="w-5 h-5 mr-2" /> Logout
            </button>
          ) : (
            <button
              onClick={() => handleNavigate("/login")}
              className="flex items-center text-blue-600 hover:bg-blue-50 w-full px-3 py-2 rounded-lg"
            >
              <LogIn className="w-5 h-5 mr-2" /> Login
            </button>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
