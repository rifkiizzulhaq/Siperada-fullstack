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
import { useState, useEffect } from "react";

export default function Cards() {
    // const [errCount, setErrCount] = useState(null)

    // const adminCount = datasApi.filter(item => item.role === 'admin').length
    // const unitCount = datasApi.filter(item => item.role === 'unit').length
    // const pemimpinCount = datasApi.filter(item => item.role === 'pemimpin').length
    // const totalUsers = datasApi.length

    // useEffect(() => {
    //     const ChecksData = () => {
    //         if (datasApi.length === 0 && !loadings) {
    //             setErrCount("Data tidak ada")
    //         } else {
    //             setErrCount(null)
    //         }
    //     }
    //     ChecksData()
    // }, [datasApi, loadings])


    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {/* {loadings ? "loading..." : errCount}
                    {!loadings && datasApi.length > 0 && <div className="text-2xl font-bold">{totalUsers}</div>} */}
                    <p className="text-xs text-muted-foreground">Semua pengguna terdaftar</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Admin</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {/* {loadings ? "loading..." : errCount}
                    {!loadings && datasApi.length > 0 && (
                        <>
                            <div className="text-2xl font-bold">{adminCount}</div>
                            <p className="text-xs text-muted-foreground">{adminCount} admin terdaftar</p>
                        </>
                    )} */}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pemimpin</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {/* {loadings ? "loading..." : errCount}
                    {!loadings && datasApi.length > 0 && (
                        <>
                            <div className="text-2xl font-bold">{pemimpinCount}</div>
                            <p className="text-xs text-muted-foreground">{pemimpinCount} admin terdaftar</p>
                        </>
                    )} */}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unit</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {/* {loadings ? "loading..." : errCount}
                    {!loadings && datasApi.length > 0 && (
                        <>
                            <div className="text-2xl font-bold">{unitCount}</div>
                            <p className="text-xs text-muted-foreground">{unitCount} admin terdaftar</p>
                        </>
                    )} */}
                </CardContent>
            </Card>
        </div>
    )
}