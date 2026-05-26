"use client";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost">
        Wyloguj
      </Button>
    </form>
  );
}
