"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { 
  Moon, 
  Sun, 
  LogOut, 
  Menu,
  Crown,
  Building2,
  Bell,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { adminLogout, getAdminUser } from "@/lib/store"
import { useEffect, useState } from "react"
import type { AdminUser } from "@/lib/types"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings,
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/tenants", label: "Tenants", icon: Building2 },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setAdmin(getAdminUser())
  }, [])

  const handleLogout = () => {
    adminLogout()
    router.push("/admin/login")
  }

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar">
            <SheetHeader className="flex flex-row items-center gap-2 h-16 px-4 border-b border-sidebar-border">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-gold">
                <Crown className="h-4 w-4 text-sidebar" />
              </div>
              <div className="flex flex-col">
                <SheetTitle className="text-left text-sidebar-foreground text-sm">Nexus</SheetTitle>
                <span className="text-[10px] text-gold font-medium tracking-wider uppercase">Admin</span>
              </div>
              <SheetDescription className="sr-only">Admin navigation menu</SheetDescription>
            </SheetHeader>
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/admin" && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-3 md:hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-gold">
            <Crown className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Nexus</span>
            <span className="text-[10px] text-gold font-medium tracking-wider uppercase">Admin</span>
          </div>
        </div>

        {/* Status badge - Desktop only */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 ml-4">
          <Activity className="h-3 w-3 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">All Systems Operational</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1">
              <Avatar className="h-9 w-9 border-2 border-gold/30">
                <AvatarFallback className="bg-gradient-gold text-primary font-semibold">
                  SA
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-border/50 shadow-premium">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1 p-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">{admin?.name || "System Admin"}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold font-medium">Admin</span>
                </div>
                <p className="text-xs leading-none text-muted-foreground">
                  {admin?.email || "admin@platform.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                <Building2 className="mr-2 h-4 w-4 text-gold" />
                Client View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
