import { redirect } from "next/navigation";
import { auth } from "@/../auth";
import { ActivityLogsList } from "@/components/admin/activity-logs-list";

export default async function AdminActivityLogsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has admin role
  const userRoles = session.user.roles || [];
  if (!userRoles.includes("admin")) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-card shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-lg font-medium text-foreground mb-6">
            Activity Logs
          </h1>
          <ActivityLogsList />
        </div>
      </div>
    </div>
  );
}
