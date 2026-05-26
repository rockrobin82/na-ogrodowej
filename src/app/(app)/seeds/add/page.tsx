import { SeedPackageForm } from "@/components/forms/seed-form";
import { MySeedList } from "@/components/seeds/seed-list";
import { getAppSettings } from "@/lib/settings";
import { getMySeedPackages } from "@/lib/actions/seeds";

export default async function AddSeedsPage() {
  const settings = await getAppSettings();
  const packages = await getMySeedPackages();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-soil-900">Dodaj nasiona</h1>
        <p className="mt-1 text-soil-600">
          Prześlij paczkę do wymiany. Administrator zatwierdzi ją po dostarczeniu.
        </p>
      </div>
      <SeedPackageForm maxPackages={settings.max_packages_per_user} />
      <section>
        <h2 className="mb-4 text-lg font-semibold text-soil-900">
          Twoje paczki
        </h2>
        <MySeedList packages={packages} />
      </section>
    </div>
  );
}
