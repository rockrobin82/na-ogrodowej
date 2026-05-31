"use client";

import { useState } from "react";

export function ShippingForm() {
  const [loading, setLoading] = useState(false);

  return (
    <form className="space-y-4 max-w-xl">
      <div>
        <label>Imię i nazwisko</label>
        <input
          className="w-full border p-2 rounded"
          name="full_name"
        />
      </div>

      <div>
        <label>Adres</label>
        <input
          className="w-full border p-2 rounded"
          name="address_line1"
        />
      </div>

      <div>
        <label>Kod pocztowy</label>
        <input
          className="w-full border p-2 rounded"
          name="postal_code"
        />
      </div>

      <div>
        <label>Miasto</label>
        <input
          className="w-full border p-2 rounded"
          name="city"
        />
      </div>

      <div>
        <label>Telefon</label>
        <input
          className="w-full border p-2 rounded"
          name="phone"
        />
      </div>

      <div>
        <label>Uwagi dla wysyłki</label>
        <textarea
          className="w-full border p-2 rounded"
          name="shipping_notes"
        />
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        Zapisz dane
      </button>
    </form>
  );
}