import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      city,
      phone,
      postal_code,
      address_line1
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Użytkownicy
        </h1>

        <p className="text-muted-foreground">
          Lista użytkowników i danych wysyłkowych
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="p-3 text-left">Imię</th>
              <th className="p-3 text-left">Miasto</th>
              <th className="p-3 text-left">Telefon</th>
              <th className="p-3 text-left">Kod</th>
              <th className="p-3 text-left">Adres</th>
            </tr>
          </thead>

          <tbody>
            {users?.map((user) => (
              <tr
                key={user.id}
                className="border-t"
              >
                <td className="p-3">
                  {user.full_name || "-"}
                </td>

                <td className="p-3">
                  {user.city || "-"}
                </td>

                <td className="p-3">
                  {user.phone || "-"}
                </td>

                <td className="p-3">
                  {user.postal_code || "-"}
                </td>

                <td className="p-3">
                  {user.address_line1 || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}