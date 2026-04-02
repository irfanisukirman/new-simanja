
"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
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
  Clock,
  Plus,
  Trash2,
  UserCheck,
  PackageOpen,
  User,
  PlusCircle,
  MessageCircle,
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
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import * as XLSX from "xlsx"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import axios from "axios"

interface MaintenanceLog {
  date: string;
  action: string;
  user: string;
}

interface UnitPIC {
  name: string;
  contact: string;
  position: string;
}

interface Unit {
  id: number;
  unit_code: string;
  unit_name: string;
  description?: string;
  capacity: number;
  condition_status: string;
  last_check_date: string;
  pic: UnitPIC;
  current_occupancy: number;
  total_occupancy: string;
}

interface SummaryData {
  kondisi_baik: number;
  kondisi_rusak: number;
  dalam_perbaikan: number;
}

interface NeededMaterial {
  id: string;
  itemName: string;
  qty: string;
  unit: string;
}

const getStatusBadge = (status: string) => {
  const normalizedStatus = (status || "").toUpperCase();
  
  if (normalizedStatus === "BAIK") {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
        <CheckCircle2 className="mr-1 h-3 w-3" /> Baik
      </Badge>
    );
  }
  
  if (normalizedStatus === "RUSAK") {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
        <AlertTriangle className="mr-1 h-3 w-3" /> Rusak
      </Badge>
    );
  }
  
  if (normalizedStatus.includes("PERBAIKAN")) {
    return (
      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">
        <Wrench className="mr-1 h-3 w-3" /> Dalam Perbaikan
      </Badge>
    );
  }
  
  return <Badge variant="outline">{status}</Badge>;
};

const statusPriority: Record<string, number> = {
  "RUSAK": 0,
  "PERBAIKAN": 1,
  "BAIK": 2
};

export default function StatusKondisiPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<"none" | "priority" | "priority-desc">("none");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Stats State
  const [summary, setSummary] = useState<SummaryData>({
    kondisi_baik: 0,
    kondisi_rusak: 0,
    dalam_perbaikan: 0
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  // Units State
  const [units, setUnits] = useState<Unit[]>([]);
  const [isUnitsLoading, setIsUnitsLoading] = useState(true);

  const [materials, setMaterials] = useState<NeededMaterial[]>([
    { id: Math.random().toString(), itemName: "", qty: "", unit: "" }
  ]);
  const [requestingPIC, setRequestingPIC] = useState("");

  const handleApiError = useCallback((error: any, context: string = "general") => {
    if (error.response?.status === 401) {
      toast({
        variant: "destructive",
        title: "Sesi Habis",
        description: "Sesi Anda telah berakhir. Silakan login kembali.",
      });
      localStorage.clear();
      window.location.href = "/login";
      return true;
    }
    
    toast({
      variant: "destructive",
      title: `Terjadi Kesalahan - ${context}`,
      description: error.response?.data?.message || "Tidak dapat terhubung ke server.",
    });

    return false;
  }, [toast]);

  const fetchSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/utility/summary`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (response.data?.code === 200) {
        setSummary(response.data.data);
      }
    } catch (error: any) {
      handleApiError(error, "Fetch Summary");
    } finally {
      setTimeout(() => {
        setIsSummaryLoading(false);
      }, 700);
    }
  }, [handleApiError]);

  const fetchUnits = useCallback(async () => {
    setIsUnitsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/utility`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (response.data?.code === 200) {
        setUnits(response.data.data);
      }
    } catch (error: any) {
      handleApiError(error, "Fetch Units");
    } finally {
      setTimeout(() => {
        setIsUnitsLoading(false);
      }, 1000);
    }
  }, [handleApiError]);

  useEffect(() => {
    fetchSummary();
    fetchUnits();
  }, [fetchSummary, fetchUnits]);

  const filteredAndSortedData = useMemo(() => {
    let result = units.filter(item => {
      const matchesSearch = (item.unit_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (item.unit_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.pic.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const categoryFromCode = (item.unit_code || "").startsWith('W-') ? 'Wisma' : 
                               (item.unit_code || "").startsWith('TA-') ? 'Tower A' : 
                               (item.unit_code || "").startsWith('TB-') ? 'Tower B' : 'Lainnya';
                               
      const matchesCategory = activeCategory === "all" || categoryFromCode === activeCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortOrder === "priority") {
      result.sort((a, b) => {
        const priorityA = statusPriority[(a.condition_status || "").toUpperCase()] ?? 99;
        const priorityB = statusPriority[(b.condition_status || "").toUpperCase()] ?? 99;
        return priorityA - priorityB;
      });
    } else if (sortOrder === "priority-desc") {
      result.sort((a, b) => {
        const priorityA = statusPriority[(a.condition_status || "").toUpperCase()] ?? 99;
        const priorityB = statusPriority[(b.condition_status || "").toUpperCase()] ?? 99;
        return priorityB - priorityA;
      });
    }

    return result;
  }, [units, searchTerm, activeCategory, sortOrder]);

  const handleExportExcel = () => {
    const dataToExport = units.map(item => ({
      "ID Unit": item.unit_code,
      "Nama Unit": item.unit_name,
      "Deskripsi": item.description || "-",
      "PIC Unit": item.pic.name,
      "Keterisian": item.total_occupancy,
      "Kondisi": item.condition_status,
      "Terakhir Dicek": item.last_check_date ? format(new Date(item.last_check_date), 'dd-MM-yyyy') : "-"
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

  const handleOpenMaintenance = (unit: Unit) => {
    setSelectedUnit(unit);
    setMaterials([{ id: Math.random().toString(), itemName: "", qty: "", unit: "" }]);
    setRequestingPIC("");
    setIsMaintenanceOpen(true);
  };

  const handleOpenDetail = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDetailOpen(true);
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

  const handleSaveNewUnit = () => {
    toast({
      variant: "success",
      title: "Unit Berhasil Ditambahkan",
      description: "Data unit baru telah masuk ke dalam sistem monitoring."
    });
  };

  const openWhatsApp = (contact: string) => {
    const formatted = contact.replace(/\D/g, '');
    const cleanNumber = formatted.startsWith('0') ? '62' + formatted.slice(1) : formatted;
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  return (
    <div className="flex min-h-screen flex-col relative">
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8 pb-24 text-foreground print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Status Kondisi Bangunan</h1>
            <p className="text-muted-foreground text-sm">Monitoring fisik per unit dengan penanggung jawab spesifik.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden sm:flex">
              <Printer className="mr-2 h-4 w-4" /> Cetak PDF
            </Button>
            <Button size="sm" onClick={handleExportExcel} className="bg-success hover:bg-success/90 text-white">
              <FileDown className="mr-2 h-4 w-4" /> Excel
            </Button>
          </div>
        </div>

        {/* Statistik Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-green-50/50">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Kondisi Baik</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0 min-h-[40px] flex items-center">
              {isSummaryLoading ? (
                <Skeleton className="h-8 w-14 animate-pulse bg-slate-200" />
              ) : (
                <div className="text-2xl font-bold text-green-700">{summary.kondisi_baik}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-red-50/50">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Kondisi Rusak</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0 min-h-[40px] flex items-center">
              {isSummaryLoading ? (
                <Skeleton className="h-8 w-14 animate-pulse bg-slate-200" />
              ) : (
                <div className="text-2xl font-bold text-red-700">{summary.kondisi_rusak}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-blue-50/50">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Dalam Perbaikan</CardTitle>
              <Wrench className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0 min-h-[40px] flex items-center">
              {isSummaryLoading ? (
                <Skeleton className="h-8 w-14 animate-pulse bg-slate-200" />
              ) : (
                <div className="text-2xl font-bold text-blue-700">{summary.dalam_perbaikan}</div>
              )}
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

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto bg-primary">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Tambah Unit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Tambah Unit Gedung/Wisma Baru</DialogTitle>
                      <DialogDescription>
                        Input data unit baru untuk monitoring kondisi fisik dan hunian.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-id">ID Unit</Label>
                          <Input id="new-id" placeholder="cth: W-A01 atau TA-101" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-name">Nama Unit</Label>
                          <Input id="new-name" placeholder="cth: Blok A-1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-category">Kategori</Label>
                          <Select>
                            <SelectTrigger id="new-category">
                              <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Wisma">Wisma</SelectItem>
                              <SelectItem value="Tower A">Tower A</SelectItem>
                              <SelectItem value="Tower B">Tower B</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-capacity">Kapasitas (Orang)</Label>
                          <Input id="new-capacity" type="number" placeholder="6" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-status">Status Awal</Label>
                        <Select defaultValue="Baik">
                          <SelectTrigger id="new-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Baik">Baik</SelectItem>
                            <SelectItem value="Dalam Perbaikan">Dalam Perbaikan</SelectItem>
                            <SelectItem value="Rusak">Rusak</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-pic">Nama PIC Penanggung Jawab</Label>
                        <Select>
                          <SelectTrigger id="new-pic">
                            <SelectValue placeholder="Pilih PIC" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Udin Syarifuddin">Udin Syarifuddin</SelectItem>
                            <SelectItem value="Pedro Gonzales">Pedro Gonzales</SelectItem>
                            <SelectItem value="Siti Aminah">Siti Aminah</SelectItem>
                            <SelectItem value="Ahmad Fauzi">Ahmad Fauzi</SelectItem>
                            <SelectItem value="Irfan Irawan Sukirman">Irfan Irawan Sukirman</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-desc">Deskripsi / Catatan Awal</Label>
                        <Textarea id="new-desc" placeholder="Keterangan tambahan unit..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" onClick={handleSaveNewUnit}>Simpan Unit</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                        <TableHead className="w-[100px] text-center">ID Unit</TableHead>
                        <TableHead className="text-left">Nama Unit</TableHead>
                        <TableHead className="text-center">Keterisian</TableHead>
                        <TableHead className="text-left">PIC Penanggung Jawab</TableHead>
                        <TableHead className="text-center">Kondisi</TableHead>
                        <TableHead className="text-center">Tgl Cek</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isUnitsLoading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-center"><Skeleton className="h-4 w-16 bg-slate-200 mx-auto" /></TableCell>
                            <TableCell className="text-left"><Skeleton className="h-4 w-48 bg-slate-200" /></TableCell>
                            <TableCell className="text-center"><Skeleton className="h-6 w-12 rounded-full bg-slate-200 mx-auto" /></TableCell>
                            <TableCell className="text-left">
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-7 w-7 rounded-full bg-slate-200" />
                                <div className="space-y-1">
                                  <Skeleton className="h-3 w-24 bg-slate-200" />
                                  <Skeleton className="h-2 w-16 bg-slate-200" />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center"><Skeleton className="h-6 w-20 rounded-full bg-slate-200 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Skeleton className="h-4 w-20 mx-auto bg-slate-200" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto bg-slate-200" /></TableCell>
                          </TableRow>
                        ))
                      ) : filteredAndSortedData.length > 0 ? (
                        filteredAndSortedData.map((item) => (
                          <TableRow key={item.id} className="hover:bg-accent/50">
                            <TableCell className="font-mono text-xs font-bold text-center">{item.unit_code}</TableCell>
                            <TableCell className="text-left">
                                <div className="flex flex-col">
                                    <span className="font-medium">{item.unit_name}</span>
                                    {item.description && (
                                        <div className="flex items-center gap-1 group">
                                            <span className="text-[11px] text-muted-foreground italic truncate max-w-[200px]">
                                                {item.description}
                                            </span>
                                            {item.description.length > 30 && (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Info className="h-3 w-3 text-muted-foreground" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-72" align="start">
                                                        <div className="space-y-2">
                                                            <h4 className="font-semibold text-xs uppercase text-muted-foreground">Detail Keterangan</h4>
                                                            <p className="text-xs leading-relaxed">{item.description}</p>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Badge 
                                            variant="secondary" 
                                            className={cn(
                                                "cursor-pointer transition-colors mx-auto",
                                                item.current_occupancy >= item.capacity 
                                                  ? "bg-red-100 text-red-700 hover:bg-red-200" 
                                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                                            )}
                                        >
                                            <Info className="mr-1 h-3 w-3" />
                                            {item.total_occupancy}
                                        </Badge>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-0" align="center">
                                        <div className="bg-muted/50 p-3 border-b">
                                            <h4 className="font-semibold text-xs uppercase flex items-center justify-center gap-2">
                                                <User className="h-3 w-3" /> Info Penghuni
                                            </h4>
                                        </div>
                                        <div className="p-4 text-center text-xs text-muted-foreground italic border border-dashed m-2 rounded bg-white">
                                            Data detail penghuni sedang dimuat...
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </TableCell>
                            <TableCell className="text-left">
                                <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center border">
                                        <User className="h-3.5 w-3.5 text-slate-600" />
                                    </div>
                                    <div className="text-xs">
                                        <div className="font-semibold">{item.pic.name}</div>
                                        <div className="text-muted-foreground">{item.pic.position}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">{getStatusBadge(item.condition_status)}</TableCell>
                            <TableCell className="text-center text-xs">
                              {item.last_check_date ? format(new Date(item.last_check_date), 'dd-MM-yyyy') : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {(item.condition_status || "").toUpperCase() !== "BAIK" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                    onClick={() => handleOpenMaintenance(item)}
                                  >
                                    <Wrench className="mr-1 h-3 w-3" /> Tindak Lanjut
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 hover:bg-primary/10 hover:text-primary"
                                  onClick={() => handleOpenDetail(item)}
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Data tidak ditemukan.</TableCell>
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-white hover:bg-white/20"
                          onClick={() => openWhatsApp(selectedUnit.pic.contact)}
                        >
                            <MessageCircle className="h-4 w-4" />
                        </Button>
                    </div>
                    <Separator className="bg-white/10 mb-3" />
                    <div className="grid grid-cols-2 gap-4 text-[11px]">
                        <div>
                            <p className="text-blue-300 font-bold uppercase mb-0.5">Role/Jabatan</p>
                            <p>{selectedUnit.pic.position}</p>
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
                    <div>{getStatusBadge(selectedUnit.condition_status)}</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <Label className="text-[10px] uppercase text-muted-foreground">ID Unit</Label>
                    <div className="text-sm font-bold">{selectedUnit.unit_code}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-semibold flex items-center gap-2 border-b pb-2">
                    <Clock className="h-4 w-4 text-blue-600" /> Progres Pekerjaan
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="next-status">Update Status Baru</Label>
                      <Select defaultValue={selectedUnit.condition_status}>
                        <SelectTrigger id="next-status">
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RUSAK">Rusak</SelectItem>
                          <SelectItem value="DALAM_PERBAIKAN">Sedang Dikerjakan</SelectItem>
                          <SelectItem value="BAIK">Selesai & Kembali Baik</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="action-note">Catatan Pekerjaan</Label>
                      <Textarea id="action-note" placeholder="Tuliskan progres perbaikan..." className="min-h-[80px]" />
                    </div>
                  </div>
                </div>

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

        {/* Unit & PIC Detail Sheet */}
        <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <SheetContent side="right" className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Detail Unit & PIC</SheetTitle>
              <SheetDescription>Informasi lengkap unit bangunan dan penanggung jawab.</SheetDescription>
            </SheetHeader>
            
            {selectedUnit && (
              <div className="space-y-8 py-8">
                {/* Unit Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" /> Informasi Unit
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">ID Unit</p>
                      <p className="font-mono font-bold text-primary">{selectedUnit.unit_code}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Status Kondisi</p>
                      <div>{getStatusBadge(selectedUnit.condition_status)}</div>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-xs text-muted-foreground">Nama Unit</p>
                      <p className="font-medium">{selectedUnit.unit_name}</p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-xs text-muted-foreground">Deskripsi</p>
                      <p className="text-sm italic">{selectedUnit.description || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Kapasitas</p>
                      <p className="font-medium">{selectedUnit.capacity} Orang</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Hunian Saat Ini</p>
                      <p className={cn("font-bold", selectedUnit.current_occupancy >= selectedUnit.capacity ? "text-red-600" : "text-green-600")}>
                        {selectedUnit.total_occupancy}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* PIC Card Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <UserCheck className="h-4 w-4" /> Penanggung Jawab (PIC)
                  </h4>
                  <Card className="border-none shadow-lg bg-slate-900 text-white overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                          <User className="h-7 w-7 text-blue-300" />
                        </div>
                        <div>
                          <p className="text-lg font-bold leading-tight">{selectedUnit.pic.name}</p>
                          <p className="text-xs text-blue-300 font-medium">{selectedUnit.pic.position}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-white/5 border border-white/10">
                          <span className="text-white/60">No. Telepon</span>
                          <span className="font-mono font-bold">{selectedUnit.pic.contact}</span>
                        </div>
                        
                        <Button 
                          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-6 gap-2"
                          onClick={() => openWhatsApp(selectedUnit.pic.contact)}
                        >
                          <MessageCircle className="h-5 w-5" />
                          Hubungi via WhatsApp
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Last Check Info */}
                <div className="rounded-lg bg-accent/50 p-4 flex items-center gap-3">
                   <Clock className="h-5 w-5 text-muted-foreground" />
                   <div>
                     <p className="text-[10px] uppercase font-bold text-muted-foreground">Pemeriksaan Terakhir</p>
                     <p className="text-sm font-medium">
                       {selectedUnit.last_check_date ? format(new Date(selectedUnit.last_check_date), 'dd MMMM yyyy, HH:mm') : 'Belum pernah dicek'}
                     </p>
                   </div>
                </div>
              </div>
            )}
            
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline" className="w-full">Tutup</Button>
              </SheetClose>
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

      {/* Area Print khusus PDF */}
      <div id="print-area" className="hidden print:block p-8 bg-white text-black w-full min-h-screen">
        <header className="text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase">Laporan Status Kondisi Bangunan</h1>
          <h2 className="text-lg font-semibold uppercase text-slate-700">Wisma & Tower A/B BPSDM Provinsi Jawa Barat</h2>
          <p className="text-sm mt-2 text-slate-500">Tanggal Laporan: {format(new Date(), 'dd MMMM yyyy')}</p>
        </header>

        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-center w-[80px]">ID Unit</th>
              <th className="border border-black p-2 text-left">Nama Unit</th>
              <th className="border border-black p-2 text-center">Keterisian</th>
              <th className="border border-black p-2 text-left">PIC Penanggung Jawab</th>
              <th className="border border-black p-2 text-center">Status Kondisi</th>
              <th className="border border-black p-2 text-center">Tgl Cek</th>
            </tr>
          </thead>
          <tbody>
            {units.map((item) => (
              <tr key={item.id}>
                <td className="border border-black p-2 text-center font-mono font-bold">{item.unit_code}</td>
                <td className="border border-black p-2">
                    <div>{item.unit_name}</div>
                    <div className="text-[9px] italic text-slate-600">{item.description}</div>
                </td>
                <td className="border border-black p-2 text-center">{item.total_occupancy}</td>
                <td className="border border-black p-2 text-left">
                  <div className="font-bold">{item.pic.name}</div>
                  <div className="text-[10px]">{item.pic.position}</div>
                </td>
                <td className="border border-black p-2 text-center font-bold">
                  {(item.condition_status || "").toUpperCase()}
                </td>
                <td className="border border-black p-2 text-center">
                  {item.last_check_date ? format(new Date(item.last_check_date), 'dd-MM-yyyy') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer className="mt-12 grid grid-cols-2 gap-8 text-xs">
          <div className="text-center">
            <p className="mb-16">Mengetahui,</p>
            <p className="font-bold underline uppercase">(_________________________)</p>
            <p className="mt-1">Kepala Bagian Umum</p>
          </div>
          <div className="text-center">
            <p className="mb-16">Dibuat Oleh,</p>
            <p className="font-bold underline uppercase">(_________________________)</p>
            <p className="mt-1">Admin Utilitas</p>
          </div>
        </footer>
      </div>
      
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          
          [data-sidebar="sidebar"], 
          aside, 
          nav, 
          header, 
          footer, 
          button, 
          [role="tablist"], 
          .print\:hidden {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
          }

          main.ml-72, 
          .ml-72 {
            margin-left: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          
          body, html {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            width: 100% !important;
          }

          #print-area {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            z-index: 9999 !important;
          }
        }
      `}</style>
    </div>
  )
}
