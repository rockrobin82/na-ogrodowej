import Link from "next/link";
import { canUserOrder } from "@/lib/permissions";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderHistory } from "@/components/orders/order-history";
import { getCurrentProfile } from "@/lib/auth";
import { getAppSettings, isSeedDropOpen } from "@/lib/settings";
import { getMySeedPackages } from "@/lib/actions/seeds";
import { getMyOrders } from "@/lib/actions/orders";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const settings = await getAppSettings();
  const packages = await getMySeedPackages();
  const orders = await getMyOrders();
  const dropOpen = isSeedDropOpen(settings);
  
  const orderPermission = profile
  ? await canUserOrder(profile.id)
  : {
      allowed: false,
      reason: "Brak użytkownika",
    };

  const approvedCount = packages.filter((p) => p.status === "approved").length;
  const pendingCount = packages.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-soil-900">
          Witaj, {profile?.full_name ?? "Ogrodniku"}!
        </h1>
        <p className="mt-1 text-soil-600">
          Panel wymiany nasion Na-Ogrodowej
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-soil-600">Zatwierdzone paczki</p>
          <p className="text-3xl font-bold text-leaf-700">{approvedCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-soil-600">Oczekujące</p>
          <p className="text-3xl font-bold text-amber-700">{pendingCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-soil-600">Zamówienia</p>
          <p className="text-3xl font-bold text-soil-900">{orders.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-soil-600">Status zamówień</p>
          <p className="text-lg font-semibold text-soil-900">
            {dropOpen
              ? `Otwarte (od ${settings.seed_drop_hour}:00)`
              : `Od ${settings.seed_drop_hour}:00`}
          </p>
        </Card>
      </div>
      
      <Card
  className={
    orderPermission.allowed
      ? "border-green-200 bg-green-50"
      : "border-amber-200 bg-amber-50"
    }
>
  <CardHeader
    title={
      orderPermission.allowed
        ? "Możesz zamawiać nasiona 🌱"
        : "Wymagane działania"
    }
    description={
      orderPermission.allowed
        ? "Twoje konto spełnia warunki wymiany."
        : orderPermission.reason ?? ""
    }
  />
   </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Szybkie akcje" />
          <div className="flex flex-wrap gap-3">
            <Link href="/seeds/add">
              <Button variant="outline">Dodaj paczkę</Button>
            </Link>
            <Link href="/seeds/available">
              <Button variant="outline">Przeglądaj nasiona</Button>
            </Link>
            <Link href="/cart">
              <Button variant="outline">Koszyk</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader title="Historia zamówień" />
          <OrderHistory orders={orders} />
        </Card>
      </div>
    </div>
  );
}
