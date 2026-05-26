import { AvailableSeedList } from "@/components/seeds/seed-list";
import { getCurrentProfile, userHasApprovedPackage } from "@/lib/auth";
import { getAppSettings, isSeedDropOpen } from "@/lib/settings";
import { getAvailableSeeds } from "@/lib/actions/seeds";

export default async function AvailableSeedsPage() {
  const settings = await getAppSettings();
  const seeds = await getAvailableSeeds();
  const profile = await getCurrentProfile();
  const hasApproved = profile
    ? await userHasApprovedPackage(profile.id)
    : false;
  const canOrder = hasApproved && isSeedDropOpen(settings);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-soil-900">Dostępne nasiona</h1>
        <p className="mt-1 text-soil-600">
          Tylko zatwierdzone paczki z dostępną ilością. Limit:{" "}
          {settings.max_quantity_per_seed_per_user} szt. na rodzaj.
          {!hasApproved && (
            <span className="mt-1 block text-amber-700">
              Dodaj i uzyskaj zatwierdzenie własnej paczki, aby móc zamawiać.
            </span>
          )}
        </p>
      </div>
      <AvailableSeedList
        seeds={seeds}
        maxPerSeed={settings.max_quantity_per_seed_per_user}
        canOrder={canOrder}
      />
    </div>
  );
}
