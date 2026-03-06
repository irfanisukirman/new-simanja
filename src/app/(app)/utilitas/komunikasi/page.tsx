
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
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
  Wifi, 
  Phone, 
  Users, 
  FileText, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Info,
  ExternalLink,
  LineChart as LineChartIcon
} from "lucide-react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
}

const internetServices = [
  { id: 1, name: "Astinet Telkom", speed: "100 Mbps", type: "Dedicated", status: "Aktif", ip: "180.250.xx.xx" },
  { id: 2, name: "Indibiz Silver", speed: "300 Mbps", type: "Broadband", status: "Aktif", ip: "Dynamic" },
  { id: 3, name: "Backup Link (Biznet)", speed: "50 Mbps", type: "Dedicated", status: "Standby", ip: "103.15.xx.xx" },
]

const phoneExtensions = [
  { ext: "101", room: "Ruang Kepala Badan", status: "Aktif" },
  { ext: "102", room: "Sekretariat", status: "Aktif" },
  { ext: "105", room: "Bidang Kompetensi Manajerial", status: "Aktif" },
  { ext: "110", room: "Bidang Sertifikasi", status: "Perbaikan" },
  { ext: "201", room: "Wisma A (Resepsionis)", status: "Aktif" },
]

const vendors = [
  { id: 1, company: "PT. Telkom Indonesia", service: "Internet & Telepon", contact: "Bpk. Andi (AM)", phone: "0812-xxxx-xxxx" },
  { id: 2, company: "PT. Supra Primatama (Biznet)", service: "Internet Backup", contact: "Ibu Maya", phone: "0856-xxxx-xxxx" },
  { id: 3, company: "PT. Iforte Solusi Infotek", service: "Infrastruktur Jaringan", contact: "CS Iforte", phone: "1500-xxx" },
]

const bills = [
  { id: 1, period: "Juni 2026", service: "Internet Astinet", amount: 8500000, status: "Lunas", due: "20-06-2026" },
  { id: 2, period: "Juni 2026", service: "Indibiz + Telepon", amount: 1250000, status: "Proses", due: "20-06-2026" },
  { id: 3, period: "Mei 2026", service: "Internet Astinet", amount: 8500000, status: "Lunas", due: "20-05-2026" },
]

const communicationData = [
  { month: "Jan", cost: 9500000 },
  { month: "Feb", cost: 9700000 },
  { month: "Mar", cost: 9300000 },
  { month: "Apr", cost: 9800000 },
  { month: "Mei", cost: 9600000 },
  { month: "Jun", cost: 9750000 },
  { month: "Jul", cost: 9400000 },
  { month: "Agu", cost: 9900000 },
  { month: "Sep", cost: 9550000 },
  { month: "Okt", cost: 10200000 },
  { month: "Nov", cost: 9800000 },
  { month: "Des", cost: 10500000 },
]

const chartConfig = {
  cost: {
    label: "Biaya Komunikasi",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function KomunikasiPage() {
  const [activeTab, setActiveTab] = useState("internet")

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8 pb-24">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Komunikasi</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Globe className="mr-1 h-3 w-3" /> Jaringan & IT Support
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 border-b rounded-none">
            <TabsTrigger 
              value="internet" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              <Wifi className="h-4 w-4" /> Internet Kantor
            </TabsTrigger>
            <TabsTrigger 
              value="telepon" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              <Phone className="h-4 w-4" /> Telepon Kantor
            </TabsTrigger>
            <TabsTrigger 
              value="vendor" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              <Users className="h-4 w-4" /> Vendor Layanan
            </TabsTrigger>
            <TabsTrigger 
              value="bills" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" /> Tagihan
            </TabsTrigger>
            <TabsTrigger 
              value="graph" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              <LineChartIcon className="h-4 w-4" /> Grafik
            </TabsTrigger>
          </TabsList>

          {/* Tab: Internet Kantor */}
          <TabsContent value="internet" className="mt-0 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {internetServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
                    {service.status === "Aktif" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{service.speed}</div>
                    <p className="text-xs text-muted-foreground mt-1">Tipe: {service.type}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{service.ip}</Badge>
                      <Badge className={service.status === "Aktif" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}>
                        {service.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Topologi & Akses Point</CardTitle>
                <CardDescription>Informasi infrastruktur jaringan lokal BPSDM.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground bg-accent/30 p-4 rounded-lg border border-dashed flex items-center justify-center min-h-[100px]">
                  Visualisasi Topologi Jaringan (Coming Soon)
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Telepon Kantor */}
          <TabsContent value="telepon" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Ekstensi Telepon (PABX)</CardTitle>
                <CardDescription>Daftar nomor internal kantor dan status operasional.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Ekstensi</TableHead>
                        <TableHead>Ruangan / Bagian</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {phoneExtensions.map((item) => (
                        <TableRow key={item.ext}>
                          <TableCell className="font-bold">{item.ext}</TableCell>
                          <TableCell>{item.room}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={item.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Vendor Layanan */}
          <TabsContent value="vendor" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Kontrak & Kontak Vendor</CardTitle>
                <CardDescription>Data mitra penyedia layanan komunikasi.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {vendors.map((vendor) => (
                    <Card key={vendor.id} className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{vendor.company}</CardTitle>
                        <CardDescription>{vendor.service}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">PIC:</span>
                          <span className="font-medium">{vendor.contact}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Telp:</span>
                          <span className="font-medium">{vendor.phone}</span>
                        </div>
                        <div className="pt-2 flex gap-2">
                          <Button variant="outline" size="sm" className="w-full">
                            Hubungi
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full">
                             Kontrak <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Tagihan Bulanan */}
          <TabsContent value="bills" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Histori Tagihan Komunikasi</CardTitle>
                <CardDescription>Monitoring biaya internet dan telepon bulanan.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Periode</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead className="text-right">Nominal</TableHead>
                        <TableHead className="text-center">Jatuh Tempo</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-medium">{bill.period}</TableCell>
                          <TableCell>{bill.service}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(bill.amount)}</TableCell>
                          <TableCell className="text-center">{bill.due}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={bill.status === "Lunas" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
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
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Detail Tagihan {bill.service}</DialogTitle>
                                  <DialogDescription>{bill.period}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Layanan Pokok</span>
                                    <span>{formatCurrency(bill.amount - 50000)}</span>
                                  </div>
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Meterai / Admin</span>
                                    <span>{formatCurrency(50000)}</span>
                                  </div>
                                  <div className="flex justify-between pt-2">
                                    <span className="font-bold">Total Pembayaran</span>
                                    <span className="font-bold text-purple-600">{formatCurrency(bill.amount)}</span>
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

          {/* Tab: Grafik Komunikasi */}
          <TabsContent value="graph" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Tren Biaya Komunikasi</CardTitle>
                <CardDescription>Grafik pengeluaran biaya internet dan telepon selama 12 bulan terakhir.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={communicationData}>
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
                        tickFormatter={(value) => `Rp ${value/1000000}jt`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="cost" 
                        stroke="var(--color-cost)" 
                        strokeWidth={3} 
                        dot={{ r: 6, fill: "var(--color-cost)" }}
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
