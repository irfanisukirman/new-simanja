
"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";

export function UserNav() {
  const { name, logout, isLoading } = useAuth();
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if(storedName) {
      setUserName(storedName)
    }
  }, [name])
  
  const getInitials = (name: string = "") => {
    if (!name) return "";
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
        <div className="flex items-center gap-3 p-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="w-24">
                <Skeleton className="h-4 w-full mb-1" />
            </div>
        </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-sidebar-accent">
        <Avatar className="h-8 w-8">
          {/* Using initials as fallback, no external image needed for now */}
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-sm font-medium text-sidebar-foreground">
            {userName}
          </p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" side="top" forceMount>
        <DropdownMenuItem onClick={logout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
