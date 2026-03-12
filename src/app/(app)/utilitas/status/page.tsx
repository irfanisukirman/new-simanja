"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  ClipboardList, 
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
  SortDesc
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import * as XLSX from "xlsx"
import { useToast } from "@/hooks/use-toast"

interface RoomStatus {
  id: string;
  name: string;
  building: string;
  category: "Wisma" | "Tower A" | "Tower B";
  status: "Baik" | "Rusak Ringan" | "Rusak Berat";
  description: string;
  lastChecked: string;
}

const dummyData: RoomStatus[] = [
  // Wisma
  { id: "W-A01", name: "Blok A-1", building: "Wisma", category: "Wisma", status: "Rusak Ringan", description: "Atap bocor halus di area teras", lastChecked: "05-06-2026" },
  { id: "W-A02", name: "Blok A-2", building: "Wisma", category: "Wisma", status: "Baik", description: "Kondisi sangat baik", lastChecked: "05-06-2026" },
  { id: "W-B05", name: "Blok B-5", building: "Wisma", category: "Wisma", status: "Rusak Berat", description: "Plafon kamar mandi jebol", lastChecked: "04-06-2026" },
  
  // Tower A
  { id: "TA-321", name: "Kamar A-321", building: "Tower A", category: "Tower A", status: "Rusak Berat", description: "AC tidak dingin & dinding rembes air", lastChecked: "02-06-2026" },
  { id: "TA-322", name: "Kamar A-322", building: "Tower A", category: "Tower A", status: "Baik", description: "Kondisi normal", lastChecked: "02-06-2026" },
  { id: "TA-405", name: "Kamar A-405", building: "Tower A", category: "Tower A", status: "Rusak Ringan", description: "Gagang pintu kamar mandi longgar", lastChecked: "03-06-2026" },

  // Tower B
  { id: "TB-102", name: "Kamar B-102", building: "Tower B", category: "Tower B", status: "Baik", description: "Siap huni", lastChecked: "01-06-2026" },
  { id: "TB-210", name: "Kamar B-210", building: "Tower B", category: "Tower B", status: "Rusak Ringan", description: "Lampu utama redup/kedip", lastChecked: "04-06-2026" },
];

const getStatusBadge = (status: RoomStatus["status"]) => {
  switch (status) {
    case "Baik":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"><CheckCircle2 className="mr-1 h-3 w-3" /> Baik</Badge>;
    case "Rusak Ringan":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"><AlertTriangle className="mr-1 h-3 w-3" /> Rusak Ringan</Badge>;
    case "Rusak Berat":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><AlertTriangle className="mr-1 h-3 w-3" /> Rusak Berat</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const statusPriority = {
  "Rusak Berat": 0,
  "Rusak Ringan": 1,
  "Baik": 2
};

export default function StatusKondisiPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<"none" | "priority" | "priority-desc">("none");

  const filteredAndSortedData = useMemo(() => {
    // 1. Filter
    let result = dummyData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });

    // 2. Sort
    if (sortOrder === "priority") {
      // Rusak Berat First
      result.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
    } else if (sortOrder === "priority-desc") {
      // Kondisi Baik First
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
    XLSX.writeFile(workbook, `Status_Kondisi_Bangunan_${new Date().toLocaleDateString()}.xlsx`);
    
    toast({
      variant: "success",
      title: "Ekspor Berhasil",
      description: "Data status kondisi telah diunduh ke Excel.",
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Status Kondisi Bangunan</h1>
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
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-green-50/50">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Kondisi Baik</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-green-700">{dummyData.filter(d => d.status === "Baik").length} Unit</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50/50">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Rusak Ringan</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-yellow-700">{dummyData.filter(d => d.status === "Rusak Ringan").length} Unit</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50/50">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Rusak Berat</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-red-700">{dummyData.filter(d => d.status === "Rusak Berat").length} Unit</div>
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
                      Urutkan: {sortOrder === 'none' ? 'Default' : sortOrder === 'priority' ? 'Tingkat Kerusakan' : 'Kondisi Baik'}
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

              <TabsContent value={activeCategory} className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[120px]">ID Unit</TableHead>
                        <TableHead>Nama Unit</TableHead>
                        <TableHead>Kondisi</TableHead>
                        <TableHead className="max-w-[300px]">Deskripsi Kerusakan</TableHead>
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
                            <TableCell className="text-sm text-muted-foreground italic">
                              {item.description}
                            </TableCell>
                            <TableCell className="text-center text-xs">{item.lastChecked}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Info className="h-4 w-4" />
                              </Button>
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
