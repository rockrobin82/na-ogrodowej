import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, userHasApprovedPackage } from "@/lib/auth";
import { getAppSettings, isSeedDropOpen } from "@/lib/settings";
import { getMySeedPackages } from "@/lib/actions/seeds";
import { getMyOrders } from "@/lib/actions/orders";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const settings = await getAppSettings();
  const packages = await getMySeedPackages();
  const orders = await getMyOrders();
  const hasApproved = profile
    ? await userHasApprovedPackage(profile.id)
    : false;
  const dropOpen = isSeedDropOpen(settings);

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

      {!hasApproved && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader
            title="Zacznij od wkładu"
            description="Aby móc zamawiać nasiona innych, musisz mieć co najmniej jedną zatwierdzoną paczkę."
          />
          <Link href="/seeds/add">
            <Button>Dodaj nasiona</Button>
          </Link>
        </Card>
      )}

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
          <CardHeader title="Ostatnie zamówienia" />
          {orders.length === 0 ? (
            <p className="text-sm text-soil-600">Brak zamówień.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {orders.slice(0, 3).map((order) => (
                <li key={order.id} className="text-soil-700">
                  {new Date(order.created_at).toLocaleDateString("pl-PL")} —{" "}
                  {order.status}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
