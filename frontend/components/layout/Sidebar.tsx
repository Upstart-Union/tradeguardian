"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: "⌂",
  },
  {
    name: "AI Opportunities",
    href: "/opportunities",
    icon: "✦",
  },
  {
    name: "Trade Analysis",
    href: "/trade",
    icon: "↗",
  },
  {
    name: "History",
    href: "/history",
    icon: "◷",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Brand */}
      <div className="flex h-20 items-center border-b border-zinc-800 px-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            TradeGuardian
          </h1>

          <p className="mt-1 text-xs text-zinc-500">
            AI Risk Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white",
                ].join(" ")}
              >
                <span className="w-5 text-center text-base">
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom status */}
      <div className="border-t border-zinc-800 p-4">
        <div className="rounded-lg bg-zinc-900 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-xs font-medium text-zinc-300">
              Guardian Online
            </span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Monitoring portfolio risk and AI trade proposals.
          </p>
        </div>
      </div>
    </aside>
  );
}