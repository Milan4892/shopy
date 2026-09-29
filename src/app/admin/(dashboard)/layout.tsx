import { ReactNode } from "react";
import Link from "next/link";

const navigation = [
  { name: "Dashboard", href: "/admin" },
  { name: "Users", href: "/admin/users" },
  { name: "Products", href: "/admin/products" },
  { name: "Purchases", href: "/admin/purchases" },
  { name: "Wallet", href: "/admin/wallet" },
  { name: "Withdrawals", href: "/admin/withdrawals" },
  { name: "Mining", href: "/admin/mining" },
  { name: "Missions", href: "/admin/missions" },
  { name: "Referrals", href: "/admin/referrals" },
  { name: "Lucky Draw", href: "/admin/lucky-draw" },
  { name: "Notifications", href: "/admin/notifications" },
  { name: "Transactions", href: "/admin/transactions" },
  { name: "Settings", href: "/admin/settings" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f7f2]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-gray-100 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-xl font-black text-black">
              S
            </div>

            <div>
              <p className="font-bold text-black">Shopy</p>
              <p className="text-xs text-gray-400">Administration</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-lime-50 hover:text-black"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-100 p-4">
            <Link
              href="/"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-black"
            >
              Back to Shopy
            </Link>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="font-bold text-black">
                Shopy Administration
              </h1>

              <p className="text-xs text-gray-400">
                Manage users, products, finances and platform activity
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
              S
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}