
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarClock,
  Link2,
  ArrowRightLeft,
  Boxes,
  ChevronDown,
  Users,
  Package,
  Building2,
  Zap,
  Droplets,
  Phone,
  FileBarChart,
  Settings,
  ClipboardList,
  LogIn,
  FileOutput
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { UserNav } from '@/components/user-nav';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { Button } from '@/components/ui/button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isUtilitasMenuOpen, setIsUtilitasMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const isPublicPath = pathname === '/tautan';
    
    // Validasi token yang lebih ketat
    const hasValidToken = token !== null && token !== '' && token !== 'undefined';
    setIsLoggedIn(hasValidToken);
    setUserRole(role);
    
    if (!hasValidToken && !isPublicPath) {
      router.replace('/login');
    }
  }, [router, pathname]);

  useEffect(() => {
    const isUtilitasPath = pathname.startsWith('/utilitas');
    setIsUtilitasMenuOpen(isUtilitasPath);
  }, [pathname]);

  // Menu hanya ditampilkan jika sudah mounted untuk menghindari hydration mismatch
  if (!mounted) return null;

  return (
    <Providers>
      <Sidebar>
        <SidebarHeader className="pl-0 pt-0 pr-0 pb-2">
          <Link href={isLoggedIn ? "/dashboard" : "/tautan"}>
            <Image 
              src="/img_bg_nav_header.jpg" 
              alt="SIMANJA Header"
              width={288}
              height={162}
              className="w-full h-auto"
              priority
              data-ai-hint="header graphic"
            />
          </Link>
        </SidebarHeader>
        <SidebarContent className='pl-2 pr-2'>
          <SidebarMenu>
            {/* MENU PRIVAT: Hanya muncul jika isLoggedIn adalah TRUE */}
            {isLoggedIn && (
              <>
                {userRole !== 'staff_barang' && userRole !== 'staff_gudang' && (
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Master Data Pegawai" isActive={pathname === '/master-data-pegawai'}>
                        <Link href="/master-data-pegawai">
                          <Users />
                          <span>Master Data Pegawai</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                )}

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Master Data Barang" isActive={pathname === '/master-data-barang'}>
                    <Link href="/master-data-barang">
                      <Package />
                      <span>Master Data Barang</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {userRole !== 'staff_barang' && userRole !== 'staff_gudang' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Data Jadwal" isActive={pathname === '/scheduling'}>
                      <Link href="/scheduling">
                        <CalendarClock />
                        <span>Jadwal</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Mutasi Persediaan" isActive={pathname === '/inventaris/mutasi'}>
                    <Link href="/inventaris/mutasi">
                      <FileOutput />
                      <span>Mutasi Persediaan</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Barang Keluar" isActive={pathname === '/inventaris/barang-keluar'}>
                    <Link href="/inventaris/barang-keluar">
                      <Boxes />
                      <span>Barang Keluar</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <Collapsible open={isUtilitasMenuOpen} onOpenChange={setIsUtilitasMenuOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        className="w-full"
                        tooltip="Utilitas Gedung & Wisma"
                      >
                        <Building2 />
                        <span className='flex-1 text-left'>Utilitas Gedung & Wisma</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isUtilitasMenuOpen && "rotate-180")} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                  <CollapsibleContent>
                    <SidebarMenu className="pl-7">
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Dashboard Utilitas" isActive={pathname === '/utilitas/dashboard'}>
                          <Link href="/utilitas/dashboard">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className='pl-2'>Dashboard</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Status Kondisi" isActive={pathname === '/utilitas/status'}>
                          <Link href="/utilitas/status">
                            <ClipboardList className="h-4 w-4" />
                            <span className='pl-2'>Status</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Listrik" isActive={pathname === '/utilitas/listrik'}>
                          <Link href="/utilitas/listrik">
                            <Zap className="h-4 w-4" />
                            <span className='pl-2'>Listrik</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Air" isActive={pathname === '/utilitas/air'}>
                          <Link href="/utilitas/air">
                            <Droplets className="h-4 w-4" />
                            <span className='pl-2'>Air</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Komunikasi" isActive={pathname === '/utilitas/komunikasi'}>
                          <Link href="/utilitas/komunikasi">
                            <Phone className="h-4 w-4" />
                            <span className='pl-2'>Komunikasi</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Laporan" isActive={pathname === '/utilitas/laporan'}>
                          <Link href="/utilitas/laporan">
                            <FileBarChart className="h-4 w-4" />
                            <span className='pl-2'>Laporan</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Pengaturan" isActive={pathname === '/utilitas/pengaturan'}>
                          <Link href="/utilitas/pengaturan">
                            <Settings className="h-4 w-4" />
                            <span className='pl-2'>Pengaturan</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
            
            {/* MENU PUBLIK: Selalu muncul */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Tautan" isActive={pathname === '/tautan'}>
                <Link href="/tautan">
                  <Link2 />
                  <span>Tautan</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          {isLoggedIn ? (
            <UserNav />
          ) : (
            <div className="p-2">
              <Button asChild variant="ghost" className="w-full justify-start gap-3">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </Button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        {children}
      </SidebarInset>
    </Providers>
  );
}
