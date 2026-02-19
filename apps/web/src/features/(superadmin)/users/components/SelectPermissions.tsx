"use client"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@workspace/ui/components/command";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { PlusCircle, Check, Key } from "lucide-react";
import { useState } from "react";
import { usePermissions } from "../hooks/useUser.hooks";
import { useQueryState, parseAsArrayOf, parseAsString, parseAsInteger } from 'nuqs';

export const SelectPermissions = () => {
    const [permissionFilter, setPermissionFilter] = useQueryState('permission', parseAsArrayOf(parseAsString));
    const [, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
    const { data: permissions } = usePermissions();
    const [open, setOpen] = useState(false);

    const handleSelect = (value: string) => {
        const current = permissionFilter || [];
        const isSelected = current.includes(value);
        let next;
        
        if (isSelected) {
            next = current.filter((item) => item !== value);
        } else {
            next = [...current, value];
        }

        setPermissionFilter(next.length > 0 ? next : null);
        setPage(1);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-dashed">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Permission
                    {permissionFilter && permissionFilter.length > 0 && (
                        <>
                            <div className="mx-2 h-4 w-[1px] bg-border" />
                            <div className="flex gap-1">
                                <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-xs capitalize max-w-[100px] truncate">
                                    {permissionFilter.length} selected
                                </span>
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Permission" />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {permissions?.map((perm) => {
                                const isSelected = permissionFilter?.includes(perm.name);
                                return (
                                    <CommandItem
                                        key={perm.id}
                                        onSelect={() => handleSelect(perm.name)}
                                    >
                                        <div className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                        )}>
                                            <Check className="h-3 w-3" />
                                        </div>
                                        <Key className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span className="truncate">{perm.name}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {permissionFilter && permissionFilter.length > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => {
                                            setPermissionFilter(null);
                                            setPage(1);
                                        }}
                                        className="justify-center text-center"
                                    >
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
