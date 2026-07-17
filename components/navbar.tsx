import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./logout-button";

export async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAdmin = session?.user.role === "admin";

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/pegawai", label: "Pegawai" },
    { href: "/jabatan", label: "Jabatan" },
    { href: "/jabatanpegawai", label: "Penugasan" },
    ...(isAdmin ? [{ href: "/users", label: "Users" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm">
              KP
            </span>
            Kepegawaian
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium leading-none">{session.user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{session.user.role}</span>
              </div>
              <LogoutButton />
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
