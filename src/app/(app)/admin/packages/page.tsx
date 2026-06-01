import { Card } from "@/components/ui/card";
import {
        getAllSeedPackages,
        approvePackageDirect,
        rejectPackageDirect,
      } from "@/lib/actions/admin";

export default async function AdminPackagesPage() {
  const packages = await getAllSeedPackages();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Paczki nasion
        </h1>

        <p className="text-muted-foreground">
          Zarządzanie paczkami użytkowników
        </p>
      </div>

      <div className="space-y-4">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {pkg.plant_name}
                  {pkg.variety ? ` — ${pkg.variety}` : ""}
                </h2>

                <p className="text-sm text-muted-foreground">
                  Dodane przez użytkownika:
                </p>

                <p className="text-sm">
                  Ilość: {pkg.quantity_total}
                </p>

                <p className="text-sm">
                  Status: {pkg.status}
                </p>
              </div>

              <div className="flex gap-2">

                <form action={approvePackageDirect}>
                  <input
                    type="hidden"
                    name="packageId"
                    value={pkg.id}
                  />

                  <input
                    type="hidden"
                    name="status"
                    value="approved"
                  />

                  <button
                    className="rounded bg-green-600 px-3 py-2 text-sm text-white"
                  >
                    Zatwierdź
                  </button>
                </form>

                <form action={rejectPackageDirect}>
                  <input
                    type="hidden"
                    name="packageId"
                    value={pkg.id}
                  />

                  <input
                    type="hidden"
                    name="status"
                    value="rejected"
                  />

                  <button
                    className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                  >
                    Odrzuć
                  </button>
                </form>

              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}