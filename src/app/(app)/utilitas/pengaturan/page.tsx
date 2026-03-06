
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog"
import { 
  Settings, 
  Users, 
  MapPin, 
  PlusCircle, 
  Pencil, 
  Trash2,
  Building2,
  Globe
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const vendorsData = [
  { id: 1, name: "PT. PLN (Persero)", category: "Listrik", contact: "Layanan Pelanggan", phone: "123", status: "Aktif" },
  { id: 2, name: "PDAM Tirta Raharja", category: "Air", contact: "Unit Cimahi", phone: "022-xxxxxx", status: "Aktif" },
  { id: 3, name: "PT. Telkom Indonesia", category: "Komunikasi", contact: "Bpk. Andi (AM)", phone: "0812-xxxx-xxxx", status: "Aktif" },
  { id: 4, name: "Biznet Networks", category: "Komunikasi", contact: "Ibu Maya", phone: "0856-xxxx-xxxx", status: "Aktif" },
]

const locationsData = [
  { id: 1, name: "Gedung Utama", area: "Kantor Pusat", description: "Lantai 1-3", status: "Aktif" },
  { id: 2, name: "Wisma A", area: "Area Penginapan", description: "Kamar 01-20", status: "Aktif" },
  { id: 3, name: "Wisma B", area: "Area Penginapan", description: "Kamar 21-40", status: "Aktif" },
  { id: 4, name: "Gedung Aula", area: "Fasilitas Umum", description: "Kapasitas 500 orang", status: "Aktif" },
  { id: 5, name: "Gedung Serbaguna", area: "Fasilitas Umum", description: "Area Belakang", status: "Aktif" },
]

export default function PengaturanUtilitasPage() {
  const [activeTab, setActiveTab] = useState("vendor")

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8 pb-24">
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Pengaturan Utilitas</h1>
            <p className="text-muted-foreground text-sm">Kelola master data vendor layanan dan lokasi pemakaian utilitas.</p>
          </div>
          <Badge variant="outline" className="bg-slate-50">
            <Settings className="mr-1 h-3 w-3" /> Konfigurasi Sistem
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 border-b rounded-none">
            <TabsTrigger 
              value="vendor" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              <Users className="h-4 w-4" /> Data Vendor
            </TabsTrigger>
            <TabsTrigger 
              value="lokasi" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" /> Data Lokasi
            </TabsTrigger>
          </TabsList>

          {/* Tab: Data Vendor */}
          <TabsContent value="vendor" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Master Data Vendor</CardTitle>
                  <CardDescription>Daftar penyedia layanan utilitas (PLN, PDAM, ISP, dll).</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" /> Tambah Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Vendor Baru</DialogTitle>
                      <DialogDescription>Input informasi penyedia layanan baru ke sistem.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="v-name">Nama Perusahaan/Instansi</Label>
                        <Input id="v-name" placeholder="Contoh: PT. PLN (Persero)" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="v-cat">Kategori Layanan</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="listrik">Listrik</SelectItem>
                            <SelectItem value="air">Air</SelectItem>
                            <SelectItem value="komunikasi">Komunikasi / Internet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="v-cp">Contact Person</Label>
                          <Input id="v-cp" placeholder="Nama PIC" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="v-phone">No. Telepon</Label>
                          <Input id="v-phone" placeholder="0812..." />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Batal</Button>
                      </DialogClose>
                      <Button type="submit">Simpan Vendor</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Vendor</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Kontak</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorsData.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal">
                              {vendor.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{vendor.contact}</div>
                            <div className="text-xs text-muted-foreground">{vendor.phone}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                              {vendor.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Data Lokasi */}
          <TabsContent value="lokasi" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Master Data Lokasi</CardTitle>
                  <CardDescription>Daftar gedung atau ruangan yang terpasang meteran utilitas.</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" /> Tambah Lokasi
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Lokasi Baru</DialogTitle>
                      <DialogDescription>Input lokasi pemantauan baru ke sistem.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="l-name">Nama Gedung/Ruangan</Label>
                        <Input id="l-name" placeholder="Contoh: Gedung Aula Utama" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="l-area">Area / Kompleks</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Area" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kantor">Area Kantor</SelectItem>
                            <SelectItem value="wisma">Area Wisma / Penginapan</SelectItem>
                            <SelectItem value="umum">Fasilitas Umum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="l-desc">Deskripsi Tambahan</Label>
                        <Input id="l-desc" placeholder="Contoh: Lantai Dasar - Sayap Kiri" />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Batal</Button>
                      </DialogClose>
                      <Button type="submit">Simpan Lokasi</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Lokasi</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locationsData.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {location.name}
                          </TableCell>
                          <TableCell>{location.area}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{location.description}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                              {location.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="sticky bottom-0 z-10 w-full bg-background/95 backdrop-blur-sm">
        <Card className="rounded-none border-0 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>© 2026 BPSDM Provinsi Jawa Barat. Developed by Irfan Irawan Sukirman. SIMANJA. All rights reserved.</p>
          </div>
        </Card>
      </footer>
    </div>
  )
}
