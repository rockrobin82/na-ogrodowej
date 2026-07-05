import { Check, Package, Truck } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { OrderStatus } from "@/types/database";

type TimelineStep = {
  status: Exclude<OrderStatus, "cancelled">;
  label: string;
  timestamp: string | null;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const statusOrder: Exclude<OrderStatus, "cancelled">[] = [
  "submitted",
  "approved",
  "packed",
  "shipped",
];

function formatDate(timestamp: string | null) {
  if (!timestamp) return { date: "—", time: "" };

  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function getStepState(stepIndex: number, currentIndex: number) {
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "future";
}

export function OrderStatusTimeline({
  status,
  created_at,
  approved_at,
  packed_at,
  shipped_at,
}: {
  status: OrderStatus;
  created_at: string;
  approved_at?: string | null;
  packed_at?: string | null;
  shipped_at?: string | null;
}) {
  if (status === "cancelled") {
    return (
      <div className="inline-flex items-center rounded-full bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800">
        <span aria-hidden className="mr-1.5">
          🔴
        </span>
        Zamówienie anulowane
      </div>
    );
  }

  const currentIndex = statusOrder.indexOf(status);
  const steps: TimelineStep[] = [
    {
      status: "submitted",
      label: "Złożone",
      timestamp: created_at,
      Icon: Check,
    },
    {
      status: "approved",
      label: "Zatwierdzone",
      timestamp: approved_at ?? null,
      Icon: Check,
    },
    {
      status: "packed",
      label: "Spakowane",
      timestamp: packed_at ?? null,
      Icon: Package,
    },
    {
      status: "shipped",
      label: "Wysłane",
      timestamp: shipped_at ?? null,
      Icon: Truck,
    },
  ];

  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0">
      {steps.map((step, index) => {
        const state = getStepState(index, currentIndex);
        const Icon = step.Icon;
        const formatted = formatDate(step.timestamp);
        const isCompleted = state === "completed";
        const isCurrent = state === "current";

        return (
          <li
            key={step.status}
            className="relative flex gap-3 sm:min-w-[104px] sm:flex-1 sm:flex-col sm:items-center sm:gap-2"
          >
            {index > 0 && (
              <span
                aria-hidden
                className={`absolute left-4 top-0 h-[calc(100%+1rem)] w-0.5 -translate-y-[calc(50%+0.5rem)] sm:left-0 sm:top-4 sm:h-0.5 sm:w-1/2 sm:-translate-y-0 ${
                  index <= currentIndex ? "bg-leaf-600" : "bg-soil-200"
                }`}
              />
            )}
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={`absolute left-4 top-8 h-[calc(100%+1rem)] w-0.5 sm:left-1/2 sm:top-4 sm:h-0.5 sm:w-1/2 ${
                  index < currentIndex ? "bg-leaf-600" : "bg-soil-200"
                }`}
              />
            )}

            <span
              className={`relative z-10 flex shrink-0 items-center justify-center rounded-full ${
                isCompleted
                  ? "h-8 w-8 bg-leaf-600 text-white"
                  : isCurrent
                    ? "h-9 w-9 border-2 border-leaf-600 bg-white text-leaf-700 ring-4 ring-leaf-100"
                    : "h-8 w-8 border-2 border-soil-200 bg-white text-soil-400"
              }`}
            >
              <Icon className={isCurrent ? "h-[18px] w-[18px]" : "h-4 w-4"} />
            </span>

            <div className="min-w-0 sm:text-center">
              <p
                className={`text-sm font-medium ${
                  isCompleted || isCurrent ? "text-soil-900" : "text-soil-500"
                }`}
              >
                {step.label}
              </p>
              <p className="mt-0.5 whitespace-pre-line text-xs leading-5 text-soil-500">
                {formatted.time
                  ? `${formatted.date}\n${formatted.time}`
                  : formatted.date}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
