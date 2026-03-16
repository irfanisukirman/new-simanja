
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
  Wrench,
  History,
  Clock,
  Plus,
  Trash2,
  UserCheck,
  PackageOpen,
  User,
  PhoneCall
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

interface UnitPIC {
  name: string;
  contact: string;
  role: string;
}

interface RoomStatus {
  id: string;
  name: string;
  building: string;
  category: "Wisma" | "Tower A" | "Tower B";
  status: "Baik" | "Dalam Perbaikan" | "Rusak";
  description: string;
  lastChecked: string;
  pic: UnitPIC;
  logs: MaintenanceLog[];
}

interface NeededMaterial {
  id: string;
  itemName: string;
  qty: string;
  unit: string;
}

const dummyData: RoomStatus[] = [
  { 
    id: "W-A01", 
    name: "Blok A-1", 
    building: "Wisma", 
    category: "Wisma", 
    status: "Rusak", 
    description: "Atap bocor halus di area teras depan wisma yang mengakibatkan air merembes ke plafon saat hujan deras.", 
    lastChecked: "05-06-2026",
    pic: { name: "Udin Syarifuddin", contact: "0812-1111-2222", role: "PJ Wisma Blok A" },
    logs: [
      { date: "05-06-2026 09:00", action: "Kerusakan dilaporkan oleh Irfan", user: "Irfan I." }
    ]
  },
  { 
    id: "W-B02", 
    name: "Blok B-2", 
    building: "Wisma", 
    category: "Wisma", 
    status: "Baik", 
    description: "Kondisi sangat baik.", 
    lastChecked: "05-06-2026",
    pic: { name: "Pedro Gonzales", contact: "0856-3333-4444", role: "PJ Wisma Blok B" },
    logs: []
  },
  { 
    id: "W-B05", 
    name: "Blok B-5", 
    building: "Wisma", 
    category: "Wisma", 
    status: "Dalam Perbaikan", 
    description: "Plafon kamar mandi jebol akibat kebocoran pipa saluran air dari lantai atas.", 
    lastChecked: "04-06-2026",
    pic: { name: "Pedro Gonzales", contact: "0856-3333-4444", role: "PJ Wisma Blok B" },
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
    status: "Rusak", 
    description: "AC tidak dingin & dinding rembes air dari sisi luar gedung saat hujan disertai angin kencang.", 
    lastChecked: "02-06-2026",
    pic: { name: "Siti Aminah", contact: "0878-5555-6666", role: "PJ Tower A" },
    logs: [
       { date: "02-06-2026 11:00", action: "Laporan tamu: AC Mati", user: "Resepsionis" }
    ]
  },
  { 
    id: "TB-102", 
    name: "Kamar B-102", 
    building: "Tower B", 
    category: "Tower B", 
    status: "Dalam Perbaikan", 
    description: "Kran air patah di wastafel kamar mandi utama.", 
    lastChecked: "06-06-2026",
    pic: { name: "Ahmad Fauzi", contact: "0813-7777-8888", role: "PJ Tower B" },
    logs: [
      { date: "02-06-2026 10:00", action: "Kerusakan Kran Air", user: "Admin" },
      { date: "06-06-2026 11:00", action: "Pengerjaan penggantian unit kran baru", user: "Teknisi" }
    ]
  },
];

const getStatusBadge = (status: RoomStatus["status"]) => {
  switch (status) {
    case "Baik":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"><CheckCircle2 className="mr-1 h-3 w-3" /> Baik</Badge>;
    case "Rusak":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><AlertTriangle className="mr-1 h-3 w-3" /> Rusak</Badge>;
    case "Dalam Perbaikan":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"><Clock className="mr-1 h-3 w-3" /> Dalam Perbaikan</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const statusPriority = {
  "Rusak": 0,
  "Dalam Perbaikan": 1,
  "Baik": 2
};

const DescriptionCell = ({ text }: { text: string }) => {
  const isLong = text.length > 50;
  if (!isLong) return <div className="text-[10px] text-muted-foreground italic">{text}</div>;

  return (
    <div className="text-[10px] text-muted-foreground italic">
      {text.substring(0, 47)}...
      <Dialog>
        <DialogTrigger asChild>
          <button className="ml-1 text-primary hover:underline font-bold print:hidden">Lihat Selengkapnya</button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deskripsi Kerusakan Lengkap</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm leading-relaxed">
            {text}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function StatusKondisiPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<"none" | "priority" | "priority-desc">("none");
  const [selectedUnit, setSelectedUnit] = useState<RoomStatus | null>(null);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);

  const [materials, setMaterials] = useState<NeededMaterial[]>([
    { id: Math.random().toString(), itemName: "", qty: "", unit: "" }
  ]);
  const [requestingPIC, setRequestingPIC] = useState("");

  const filteredAndSortedData = useMemo(() => {
    let result = dummyData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.pic.name.toLowerCase().includes(searchTerm.toLowerCase());
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
    const dataToExport = dummyData.map(item => ({
      "ID Unit": item.id,
      "Nama Unit": item.name,
      "Bangunan": item.building,
      "PIC Unit": item.pic.name,
      "Kondisi": item.status,
      "Deskripsi Kerusakan": item.description,
      "Terakhir Dicek": item.lastChecked
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Status Kondisi Lengkap");
    XLSX.writeFile(workbook, `Status_Kondisi_Lengkap_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
    
    toast({
      variant: "success",
      title: "Ekspor Berhasil",
      description: "Seluruh data status kondisi telah diunduh.",
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
        description: "Harap pilih PIC yang meminta material."
      });
      return;
    }

    toast({
      variant: "success",
      title: "Progres Disimpan",
      description: "Tindak lanjut telah berhasil diperbarui."
    });
    setIsMaintenanceOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8 pb-24 text-foreground print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Status Kondisi Bangunan</h1>
            <p className="text-muted-foreground text-sm">Monitoring fisik per unit dengan penanggung jawab spesifik.</p>
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

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-green-50/50">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Kondisi Baik</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-green-700">{dummyData.filter(d => d.status === "Baik").length}</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50/50">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Kondisi Rusak</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-red-700">{dummyData.filter(d => d.status === "Rusak").length}</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50/50">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Dalam Perbaikan</CardTitle>
              <Wrench className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-blue-700">{dummyData.filter(d => d.status === "Dalam Perbaikan").length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle>Daftar Kondisi Unit</CardTitle>
                <CardDescription>Pemantauan unit kerja beserta penanggung jawab (PIC) terkait.</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Cari unit atau nama PIC..." 
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
                    <DropdownMenuItem onClick={() => setSortOrder("none")}>Default</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOrder("priority")}>Rusak Teratas</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOrder("priority-desc")}>Kondisi Baik Teratas</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-4">
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 border-b rounded-none">
                <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Semua</TabsTrigger>
                <TabsTrigger value="Wisma" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 flex items-center gap-2"><Home className="h-4 w-4" /> Wisma</TabsTrigger>
                <TabsTrigger value="Tower A" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 flex items-center gap-2"><Building className="h-4 w-4" /> Tower A</TabsTrigger>
                <TabsTrigger value="Tower B" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 flex items-center gap-2"><Building className="h-4 w-4" /> Tower B</TabsTrigger>
              </TabsList>

              <TabsContent value={activeCategory} className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[100px]">ID Unit</TableHead>
                        <TableHead>Nama Unit</TableHead>
                        <TableHead>PIC Penanggung Jawab</TableHead>
                        <TableHead>Kondisi</TableHead>
                        <TableHead className="text-center">Tgl Cek</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedData.length > 0 ? (
                        filteredAndSortedData.map((item) => (
                          <TableRow key={item.id} className="hover:bg-accent/50">
                            <TableCell className="font-mono text-xs font-bold">{item.id}</TableCell>
                            <TableCell className="font-medium">
                                <div>{item.name}</div>
                                <DescriptionCell text={item.description} />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center border">
                                        <User className="h-3.5 w-3.5 text-slate-600" />
                                    </div>
                                    <div className="text-xs">
                                        <div className="font-semibold">{item.pic.name}</div>
                                        <div className="text-muted-foreground">{item.pic.role}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Data tidak ditemukan.</TableCell>
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
                Manajemen Perbaikan Unit
              </SheetTitle>
              <SheetDescription>Update progres dan kebutuhan material untuk perbaikan unit.</SheetDescription>
            </SheetHeader>

            {selectedUnit && (
              <div className="space-y-6 py-6">
                {/* Info PIC Spesifik Unit */}
                <div className="bg-slate-900 text-white rounded-lg p-4 shadow-md">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-blue-300 leading-none mb-1">PIC Penanggung Jawab</p>
                                <p className="text-sm font-bold">{selectedUnit.pic.name}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                            <PhoneCall className="h-4 w-4" />
                        </Button>
                    </div>
                    <Separator className="bg-white/10 mb-3" />
                    <div className="grid grid-cols-2 gap-4 text-[11px]">
                        <div>
                            <p className="text-blue-300 font-bold uppercase mb-0.5">Role/Jabatan</p>
                            <p>{selectedUnit.pic.role}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-blue-300 font-bold uppercase mb-0.5">Kontak</p>
                            <p className="font-mono">{selectedUnit.pic.contact}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-lg bg-accent/30 p-4 border border-blue-100">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Kondisi Unit</Label>
                    <div>{getStatusBadge(selectedUnit.status)}</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <Label className="text-[10px] uppercase text-muted-foreground">ID Unit</Label>
                    <div className="text-sm font-bold">{selectedUnit.id}</div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Masalah Dilaporkan</Label>
                    <div className="text-sm italic border-l-2 border-blue-500 pl-3 py-1">"{selectedUnit.description}"</div>
                  </div>
                </div>

                {/* Form Progres */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold flex items-center gap-2 border-b pb-2">
                    <Clock className="h-4 w-4 text-blue-600" /> Progres Pekerjaan
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="next-status">Update Status Baru</Label>
                      <Select defaultValue={selectedUnit.status}>
                        <SelectTrigger id="next-status">
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Rusak">Rusak</SelectItem>
                          <SelectItem value="Dalam Perbaikan">Sedang Dikerjakan</SelectItem>
                          <SelectItem value="Baik">Selesai & Kembali Baik</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="action-note">Catatan Pekerjaan</Label>
                      <Textarea id="action-note" placeholder="Tuliskan progres perbaikan..." className="min-h-[80px]" />
                    </div>
                  </div>
                </div>

                {/* Material Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <PackageOpen className="h-4 w-4 text-orange-600" /> Kebutuhan Barang Gudang
                    </div>
                    <Button variant="outline" size="sm" onClick={addMaterialRow} className="h-7 text-xs">
                      <Plus className="mr-1 h-3 w-3" /> Tambah Item
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="pic-request" className="text-xs">PIC Yang Meminta/Mengambil</Label>
                        <Select value={requestingPIC} onValueChange={setRequestingPIC}>
                          <SelectTrigger id="pic-request">
                             <UserCheck className="mr-2 h-3 w-3 text-muted-foreground" />
                             <SelectValue placeholder="Pilih Staff/Teknisi" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Irfan Irawan Sukirman</SelectItem>
                            <SelectItem value="2">Maman (Teknisi Listrik)</SelectItem>
                            <SelectItem value="3">Asep (Teknisi Air)</SelectItem>
                            <SelectItem value="4">Fitri (Admin)</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 border rounded-md p-3 bg-muted/20">
                      {materials.map((material, index) => (
                        <div key={material.id} className="grid grid-cols-12 gap-2 items-end mb-2 last:mb-0">
                          <div className="col-span-6 space-y-1">
                            {index === 0 && <Label className="text-[10px]">Nama Barang</Label>}
                            <Input placeholder="cth: Lampu LED" value={material.itemName} onChange={(e) => updateMaterial(material.id, 'itemName', e.target.value)} className="h-8 text-xs" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            {index === 0 && <Label className="text-[10px]">Qty</Label>}
                            <Input type="number" placeholder="0" value={material.qty} onChange={(e) => updateMaterial(material.id, 'qty', e.target.value)} className="h-8 text-xs" />
                          </div>
                          <div className="col-span-3 space-y-1">
                            {index === 0 && <Label className="text-[10px]">Satuan</Label>}
                            <Select value={material.unit} onValueChange={(val) => updateMaterial(material.id, 'unit', val)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pcs">Pcs</SelectItem>
                                    <SelectItem value="Unit">Unit</SelectItem>
                                    <SelectItem value="Buah">Buah</SelectItem>
                                </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1 pb-1 text-right">
                            <Button variant="ghost" size="icon" onClick={() => removeMaterialRow(material.id)} className="h-8 w-8 text-destructive" disabled={materials.length === 1}>
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
                  <div className="flex items-center gap-2 text-sm font-semibold border-b pb-2">
                    <History className="h-4 w-4 text-slate-500" /> Riwayat Progres
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
                        <p className="text-center text-xs text-muted-foreground py-6">Belum ada riwayat pengerjaan.</p>
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
              <Button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 font-bold" onClick={handleSaveProgress}>
                Simpan & Update Status
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </main>

      {/* PRINT-ONLY SECTION: Full Data Report */}
      <div className="hidden print:block p-8 bg-white text-black min-h-screen">
        <header className="text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase">Laporan Status Kondisi Bangunan</h1>
          <h2 className="text-lg font-semibold uppercase">Wisma & Tower A/B BPSDM Provinsi Jawa Barat</h2>
          <p className="text-sm mt-2">Tanggal Laporan: {format(new Date(), 'dd MMMM yyyy')}</p>
        </header>

        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-center w-[80px]">ID Unit</th>
              <th className="border border-black p-2 text-left">Nama Unit / Bangunan</th>
              <th className="border border-black p-2 text-left">PIC Penanggung Jawab</th>
              <th className="border border-black p-2 text-center">Status Kondisi</th>
              <th className="border border-black p-2 text-left w-[30%]">Deskripsi Kerusakan</th>
              <th className="border border-black p-2 text-center">Tgl Cek</th>
            </tr>
          </thead>
          <tbody>
            {dummyData.map((item) => (
              <tr key={item.id}>
                <td className="border border-black p-2 text-center font-mono font-bold">{item.id}</td>
                <td className="border border-black p-2">
                  <div className="font-bold">{item.name}</div>
                  <div className="text-[10px] text-gray-600">{item.building}</div>
                </td>
                <td className="border border-black p-2 text-left">
                  <div className="font-bold">{item.pic.name}</div>
                  <div className="text-[10px]">{item.pic.role}</div>
                </td>
                <td className="border border-black p-2 text-center font-bold">
                  {item.status.toUpperCase()}
                </td>
                <td className="border border-black p-2 text-[10px] italic">
                  {item.status === "Baik" ? "-" : item.description}
                </td>
                <td className="border border-black p-2 text-center">{item.lastChecked}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer className="mt-12 grid grid-cols-2 gap-8 text-xs">
          <div className="text-center">
            <p>Mengetahui,</p>
            <p className="mt-16 font-bold underline">(_________________________)</p>
            <p>Kepala Bagian Umum</p>
          </div>
          <div className="text-center">
            <p>Dibuat Oleh,</p>
            <p className="mt-16 font-bold underline">(_________________________)</p>
            <p>Admin Utilitas</p>
          </div>
        </footer>
      </div>

      <footer className="sticky bottom-0 z-10 w-full bg-background/95 backdrop-blur-sm print:hidden">
        <Card className="rounded-none border-0 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>© 2026 BPSDM Provinsi Jawa Barat. Developed by Irfan Irawan Sukirman. SIMANJA. All rights reserved.</p>
          </div>
        </Card>
      </footer>
      
      <style jsx global>{`
        @media print {
          /* Sembunyikan SEMUA elemen UI aplikasi */
          body * {
            visibility: hidden;
          }
          /* Tampilkan hanya section print */
          .print\:block, .print\:block * {
            visibility: visible;
          }
          .print\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          /* Perbaikan layout cetak */
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          footer, .sidebar, header, nav, button, .tabs-list {
            display: none !important;
          }
          main {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
