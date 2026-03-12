"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Search, 
  FileDown, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Building,
  Home,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Wrench,
  History,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  UserCheck,
  PackageOpen,
  User
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import * as XLSX from "xlsx"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface MaintenanceLog {
  date: string;
  action: string;
  user: string;
}

interface RoomStatus {
  id: string;
  name: string;
  building: string;
  category: "Wisma" | "Tower A" | "Tower B";
  status: "Baik" | "Rusak Ringan" | "Rusak Berat" | "Dalam Perbaikan" | "Selesai (Verifikasi)";
  description: string;
  lastChecked: string;
  logs: MaintenanceLog[];
}

interface NeededMaterial {
  id: string;
  itemName: string;
  qty: string;
  unit: string;
}

interface BuildingPIC {
  name: string;
  role: string;
  contact: string;
}

const buildingPICs: Record<string, BuildingPIC> = {
  "all": { name: "Irfan Irawan", role: "Koordinator Fasilitas", contact: "Internal 101" },
  "Wisma": { name: "Budi Raharjo", role: "Teknisi Area Wisma", contact: "0812-XXXX-XXXX" },
  "Tower A": { name: "Siti Aminah", role: "Supervisor Tower A", contact: "0856-XXXX-XXXX" },
  "Tower B": { name: "Ahmad Fauzi", role: "Supervisor Tower B", contact: "0878-XXXX-XXXX" },
};

const dummyData: RoomStatus[] = [
  { 
    id: "W-A01", 
    name: "Blok A-1", 
    building: "Wisma", 
    category: "Wisma", 
    status: "Rusak Ringan", 
    description: "Atap bocor halus di area teras", 
    lastChecked: "05-06-2026",
    logs: [
      { date: "05-06-2026 09:00", action: "Kerusakan dilaporkan oleh Irfan", user: "Irfan I." }
    ]
  },
  { 
    id: "W-A02", 
    name: "Blok A-2", 
    building: "Wisma", 
    category: "Wisma", 
    status: "Baik", 
    description: "Kondisi sangat baik", 
    lastChecked: "05-06-2026",
    logs: []
  },
  { 
    id: "W-B05", 
    name: "Blok B-5", 
    building: "Wisma", 
    category: "Wisma", 
    status: "Dalam Perbaikan", 
    description: "Plafon kamar mandi jebol", 
    lastChecked: "04-06-2026",
    logs: [
      { date: "04-06-2026 10:00", action: "Kerusakan dilaporkan", user: "Admin" },
      { date: "05-06-2026 08:30", action: "Penugasan teknisi (Bpk. Maman)", user: "Admin" },
      { date: "05-06-2026 14:00", action: "Pembongkaran plafon lama", user: "Teknisi" }
    ]
  },
  { 
    id: "TA-321", 
    name: "Kamar A-321", 
    building: "Tower A", 
    category: "Tower A", 
    status: "Rusak Berat", 
    description: "AC tidak dingin & dinding rembes air", 
    lastChecked: "02-06-2026",
    logs: [
       { date: "02-06-2026 11:00", action: "Laporan tamu: AC Mati", user: "Resepsionis" }
    ]
  },
  { 
    id: "TA-322", 
    name: "Kamar A-322", 
    building: "Tower A", 
    category: "Tower A", 
    status: "Selesai (Verifikasi)", 
    description: "Kondisi normal", 
    lastChecked: "06-06-2026",
    logs: [
      { date: "02-06-2026 10:00", action: "Kerusakan Kran Air", user: "Admin" },
      { date: "06-06-2026 11:00", action: "Penggantian Kran Selesai", user: "Teknisi" }
    ]
  },
];

const getStatusBadge = (status: RoomStatus["status"]) => {
  switch (status) {
    case "Baik":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"><CheckCircle2 className="mr-1 h-3 w-3" /> Baik</Badge>;
    case "Rusak Ringan":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"><AlertTriangle className="mr-1 h-3 w-3" /> Rusak Ringan</Badge>;
    case "Rusak Berat":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><AlertTriangle className="mr-1 h-3 w-3" /> Rusak Berat</Badge>;
    case "Dalam Perbaikan":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"><Clock className="mr-1 h-3 w-3" /> Dalam Perbaikan</Badge>;
    case "Selesai (Verifikasi)":
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200"><CheckCircle className="mr-1 h-3 w-3" /> Selesai (Verifikasi)</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const statusPriority = {
  "Rusak Berat": 0,
  "Dalam Perbaikan": 1,
  "Selesai (Verifikasi)": 2,
  "Rusak Ringan": 3,
  "Baik": 4
};

export default function StatusKondisiPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<"none" | "priority" | "priority-desc">("none");
  const [selectedUnit, setSelectedUnit] = useState<RoomStatus | null>(null);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);

  // Material Management State
  const [materials, setMaterials] = useState<NeededMaterial[]>([
    { id: Math.random().toString(), itemName: "", qty: "", unit: "" }
  ]);
  const [requestingPIC, setRequestingPIC] = useState("");

  const filteredAndSortedData = useMemo(() => {
    let result = dummyData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortOrder === "priority") {
      result.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
    } else if (sortOrder === "priority-desc") {
      result.sort((a, b) => statusPriority[b.status] - statusPriority[a.status]);
    }

    return result;
  }, [searchTerm, activeCategory, sortOrder]);

  const handleExportExcel = () => {
    const dataToExport = filteredAndSortedData.map(item => ({
      "ID Unit": item.id,
      "Nama Unit": item.name,
      "Bangunan": item.building,
      "Kondisi": item.status,
      "Deskripsi Kerusakan": item.description,
      "Terakhir Dicek": item.lastChecked
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Status Kondisi");
    XLSX.writeFile(workbook, `Status_Kondisi_Bangunan_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
    
    toast({
      variant: "success",
      title: "Ekspor Berhasil",
      description: "Data status kondisi telah diunduh ke Excel.",
    });
  };

  const handleOpenMaintenance = (unit: RoomStatus) => {
    setSelectedUnit(unit);
    setMaterials([{ id: Math.random().toString(), itemName: "", qty: "", unit: "" }]);
    setRequestingPIC("");
    setIsMaintenanceOpen(true);
  };

  const addMaterialRow = () => {
    setMaterials([...materials, { id: Math.random().toString(), itemName: "", qty: "", unit: "" }]);
  };

  const removeMaterialRow = (id: string) => {
    if (materials.length > 1) {
      setMaterials(materials.filter(m => m.id !== id));
    }
  };

  const updateMaterial = (id: string, field: keyof NeededMaterial, value: string) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSaveProgress = () => {
    const hasMaterials = materials.some(m => m.itemName && m.qty);
    
    if (hasMaterials && !requestingPIC) {
      toast({
        variant: "destructive",
        title: "PIC Belum Dipilih",
        description: "Harap pilih PIC yang meminta material terlebih dahulu."
      });
      return;
    }

    toast({
      variant: "success",
      title: "Progres Disimpan",
      description: hasMaterials 
        ? `Tindak lanjut disimpan. ${materials.filter(m => m.itemName).length} item material akan diteruskan ke gudang.`
        : "Tindak lanjut telah berhasil diperbarui."
    });
    
    setIsMaintenanceOpen(false);
  };

  const currentPIC = buildingPICs[activeCategory] || buildingPICs["all"];

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8 pb-24 text-foreground">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Status Kondisi Bangunan</h1>
            <p className="text-muted-foreground text-sm">Monitoring fisik Wisma dan Gedung Tower (A & B) untuk peserta diklat.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden sm:flex">
              <Printer className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button size="sm" onClick={handleExportExcel} className="bg-success hover:bg-success/90">
              <FileDown className="mr-2 h-4 w-4" /> Excel
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-green-50/50">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Kondisi Baik</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-green-700">{dummyData.filter(d => d.status === "Baik").length}</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50/50">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Perlu Atensi</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-yellow-700">{dummyData.filter(d => d.status === "Rusak Ringan" || d.status === "Rusak Berat").length}</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50/50">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Progres Perbaikan</CardTitle>
              <Wrench className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-blue-700">{dummyData.filter(d => d.status === "Dalam Perbaikan").length}</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50/50">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Menunggu Verifikasi</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-purple-700">{dummyData.filter(d => d.status === "Selesai (Verifikasi)").length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle>Daftar Kondisi Unit</CardTitle>
                <CardDescription>Cari unit berdasarkan nama atau rincian kerusakan.</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Cari kamar atau wisma..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Urutkan
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Opsi Pengurutan</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortOrder("none")}>
                      Default (Bawaan)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOrder("priority")}>
                      <SortDesc className="mr-2 h-4 w-4" /> Rusak Berat Teratas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOrder("priority-desc")}>
                      <SortAsc className="mr-2 h-4 w-4" /> Kondisi Baik Teratas
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-4">
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 border-b rounded-none">
                <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                  Semua
                </TabsTrigger>
                <TabsTrigger value="Wisma" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 flex items-center gap-2">
                  <Home className="h-4 w-4" /> Wisma
                </TabsTrigger>
                <TabsTrigger value="Tower A" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 flex items-center gap-2">
                  <Building className="h-4 w-4" /> Tower A
                </TabsTrigger>
                <TabsTrigger value="Tower B" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 flex items-center gap-2">
                  <Building className="h-4 w-4" /> Tower B
                </TabsTrigger>
              </TabsList>

              {/* Dynamic PIC Info Section */}
              <div className="flex items-center justify-between rounded-lg bg-slate-50 border p-3 mt-2 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full border shadow-sm">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">PIC {activeCategory === 'all' ? 'Seluruh Area' : activeCategory}</p>
                    <p className="text-sm font-semibold">{currentPIC.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-right hidden md:block">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Jabatan</p>
                    <p className="text-xs">{currentPIC.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Kontak</p>
                    <p className="text-xs font-mono">{currentPIC.contact}</p>
                  </div>
                </div>
              </div>

              <TabsContent value={activeCategory} className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[120px]">ID Unit</TableHead>
                        <TableHead>Nama Unit</TableHead>
                        <TableHead>Kondisi</TableHead>
                        <TableHead className="max-w-[250px]">Rincian Masalah</TableHead>
                        <TableHead className="text-center">Tgl Cek</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedData.length > 0 ? (
                        filteredAndSortedData.map((item) => (
                          <TableRow key={item.id} className="hover:bg-accent/50 transition-colors">
                            <TableCell className="font-mono text-xs font-bold">{item.id}</TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground italic truncate max-w-[200px]">
                              {item.description}
                            </TableCell>
                            <TableCell className="text-center text-xs">{item.lastChecked}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {item.status !== "Baik" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                    onClick={() => handleOpenMaintenance(item)}
                                  >
                                    <Wrench className="mr-1 h-3 w-3" /> Tindak Lanjut
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" className="h-8">
                                  <Info className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Data unit tidak ditemukan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Maintenance Flow Sheet */}
        <Sheet open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
          <SheetContent className="sm:max-w-md md:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                Tindak Lanjut Perbaikan
              </SheetTitle>
              <SheetDescription>
                Kelola alur perbaikan dan kebutuhan material untuk unit {selectedUnit?.name}.
              </SheetDescription>
            </SheetHeader>

            {selectedUnit && (
              <div className="space-y-6 py-6">
                {/* Info Section */}
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-accent/30 p-4 border border-blue-100">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Kondisi Saat Ini</Label>
                    <div>{getStatusBadge(selectedUnit.status)}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Lokasi</Label>
                    <div className="text-sm font-medium">{selectedUnit.building}</div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Deskripsi Masalah</Label>
                    <div className="text-sm italic">"{selectedUnit.description}"</div>
                  </div>
                </div>

                {/* Form Progres */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Progres Pekerjaan
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="next-status">Update Status Progres</Label>
                      <Select defaultValue={selectedUnit.status}>
                        <SelectTrigger id="next-status">
                          <SelectValue placeholder="Pilih Status Baru" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Rusak Ringan">Tetap Rusak Ringan</SelectItem>
                          <SelectItem value="Rusak Berat">Ubah ke Rusak Berat</SelectItem>
                          <SelectItem value="Dalam Perbaikan">Sedang Dikerjakan (Dalam Perbaikan)</SelectItem>
                          <SelectItem value="Selesai (Verifikasi)">Selesai & Butuh Verifikasi</SelectItem>
                          <SelectItem value="Baik">Sudah Oke (Kembali ke Baik)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="action-note">Catatan Pekerjaan / Tindak Lanjut</Label>
                      <Textarea id="action-note" placeholder="Tuliskan detail perbaikan yang dilakukan..." className="min-h-[80px]" />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Material Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <PackageOpen className="h-4 w-4 text-orange-600" /> Kebutuhan Material (Opsional)
                    </div>
                    <Button variant="outline" size="sm" onClick={addMaterialRow} className="h-7 text-xs">
                      <Plus className="mr-1 h-3 w-3" /> Tambah Baris
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="pic-request" className="text-xs">PIC Penerima Material</Label>
                        <Select value={requestingPIC} onValueChange={setRequestingPIC}>
                          <SelectTrigger id="pic-request">
                             <UserCheck className="mr-2 h-3 w-3 text-muted-foreground" />
                             <SelectValue placeholder="Pilih PIC yang meminta barang" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Irfan Irawan Sukirman (Staff)</SelectItem>
                            <SelectItem value="2">Maman (Teknisi Listrik)</SelectItem>
                            <SelectItem value="3">Asep (Teknisi Air)</SelectItem>
                            <SelectItem value="4">Fitri (Admin Gudang)</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 border rounded-md p-3 bg-muted/20">
                      {materials.map((material, index) => (
                        <div key={material.id} className="grid grid-cols-12 gap-2 items-end mb-2 last:mb-0">
                          <div className="col-span-6 space-y-1">
                            {index === 0 && <Label className="text-[10px]">Nama Barang</Label>}
                            <Input 
                                placeholder="cth: Kran Air" 
                                value={material.itemName} 
                                onChange={(e) => updateMaterial(material.id, 'itemName', e.target.value)}
                                className="h-8 text-xs"
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            {index === 0 && <Label className="text-[10px]">Jumlah</Label>}
                            <Input 
                                type="number" 
                                placeholder="0" 
                                value={material.qty} 
                                onChange={(e) => updateMaterial(material.id, 'qty', e.target.value)}
                                className="h-8 text-xs"
                            />
                          </div>
                          <div className="col-span-3 space-y-1">
                            {index === 0 && <Label className="text-[10px]">Satuan</Label>}
                            <Select value={material.unit} onValueChange={(val) => updateMaterial(material.id, 'unit', val)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pcs">Pcs</SelectItem>
                                    <SelectItem value="Buah">Buah</SelectItem>
                                    <SelectItem value="Meter">Meter</SelectItem>
                                    <SelectItem value="Pak">Pak</SelectItem>
                                </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1 pb-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeMaterialRow(material.id)}
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                disabled={materials.length === 1}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Maintenance Log */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <History className="h-4 w-4" /> Riwayat Aktivitas
                  </div>
                  <ScrollArea className="h-32 rounded-md border p-4 bg-slate-50/50">
                    <div className="space-y-4">
                      {selectedUnit.logs.length > 0 ? (
                        selectedUnit.logs.map((log, idx) => (
                          <div key={idx} className="relative pl-6 pb-4 border-l last:pb-0">
                            <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-blue-500" />
                            <div className="text-[10px] text-muted-foreground">{log.date}</div>
                            <div className="text-sm font-medium">{log.action}</div>
                            <div className="text-[11px] text-muted-foreground">Oleh: {log.user}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-xs text-muted-foreground py-6">Belum ada riwayat perbaikan.</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}

            <SheetFooter className="mt-6 flex gap-2">
              <SheetClose asChild>
                <Button variant="outline" className="flex-1 sm:flex-none">Batal</Button>
              </SheetClose>
              <Button 
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveProgress}
              >
                Simpan & Proses ke Gudang
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </main>

      <footer className="sticky bottom-0 z-10 w-full bg-background/95 backdrop-blur-sm print:hidden">
        <Card className="rounded-none border-0 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>© 2026 BPSDM Provinsi Jawa Barat. Developed by Irfan Irawan Sukirman. SIMANJA. All rights reserved.</p>
          </div>
        </Card>
      </footer>
      
      <style jsx global>{`
        @media print {
          .sidebar-trigger, footer, .print:hidden, .sidebar {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}
