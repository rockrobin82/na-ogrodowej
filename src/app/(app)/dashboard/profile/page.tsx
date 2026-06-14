import { ShippingForm } from "@/components/forms/shipping-form";
import { getCurrentProfile } from "@/lib/auth";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dane wysyłkowe</h1>
        <p>Nie znaleziono profilu użytkownika.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Dane wysyłkowe
        </h1>

        <p className="text-muted-foreground">
          Uzupełnij dane do wysyłki paczek.
        </p>
      </div>

      <ShippingForm profile={profile} />
    </div>
  );
}