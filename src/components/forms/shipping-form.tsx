"use client";

import { useState } from "react";
import { updateShippingData } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";


export function ShippingForm({
  profile,
}: any) {
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        setLoading(true);

        await updateShippingData(formData);

        setLoading(false);

        router.refresh();
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
       
      }}
      className="space-y-4 max-w-xl"
    >
      <div>
        <label>Imię i nazwisko</label>

        <input
          className="w-full rounded-xl border border-green-200 bg-white p-3 text-zinc-900 focus:border-green-500 focus:outline-none"
          name="full_name"
          defaultValue={profile?.full_name || ""}
        />
      </div>

      <div>
        <label>Adres</label>

        <input
          className="w-full rounded-xl border border-green-200 bg-white p-3 text-zinc-900 focus:border-green-500 focus:outline-none"
          name="address_line1"
          defaultValue={profile?.address_line1 || ""}
        />
      </div>

      <div>
        <label>Kod pocztowy</label>

        <input
          className="w-full rounded-xl border border-green-200 bg-white p-3 text-zinc-900 focus:border-green-500 focus:outline-none"
          name="postal_code"
          defaultValue={profile?.postal_code || ""}
        />
      </div>

      <div>
        <label>Miasto</label>

        <input
          className="w-full rounded-xl border border-green-200 bg-white p-3 text-zinc-900 focus:border-green-500 focus:outline-none"
          name="city"
          defaultValue={profile?.city || ""}
        />
      </div>

      <div>
        <label>Telefon</label>

        <input
          className="w-full rounded-xl border border-green-200 bg-white p-3 text-zinc-900 focus:border-green-500 focus:outline-none"
          name="phone"
          defaultValue={profile?.phone || ""}
        />
      </div>

      <div>
        <label>Uwagi dla wysyłki</label>

        <textarea
          className="w-full rounded-xl border border-green-200 bg-white p-3 text-zinc-900 focus:border-green-500 focus:outline-none"
          name="shipping_notes"
          defaultValue={profile?.shipping_notes || ""}
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Zapisywanie..." : "Zapisz dane"}
      </button>
      {success && (
        <p className="text-green-600 font-medium">
          Twoje dane zostały zapisane
        </p>
      )}
    </form>
  );
}