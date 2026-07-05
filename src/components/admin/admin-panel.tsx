"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { OrderStatusTimeline } from "@/components/admin/order-status-timeline";
import {
  approvePackageAction,
  updateOrderStatusAction,
  updateSettingsAction,
  type ActionState,
} from "@/lib/actions/admin";
import type { AppSettings, OrderStatus, SeedPackage } from "@/types/database";

const initialState: ActionState = {};

const orderStatuses: OrderStatus[] = [
  "submitted",
  "approved",
  "packed",
  "shipped",
  "cancelled",
];

const orderStatusLabels: Record<OrderStatus, string> = {
  submitted: "Złożone",
  approved: "Zatwierdzone",
  packed: "Spakowane",
  shipped: "Wysłane",
  cancelled: "Anulowane",
};

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const [state, action, pending] = useActionState(
    updateSettingsAction,
    initialState
  );

  return (
    <Card>
      <CardHeader
        title="Ustawienia aplikacji"
        description="Godzina otwarcia zamówień i limity użytkowników"
      />
      <form action={action} className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Godzina dropu nasion (0–23)"
          name="seedDropHour"
          type="number"
          min={0}
          max={23}
          defaultValue={settings.seed_drop_hour}
          required
        />
        <Input
          label="Max paczek na użytkownika"
          name="maxPackagesPerUser"
          type="number"
          min={1}
          defaultValue={settings.max_packages_per_user}
          required
        />
        <Input
          label="Max ilość / rodzaj / użytkownik"
          name="maxQuantityPerSeedPerUser"
          type="number"
          min={1}
          defaultValue={settings.max_quantity_per_seed_per_user}
          required
        />
        {state.error && (
          <p className="col-span-full text-sm text-red-600">{state.error}</p>
        )}
        {state.success && (
          <p className="col-span-full text-sm text-leaf-700">{state.success}</p>
        )}
        <div className="col-span-full">
          <Button type="submit" disabled={pending}>
            Zapisz ustawienia
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ApprovalForm({ pkg }: { pkg: SeedPackage }) {
  const [state, action, pending] = useActionState(
    approvePackageAction,
    initialState
  );
  const contributor =
    (pkg as SeedPackage & { profiles?: { full_name?: string | null } })
      .profiles;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-soil-900">
            {pkg.plant_name}
            {pkg.variety && ` — ${pkg.variety}`}
          </h3>
          <p className="text-sm text-soil-600">
            {contributor?.full_name ?? "Użytkownik"} · Ilość:{" "}
            {pkg.quantity_total}
          </p>
          {pkg.description && (
            <p className="mt-1 text-sm text-soil-600">{pkg.description}</p>
          )}
        </div>
        <Badge variant="warning">Oczekuje</Badge>
      </div>
      <form action={action} className="flex flex-wrap gap-2">
        <input type="hidden" name="packageId" value={pkg.id} />
        <input
          type="text"
          name="adminNotes"
          placeholder="Notatka (opcjonalnie)"
          className="min-w-[200px] flex-1 rounded-lg border border-soil-200 px-3 py-2 text-sm"
        />
        {state.error && (
          <p className="w-full text-sm text-red-600">{state.error}</p>
        )}
        {state.success && (
          <p className="w-full text-sm text-leaf-700">{state.success}</p>
        )}
        <Button type="submit" name="status" value="approved" disabled={pending}>
          Zatwierdź dostarczenie
        </Button>
        <Button
          type="submit"
          name="status"
          value="rejected"
          variant="danger"
          disabled={pending}
        >
          Odrzuć
        </Button>
      </form>
    </Card>
  );
}

export function PendingApprovals({
  packages,
}: {
  packages: SeedPackage[];
}) {
  if (packages.length === 0) {
    return <p className="text-soil-600">Brak paczek oczekujących na zatwierdzenie.</p>;
  }

  return (
    <ul className="space-y-4">
      {packages.map((pkg) => (
        <li key={pkg.id}>
          <ApprovalForm pkg={pkg} />
        </li>
      ))}
    </ul>
  );
}

export function OrdersList({
  orders,
}: {
  orders: Array<{
    id: string;
    status: OrderStatus;
    created_at: string;
    approved_at?: string | null;
    packed_at?: string | null;
    shipped_at?: string | null;
    tracking_number?: string | null;
    profiles?: { full_name?: string | null };
    order_items?: Array<{
      quantity: number;
      seed_packages?: { plant_name: string; variety?: string | null };
    }>;
  }>;
}) {
  if (orders.length === 0) {
    return <p className="text-soil-600">Brak zamówień.</p>;
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 lg:w-[55%]">
                <p className="font-medium leading-tight text-soil-900">
                  {order.profiles?.full_name ?? "Użytkownik"}
                </p>
                <p className="mt-1 text-xs leading-tight text-soil-500">
                  {new Date(order.created_at).toLocaleString("pl-PL")}
                </p>
                <ul className="mt-1.5 space-y-0.5 text-sm leading-snug text-soil-700">
                  {order.order_items?.map((item, i) => (
                    <li key={i}>
                      {item.seed_packages?.plant_name}
                      {item.seed_packages?.variety &&
                        ` (${item.seed_packages.variety})`}{" "}
                      × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-w-0 lg:flex lg:w-[45%] lg:justify-end">
                <OrderStatusTimeline
                  status={order.status}
                  created_at={order.created_at}
                  approved_at={order.approved_at}
                  packed_at={order.packed_at}
                  shipped_at={order.shipped_at}
                />
              </div>
            </div>
            <OrderWorkflowForm order={order} />
          </Card>
        </li>
      ))}
    </ul>
  );
}

type AdminOrder = Parameters<typeof OrdersList>[0]["orders"][number];

function OrderWorkflowForm({ order }: { order: AdminOrder }) {
  const [state, action, pending] = useActionState(
    updateOrderStatusAction,
    initialState
  );
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order.status
  );

  return (
    <form
      action={action}
      className="mt-4 space-y-3 border-t border-soil-100 pt-4"
    >
      <input type="hidden" name="orderId" value={order.id} />
      {state.error && (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="w-full text-sm text-leaf-700">{state.success}</p>
      )}

      <div
        className={`grid items-end gap-4 ${
          selectedStatus === "shipped"
            ? "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            : "sm:grid-cols-[minmax(0,1fr)_auto]"
        }`}
      >
        <div className="min-w-0 space-y-1.5">
          <label
            htmlFor={`order-status-${order.id}`}
            className="block text-sm font-medium text-soil-800"
          >
            Status zamówienia
          </label>
          <select
            id={`order-status-${order.id}`}
            name="status"
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value as OrderStatus)
            }
            className="w-full rounded-lg border border-soil-200 bg-white px-3 py-2.5 text-sm text-soil-900 shadow-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/20"
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {orderStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>

        {selectedStatus === "shipped" && (
          <div className="min-w-0">
            <Input
              label="Numer śledzenia"
              name="trackingNumber"
              defaultValue={order.tracking_number ?? ""}
              placeholder="np. RR123456789PL"
            />
          </div>
        )}
        <Button
          type="submit"
          disabled={pending}
          className="w-full sm:w-auto sm:justify-self-end"
        >
          {pending ? "Zapisywanie..." : "Zapisz"}
        </Button>
      </div>
    </form>
  );
}
