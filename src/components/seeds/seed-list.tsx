"use client";

import { Button } from "@/components/ui/button";
import { Card, Badge } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart-store";
import type { SeedPackage } from "@/types/database";

const statusLabels = {
  pending: { label: "Oczekuje", variant: "warning" as const },
  approved: { label: "Zatwierdzona", variant: "success" as const },
  rejected: { label: "Odrzucona", variant: "danger" as const },
};

export function MySeedList({ packages }: { packages: SeedPackage[] }) {
  if (packages.length === 0) {
    return (
      <p className="text-soil-600">Nie dodałeś jeszcze żadnych paczek nasion.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {packages.map((pkg) => {
        const status = statusLabels[pkg.status];
        return (
          <li key={pkg.id}>
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-soil-900">
                  {pkg.plant_name}
                  {pkg.variety && (
                    <span className="text-soil-600"> — {pkg.variety}</span>
                  )}
                </h3>
                <p className="text-sm text-soil-600">
                  Ilość: {pkg.quantity_total} · Dostępne: {pkg.quantity_available}
                </p>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

export function AvailableSeedList({
  seeds,
  maxPerSeed,
  canOrder,
}: {
  seeds: SeedPackage[];
  maxPerSeed: number;
  canOrder: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);

  if (seeds.length === 0) {
    return (
      <p className="text-soil-600">Brak dostępnych nasion w tej chwili.</p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {seeds.map((seed) => {
        const contributor =
          (seed as SeedPackage & { profiles?: { full_name?: string } })
            .profiles?.full_name ?? "Społeczność";
        return (
          <li key={seed.id}>
            <Card className="flex h-full flex-col">
              <h3 className="font-semibold text-soil-900">{seed.plant_name}</h3>
              {seed.variety && (
                <p className="text-sm text-soil-600">Odmiana: {seed.variety}</p>
              )}
              {seed.description && (
                <p className="mt-2 flex-1 text-sm text-soil-600">
                  {seed.description}
                </p>
              )}
              <p className="mt-2 text-sm text-leaf-700">
                Dostępne: {seed.quantity_available} · max {maxPerSeed}/os.
              </p>
              <p className="text-xs text-soil-500">Od: {contributor}</p>
              <Button
                className="mt-4"
                variant="outline"
                disabled={!canOrder}
                onClick={() =>
                  addItem({
                    seedPackageId: seed.id,
                    plantName: seed.plant_name,
                    variety: seed.variety,
                    maxAvailable: Math.min(
                      seed.quantity_available,
                      maxPerSeed
                    ),
                  })
                }
              >
                {canOrder ? "Dodaj do koszyka" : "Zamówienia niedostępne"}
              </Button>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
