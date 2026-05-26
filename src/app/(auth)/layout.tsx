export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-leaf-50 to-background px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-4xl" aria-hidden>
          🌱
        </span>
        <h1 className="mt-2 text-2xl font-bold text-leaf-800">Na-Ogrodowej</h1>
      </div>
      {children}
    </div>
  );
}
