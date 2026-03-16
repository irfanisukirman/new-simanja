
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Droplets, 
  Phone, 
  TrendingUp, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  Building,
  Users,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, Legend } from "recharts"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
}

const usageData = [
  { month: "Jan", listrik: 4500000, air: 1200000, komunikasi: 800000 },
  { month: "Feb", listrik: 5200000, air: 1100000, komunikasi: 850000 },
  { month: "Mar", listrik: 4800000, air: 1500000, komunikasi: 800000 },
  { month: "Apr", listrik: 6100000, air: 1300000, komunikasi: 900000 },
  { month: "Mei", listrik: 5500000, air: 1400000, komunikasi: 850000 },
  { month: "Jun", listrik: 5900000, air: 1250000, komunikasi: 800000 },
]

const chartConfig = {
  listrik: {
    label: "Listrik",
    color: "hsl(var(--chart-1))",
  },
  air: {
    label: "Air",
    color: "hsl(var(--chart-2))",
  },
  komunikasi: {
    label: "Komunikasi",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const paymentStatus = [
  { id: 1, utility: "Listrik", period: "Juni 2026", amount: 5900000, status: "Lunas", date: "05-06-2026" },
  { id: 2, utility: "Air", period: "Juni 2026", amount: 1250000, status: "Lunas", date: "07-06-2026" },
  { id: 3, utility: "Komunikasi", period: "Juni 2026", amount: 800000, status: "Proses", date: "-" },
]

export default function UtilitasDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8 pb-24">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Utilitas & Fasilitas</h1>
        </div>

        {/* Statistik Hunian & Fasilitas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Statistik Wisma</CardTitle>
              <Home className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 / 15</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-[10px]">12 Terisi</Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 text-[10px]">3 Kosong</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kamar Tower (A & B)</CardTitle>
              <Building className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156 / 200</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 text-[10px]">156 Terisi</Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 text-[10px]">44 Kosong</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Penghuni</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">428</div>
              <p className="text-xs text-muted-foreground mt-1">
                Orang saat ini menetap
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kondisi Fisik</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">8</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] flex items-center text-red-600 font-medium">
                   5 Rusak
                </span>
                <span className="text-[10px] flex items-center text-blue-600 font-medium">
                   3 Perbaikan
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Biaya Utilitas Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Biaya Listrik (Juni)</CardTitle>
              <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                <Zap className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(5900000)}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="text-red-500 flex items-center mr-1">
                  <ArrowUpRight className="h-3 w-3" /> +7.2%
                </span>
                dari bulan lalu
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Biaya Air (Juni)</CardTitle>
              <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                <Droplets className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(1250000)}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="text-green-500 flex items-center mr-1">
                  <ArrowDownRight className="h-3 w-3" /> -10.7%
                </span>
                dari bulan lalu
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Komunikasi (Juni)</CardTitle>
              <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                <Phone className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(800000)}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="text-green-500 flex items-center mr-1">
                  <ArrowDownRight className="h-3 w-3" /> -5.8%
                </span>
                dari bulan lalu
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Chart Section */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Tren Pengeluaran Utilitas Bulanan
              </CardTitle>
              <CardDescription>Visualisasi perbandingan pengeluaran operasional.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <BarChart data={usageData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Legend />
                  <Bar 
                    dataKey="listrik" 
                    fill="var(--color-listrik)" 
                    radius={[4, 4, 0, 0]} 
                    name="Listrik"
                  />
                  <Bar 
                    dataKey="air" 
                    fill="var(--color-air)" 
                    radius={[4, 4, 0, 0]} 
                    name="Air"
                  />
                  <Bar 
                    dataKey="komunikasi" 
                    fill="var(--color-komunikasi)" 
                    radius={[4, 4, 0, 0]} 
                    name="Komunikasi"
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Payment Status Section */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Status Pembayaran Terakhir
              </CardTitle>
              <CardDescription>Ringkasan transaksi pembayaran terbaru.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilitas</TableHead>
                    <TableHead className="text-right">Biaya</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentStatus.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-xs">{item.utility}</div>
                        <div className="text-[10px] text-muted-foreground">{item.period}</div>
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold">{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={item.status === "Lunas" ? "default" : "secondary"}
                          className={item.status === "Lunas" ? "bg-green-100 text-green-700 hover:bg-green-100 text-[10px]" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-[10px]"}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
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
