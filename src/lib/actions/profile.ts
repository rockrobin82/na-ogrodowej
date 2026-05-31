"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateShippingData(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const payload = {
    full_name: formData.get("full_name") as string,
    address_line1: formData.get("address_line1") as string,
    postal_code: formData.get("postal_code") as string,
    city: formData.get("city") as string,
    phone: formData.get("phone") as string,
    shipping_notes: formData.get("shipping_notes") as string,
  };

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) {
    console.error(error);
    throw new Error("Nie udało się zapisać danych");
  }

  return {
    success: true,
  };
}