import { Badge } from "@/components/ui/card";
import type { OrderStatus } from "@/types/database";

type BadgeVariant = "default" | "success" | "warning" | "danger";

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; variant: BadgeVariant }
> = {
  submitted: { label: "Złożone", variant: "warning" },
  approved: { label: "Zatwierdzone", variant: "default" },
  packed: { label: "Spakowane", variant: "default" },
  shipped: { label: "Wysłane", variant: "success" },
  cancelled: { label: "Anulowane", variant: "danger" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = orderStatusMeta[status];

  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
