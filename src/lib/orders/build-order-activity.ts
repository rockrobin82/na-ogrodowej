import {
  CheckCircle,
  CircleX,
  Package,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { OrderStatus } from "@/types/database";

export type OrderActivityType =
  | "submitted"
  | "approved"
  | "packed"
  | "shipped"
  | "cancelled"
  | "tracking_updated";

export type OrderActivity = {
  type: OrderActivityType;
  title: string;
  timestamp: string;
  icon: LucideIcon;
  color: string;
  metadata?: Record<string, unknown>;
};

type BuildOrderActivityInput = {
  status: OrderStatus;
  created_at: string;
  approved_at?: string | null;
  packed_at?: string | null;
  shipped_at?: string | null;
  tracking_number?: string | null;
  updated_at?: string | null;
};

export function buildOrderActivity(
  order: BuildOrderActivityInput
): OrderActivity[] {
  // TODO:
  // Replace generated activity with order_events query.
  const activities: OrderActivity[] = [
    {
      type: "submitted",
      title: "Zamówienie złożone",
      timestamp: order.created_at,
      icon: CheckCircle,
      color: "text-leaf-700 bg-leaf-50 ring-leaf-100",
    },
  ];

  if (order.approved_at) {
    activities.push({
      type: "approved",
      title: "Zamówienie zatwierdzone",
      timestamp: order.approved_at,
      icon: ShieldCheck,
      color: "text-leaf-700 bg-leaf-50 ring-leaf-100",
    });
  }

  if (order.packed_at) {
    activities.push({
      type: "packed",
      title: "Zamówienie spakowane",
      timestamp: order.packed_at,
      icon: Package,
      color: "text-leaf-700 bg-leaf-50 ring-leaf-100",
    });
  }

  if (order.shipped_at) {
    activities.push({
      type: "shipped",
      title: "Przesyłka nadana",
      timestamp: order.shipped_at,
      icon: Truck,
      color: "text-leaf-700 bg-leaf-50 ring-leaf-100",
      metadata: order.tracking_number
        ? { trackingNumber: order.tracking_number }
        : undefined,
    });
  }

  if (order.status === "cancelled") {
    activities.push({
      type: "cancelled",
      title: "Zamówienie anulowane",
      timestamp: order.updated_at ?? order.created_at,
      icon: CircleX,
      color: "text-red-700 bg-red-50 ring-red-100",
    });
  }

  return activities;
}
