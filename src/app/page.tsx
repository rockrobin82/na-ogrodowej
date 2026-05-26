import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-leaf-50 to-background px-4">
      <div className="max-w-lg text-center">
        <span className="text-6xl" aria-hidden>
          🌱
        </span>
        <h1 className="mt-4 text-4xl font-bold text-leaf-800">Na-Ogrodowej</h1>
        <p className="mt-3 text-lg text-soil-700">
          Bezpłatna wymiana nasion między ogrodnikami z Twojej okolicy.
          Dodaj swoje nasiona, zamów od innych — wszystko w jednej społeczności.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/register">
            <Button>Dołącz</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Zaloguj się</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
