"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { LogoutButton } from "@/components/layout/logout-button";
import type { Profile } from "@/types/database";

const navItems = [
  { href: "/dashboard", label: "Panel" },
  { href: "/seeds/add", label: "Dodaj nasiona" },
  { href: "/seeds/available", label: "Dostępne" },
  { href: "/cart", label: "Koszyk" },
];

export function Header({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <header className="sticky top-0 z-50 border-b border-leaf-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🌱
          </span>
          <span className="font-semibold text-leaf-700">Na-Ogrodowej</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === item.href
                  ? "bg-leaf-100 text-leaf-800"
                  : "text-soil-600 hover:bg-soil-100 hover:text-soil-900"
              }`}
            >
              {item.label}
              {item.href === "/cart" && cartCount > 0 && (
                <span className="ml-1.5 rounded-full bg-leaf-600 px-1.5 py-0.5 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          ))}
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === "/admin"
                  ? "bg-leaf-100 text-leaf-800"
                  : "text-soil-600 hover:bg-soil-100"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 text-sm text-soil-600">
          {profile?.full_name && (
            <span className="hidden sm:inline">{profile.full_name}</span>
          )}
          <LogoutButton />
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-leaf-50 px-4 py-2 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
              pathname === item.href
                ? "bg-leaf-100 text-leaf-800"
                : "text-soil-600"
            }`}
          >
            {item.label}
          </Link>
        ))}
        {profile?.role === "admin" && (
          <Link
            href="/admin"
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
              pathname === "/admin" ? "bg-leaf-100 text-leaf-800" : "text-soil-600"
            }`}
          >
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
}
