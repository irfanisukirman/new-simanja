
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, PlusCircle, Trash2, FileDown, Loader2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import bcrypt from "bcryptjs";

interface Pegawai {
  id: number;
  nip: string | null;
  nama: string;
  email: string;
  jabatan: string;
  golongan: string | null;
  role: string;
  photo_url?: string | null;
  token?: string | null;
}

const initialNewPegawaiState = {
  nama: "",
  email: "",
  password: "",
  nip: "",
  jabatan: "",
  golongan: "",
  role: "",
  photo_url: "",
  token: "",
};

const getRoleBadge = (role: string) => {
  if (!role) return <Badge>Tidak Diketahui</Badge>;

  switch (role.toLowerCase()) {
    case "admin":
      return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Admin</Badge>;
    case "user":
       return <Badge className="bg-green-500 text-white hover:bg-green-600">User</Badge>;
    case "staff_barang":
        return <Badge className="bg-orange-500 text-white hover:bg-orange-600">Staff Barang</Badge>;
    case "pic":
      return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">PIC</Badge>;
    case "pimpinan":
      return <Badge className="bg-purple-500 text-white hover:bg-purple-600">Pimpinan</Badge>;
    case "staff_gudang":
      return <Badge className="bg-cyan-500 text-white hover:bg-cyan-600">Staff Gudang</Badge>;
    default:
       const roleName = role.charAt(0).toUpperCase() + role.slice(1);
      return <Badge>{roleName}</Badge>;
  }
};

const golonganOptions = [
  // PNS
  "I/a", "I/b", "I/c", "I/d",
  "II/a", "II/b", "II/c", "II/d",
  "III/a", "III/b", "III/c", "III/d",
  "IV/a", "IV/b", "IV/c", "IV/d", "IV/e",
  // PPPK
  "PPPK I", "PPPK II", "PPPK III", "PPPK IV", "PPPK V",
  "PPPK VI", "PPPK VII", "PPPK VIII", "PPPK IX", "PPPK X",
  "PPPK XI", "PPPK XII", "PPPK XIII", "PPPK XIV", "PPPK XV",
  "PPPK XVI", "PPPK XVII", "None"
];

export default function MasterDataPegawaiPage() {
  const { toast } = useToast();
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [newPegawai, setNewPegawai] = useState(initialNewPegawaiState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  // States for edit functionality
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [editedPegawaiData, setEditedPegawaiData] = useState<Partial<Pegawai>>({});
  const [showEditPassword, setShowEditPassword] = useState(false);


  const fetchPegawai = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}`},
      });
      setPegawaiList(response.data.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Mengambil Data Pegawai",
        description: error.response?.data?.message || "Terjadi kesalahan pada server.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPegawai();
  }, [fetchPegawai]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewPegawai(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setNewPegawai(prev => ({ ...prev, [id]: value }));
  };

  const handleEditInputChange = (field: keyof Pegawai, value: string) => {
    setEditedPegawaiData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSelectChange = (field: keyof Pegawai, value: string) => {
    setEditedPegawaiData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditClick = (pegawai: Pegawai) => {
    setSelectedPegawai(pegawai);
    setEditedPegawaiData(pegawai);
    setShowEditPassword(false);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdate = async () => {
    if (!selectedPegawai) return;
    setIsUpdating(true);
    
    try {
        const token = localStorage.getItem("token");
        const payload = {
            nama: editedPegawaiData.nama,
            email: editedPegawaiData.email,
            nip: editedPegawaiData.nip,
            jabatan: editedPegawaiData.jabatan,
            golongan: editedPegawaiData.golongan,
            role: editedPegawaiData.role,
        };

        await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${selectedPegawai.id}`, payload, {
            headers: { Authorization: `Bearer ${token}`},
        });

        toast({
            title: "Berhasil!",
            description: "Data pegawai berhasil diperbarui.",
            className: "bg-green-500 text-white",
        });

        setIsEditDialogOpen(false);
        fetchPegawai();

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Gagal Memperbarui Data",
            description: error.response?.data?.message || "Terjadi kesalahan pada server.",
        });
    } finally {
        setIsUpdating(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const hashedPassword = await bcrypt.hash(newPegawai.password, 10);
      const token = localStorage.getItem("token");

      const payload = [{
        ...newPegawai,
        password: hashedPassword,
      }];

      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, payload, {
         headers: { Authorization: `Bearer ${token}`},
      });

      toast({
        title: "Berhasil!",
        description: "Data pegawai baru telah berhasil ditambahkan.",
        className: "bg-green-500 text-white",
      });
      
      setIsAddDialogOpen(false);
      setNewPegawai(initialNewPegawaiState);
      fetchPegawai();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan Data",
        description: error.response?.data?.message || "Terjadi kesalahan pada server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (pegawaiId: number) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${pegawaiId}`, {
        headers: { Authorization: `Bearer ${token}`},
      });

      toast({
        title: "Berhasil!",
        description: "Data pegawai telah berhasil dihapus.",
        className: "bg-green-500 text-white",
      });

      fetchPegawai();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Menghapus Data",
        description: error.response?.data?.message || "Terjadi kesalahan pada server.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Master Data Pegawai
          </h1>
        </div>
        <div className="flex justify-end gap-2 pt-2 pb-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setNewPegawai(initialNewPegawaiState);
                  setShowPassword(false);
                  setIsAddDialogOpen(true);
                }}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Pegawai
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Tambah Data Pegawai</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nip" className="text-right">NIP</Label>
                    <Input id="nip" value={newPegawai.nip} onChange={handleInputChange} className="col-span-3" placeholder="Contoh: 199001012020011001" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nama" className="text-right">Nama Lengkap</Label>
                    <Input id="nama" value={newPegawai.nama} onChange={handleInputChange} className="col-span-3" placeholder="Contoh: Asep Sunandar" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" value={newPegawai.email} onChange={handleInputChange} className="col-span-3" placeholder="Contoh: asep.s@example.com" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">Password</Label>
                    <div className="col-span-3 relative">
                      <Input id="password" value={newPegawai.password} onChange={handleInputChange} type={showPassword ? "text" : "password"} className="pr-10" />
                      <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(prev => !prev)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="jabatan" className="text-right">Jabatan</Label>
                    <Input id="jabatan" value={newPegawai.jabatan} onChange={handleInputChange} className="col-span-3" placeholder="Contoh: Analis Kepegawaian" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="golongan" className="text-right">Golongan</Label>
                    <Select value={newPegawai.golongan} onValueChange={(value) => handleSelectChange("golongan", value)}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Pilih Golongan" />
                        </SelectTrigger>
                        <SelectContent>
                          {golonganOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Role</Label>
                    <Select value={newPegawai.role} onValueChange={(value) => handleSelectChange("role", value)}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Pilih Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="staff_barang">Staff Barang</SelectItem>
                          <SelectItem value="staff_gudang">Staff Gudang</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary" disabled={isSubmitting}>Batal</Button>
                  </DialogClose>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        <div className="rounded-md border">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center text-foreground font-semibold">No</TableHead>
                <TableHead className="text-center text-foreground font-semibold">NIP</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Nama</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Email</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Jabatan</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Golongan</TableHead>
                <TableHead className="text-center text-foreground font-semibold">Role</TableHead>
                <TableHead className="w-[150px] text-center text-foreground font-semibold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            {/* <TableBody>
              {pegawaiList.map((pegawai, index) => (
                <TableRow key={pegawai.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell className="text-center">{pegawai.nip || ""}</TableCell>
                  <TableCell className="text-center">{pegawai.nama}</TableCell>
                  <TableCell className="text-center">{pegawai.email}</TableCell>
                  <TableCell className="text-center">{pegawai.jabatan}</TableCell>
                  <TableCell className="text-center">{pegawai.golongan || ""}</TableCell>
                  <TableCell className="text-center">{getRoleBadge(pegawai.role)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button size="icon" variant="ghost" className="hover:bg-yellow-500 hover:text-white" onClick={() => handleEditClick(pegawai)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="hover:bg-destructive hover:text-destructive-foreground">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Data pegawai '{pegawai.nama}' akan dihapus secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(pegawai.id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Hapus"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody> */}
          </Table>
          )}
        </div>
      </main>

       {/* Edit Pegawai Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Data Pegawai</DialogTitle>
          </DialogHeader>
          {selectedPegawai && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-nip" className="text-right">NIP</Label>
                <Input id="edit-nip" value={editedPegawaiData.nip || ''} onChange={(e) => handleEditInputChange('nip', e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-nama" className="text-right">Nama Lengkap</Label>
                <Input id="edit-nama" value={editedPegawaiData.nama || ''} onChange={(e) => handleEditInputChange('nama', e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">Email</Label>
                <Input id="edit-email" type="email" value={editedPegawaiData.email || ''} onChange={(e) => handleEditInputChange('email', e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-jabatan" className="text-right">Jabatan</Label>
                <Input id="edit-jabatan" value={editedPegawaiData.jabatan || ''} onChange={(e) => handleEditInputChange('jabatan', e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-golongan" className="text-right">Golongan</Label>
                <Select value={editedPegawaiData.golongan || ''} onValueChange={(value) => handleEditSelectChange("golongan", value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih Golongan" />
                    </SelectTrigger>
                    <SelectContent>
                      {golonganOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">Role</Label>
                 <Select value={editedPegawaiData.role || ''} onValueChange={(value) => handleEditSelectChange("role", value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="admin">Admin</SelectItem>
                       <SelectItem value="user">User</SelectItem>
                       <SelectItem value="staff_barang">Staff Barang</SelectItem>
                       <SelectItem value="staff_gudang">Staff Gudang</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isUpdating}>Batal</Button>
            </DialogClose>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <footer className="mt-auto border-t">
        <div className="p-4 text-center text-sm text-muted-foreground">
          <p>© 2026 BPSDM Provinsi Jawa Barat. Developed by Irfan Irawan Sukirman. SIMANJA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}