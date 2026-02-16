"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

import {
 Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar"
import { ChevronRightIcon } from "lucide-react"
import React from "react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
      isActive?: boolean
    }[]
  }[]
}) {
  
  const pathname = usePathname()
  const isItemActive = (item: typeof items[0]) => {
    if (item.url !== "#" && pathname === item.url) return true
    if (item.items) {
      return item.items.some(subItem => subItem.url !== "#" && pathname === subItem.url)
    }
    return false
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const itemActive = isItemActive(item)
          const hasSubmenu = item.items && item.items.length > 0
          
          return (
            <Collapsible 
              key={item.title} 
              asChild 
              defaultOpen={itemActive}
            >
              <SidebarMenuItem>
                {hasSubmenu ? (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} className="group/collapsible">
                      {item.icon}
                      <span>{item.title}</span>
                      <ChevronRightIcon className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  <SidebarMenuButton asChild tooltip={item.title} isActive={itemActive}>
                    <Link href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
                {hasSubmenu && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={pathname === subItem.url && subItem.url !== "#"}>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
