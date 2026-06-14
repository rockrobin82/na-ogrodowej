import { CartView } from "@/components/cart/cart-view";
import { getCurrentProfile } from "@/lib/auth";
import { getAppSettings, isSeedDropOpen } from "@/lib/settings";

export default async function CartPage() {
  const settings = await getAppSettings();
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-soil-900">Koszyk</h1>
        <p className="mt-1 text-soil-600">Podsumowanie i złożenie zamówienia</p>
      </div>
      <CartView
        canOrder={hasApproved && isSeedDropOpen(settings)}
        dropHour={settings.seed_drop_hour}
        hasApprovedPackage={hasApproved}
      />
    </div>
  );
}
