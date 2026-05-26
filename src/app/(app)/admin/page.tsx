import {
  SettingsForm,
  PendingApprovals,
  OrdersList,
} from "@/components/admin/admin-panel";
import { Card, CardHeader } from "@/components/ui/card";
import { getAppSettings } from "@/lib/settings";
import { getPendingPackages, getAllOrders } from "@/lib/actions/admin";

export default async function AdminPage() {
  const settings = await getAppSettings();
  const pending = await getPendingPackages();
  const orders = await getAllOrders();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-soil-900">Panel administratora</h1>
        <p className="mt-1 text-soil-600">
          Zatwierdzanie paczek, ustawienia i podgląd zamówień
        </p>
      </div>

      <SettingsForm settings={settings} />

      <section className="space-y-4">
        <CardHeader
          title="Paczki do zatwierdzenia"
          description="Ręczne zatwierdzenie po fizycznym dostarczeniu nasion"
        />
        <PendingApprovals packages={pending} />
      </section>

      <section className="space-y-4">
        <Card>
          <CardHeader title="Ostatnie zamówienia" />
          <OrdersList orders={orders} />
        </Card>
      </section>
    </div>
  );
}
