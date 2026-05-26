import { Header } from "@/components/layout/header";
import { getCurrentProfile } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <div className="min-h-screen bg-gradient-to-b from-leaf-50/50 to-background">
      <Header profile={profile} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
