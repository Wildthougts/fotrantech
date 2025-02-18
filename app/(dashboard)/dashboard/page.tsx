import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supabase";
import { FiActivity } from "react-icons/fi";
import { SignIn, UserButton } from "@clerk/nextjs";
import ContactBar from "@/app/components/ContactBar";
import Link from "next/link";

async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <SignIn />
      </div>
    );
  }

  // Fetch recent payments
  const { data: recentPayments } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch available services
  const { data: availableServices } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .limit(6);

  return (
    <>
      <ContactBar />
      <div className="space-y-8 p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Available Services
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {availableServices?.length || 0}
                </h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiActivity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Account</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {user.firstName || "User"}
                </h3>
              </div>
              <div className="p-1">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </div>

        {/* Available Services Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Available Services
            </h2>
            <div className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {availableServices?.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900">
                        {service.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {service.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          ${service.price}
                        </span>
                        <Link
                          href="/services"
                          className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {(!availableServices || availableServices.length === 0) && (
                <p className="text-center text-gray-500">
                  No services available at the moment.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Payments Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Payments
            </h2>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPayments?.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!recentPayments || recentPayments.length === 0) && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No recent payments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
