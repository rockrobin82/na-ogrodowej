"use client";

import { updateShippingData } from "@/lib/actions/profile";
import { useState } from "react";

export function ShippingForm() {
  const [loading, setLoading] = useState(false);

  return (
    <form
    action={async (formData) => {
      setLoading(true);
  
      await updateShippingData(formData);
  
      setLoading(false);
  
      alert("Dane zapisane");
    }}
    className="space-y-4 max-w-xl"
    >

    <div className="space-y-4">
    <input
      name="full_name"
      placeholder="Imię i nazwisko"
      className="w-full rounded-xl border border-green-200 bg-white p-3 text-zinc-900 focus:border-green-500 focus:outline-none"
    />
  
    <input
      name="phone"
      placeholder="Telefon"
      className="w-full rounded-xl border border-green-200 bg-white p-3 text-zinc-900 focus:border-green-500 focus:outline-none"
    />
  
    <input
      name="city"
      placeholder="Miasto"
      className="w-full rounded-xl border border-green-200 bg-white p-3 text-zinc-900 focus:border-green-500 focus:outline-none"
    />
  
    <input
      name="postal_code"
      placeholder="Kod pocztowy"
      className="w-full rounded-xl border border-green-200 bg-white p-3 text-zinc-900 focus:border-green-500 focus:outline-none"
    />
  
    <textarea
      name="address"
      placeholder="Adres wysyłki"
      className="w-full rounded-xl border border-green-200 bg-white p-3 text-zinc-900 focus:border-green-500 focus:outline-none"
    />
  
    <button
      type="submit"
      className="rounded bg-green-600 px-4 py-2 text-white"
    >
      {loading ? "Zapisywanie..." : "Zapisz dane"}
    </button>
  </div>

  </form>
  );
}
