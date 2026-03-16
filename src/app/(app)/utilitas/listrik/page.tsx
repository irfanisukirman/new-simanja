
"use client"

import { useState } from "react"
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
  Info
} from "lucide-react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
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

const bills = [
  { id: 1, period: "Juni 2026", amount: 5900000, status: "Lunas", due: "20-06-2026", noPel: "543210987654", usage: 1700 },
  { id: 2, period: "Mei 2026", amount: 5500000, status: "Lunas", due: "20-05-2026", noPel: "543210987654", usage: 1550 },
  { id: 3, period: "April 2026", amount: 6100000, status: "Lunas", due: "20-04-2026", noPel: "543210987654", usage: 1600 },
]

const history = [
  { id: 1, date: "01-06-2026", location: "Gedung Utama", meter: 45230, usage: 1700 },
  { id: 2, date: "01-05-2026", location: "Gedung Utama", meter: 43530, usage: 1550 },
  { id: 3, date: "01-04-2026", location: "Gedung Utama", meter: 41980, usage: 1600 },
]

export default function ListrikPage() {
  const [activeTab, setActiveTab] = useState("input")

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
              <PlusCircle className="h-4 w-4" /> Input Meter
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

          {/* Tab: Input Meter */}
          <TabsContent value="input" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Pencatatan Meter Mandiri</CardTitle>
                <CardDescription>Input stand meter listrik untuk pemantauan pemakaian bulanan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tanggal">Tanggal Pencatatan</Label>
                      <Input id="tanggal" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lokasi">Lokasi Panel / Gedung</Label>
                      <Select defaultValue="utama">
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Lokasi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utama">Gedung Utama (Kantor)</SelectItem>
                          <SelectItem value="wisma-a">Wisma A</SelectItem>
                          <SelectItem value="wisma-b">Wisma B</SelectItem>
                          <SelectItem value="aula">Gedung Aula</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stand-meter">Stand Meter Terakhir (kWh)</Label>
                      <Input id="stand-meter" type="number" placeholder="Contoh: 45230" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label>Foto Bukti Meteran</Label>
                    <div className="border-2 border-dashed rounded-lg h-[210px] flex flex-col items-center justify-center text-muted-foreground hover:bg-accent/50 cursor-pointer transition-colors">
                      <Upload className="h-8 w-8 mb-2" />
                      <p className="text-sm">Klik atau seret foto untuk upload</p>
                      <p className="text-xs mt-1">Format: JPG, PNG (Maks 2MB)</p>
                    </div>
                    <div className="pt-2">
                      <Button className="w-full">
                        Simpan Data Meter
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Tagihan PLN */}
          <TabsContent value="bills" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Tagihan & Pembayaran PLN</CardTitle>
                <CardDescription>Daftar tagihan bulanan dari PLN.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Periode</TableHead>
                        <TableHead>No. Pelanggan</TableHead>
                        <TableHead className="text-right">Nominal Tagihan</TableHead>
                        <TableHead className="text-center">Jatuh Tempo</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-medium">{bill.period}</TableCell>
                          <TableCell>{bill.noPel}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(bill.amount)}</TableCell>
                          <TableCell className="text-center">{bill.due}</TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                              {bill.status}
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
                                  <DialogTitle>Rincian Tagihan {bill.period}</DialogTitle>
                                  <DialogDescription>
                                    Informasi lengkap pemakaian dan rincian biaya listrik.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">No. Pelanggan</span>
                                    <span className="font-medium">{bill.noPel}</span>
                                  </div>
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Total Pemakaian</span>
                                    <span className="font-medium">{bill.usage} kWh</span>
                                  </div>
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Tarif Dasar</span>
                                    <span className="font-medium">{formatCurrency(bill.amount - 250000)}</span>
                                  </div>
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Pajak (PPJ)</span>
                                    <span className="font-medium">{formatCurrency(245000)}</span>
                                  </div>
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Biaya Admin</span>
                                    <span className="font-medium">{formatCurrency(5000)}</span>
                                  </div>
                                  <div className="flex justify-between pt-2">
                                    <span className="font-bold">Total Bayar</span>
                                    <span className="font-bold text-primary">{formatCurrency(bill.amount)}</span>
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Riwayat Pemakaian */}
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

          {/* Tab: Grafik kWh */}
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
