"use client"

import { Button } from "@workspace/ui/components/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Eye, EyeOff, SquarePen } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
// import { editUsersSchema } from "../../schema/editUsersSchema"
// import { editUser } from "../../services/ServicesSuperadmin"
// import toast from "react-hot-toast"

export const UsersDialog = () => {
    // const [open, setOpen] = useState(false)
    // const [loading, setLoading] = useState(false)
    // const [showPassword, setShowPassword] = useState(false)
    // const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    // const [role, setRole] = useState("")
    // const [roleError, setRoleError] = useState("")
    // const [passwordValue, setPasswordValue] = useState("")

    // const { register, handleSubmit, setValue, reset, formState: {errors} } = useForm({
    //     resolver: zodResolver(editUsersSchema),
    //     mode: 'onChange'
    // })

    // const handleRoleChange = (newRole) => {
    //     setRole(newRole)
        
    //     if (newRole === "unit") {
    //         setValue("nidn", "")
    //     }
        
    //     if (newRole === "admin") {
    //         setValue("bidang", "")
    //     }
        
    //     if (newRole !== "unit") {
    //         setValue("kode_unit", "")
    //         setValue("nama_unit", "")
    //     }
    // }

    // const handleOpenChange = (isOpen) => {
    //     setOpen(isOpen)
    //     if(isOpen && item) {
    //         setValue("name", item.name || "")
    //         setValue("email", item.email || "")
            
    //         const userRole = item.role || ""
    //         setRole(userRole)
            
    //         let profile = null
            
    //         if (userRole === "admin" && item.admin?.length > 0) {
    //             profile = item.admin[0]
    //         } else if (userRole === "pemimpin" && item.pemimpin?.length > 0) {
    //             profile = item.pemimpin[0]
    //         } else if (userRole === "unit" && item.unit?.length > 0) {
    //             profile = item.unit[0]
    //         }
            
    //         if (profile) {
    //             setValue("nip", profile.nip || "")
    //             setValue("nidn", profile.nidn || "")
    //             setValue("bidang", profile.bidang || "")
    //             setValue("kode_unit", profile.kode_unit || "")
    //             setValue("nama_unit", profile.nama_unit || "")
    //         }
    //     }
    // }

    // const onSubmit = async (data) => {
    //     if (!role) {
    //         setRoleError("Silahkan pilih role")
    //         setTimeout(() => {
    //             setRoleError("")
    //         }, 3000);
    //         return
    //     }
    //     setRoleError("")

    //     const errors = []
        
    //     if (role === "admin") {
    //         if (!data.nip) errors.push("NIP wajib diisi untuk Admin")
    //         if (!data.nidn) errors.push("NIDN wajib diisi untuk Admin")
    //     } else if (role === "pemimpin") {
    //         if (!data.nip) errors.push("NIP wajib diisi untuk Pemimpin")
    //         if (!data.nidn) errors.push("NIDN wajib diisi untuk Pemimpin")
    //         if (!data.bidang) errors.push("Bidang wajib diisi untuk Pemimpin")
    //     } else if (role === "unit") {
    //         if (!data.nama_unit) errors.push("Nama Unit wajib diisi untuk Unit")
    //         if (!data.kode_unit) errors.push("Kode Unit wajib diisi untuk Unit")
    //         if (!data.bidang) errors.push("Bidang wajib diisi untuk Unit")
    //         if (!data.nip) errors.push("NIP wajib diisi untuk Unit")
    //     }

    //     if (errors.length > 0) {
    //         toast.error(errors[0])
    //         return
    //     }

    //     // Filter out empty strings
    //     const filteredData = Object.fromEntries(
    //         Object.entries({...data, role}).filter(([key, value]) => value !== "")
    //     )

    //     setLoading(true)
    //     toast.promise(
    //         editUser(item.id, filteredData),
    //         {
    //             loading: "Tunggu...",
    //             success: (res) => {
    //                 setOpen(false)
    //                 reset()
    //                 setRole('')
    //                 setPasswordValue("") 
    //                 onSuccess?.()
    //                 return res.data.message
    //             },
    //             error: (err) => {
    //                 return err.response?.data?.message || err.message
    //             }
    //         }
    //     ).finally(() => {
    //         setLoading(false)
    //     })
    // }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm">
                    <SquarePen className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Edit user di sini. Klik save ketika selesai.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-3">
                            <Label htmlFor="name" className="w-[130px] shrink-0">Name</Label>
                            <Input 
                                id="name" 
                                placeholder="John"
                                className="flex-1"
                                // {...register("name")}
                            />
                        </div>
                        {/* {errors.name && (
                            <div className="flex justify-end items-end">
                                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                            </div>
                        )} */}
                        <div className="flex items-center gap-3">
                            <Label htmlFor="Email" className="w-[130px] shrink-0">Email</Label>
                            <Input 
                                id="Email" 
                                placeholder="ohn.doe@gmail.com"
                                className="flex-1"
                                // {...register("email")}
                            />
                        </div>
                        {/* {errors.email && (
                            <div className="flex justify-end items-end">
                                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                            </div>
                        )} */}
                        <div className="flex items-center gap-3">
                            <Label htmlFor="password" className="w-[130px] shrink-0">Password</Label>
                            <div className="flex-1 relative">
                                <Input 
                                    id="password" 
                                    // type={showPassword ? "text" : "password"}
                                    placeholder="e.g., S3cur3P@ssw0rd"
                                    className="pr-10"
                                    // {...register("password", {
                                    //     onChange: (e) => setPasswordValue(e.target.value)
                                    // })}
                                />
                                <button
                                    type="button"
                                    // onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {/* {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} */}
                                </button>
                            </div>
                        </div>
                        {/* {errors.password && (
                            <div className="flex justify-end items-end">
                                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                            </div>
                        )} */}
                        <div className="flex items-center gap-3">
                            <Label htmlFor="confirmPassword" className="w-[130px] shrink-0">Confirm Password</Label>
                            <div className="flex-1 relative">
                                <Input 
                                    id="confirmPassword" 
                                    // type={showConfirmPassword ? "text" : "password"}
                                    placeholder="e.g., S3cur3P@ssw0rd"
                                    className="pr-10"
                                    // disabled={!passwordValue || passwordValue.length < 6}
                                />
                                <button
                                    type="button"
                                    // onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {/* {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} */}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Label htmlFor="role" className="w-[130px] shrink-0">Role</Label>
                            <Select>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="unit">Unit</SelectItem>
                                    <SelectItem value="pemimpin">Pemimpin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* {roleError && (
                            <div className="flex justify-end items-end">
                                <p className="text-red-500 text-xs">{roleError}</p>
                            </div>
                        )} */}
                        {/* {role === "unit" ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <Label htmlFor="nama_unit" className="w-[130px] shrink-0">Nama Unit</Label>
                                    <Input 
                                        id="nama_unit" 
                                        placeholder="rpl-001"
                                        className="flex-1"
                                        {...register("nama_unit")}
                                    />
                                </div>
                                {errors.nama_unit && (
                                    <div className="flex justify-end items-end">
                                        {errors.nama_unit && <p className="text-red-500 text-xs">{errors.nama_unit.message}</p>}
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Label htmlFor="kode_unit" className="w-[130px] shrink-0">Kode Unit</Label>
                                    <Input 
                                        id="kode_unit" 
                                        placeholder="123456789012345678"
                                        className="flex-1"
                                        inputMode="numeric"
                                        onKeyDown={(e) => {
                                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                e.preventDefault()
                                            }
                                        }}
                                        {...register("kode_unit")}
                                    />
                                </div>
                                {errors.kode_unit && (
                                    <div className="flex justify-end items-end">
                                        {errors.kode_unit && <p className="text-red-500 text-xs">{errors.kode_unit.message}</p>}
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Label htmlFor="bidang" className="w-[130px] shrink-0">Bidang</Label>
                                    <Input 
                                        id="bidang" 
                                        placeholder="akademik"
                                        className="flex-1"
                                        {...register("bidang")}
                                    />
                                </div>
                                {errors.bidang && (
                                    <div className="flex justify-end items-end">
                                        {errors.bidang && <p className="text-red-500 text-xs">{errors.bidang.message}</p>}
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Label htmlFor="nip" className="w-[130px] shrink-0">Nip</Label>
                                    <Input 
                                        id="nip" 
                                        placeholder="199005152024031002"
                                        className="flex-1"
                                        inputMode="numeric"
                                        onKeyDown={(e) => {
                                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                e.preventDefault()
                                            }
                                        }}
                                        {...register("nip")}
                                    />
                                </div>
                                {errors.nip && (
                                    <div className="flex justify-end items-end">
                                        {errors.nip && <p className="text-red-500 text-xs">{errors.nip.message}</p>}
                                    </div>
                                )}
                            </>
                        ) : ""}
                        {role === "pemimpin" ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <Label htmlFor="bidang" className="w-[130px] shrink-0">Bidang</Label>
                                    <Input 
                                        id="bidang" 
                                        placeholder="akademik"
                                        className="flex-1"
                                        {...register("bidang")}
                                    />
                                </div>
                                {errors.bidang && (
                                    <div className="flex justify-end items-end">
                                        {errors.bidang && <p className="text-red-500 text-xs">{errors.bidang.message}</p>}
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Label htmlFor="nip" className="w-[130px] shrink-0">Nip</Label>
                                    <Input 
                                        id="nip" 
                                        placeholder="199005152024031002"
                                        className="flex-1"
                                        inputMode="numeric"
                                        onKeyDown={(e) => {
                                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                e.preventDefault()
                                            }
                                        }}
                                        {...register("nip")}
                                    />
                                </div>
                                {errors.nip && (
                                    <div className="flex justify-end items-end">
                                        {errors.nip && <p className="text-red-500 text-xs">{errors.nip.message}</p>}
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Label htmlFor="nidn" className="w-[130px] shrink-0">Nidn</Label>
                                    <Input 
                                        id="nidn" 
                                        placeholder="0015088502"
                                        className="flex-1"
                                        inputMode="numeric"
                                        onKeyDown={(e) => {
                                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                e.preventDefault()
                                            }
                                        }}
                                        {...register("nidn")}
                                    />
                                </div>
                                {errors.nidn && (
                                    <div className="flex justify-end items-end">
                                        {errors.nidn && <p className="text-red-500 text-xs">{errors.nidn.message}</p>}
                                    </div>
                                )}
                            </>
                        ) : ""}
                        {role === "admin" ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <Label htmlFor="nip" className="w-[130px] shrink-0">Nip</Label>
                                    <Input 
                                        id="nip" 
                                        placeholder="199005152024031002"
                                        className="flex-1"
                                        inputMode="numeric"
                                        onKeyDown={(e) => {
                                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                e.preventDefault()
                                            }
                                        }}
                                        {...register("nip")}
                                    />
                                </div>
                                {errors.nip && (
                                    <div className="flex justify-end items-end">
                                        {errors.nip && <p className="text-red-500 text-xs">{errors.nip.message}</p>}
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Label htmlFor="nidn" className="w-[130px] shrink-0">Nidn</Label>
                                    <Input 
                                        id="nidn" 
                                        placeholder="0015088502"
                                        className="flex-1"
                                        inputMode="numeric"
                                        onKeyDown={(e) => {
                                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                e.preventDefault()
                                            }
                                        }}
                                        {...register("nidn")}
                                    />
                                </div>
                                {errors.nidn && (
                                    <div className="flex justify-end items-end">
                                        {errors.nidn && <p className="text-red-500 text-xs">{errors.nidn.message}</p>}
                                    </div>
                                )}
                            </>
                        ) : ""}                         */}
                    </div>
                    <DialogFooter>
                        <Button 
                            type="submit" 
                            // disabled={loading}
                            // className={`${loading ? "!cursor-progress" : ""}`}
                        >
                            {/* {loading ? "Saving..." : "Save changes"} */}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}