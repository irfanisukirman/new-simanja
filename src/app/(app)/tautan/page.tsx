'use client';

import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link2 } from 'lucide-react';

const linkGroups = [
  {
    groupTitle: "Referensi Eksternal",
    links: [
      {
        title: "e-Katalog LKPP",
        description: "Sistem informasi katalog elektronik untuk pengadaan barang/jasa pemerintah.",
        url: "https://e-katalog.lkpp.go.id/",
      },
      {
        title: "SIRUP LKPP",
        description: "Sistem Informasi Rencana Umum Pengadaan barang/jasa pemerintah.",
        url: "https://sirup.lkpp.go.id/",
      },
      {
        title: "KPKNL",
        description: "Kantor Pelayanan Kekayaan Negara dan Lelang, di bawah DJKN.",
        url: "https://www.djkn.kemenkeu.go.id/kpknl-bandung",
      },
      {
        title: "SIMDA BMD",
        description: "Sistem Informasi Manajemen Daerah - Barang Milik Daerah dari BPKP.",
        url: "https://www.bpkp.go.id/sakd/konten/310/SIMDA-BMD.bpkp",
      },
      {
        title: "JDIH BPK RI",
        description: "Jaringan Dokumentasi dan Informasi Hukum Badan Pemeriksa Keuangan.",
        url: "https://peraturan.bpk.go.id/",
      },
      {
        title: "SP4N LAPOR!",
        description: "Layanan Aspirasi dan Pengaduan Online Rakyat untuk pengawasan.",
        url: "https://www.lapor.go.id/",
      },
      {
        title: "Sistem e-BMD Jabar",
        description: "Aplikasi pengelolaan Barang Milik Daerah Provinsi Jawa Barat.",
        url: "https://aset.jabarprov.go.id/",
      },
      {
        title: "Website BPSDM Jabar",
        description: "Portal resmi Badan Pengembangan Sumber Daya Manusia Jawa Barat.",
        url: "https://bpsdm.jabarprov.go.id/",
      }
    ]
  },
  {
    groupTitle: "Laporan & Tugas Internal",
    links: [
      {
        title: "Laporan Denah BPSDM Provinsi Jawa Barat",
        description: "Dokumen spreadsheet untuk laporan denah dan aset BPSDM.",
        url: "https://docs.google.com/spreadsheets/d/1Gs4zNJih6NW2OqZP8XTVH8nDnCZjxKx3KtfqFP-RS6I/edit?gid=1723776320#gid=1723776320",
      },
      {
        title: "Form Inventarisasi Barang",
        description: "Formulir online untuk pendataan dan inventarisasi barang.",
        url: "https://bit.ly/Form-Barang",
      },
      {
        title: "Form Inventarisasi Bangunan",
        description: "Formulir online untuk pendataan dan inventarisasi bangunan.",
        url: "https://bit.ly/Form-Bangunan",
      },
      {
        title: "Drive Foto Aset (Wisma)",
        description: "Kumpulan foto dokumentasi untuk barang dan bangunan di wisma.",
        url: "https://bit.ly/Foto-Wisma",
      }
    ]
  }
];

export default function TautanPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = useMemo(() => {
    if (!searchTerm) {
      return linkGroups;
    }

    return linkGroups.map(group => ({
      ...group,
      links: group.links.filter(link =>
        link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.links.length > 0);

  }, [searchTerm]);

  const totalLinks = useMemo(() => linkGroups.reduce((acc, group) => acc + group.links.length, 0), []);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Tautan Penting</h1>
          <p className="text-muted-foreground mt-2">Kumpulan tautan penting terkait manajemen aset dan kepegawaian.</p>
        </div>

        <div className="mx-auto max-w-lg">
          <Input
            type="search"
            placeholder={`Cari di antara ${totalLinks} tautan...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <Separator className="my-2" />

        {filteredGroups.length > 0 ? (
            <div className="space-y-10">
            {filteredGroups.map((group, groupIndex) => (
                <section key={groupIndex}>
                <h2 className="text-2xl font-semibold tracking-tight mb-4">{group.groupTitle}</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.links.map((link, linkIndex) => (
                    <a href={link.url} target="_blank" rel="noopener noreferrer" key={linkIndex} className="group">
                        <Card className="h-full transition-all duration-200 ease-in-out group-hover:border-primary group-hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                            <Link2 className="h-5 w-5 text-primary" />
                            {link.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{link.description}</CardDescription>
                        </CardContent>
                        </Card>
                    </a>
                    ))}
                </div>
                </section>
            ))}
            </div>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <p>Tidak ada tautan yang cocok dengan pencarian Anda.</p>
          </div>
        )}

      </main>

      <footer className="mt-auto border-t">
        <div className="p-4 text-center text-sm text-muted-foreground">
          <p>© 2026 BPSDM Provinsi Jawa Barat. Developed by Irfan Irawan Sukirman. SIMANJA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
