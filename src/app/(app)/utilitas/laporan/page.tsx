
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
  FileBarChart, 
  FileDown, 
  Printer, 
  TrendingUp, 
  Zap, 
  Droplets, 
  Phone,
  Calendar,
  Filter
} from "lucide-react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
}

const monthlyData = [
  { month: "Januari", listrik: 4500000, air: 1200000, komunikasi: 800000, kwh: 1200, m3: 120 },
  { month: "Februari", listrik: 5200000, air: 1100000, komunikasi: 850000, kwh: 1450, m3: 110 },
  { month: "Maret", listrik: 4800000, air: 1500000, komunikasi: 800000, kwh: 1300, m3: 150 },
  { month: "April", listrik: 6100000, air: 1300000, komunikasi: 900000, kwh: 1600, m3: 130 },
  { month: "Mei", listrik: 5500000, air: 1400000, komunikasi: 850000, kwh: 1550, m3: 140 },
  { month: "Juni", listrik: 5900000, air: 1250000, komunikasi: 800000, kwh: 1700, m3: 125 },
  { month: "Juli", listrik: 5700000, air: 1350000, komunikasi: 820000, kwh: 1650, m3: 135 },
  { month: "Agustus", listrik: 6000000, air: 1450000, komunikasi: 880000, kwh: 1800, m3: 145 },
  { month: "September", listrik: 5800000, air: 1300000, komunikasi: 840000, kwh: 1750, m3: 130 },
  { month: "Oktober", listrik: 6200000, air: 1550000, komunikasi: 920000, kwh: 1900, m3: 155 },
  { month: "November", listrik: 5900000, air: 1400000, komunikasi: 860000, kwh: 1850, m3: 140 },
  { month: "Desember", listrik: 6500000, air: 1600000, komunikasi: 950000, kwh: 2100, m3: 160 },
]

const chartConfig = {
  listrik: {
    label: "Listrik (Rp)",
    color: "hsl(var(--chart-1))",
  },
  air: {
    label: "Air (Rp)",
    color: "hsl(var(--chart-2))",
  },
  komunikasi: {
    label: "Komunikasi (Rp)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function LaporanUtilitasPage() {
  const [activeTab, setActiveTab] = useState("biaya")
  const [year, setYear] = useState("2026")

  const totalListrik = monthlyData.reduce((acc, curr) => acc + curr.listrik, 0)
  const totalAir = monthlyData.reduce((acc, curr) => acc + curr.air, 0)
  const totalKomunikasi = monthlyData.reduce((acc, curr) => acc + curr.komunikasi, 0)
  const grandTotal = totalListrik + totalAir + totalKomunikasi

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Laporan Utilitas</h1>
            <p className="text-muted-foreground text-sm">Rekapitulasi tahunan pengunaan dan biaya utilitas gedung.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Printer className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button size="sm" className="bg-success hover:bg-success/90">
              <FileDown className="mr-2 h-4 w-4" /> Excel
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Total Listrik</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(totalListrik)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Total Air</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(totalAir)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Total Komunikasi</CardTitle>
              <Phone className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(totalKomunikasi)}</div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase text-primary">Grand Total Biaya</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-primary">{formatCurrency(grandTotal)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 border-b rounded-none">
            <TabsTrigger 
              value="biaya" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              Rekap Biaya
            </TabsTrigger>
            <TabsTrigger 
              value="pemakaian" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              Rekap Pemakaian
            </TabsTrigger>
            <TabsTrigger 
              value="grafik" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 flex items-center gap-2"
            >
              Grafik Tahunan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="biaya" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Rekapitulasi Biaya Bulanan ({year})</CardTitle>
                <CardDescription>Rincian pengeluaran per bulan untuk seluruh kategori utilitas.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bulan</TableHead>
                        <TableHead className="text-right">Listrik</TableHead>
                        <TableHead className="text-right">Air</TableHead>
                        <TableHead className="text-right">Komunikasi</TableHead>
                        <TableHead className="text-right font-bold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyData.map((data) => (
                        <TableRow key={data.month}>
                          <TableCell className="font-medium">{data.month}</TableCell>
                          <TableCell className="text-right">{formatCurrency(data.listrik)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(data.air)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(data.komunikasi)}</TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            {formatCurrency(data.listrik + data.air + data.komunikasi)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pemakaian" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Rekapitulasi Pemakaian Fisik ({year})</CardTitle>
                <CardDescription>Rincian jumlah kWh listrik dan m³ air yang dikonsumsi per bulan.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bulan</TableHead>
                        <TableHead className="text-right">Pemakaian Listrik (kWh)</TableHead>
                        <TableHead className="text-right">Pemakaian Air (m³)</TableHead>
                        <TableHead className="text-center">Status Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyData.map((data) => (
                        <TableRow key={data.month}>
                          <TableCell className="font-medium">{data.month}</TableCell>
                          <TableCell className="text-right font-semibold text-yellow-600">{data.kwh.toLocaleString()} kWh</TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">{data.m3.toLocaleString()} m³</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terverifikasi</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grafik" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Tren Biaya Utilitas Tahunan</CardTitle>
                <CardDescription>Grafik perbandingan pengeluaran utilitas sepanjang tahun {year}.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartContainer config={chartConfig} className="h-[450px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10}
                        tickFormatter={(value) => value.substring(0, 3)}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `Rp ${value/1000000}jt`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar 
                        dataKey="listrik" 
                        stackId="a" 
                        fill="var(--color-listrik)" 
                        radius={[0, 0, 0, 0]} 
                      />
                      <Bar 
                        dataKey="air" 
                        stackId="a" 
                        fill="var(--color-air)" 
                        radius={[0, 0, 0, 0]} 
                      />
                      <Bar 
                        dataKey="komunikasi" 
                        stackId="a" 
                        fill="var(--color-komunikasi)" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
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
