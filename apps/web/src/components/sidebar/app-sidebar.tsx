"use client";

import * as React from "react";

import { NavMain } from "@/src/components/sidebar/nav-main";
import { NavUser } from "@/src/components/sidebar/nav-user";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import {
  Form,
  LayoutDashboard,
  Database,
  Users,
} from "lucide-react";
import Image from "next/image";
import { User, NavItem } from "@/src/types/sidebar.type";

const menuData = {
  navMain: [
    {
      title: "Users",
      url: "/users",
      icon: <Users />,
      roles: ["superadmin"],
      requiredPermission: "superadmin:read-user",
    },
    {
      title: "Dashboard",
      url: "/admin-dashboard",
      icon: <LayoutDashboard />,
      roles: ["admin"],
    },
    {
      title: "Meta Data",
      url: "#",
      icon: <Database />,
      roles: ["admin"],
      items: [
        {
          title: "Kategori",
          url: "/kategori",
          roles: ["admin"],
          requiredPermission: "admin:read-kategori",
        },
        {
          title: "Komponen program",
          url: "/komponen-program",
          roles: ["admin"],
          requiredPermission: "admin:read-komponen-program",
        },
        {
          title: "Satuan",
          url: "/satuan",
          roles: ["admin"],
          requiredPermission: "admin:read-satuan",
        },
        {
          title: "Akun detail",
          url: "/akun-detail",
          roles: ["admin"],
          requiredPermission: "admin:read-akun-detail",
        },
      ],
    },
    {
      title: "Dashboard",
      url: "/unit-dashboard",
      icon: <LayoutDashboard />,
      roles: ["unit"],
    },
    {
      title: "Usulan Kegiatan",
      url: "/usulan-kegiatan",
      icon: <Form />,
      roles: ["unit"],
      requiredPermission: "unit:read-usulan-kegiatan",
    },
    {
      title: "Judul Kegiatan",
      url: "/judul-kegiatan",
      icon: <Form />,
      roles: ["unit"],
      requiredPermission: "unit:read-judul-kegiatan",
    },
  ],
};

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
  const { user } = props;

  const checkAccess = (item: NavItem) => {
    if (item.roles && (!user?.role || !item.roles.includes(user.role)))
      return false;
    if (item.requiredPermission) {
      const hasPermission = user?.permissions?.some(
        (p) => p.name === item.requiredPermission,
      );
      if (!hasPermission) return false;
    }
    return true;
  };

  const filterMenu = (items: NavItem[]): NavItem[] => {
    return items
      .map((item) => {
        if (!checkAccess(item)) return null;

        if (item.items) {
          const filteredItems = filterMenu(item.items); 
          return { ...item, items: filteredItems };
        }

        return item;
      })
      .filter((item): item is NavItem => item !== null);
  };


  const filteredNavMain = filterMenu(menuData.navMain);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-gray-500 dark:bg-white text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    width={24}
                    height={24}
                    src="/logo_polindra.png"
                    alt="Image"
                    className="object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Siperada</span>
                  <span className="truncate text-xs">Polindra</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain as React.ComponentProps<typeof NavMain>["items"]} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || "Guest",
            email: user?.email || "",
            avatar: "/avatars/shadcn.jpg",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
