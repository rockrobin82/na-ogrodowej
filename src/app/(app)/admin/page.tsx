import {
  SettingsForm,
  PendingApprovals,
  OrdersList,
} from "@/components/admin/admin-panel";
import { Card, CardHeader } from "@/components/ui/card";
import { getAppSettings } from "@/lib/settings";
import {
  getPendingPackages,
  getAllOrders,
  getAdminDashboardStats,
} from "@/lib/actions/admin";

export default async function AdminPage() {
  const [settings, pending, orders, stats] = await Promise.all([
    getAppSettings(),
    getPendingPackages(),
    getAllOrders(),
    getAdminDashboardStats(),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-soil-900">Panel administratora</h1>
        <p className="mt-1 text-soil-600">
          Zatwierdzanie paczek, ustawienia i podgląd zamówień
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-soil-600">Wszyscy użytkownicy</p>
          <p className="mt-1 text-3xl font-bold text-soil-900">
            {stats.totalUsers}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-soil-600">Oczekujące zgłoszenia nasion</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">
            {stats.pendingSeedSubmissions}
          </p>
        </Card>
        <Card>
          <CardHeader title="Najnowsi użytkownicy" />
          {stats.latestUsers.length === 0 ? (
            <p className="text-sm text-soil-600">Brak użytkowników.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {stats.latestUsers.map((user) => (
                <li key={user.id} className="text-soil-700">
                  <span className="font-medium">
                    {user.full_name || "Użytkownik"}
                  </span>{" "}
                  <span className="text-soil-500">({user.role})</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

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
