"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  createSeedPackageAction,
  type ActionState,
} from "@/lib/actions/seeds";

const initialState: ActionState = {};

export function SeedPackageForm({ maxPackages }: { maxPackages: number }) {
  const [state, action, pending] = useActionState(
    createSeedPackageAction,
    initialState
  );

  return (
    <Card>
      <CardHeader
        title="Dodaj paczkę nasion"
        description={`Maksymalnie ${maxPackages} paczek na użytkownika. Paczka wymaga zatwierdzenia przez administratora po dostarczeniu.`}
      />
      <form action={action} className="space-y-4">
        <Input
          label="Nazwa rośliny"
          name="plantName"
          required
          placeholder="np. Pomidor"
        />
        <Input
          label="Odmiana (opcjonalnie)"
          name="variety"
          placeholder="np. Malinowy"
        />
        <Input
          label="Ilość nasion / paczek"
          name="quantity"
          type="number"
          min={1}
          required
        />
        <Textarea
          label="Opis (opcjonalnie)"
          name="description"
          placeholder="Informacje o pochodzeniu, roku zbioru…"
        />
        <Input
          label="Data dostarczenia (opcjonalnie)"
          name="deliveredAt"
          type="datetime-local"
        />
        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-lg bg-leaf-50 px-3 py-2 text-sm text-leaf-800">
            {state.success}
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Zapisywanie…" : "Dodaj paczkę"}
        </Button>
      </form>
    </Card>
  );
}
