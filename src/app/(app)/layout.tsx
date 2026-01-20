
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarClock,
  Library,
  Link2,
  ArrowRightLeft,
  Boxes,
  ChevronDown,
  Users,
  Package
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isBmdMenuOpen, setIsBmdMenuOpen] = useState(false);
  const [isSchedulingMenuOpen, setIsSchedulingMenuOpen] = useState(false);
  const [isInventarisMenuOpen, setIsInventarisMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);

    const isBmdPath = pathname.startsWith('/bmd-management');
    const isSchedulingPath = pathname.startsWith('/scheduling');
    const isInventarisPath = pathname.startsWith('/inventaris');
    setIsBmdMenuOpen(isBmdPath);
    setIsSchedulingMenuOpen(isSchedulingPath);
    setIsInventarisMenuOpen(isInventarisPath);
  }, [pathname]);

  return (
    <Providers>
      <Sidebar>
        <SidebarHeader className="pl-0 pt-0 pr-0 pb-2">
          <Link href="/dashboard">
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
        <SidebarContent>
          <SidebarMenu>
            {/* <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname === '/dashboard'}>
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem> */}

             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Master Data Pegawai" isActive={pathname === '/master-data-pegawai'}>
                  <Link href="/master-data-pegawai">
                    <Users />
                    <span>Master Data Pegawai</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Master Data Barang" isActive={pathname === '/master-data-barang'}>
                  <Link href="/master-data-barang">
                    <Package />
                    <span>Master Data Barang</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            {/* <Collapsible open={isBmdMenuOpen} onOpenChange={setIsBmdMenuOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    className="w-full"
                  >
                    <Library />
                    <span className='flex-1 text-left'>Manajemen BMD</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isBmdMenuOpen && "rotate-180")} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                 <SidebarMenu className="pl-7">
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Dashboard BMD" isActive={pathname === '/bmd-management/dashboard'}>
                            <Link href="/bmd-management/dashboard">
                                <span className='pl-2'>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Data Masalah" isActive={pathname === '/bmd-management'}>
                            <Link href="/bmd-management">
                                <span className='pl-2'>Data Masalah</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                 </SidebarMenu>
              </CollapsibleContent>
            </Collapsible> */}

            {/* <Collapsible open={isSchedulingMenuOpen} onOpenChange={setIsSchedulingMenuOpen}>
              <SidebarMenuItem>
                 <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      className="w-full"
                    >
                       <CalendarClock />
                       <span className='flex-1 text-left'>Jadwal</span>
                       <ChevronDown className={cn("h-4 w-4 transition-transform", isSchedulingMenuOpen && "rotate-180")} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <SidebarMenu className="pl-7">
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Dashboard Jadwal" isActive={pathname === '/scheduling/dashboard'}>
                            <Link href="/scheduling/dashboard">
                                <span className='pl-2'>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Data Jadwal" isActive={pathname === '/scheduling'}>
                            <Link href="/scheduling">
                                <span className='pl-2'>Data Jadwal</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                 </SidebarMenu>
              </CollapsibleContent>
            </Collapsible> */}

            {/* <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Peralihan Barang" isActive={pathname === '/peralihan-barang'}>
                <Link href="/peralihan-barang">
                  <ArrowRightLeft />
                  <span>Peralihan Barang</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem> */}
             {/* <Collapsible open={isInventarisMenuOpen} onOpenChange={setIsInventarisMenuOpen}>
              <SidebarMenuItem>
                 <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      className="w-full"
                    >
                       <Boxes />
                       <span className='flex-1 text-left'>Inventaris</span>
                       <ChevronDown className={cn("h-4 w-4 transition-transform", isInventarisMenuOpen && "rotate-180")} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <SidebarMenu className="pl-7">
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Mutasi Persediaan" isActive={pathname === '/inventaris/mutasi-persediaan'}>
                            <Link href="/inventaris/mutasi-persediaan">
                                <span className='pl-2'>Mutasi Persediaan</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Barang Keluar" isActive={pathname === '/inventaris/barang-keluar'}>
                            <Link href="/inventaris/barang-keluar">
                                <span className='pl-2'>Barang Keluar</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                 </SidebarMenu>
              </CollapsibleContent>
            </Collapsible> */}
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Data Jadwal" isActive={pathname === '/scheduling'}>
                <Link href="/scheduling">
                  <CalendarClock />
                  <span>Jadwal</span>
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
          <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        {children}
      </SidebarInset>
    </Providers>
  );
}