
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  History, 
  FileText, 
  LineChart as LineChartIcon, 
  PlusCircle, 
  Upload,
  Info,
  Loader2
} from "lucide-react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"

interface Bill {
  id: number;
  periode: string;
  no_pelanggan: string;
  lokasi: string;
  total_pemakaian_kwh: string;
  stand_meter_awal: string;
  stand_meter_akhir: string;
  total_bruto: string;
  pajak: string;
  subsidi: string;
  total_bayar: string;
  jatuh_tempo: string;
  status: string;
  foto_meteran: string;
}

const formatCurrency = (value: number | string) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(numericValue || 0);
}

const kwhData = [
  { month: "Jan", kwh: 1200 },
  { month: "Feb", kwh: 1450 },
  { month: "Mar", kwh: 1300 },
  { month: "Apr", kwh: 1600 },
  { month: "Mei", kwh: 1550 },
  { month: "Jun", kwh: 1700 },
  { month: "Jul", kwh: 1650 },
  { month: "Agu", kwh: 1800 },
  { month: "Sep", kwh: 1750 },
  { month: "Okt", kwh: 1900 },
  { month: "Nov", kwh: 1850 },
  { month: "Des", kwh: 2100 },
]

const chartConfig = {
  kwh: {
    label: "Pemakaian (kWh)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const history = [
  { id: 1, date: "01-06-2026", location: "Gedung Utama", meter: 45230, usage: 1700 },
  { id: 2, date: "01-05-2026", location: "Gedung Utama", meter: 43530, usage: 1550 },
  { id: 3, date: "01-04-2026", location: "Gedung Utama", meter: 41980, usage: 1600 },
]

const locationMapping: Record<string, string> = {
  utama_wisma: "Gedung BPSDM & Wisma",
  masjid_at_tarbiyah: "Masjid At-Tarbiyah",
  pos_satpam_koperasi: "Pos Satpam & Koperasi",
};

export default function ListrikPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("input")
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoadingBills, setIsLoadingBills] = useState(false);

  const handleApiError = useCallback((error: any) => {
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
    return false;
  }, [toast]);

  const fetchBills = useCallback(async () => {
    setIsLoadingBills(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/utility/bills`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
      });
      if (response.data.code === 200) {
        setBills(response.data.data);
      }
    } catch (error: any) {
      if (!handleApiError(error)) {
        toast({
          variant: "destructive",
          title: "Gagal Mengambil Data Tagihan",
          description: error.response?.data?.message || "Terjadi kesalahan pada server.",
        });
      }
    } finally {
      setIsLoadingBills(false);
    }
  }, [toast, handleApiError]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8 pb-24">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Listrik</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Zap className="mr-1 h-3 w-3" /> PLN Pasca Bayar
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 border-b rounded-none">
            <TabsTrigger 
              value="input" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Input Tagihan & Meter
            </TabsTrigger>
            <TabsTrigger 
              value="bills" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" /> Tagihan
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              <History className="h-4 w-4" /> Riwayat
            </TabsTrigger>
            <TabsTrigger 
              value="graph" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              <LineChartIcon className="h-4 w-4" /> Grafik
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Form Input Tagihan & Meter Listrik</CardTitle>
                <CardDescription>Lengkapi data tagihan bulanan dan stand meter listrik.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Bagian 1: Informasi Dasar */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold border-b pb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Informasi Tagihan
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="tanggal">Tanggal Pencatatan</Label>
                      <Input id="tanggal" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="no_pelanggan">Nomor Pelanggan</Label>
                      <Input id="no_pelanggan" placeholder="Contoh: 535811797103" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lokasi">Lokasi Panel / Gedung</Label>
                      <Select defaultValue="utama_wisma">
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Lokasi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utama_wisma">Gedung BPSDM & Wisma</SelectItem>
                          <SelectItem value="masjid_at_tarbiyah">Masjid At-Tarbiyah</SelectItem>
                          <SelectItem value="pos_satpam_koperasi">Pos Satpam & Koperasi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jatuh_tempo">Jatuh Tempo</Label>
                      <Input id="jatuh_tempo" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status Pembayaran</Label>
                      <Select defaultValue="belum_lunas">
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lunas">Lunas</SelectItem>
                          <SelectItem value="belum_lunas">Belum Lunas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Bagian 2: Data Meteran & Foto */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold border-b pb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" /> Data Stand Meter
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="stand_meter_awal">Stand Meter Awal (kWh)</Label>
                      <Input id="stand_meter_awal" type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stand_meter_akhir">Stand Meter Akhir (kWh)</Label>
                      <Input id="stand_meter_akhir" type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total_pemakaian_kwh">Total Pemakaian (kWh)</Label>
                      <Input id="total_pemakaian_kwh" type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="pt-4 space-y-2">
                      <Label>Foto Bukti Meteran</Label>
                      <div className="border-2 border-dashed rounded-lg h-[200px] flex flex-col items-center justify-center text-muted-foreground hover:bg-accent/50 cursor-pointer transition-colors">
                        <Upload className="h-8 w-8 mb-2" />
                        <p className="text-sm">Klik untuk upload foto</p>
                        <p className="text-[10px] mt-1 text-muted-foreground">JPG, PNG (Maks 2MB)</p>
                      </div>
                    </div>
                  </div>

                  {/* Bagian 3: Rincian Biaya */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold border-b pb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500" /> Rincian Biaya (Rp)
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="total_bruto">Total Bruto</Label>
                      <Input id="total_bruto" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pajak">Pajak (PPJ)</Label>
                      <Input id="pajak" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subsidi">Subsidi</Label>
                      <Input id="subsidi" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total_bayar" className="text-primary font-bold">Total Bayar</Label>
                      <Input id="total_bayar" type="number" className="font-bold text-lg border-primary/30" placeholder="0" />
                    </div>
                    <div className="pt-6">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-lg">
                        Simpan Data Listrik
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bills" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Tagihan & Pembayaran PLN</CardTitle>
                <CardDescription>Daftar tagihan bulanan dari PLN.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  {isLoadingBills ? (
                    <div className="h-64 flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Periode</TableHead>
                          <TableHead>No. Pelanggan</TableHead>
                          <TableHead>Lokasi</TableHead>
                          <TableHead className="text-right">Nominal Tagihan</TableHead>
                          <TableHead className="text-center">Jatuh Tempo</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bills.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              Tidak ada data tagihan.
                            </TableCell>
                          </TableRow>
                        ) : (
                          bills.map((bill) => (
                            <TableRow key={bill.id}>
                              <TableCell className="font-medium">{bill.periode}</TableCell>
                              <TableCell>{bill.no_pelanggan}</TableCell>
                              <TableCell>{locationMapping[bill.lokasi] || bill.lokasi}</TableCell>
                              <TableCell className="text-right font-semibold">{formatCurrency(bill.total_bayar)}</TableCell>
                              <TableCell className="text-center">
                                {bill.jatuh_tempo ? format(new Date(bill.jatuh_tempo), 'dd-MM-yyyy') : '-'}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={bill.status.toLowerCase() === 'lunas' ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100" : "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100"}>
                                  {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Info className="mr-2 h-3 w-3" /> Detail
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>Rincian Tagihan {bill.periode}</DialogTitle>
                                      <DialogDescription>
                                        Informasi lengkap pemakaian dan rincian biaya listrik.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">No. Pelanggan</span>
                                        <span className="font-medium">{bill.no_pelanggan}</span>
                                      </div>
                                      <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Lokasi</span>
                                        <span className="font-medium">{locationMapping[bill.lokasi] || bill.lokasi}</span>
                                      </div>
                                      <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Total Pemakaian</span>
                                        <span className="font-medium">{parseFloat(bill.total_pemakaian_kwh).toLocaleString()} kWh</span>
                                      </div>
                                      <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Biaya Bruto</span>
                                        <span className="font-medium">{formatCurrency(bill.total_bruto)}</span>
                                      </div>
                                      <div className="flex justify-between border-b pb-2 text-green-600">
                                        <span className="text-muted-foreground">Subsidi</span>
                                        <span className="font-medium">- {formatCurrency(bill.subsidi)}</span>
                                      </div>
                                      <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Pajak (PPJ)</span>
                                        <span className="font-medium">{formatCurrency(bill.pajak)}</span>
                                      </div>
                                      <div className="flex justify-between pt-2">
                                        <span className="font-bold">Total Bayar</span>
                                        <span className="font-bold text-primary">{formatCurrency(bill.total_bayar)}</span>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button type="button">Tutup</Button>
                                      </DialogClose>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pemakaian Listrik</CardTitle>
                <CardDescription>Catatan pemakaian kWh dari waktu ke waktu.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal Catat</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead className="text-right">Stand Meter</TableHead>
                        <TableHead className="text-right">Pemakaian (kWh)</TableHead>
                        <TableHead className="text-center">Petugas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell className="text-right">{item.meter.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold text-primary">{item.usage.toLocaleString()} kWh</TableCell>
                          <TableCell className="text-center">Irfan I.</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graph" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Tren Konsumsi Listrik</CardTitle>
                <CardDescription>Grafik pemakaian kWh selama 12 bulan terakhir.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kwhData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `${value} kWh`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="kwh" 
                        stroke="var(--color-kwh)" 
                        strokeWidth={3} 
                        dot={{ r: 6, fill: "var(--color-kwh)" }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
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
