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
} from "@workspace/ui/components/command";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { usePermissions } from "../../hooks/useUser.hooks";

interface FormPermissionSelectProps {
    value?: number[];
    onChange: (value: number[]) => void;
    error?: string;
    role?: string;
}

export const FormPermissionSelect = ({ value = [], onChange, error, role }: FormPermissionSelectProps) => {
    const { data: permissions } = usePermissions();
    const [open, setOpen] = useState(false);

    const filteredPermissions = permissions?.filter((perm) => 
        !role || perm.name.startsWith(`${role}:`)
    );

    const handleSelect = (id: number) => {
        const current = value || [];
        const isSelected = current.includes(id);
        if (isSelected) {
            onChange(current.filter((item) => item !== id));
        } else {
            onChange([...current, id]);
        }
    };

    return (
        <div className="flex flex-col">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between",
                            !value?.length && "text-muted-foreground",
                            error && "border-red-500"
                        )}
                        disabled={!role}
                    >
                        {value?.length && permissions
                            ? `${value.length} permissions selected`
                            : "Select permissions"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder="Search permission..." />
                        <CommandList>
                             <CommandEmpty>No permission found.</CommandEmpty>
                            <CommandGroup>
                                {filteredPermissions?.map((perm) => (
                                    <CommandItem
                                        key={perm.id}
                                        value={perm.name}
                                        onSelect={() => handleSelect(perm.id)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value?.includes(perm.id)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {perm.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
        </div>
    )
}
