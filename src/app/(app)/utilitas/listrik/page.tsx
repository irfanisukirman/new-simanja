"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
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
  FileText, 
  LineChart as LineChartIcon, 
  PlusCircle, 
  Upload,
  Info,
  Loader2,
  X,
  Calendar,
  Image as ImageIcon,
  Receipt
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
import { cn } from "@/lib/utils"
import { uploadToCloudinary } from "@/app/actions/cloudinary"

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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue || 0);
}

const chartConfig = {
  kwh: {
    label: "Pemakaian (kWh)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    tanggal: format(new Date(), 'yyyy-MM-dd'),
    no_pelanggan: '',
    lokasi: 'utama_wisma',
    jatuh_tempo: '',
    status: 'belum_lunas',
    total_pemakaian_kwh: '',
    total_bruto: '',
    pajak: '',
    subsidi: '',
    total_bayar: '',
  });

  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dynamicChartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const idFullMonthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    const data = monthNames.map(m => ({ month: m, kwh: 0 }));

    bills.forEach(bill => {
      const monthPart = bill.periode.split(' ')[0];
      
      let monthIndex = fullMonthNames.findIndex(m => m.toLowerCase() === monthPart.toLowerCase());
      if (monthIndex === -1) {
        monthIndex = idFullMonthNames.findIndex(m => m.toLowerCase() === monthPart.toLowerCase());
      }

      if (monthIndex !== -1) {
        data[monthIndex].kwh += parseFloat(bill.total_pemakaian_kwh || "0");
      }
    });

    return data;
  }, [bills]);

  useEffect(() => {
    const bruto = parseFloat(formData.total_bruto || "0");
    const sub = parseFloat(formData.subsidi || "0");
    const total = bruto - sub;
    setFormData(prev => ({ ...prev, total_bayar: total.toFixed(2) }));
  }, [formData.total_bruto, formData.subsidi]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: false }));
    }
  };

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
          title: "Terjadi Kesalahan",
          description: "Gagal mengambil data tagihan dari server.",
        });
      }
    } finally {
      setIsLoadingBills(false);
    }
  }, [toast, handleApiError]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      if (formErrors.foto) {
        setFormErrors(prev => ({ ...prev, foto: false }));
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setSelectedFileName(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    if (!formData.no_pelanggan) errors.no_pelanggan = true;
    if (!formData.jatuh_tempo) errors.jatuh_tempo = true;
    if (!formData.total_pemakaian_kwh || parseFloat(formData.total_pemakaian_kwh) <= 0) errors.total_pemakaian_kwh = true;
    if (!formData.total_bruto || parseFloat(formData.total_bruto) <= 0) errors.total_bruto = true;
    if (!selectedFile) errors.foto = true;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveData = async () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Input Tidak Lengkap",
        description: "Harap lengkapi semua kolom yang wajib diisi.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Helper function to read file as base64 with cleaner Promise
      const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(new Error('Gagal membaca file gambar.'));
          reader.readAsDataURL(file);
        });
      };

      const base64Image = await readFileAsBase64(selectedFile!);
      
      // Step 1: Upload to Cloudinary via Server Action
      const uploadResult = await uploadToCloudinary(base64Image);

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Gagal mengunggah gambar ke Cloudinary.");
      }

      // Step 2: Prepare Payload for Backend
      const token = localStorage.getItem("token");
      const selectedDate = new Date(formData.tanggal);
      const periode = format(selectedDate, 'MMMM yyyy'); 
      
      const jtDate = new Date(formData.jatuh_tempo);
      const formattedJatuhTempo = format(jtDate, 'MM-dd-yyyy');

      const payload = {
        periode: periode,
        no_pelanggan: formData.no_pelanggan,
        total_pemakaian_kwh: parseFloat(formData.total_pemakaian_kwh),
        lokasi: formData.lokasi,
        stand_meter_awal: 0,
        stand_meter_akhir: 0,
        total_bruto: parseFloat(formData.total_bruto),
        pajak: parseFloat(formData.pajak || "0"),
        subsidi: parseFloat(formData.subsidi || "0"),
        total_bayar: parseFloat(formData.total_bayar),
        jatuh_tempo: formattedJatuhTempo,
        status: formData.status,
        foto_meteran: uploadResult.url
      };

      // Step 3: Send to Backend API
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/utility/bills`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (response.data.code === 200) {
        toast({
          variant: "success",
          title: "Berhasil",
          description: "Data tagihan listrik telah berhasil disimpan.",
        });

        // Reset Form
        setFormData({
          tanggal: format(new Date(), 'yyyy-MM-dd'),
          no_pelanggan: '',
          lokasi: 'utama_wisma',
          jatuh_tempo: '',
          status: 'belum_lunas',
          total_pemakaian_kwh: '',
          total_bruto: '',
          pajak: '',
          subsidi: '',
          total_bayar: '',
        });
        setSelectedFile(null);
        setSelectedFileName(null);
        setPreviewUrl(null);
        setFormErrors({});
        if (fileInputRef.current) fileInputRef.current.value = "";

        await fetchBills();
        setActiveTab("bills"); 
      } else {
        throw new Error(response.data.message || "Gagal menyimpan data ke database.");
      }

    } catch (error: any) {
      console.error("DEBUG - handleSaveData error:", error);
      
      const errorMessage = error.message || "Terjadi kesalahan sistem saat memproses data.";
      
      if (!handleApiError(error)) {
        toast({
          variant: "destructive",
          title: "Proses Gagal",
          description: errorMessage,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 pt-6 md:p-8 pb-24">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manajemen Listrik</h1>
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
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold border-b pb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Informasi Tagihan
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="tanggal">Tanggal Pencatatan</Label>
                      <div className="relative">
                        <input 
                          id="tanggal" 
                          type="date" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                          value={formData.tanggal} 
                          onChange={(e) => handleInputChange('tanggal', e.target.value)}
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="no_pelanggan">Nomor Pelanggan</Label>
                      <Input 
                        id="no_pelanggan" 
                        placeholder="Contoh: 535811797103" 
                        className={cn(formErrors.no_pelanggan && "border-destructive focus-visible:ring-destructive")}
                        value={formData.no_pelanggan}
                        onChange={(e) => handleInputChange('no_pelanggan', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lokasi">Lokasi Panel / Gedung</Label>
                      <Select 
                        value={formData.lokasi} 
                        onValueChange={(value) => handleInputChange('lokasi', value)}
                      >
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
                      <div className="relative">
                        <input 
                          id="jatuh_tempo" 
                          type="date" 
                          className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
                            formErrors.jatuh_tempo && "border-destructive focus-visible:ring-destructive"
                          )}
                          value={formData.jatuh_tempo}
                          onChange={(e) => handleInputChange('jatuh_tempo', e.target.value)}
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status Pembayaran</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => handleInputChange('status', value)}
                      >
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

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold border-b pb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" /> Data Stand Meter
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="stand_meter_awal">Stand Meter Awal (kWh)</Label>
                      <Input disabled id="stand_meter_awal" type="number" step="0.01" value="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stand_meter_akhir">Stand Meter Akhir (kWh)</Label>
                      <Input disabled id="stand_meter_akhir" type="number" step="0.01" value="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total_pemakaian_kwh">Total Pemakaian (kWh)</Label>
                      <Input 
                        id="total_pemakaian_kwh" 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        className={cn(formErrors.total_pemakaian_kwh && "border-destructive focus-visible:ring-destructive")}
                        value={formData.total_pemakaian_kwh}
                        onChange={(e) => handleInputChange('total_pemakaian_kwh', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Foto Bukti Meteran</Label>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                      />
                      <div 
                        onClick={triggerFileInput}
                        className={cn(
                          "border-2 border-dashed rounded-lg h-[220px] flex flex-col items-center justify-center text-muted-foreground transition-all relative group overflow-hidden cursor-pointer",
                          previewUrl ? "border-slate-400 bg-slate-100" : "border-slate-400 bg-slate-100 hover:bg-slate-200",
                          formErrors.foto && "border-destructive bg-destructive/5"
                        )}
                      >
                        {previewUrl ? (
                          <div className="relative w-full h-full flex flex-col items-center justify-center">
                            <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                               <p className="text-xs font-medium truncate max-w-[150px] mb-2">{selectedFileName}</p>
                               <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>Ganti Foto</Button>
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 rounded-full"
                              onClick={clearFile}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className={cn("h-8 w-8 mb-2 text-slate-400", formErrors.foto && "text-destructive")} />
                            <p className={cn("text-sm", formErrors.foto && "text-destructive")}>Klik untuk pilih foto</p>
                            <p className="text-[10px] mt-1 text-muted-foreground">JPG, PNG (Maks 2MB)</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold border-b pb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500" /> Rincian Biaya (Rp)
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="total_bruto">Total Bruto</Label>
                      <Input 
                        id="total_bruto" 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        className={cn(formErrors.total_bruto && "border-destructive focus-visible:ring-destructive")}
                        value={formData.total_bruto}
                        onChange={(e) => handleInputChange('total_bruto', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pajak">Pajak (PPJ)</Label>
                      <Input 
                        id="pajak" 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        value={formData.pajak}
                        onChange={(e) => handleInputChange('pajak', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subsidi">Subsidi</Label>
                      <Input 
                        id="subsidi" 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        value={formData.subsidi}
                        onChange={(e) => handleInputChange('subsidi', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total_bayar" className="text-primary font-bold">Total Bayar</Label>
                      <Input 
                        disabled
                        id="total_bayar" 
                        type="number" 
                        step="0.01"
                        className="font-bold text-lg border-primary/30 bg-muted/50" 
                        placeholder="0.00" 
                        value={formData.total_bayar}
                      />
                    </div>
                    <div className="pt-6">
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-lg"
                        onClick={handleSaveData}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          "Simpan"
                        )}
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
                                  <DialogContent className="sm:max-w-4xl w-[95vw]">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Receipt className="h-5 w-5 text-primary" />
                                        Rincian Tagihan {bill.periode}
                                      </DialogTitle>
                                      <DialogDescription>
                                        Informasi lengkap pemakaian dan rincian biaya listrik.
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                                      <div className="space-y-6">
                                        <div className="space-y-3">
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Informasi Umum</h4>
                                          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-lg border">
                                            <div>
                                              <p className="text-muted-foreground text-[10px] uppercase font-semibold">Nomor Pelanggan</p>
                                              <p className="font-mono font-medium">{bill.no_pelanggan}</p>
                                            </div>
                                            <div>
                                              <p className="text-muted-foreground text-[10px] uppercase font-semibold">Lokasi</p>
                                              <p className="font-medium truncate">{locationMapping[bill.lokasi] || bill.lokasi}</p>
                                            </div>
                                            <div className="mt-2">
                                              <p className="text-muted-foreground text-[10px] uppercase font-semibold">Status</p>
                                              <Badge variant="outline" className={cn(
                                                "mt-1",
                                                bill.status.toLowerCase() === 'lunas' ? "border-green-200 bg-green-50 text-green-700" : "border-yellow-200 bg-yellow-50 text-yellow-700"
                                              )}>
                                                {bill.status.toUpperCase()}
                                              </Badge>
                                            </div>
                                            <div className="mt-2">
                                              <p className="text-muted-foreground text-[10px] uppercase font-semibold">Total Pemakaian</p>
                                              <p className="font-bold text-primary">{parseFloat(bill.total_pemakaian_kwh).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh</p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-3">
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rincian Biaya</h4>
                                          <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                              <span className="text-muted-foreground">Biaya Bruto</span>
                                              <span className="font-medium">{formatCurrency(bill.total_bruto)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-green-600">
                                              <span className="text-muted-foreground">Subsidi</span>
                                              <span className="font-medium">- {formatCurrency(bill.subsidi)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                              <span className="text-muted-foreground">Pajak (PPJ)</span>
                                              <span className="font-medium">{formatCurrency(bill.pajak)}</span>
                                            </div>
                                            <div className="border-t pt-3 flex justify-between">
                                              <span className="font-bold text-base">Total Bayar</span>
                                              <span className="font-bold text-base text-primary">{formatCurrency(bill.total_bayar)}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-3 flex flex-col">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                          <ImageIcon className="h-3 w-3" /> Foto Bukti Meteran
                                        </h4>
                                        <div className="flex-1 rounded-xl border-2 border-dashed bg-muted/50 overflow-hidden flex items-center justify-center min-h-[300px] relative group">
                                          {bill.foto_meteran ? (
                                            <>
                                              <img 
                                                src={bill.foto_meteran} 
                                                alt="Foto Meteran" 
                                                className="absolute inset-0 w-full h-full object-contain p-2"
                                              />
                                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button 
                                                  variant="secondary" 
                                                  size="sm"
                                                  onClick={() => window.open(bill.foto_meteran, '_blank')}
                                                >
                                                  Lihat Ukuran Penuh
                                                </Button>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="text-center p-6 space-y-2">
                                              <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto opacity-20" />
                                              <p className="text-xs text-muted-foreground italic">Tidak ada foto bukti</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <DialogFooter className="mt-2 border-t pt-4">
                                      <DialogClose asChild>
                                        <Button type="button" variant="outline">Tutup</Button>
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

          <TabsContent value="graph" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Tren Konsumsi Listrik</CardTitle>
                <CardDescription>Grafik pemakaian kWh dinamis dari seluruh data tagihan.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dynamicChartData}>
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
