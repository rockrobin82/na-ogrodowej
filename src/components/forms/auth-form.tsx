"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  loginAction,
  registerAction,
  type AuthActionState,
} from "@/lib/actions/auth";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <Card className="w-full max-w-md">
      <CardHeader
        title="Zaloguj się"
        description="Witaj z powrotem w wymianie nasion Na-Ogrodowej"
      />
      <form action={action} className="space-y-4">
        <Input
          label="E-mail"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="twoj@email.pl"
        />
        <Input
          label="Hasło"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Logowanie…" : "Zaloguj"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-soil-600">
        Nie masz konta?{" "}
        <Link href="/register" className="font-medium text-leaf-700 hover:underline">
          Zarejestruj się
        </Link>
      </p>
    </Card>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);

  return (
    <Card className="w-full max-w-md">
      <CardHeader
        title="Rejestracja"
        description="Dołącz do społeczności wymiany nasion"
      />
      <form action={action} className="space-y-4">
        <Input
          label="Imię i nazwisko"
          name="fullName"
          required
          autoComplete="name"
          placeholder="Jan Kowalski"
        />
        <Input
          label="E-mail"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <Input
          label="Hasło"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Rejestracja…" : "Utwórz konto"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-soil-600">
        Masz już konto?{" "}
        <Link href="/login" className="font-medium text-leaf-700 hover:underline">
          Zaloguj się
        </Link>
      </p>
    </Card>
  );
}
