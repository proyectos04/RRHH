"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOut() {
  return (
    <Button
      variant={"destructive"}
      onClick={() => signOut({ redirectTo: "/" })}
    >
      <LogOut />
    </Button>
  );
}
