"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { OrderActivity } from "@/lib/orders/build-order-activity";

function formatDateTime(timestamp: string) {
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

function getTrackingNumber(activity: OrderActivity) {
  const value = activity.metadata?.trackingNumber;
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function OrderActivityTimeline({
  activities,
}: {
  activities: OrderActivity[];
}) {
  const [copied, setCopied] = useState(false);

  const copyTrackingNumber = async (trackingNumber: string) => {
    await navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <section className="mt-5 border-t border-soil-100 pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-soil-900">
          Historia zamówienia
        </h3>
        {copied && (
          <p className="rounded-full bg-leaf-50 px-3 py-1 text-xs font-medium text-leaf-800">
            Numer przesyłki skopiowany
          </p>
        )}
      </div>

      <ol className="space-y-0">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          const { date, time } = formatDateTime(activity.timestamp);
          const trackingNumber = getTrackingNumber(activity);
          const isLast = index === activities.length - 1;

          return (
            <li key={`${activity.type}-${activity.timestamp}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ${activity.color}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {!isLast && <span className="mt-1 h-full min-h-8 w-0.5 bg-soil-200" />}
              </div>

              <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-5"}`}>
                <p className="text-sm font-medium text-soil-900">
                  {activity.title}
                </p>
                <p className="mt-0.5 whitespace-pre-line text-xs leading-5 text-soil-500">
                  {date}
                  {"\n"}
                  {time}
                </p>

                {trackingNumber && (
                  <div className="mt-3 rounded-lg border border-soil-100 bg-soil-100/30 p-3">
                    <p className="text-xs font-medium text-soil-600">
                      Numer przesyłki
                    </p>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                      <p className="break-all text-sm font-medium text-soil-900">
                        {trackingNumber}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="px-3 py-1.5 text-xs"
                        onClick={() => copyTrackingNumber(trackingNumber)}
                      >
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Kopiuj
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
