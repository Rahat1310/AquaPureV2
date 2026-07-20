import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Calendar, Phone, User, Wrench } from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getServiceRequestsByUser } from "@/features/portal/queries";

export const metadata: Metadata = {
  title: "Service Requests — AquaPure",
  description: "Track your AMC, installation, and warranty requests.",
};

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  INSTALLATION: "Installation",
  AMC: "AMC",
  REPAIR: "Repair",
  WATER_TESTING: "Water Testing",
  WARRANTY_REGISTRATION: "Warranty",
};

const STATUS_VARIANT: Record<
  string,
  "warning" | "secondary" | "default" | "success" | "sale" | "outline"
> = {
  OPEN: "warning",
  IN_PROGRESS: "secondary",
  COMPLETED: "success",
  CANCELLED: "sale",
};

export default async function ServiceRequestsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?redirect_url=/account/service-requests");
  }

  const requests = await getServiceRequestsByUser(session.user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Service Requests
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          AMC, installation, repair, and warranty status.
        </p>
      </header>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-blue-200 bg-white/60 py-20 text-center backdrop-blur">
          <div className="grid size-16 place-items-center rounded-2xl bg-secondary text-primary">
            <Wrench className="size-8" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">No service requests</p>
            <p className="mt-1 text-sm text-slate-500">
              Installation and AMC requests will show up here.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {requests.map((req) => (
            <li key={req.id}>
              <Card className="border-blue-100/80 bg-white/85">
                <CardContent className="flex flex-wrap items-start gap-4 p-5">
                  <div className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                    <Wrench className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900">
                        {TYPE_LABELS[req.type] ?? req.type}
                      </span>
                      <Badge variant={STATUS_VARIANT[req.status] ?? "outline"}>
                        {req.status.replace("_", " ")}
                      </Badge>
                    </div>
                    {req.productModel && (
                      <p className="text-sm text-slate-600">
                        Model:{" "}
                        <span className="font-medium text-slate-800">
                          {req.productModel}
                        </span>
                      </p>
                    )}
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {req.address}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {new Date(req.createdAt).toLocaleDateString("en-BD", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {req.scheduleDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          Scheduled{" "}
                          {new Date(req.scheduleDate).toLocaleDateString(
                            "en-BD",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      )}
                      {req.technician && (
                        <span className="inline-flex items-center gap-1">
                          <User className="size-3.5" />
                          {req.technician.name}
                          {req.technician.phone && (
                            <>
                              {" · "}
                              <Phone className="size-3" />
                              {req.technician.phone}
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    {req.notes && (
                      <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        {req.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
