import { createClient } from "@/lib/supabase/server";

export async function canUserOrder(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      full_name,
      address_line1,
      postal_code,
      city,
      phone,
      is_blocked
    `)
    .eq("id", userId)
    .single();

  if (!profile) {
    return {
      allowed: false,
      reason: "Brak profilu użytkownika",
    };
  }

  if (profile.is_blocked) {
    return {
      allowed: false,
      reason: "Konto zostało zablokowane",
    };
  }

  const profileComplete =
    profile.full_name &&
    profile.address_line1 &&
    profile.postal_code &&
    profile.city &&
    profile.phone;

    console.log("PROFILE:", profile);
    console.log("PROFILE COMPLETE:", profileComplete);

  if (!profileComplete) {
    return {
      allowed: false,
      reason:
        "Uzupełnij dane wysyłkowe aby zamawiać nasiona",
    };
  }

  const { count } = await supabase
    .from("seed_packages")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId)
    .eq("status", "approved");

  if ((count ?? 0) < 1) {
    return {
      allowed: false,
      reason:
        "Dodaj i zatwierdź przynajmniej jedną paczkę nasion",
    };
  }

  return {
    allowed: true,
    reason: null,
  };
}