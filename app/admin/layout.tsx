import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/admin/login/actions";
import { SITE_NAME } from "@/lib/constants";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const path = h.get("x-pathname") ?? "";
  if (path.endsWith("/admin/login")) {
    return <>{children}</>;
  }

  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <AdminSidebar email={admin.email} role={admin.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
          <Link href="/admin" className="text-sm font-semibold text-brand-deep">
            {SITE_NAME} · Admin
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Cerrar sesión
            </Button>
          </form>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
