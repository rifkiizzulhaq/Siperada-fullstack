"use client"

import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from "@workspace/ui/components/card";
import {  
    Users,
} from "lucide-react";
import { useUserStats } from "../hooks/useUser.hooks";

export default function Cards() {
    const { data: stats, isLoading } = useUserStats();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {isLoading ? "..." : stats?.total || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Semua pengguna terdaftar</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Admin</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     <div className="text-2xl font-bold">
                        {isLoading ? "..." : stats?.admin || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Admin terdaftar</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pemimpin</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     <div className="text-2xl font-bold">
                        {isLoading ? "..." : stats?.pemimpin || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Pemimpin terdaftar</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unit</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     <div className="text-2xl font-bold">
                        {isLoading ? "..." : stats?.unit || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Unit terdaftar</p>
                </CardContent>
            </Card>
        </div>
    )
}