import { AppSidebar } from "@/src/components/sidebar/app-sidebar";
import { DynamicBreadcrumb } from "@/src/components/sidebar/dynamic-breadcrum";
import { Separator } from "@workspace/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { User } from "@/src/types/sidebar.type";
import { auth } from "@/src/lib/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SidebarProvider>
      <AppSidebar user={session?.user as User} />
      <SidebarInset className="h-[calc(100svh-1rem)] overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-background">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumb />
          </div>
        </header>
        <main className="flex flex-col gap-4 px-4 pt-1 pb-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
