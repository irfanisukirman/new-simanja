"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DateRange } from "react-day-picker"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarMode = "single" | "range"

interface CustomCalendarProps {
  mode?: CalendarMode
  selected?: Date | DateRange
  onSelect?: (date: any) => void
  className?: string
}

export function CustomCalendar({
  mode = "single",
  selected,
  onSelect,
  className,
}: CustomCalendarProps) {
  return (
    <DayPicker
      mode={mode}
      selected={selected as any}
      onSelect={onSelect}
      locale={id}
      showOutsideDays
      className={cn("rounded-lg border bg-background p-3", className)}
      classNames={{
        /* ===== LAYOUT ===== */
        months: "flex flex-col",
        month: "space-y-4",

        /* ===== HEADER ===== */
        caption: "relative flex items-center justify-center",
        caption_label: "text-sm font-semibold",

        nav: "absolute inset-y-0 flex w-full justify-between",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 p-0 opacity-70 hover:opacity-100"
        ),
        nav_button_previous: "ml-1",
        nav_button_next: "mr-1",

        /* ===== TABLE ===== */
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7",
        head_cell:
          "text-muted-foreground text-center text-xs font-medium uppercase",
        row: "grid grid-cols-7 mt-1",

        cell:
          "relative flex h-9 w-9 items-center justify-center text-sm focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal"
        ),

        /* ===== STATES ===== */
        day_today: "bg-accent text-accent-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        day_outside:
          "text-muted-foreground opacity-40",
        day_disabled:
          "text-muted-foreground opacity-40 cursor-not-allowed",

        /* ===== RANGE ===== */
        day_range_start:
          "bg-primary text-primary-foreground rounded-l-md",
        day_range_end:
          "bg-primary text-primary-foreground rounded-r-md",
        day_range_middle:
          "bg-primary/20 text-primary",

      }}
      components={{
        IconLeft: ({ className }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} />
        ),
        IconRight: ({ className }) => (
          <ChevronRight className={cn("h-4 w-4", className)} />
        ),
        CaptionLabel: ({ displayMonth }) => (
          <span className="text-sm font-semibold">
            {format(displayMonth, "MMMM yyyy", { locale: id })}
          </span>
        ),
      }}
    />
  )
}