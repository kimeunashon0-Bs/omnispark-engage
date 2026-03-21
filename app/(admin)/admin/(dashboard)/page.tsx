"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Building2, 
  DollarSign, 
  MessageSquare, 
  Mail, 
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Crown
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { getPlatformStats, getAllTenants, getAdminRevenueData } from "@/lib/store"
import type { PlatformStats, TenantWithStats } from "@/lib/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [tenants, setTenants] = useState<TenantWithStats[]>([])
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; tenants: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [statsData, tenantsData] = await Promise.all([
        getPlatformStats(),
        getAllTenants(),
      ])
      setStats(statsData)
      setTenants(tenantsData)
      setRevenueData(getAdminRevenueData())
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Tenants",
      value: stats?.totalTenants || 0,
      change: `+${stats?.tenantGrowth || 0}%`,
      icon: Building2,
      description: `${stats?.activeTenants || 0} active`,
      gradient: "from-chart-1/20 to-chart-1/5",
      iconBg: "bg-chart-1/10",
      iconColor: "text-chart-1",
    },
    {
      title: "Monthly Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: `+${stats?.revenueGrowth || 0}%`,
      icon: DollarSign,
      description: "MRR",
      gradient: "from-gold/20 to-gold/5",
      iconBg: "bg-gold/10",
      iconColor: "text-gold-dark",
    },
    {
      title: "SMS Sent",
      value: (stats?.totalSmsSent || 0).toLocaleString(),
      change: "+15.2%",
      icon: MessageSquare,
      description: "This month",
      gradient: "from-chart-3/20 to-chart-3/5",
      iconBg: "bg-chart-3/10",
      iconColor: "text-chart-3",
    },
    {
      title: "Emails Sent",
      value: (stats?.totalEmailsSent || 0).toLocaleString(),
      change: "+22.1%",
      icon: Mail,
      description: "This month",
      gradient: "from-chart-4/20 to-chart-4/5",
      iconBg: "bg-chart-4/10",
      iconColor: "text-chart-4",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'trial': return 'secondary'
      case 'suspended': return 'destructive'
      default: return 'outline'
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'enterprise': 
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gradient-gold text-navy font-medium">
            <Crown className="h-3 w-3" />
            Enterprise
          </span>
        )
      case 'pro': 
        return <span className="text-xs px-2 py-0.5 rounded-full bg-chart-1/10 text-chart-1 font-medium">Pro</span>
      case 'starter': 
        return <span className="text-xs px-2 py-0.5 rounded-full bg-chart-3/10 text-chart-3 font-medium">Starter</span>
      default: 
        return <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Free</span>
    }
  }

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Platform Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your enterprise SaaS platform</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-gold/10 border border-gold/20">
          <Sparkles className="h-4 w-4 text-gold" />
          <span className="text-sm font-medium text-gold-dark">System Healthy</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden border-0 shadow-premium">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change}
                </span>
                <span className="text-muted-foreground/70">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="border-0 shadow-premium">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gold/10">
                <TrendingUp className="h-4 w-4 text-gold" />
              </div>
              <div>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly recurring revenue over time</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.78 0.14 85)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="oklch(0.78 0.14 85)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="oklch(0.78 0.14 85)" 
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tenants */}
        <Card className="border-0 shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-chart-1/10">
                <Building2 className="h-4 w-4 text-chart-1" />
              </div>
              <div>
                <CardTitle>Recent Tenants</CardTitle>
                <CardDescription>Newest platform users</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-gold hover:text-gold-dark hover:bg-gold/10">
              <Link href="/admin/tenants">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenants.slice(0, 5).map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-premium">
                      <Building2 className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={getStatusColor(tenant.status)} className="text-xs">
                          {tenant.status}
                        </Badge>
                        {getPlanBadge(tenant.plan)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gold">
                      ${tenant.monthlyRevenue}/mo
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                      <Users className="h-3 w-3" />
                      {tenant.contactCount.toLocaleString()} contacts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-premium overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-gold/5" />
        <CardHeader className="relative">
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-gradient-gold text-primary hover:opacity-90 shadow-gold">
              <Link href="/admin/tenants">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Tenants
              </Link>
            </Button>
            <Button variant="outline" asChild className="border-border/50 hover:bg-secondary hover:border-gold/30">
              <Link href="/admin/analytics">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            <Button variant="outline" asChild className="border-border/50 hover:bg-secondary hover:border-gold/30">
              <Link href="/admin/settings">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                System Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
