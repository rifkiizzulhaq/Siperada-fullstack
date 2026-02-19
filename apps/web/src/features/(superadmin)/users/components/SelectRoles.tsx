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
import { Users, PlusCircle, Check } from "lucide-react";
import { useState } from "react";
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';

export const SelectRoles = () => {
    const [roleFilter, setRoleFilter] = useQueryState('role', parseAsString);
    const [, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
    const [open, setOpen] = useState(false);

    const roles = [
        { value: "admin", label: "Admin", icon: Users },
        { value: "pemimpin", label: "Pemimpin", icon: Users },
        { value: "unit", label: "Unit", icon: Users },
    ];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-dashed">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Role
                    {roleFilter && (
                        <>
                            <div className="mx-2 h-4 w-[1px] bg-border" />
                            <div className="flex gap-1">
                                <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-xs capitalize">
                                    {roleFilter}
                                </span>
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Role" />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {roles.map((role) => {
                                const isSelected = roleFilter === role.value;
                                return (
                                    <CommandItem
                                        key={role.value}
                                        onSelect={() => {
                                            if (isSelected) {
                                                setRoleFilter(null);
                                            } else {
                                                setRoleFilter(role.value);
                                            }
                                            setPage(1);
                                            setOpen(false);
                                        }}
                                    >
                                        <div className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                                        )}>
                                            {isSelected && <Check className="h-3 w-3" />}
                                        </div>
                                        <role.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>{role.label}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {roleFilter && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => {
                                            setRoleFilter(null);
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