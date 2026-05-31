import { ShippingForm } from "@/components/forms/shipping-form";

export default function ProfilePage() {
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

      <ShippingForm />
    </div>
  );
}
