import { SignedIn, SignIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { isAdmin } from "@/utils/admin";
import { currentUser } from "@clerk/nextjs/server";

async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <SignIn />
      </div>
    );
  }

  const isAdminUser = await isAdmin(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-2xl font-bold text-gray-900">Fotrantech</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
              <Link
                href="/dashboard"
                className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/services"
                className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                Services
              </Link>
              {isAdminUser && (
                <>
                  <Link
                    href="/dashboard/admin/services"
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                  >
                    Manage Services
                  </Link>
                  <Link
                    href="/dashboard/admin/users"
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                  >
                    Manage Users
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
          <h1 className="text-lg font-medium text-black">Fotrantech</h1>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
        <nav className="flex overflow-x-auto border-b border-gray-200 bg-white py-2">
          <Link
            href="/dashboard"
            className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/services"
            className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Services
          </Link>
          {isAdminUser && (
            <>
              <Link
                href="/dashboard/admin/services"
                className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Manage Services
              </Link>
              <Link
                href="/dashboard/admin/users"
                className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Manage Users
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <main className="py-6 px-4 sm:px-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
