"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart-store";
import { submitOrderAction } from "@/lib/actions/orders";

export function CartView({
  canOrder,
  dropHour,
  hasApprovedPackage,
}: {
  canOrder: boolean;
  dropHour: number;
  hasApprovedPackage: boolean;
}) {
  const { items, removeItem, updateQuantity, clearCart, totalItems } =
    useCartStore();
  const [message, setMessage] = useState<{ error?: string; success?: string }>(
    {}
  );
  const [pending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await submitOrderAction(items);
      setMessage(result);
      if (result.success) clearCart();
    });
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader title="Koszyk" description="Twój koszyk jest pusty" />
        <Link href="/seeds/available">
          <Button variant="outline">Przeglądaj dostępne nasiona</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={`Koszyk (${totalItems()} szt.)`}
        description={
          !hasApprovedPackage
            ? "Potrzebujesz co najmniej jednej zatwierdzonej paczki, aby zamawiać."
            : !canOrder
              ? `Zamówienia od godziny ${dropHour}:00`
              : "Sprawdź pozycje i złóż zamówienie"
        }
      />
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.seedPackageId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-soil-100 p-4"
          >
            <div>
              <p className="font-medium text-soil-900">{item.plantName}</p>
              {item.variety && (
                <p className="text-sm text-soil-600">{item.variety}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={item.maxAvailable}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(
                    item.seedPackageId,
                    parseInt(e.target.value, 10) || 1
                  )
                }
                className="w-16 rounded-lg border border-soil-200 px-2 py-1 text-center"
              />
              <Button
                variant="ghost"
                onClick={() => removeItem(item.seedPackageId)}
              >
                Usuń
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {message.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {message.error}
        </p>
      )}
      {message.success && (
        <p className="mt-4 rounded-lg bg-leaf-50 px-3 py-2 text-sm text-leaf-800">
          {message.success}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          onClick={handleSubmit}
          disabled={pending || !canOrder || !hasApprovedPackage}
        >
          {pending ? "Składanie…" : "Złóż zamówienie"}
        </Button>
        <Button variant="outline" onClick={clearCart}>
          Wyczyść koszyk
        </Button>
      </div>
    </Card>
  );
}
