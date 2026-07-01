"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cancelOrderAction } from "@/lib/actions/orders";
import type { OrderStatus } from "@/types/database";

type OrderHistoryOrder = {
  id: string;
  status: OrderStatus;
  created_at: string;
  order_items?: Array<{
    id?: string;
    quantity: number;
    seed_packages?: {
      plant_name: string;
      variety?: string | null;
    } | null;
  }>;
};

const statusBadge: Record<
  OrderStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" }
> = {
  submitted: { label: "submitted", variant: "warning" },
  fulfilled: { label: "fulfilled", variant: "success" },
  cancelled: { label: "cancelled", variant: "danger" },
};

export function OrderHistory({ orders }: { orders: OrderHistoryOrder[] }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ error?: string; success?: string }>(
    {}
  );
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCancel = (orderId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? All reserved seeds will be returned to inventory."
    );

    if (!confirmed) return;

    setPendingOrderId(orderId);
    setMessage({});

    startTransition(async () => {
      const result = await cancelOrderAction(orderId);
      setMessage(result);
      setPendingOrderId(null);

      if (result.success) {
        router.refresh();
      }
    });
  };

  if (orders.length === 0) {
    return <p className="text-sm text-soil-600">Brak zamówień.</p>;
  }

  return (
    <div className="space-y-4">
      {message.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {message.error}
        </p>
      )}
      {message.success && (
        <p className="rounded-lg bg-leaf-50 px-3 py-2 text-sm text-leaf-800">
          {message.success}
        </p>
      )}

      <ul className="space-y-3">
        {orders.map((order) => {
          const badge = statusBadge[order.status];
          const cancelPending = isPending && pendingOrderId === order.id;

          return (
            <li
              key={order.id}
              className="rounded-lg border border-soil-100 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-soil-900">
                      {new Date(order.created_at).toLocaleDateString("pl-PL")}
                    </p>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-soil-700">
                    {order.order_items?.map((item, index) => (
                      <li key={item.id ?? `${order.id}-${index}`}>
                        {item.seed_packages?.plant_name ?? "Nasiona"}
                        {item.seed_packages?.variety &&
                          ` (${item.seed_packages.variety})`}{" "}
                        × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                {order.status === "submitted" && (
                  <Button
                    type="button"
                    variant="danger"
                    disabled={cancelPending}
                    onClick={() => handleCancel(order.id)}
                  >
                    {cancelPending ? "Cancelling..." : "Cancel Order"}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
