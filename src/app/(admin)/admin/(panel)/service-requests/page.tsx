import { getAdminSession } from "@/lib/admin-auth";
import { ServiceKanban } from "@/features/admin/components/ServiceKanban";
import { adminQuery } from "@/features/admin/guard";
import { AdminPermission } from "@/features/admin/permissions";
import {
  listServiceRequests,
  listTechnicians,
} from "@/features/admin/queries";
import { hasAnyRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function AdminServiceRequestsPage() {
  const session = await getAdminSession();
  const canManage = hasAnyRole(session, [...AdminPermission.SERVICE_REQUESTS]);

  const [requests, technicians] = await Promise.all([
    adminQuery(() => listServiceRequests()),
    adminQuery(() => listTechnicians()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Service requests
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kanban board by status — assign technicians and move cards through the
          pipeline.
        </p>
      </div>

      <ServiceKanban
        canManage={canManage}
        technicians={technicians}
        requests={requests.map((r) => ({
          id: r.id,
          type: r.type,
          status: r.status,
          notes: r.notes,
          customerName: r.customerName,
          phone: r.phone,
          createdAt: r.createdAt,
          user: r.user,
          technician: r.technician,
        }))}
      />
    </div>
  );
}
