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
  ArrowRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { getPlatformStats, getAllTenants, getAdminRevenueData } from "@/lib/store"
import type { PlatformStats, TenantWithStats } from "@/lib/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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
    },
    {
      title: "Monthly Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: `+${stats?.revenueGrowth || 0}%`,
      icon: DollarSign,
      description: "MRR",
    },
    {
      title: "SMS Sent",
      value: (stats?.totalSmsSent || 0).toLocaleString(),
      change: "+15.2%",
      icon: MessageSquare,
      description: "This month",
    },
    {
      title: "Emails Sent",
      value: (stats?.totalEmailsSent || 0).toLocaleString(),
      change: "+22.1%",
      icon: Mail,
      description: "This month",
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

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-primary/10 text-primary'
      case 'pro': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'starter': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground">Monitor and manage your SaaS platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change}
                </span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly recurring revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Tenants</CardTitle>
              <CardDescription>Newest platform users</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/tenants">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenants.slice(0, 5).map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tenant.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={getStatusColor(tenant.status)} className="text-xs">
                          {tenant.status}
                        </Badge>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${getPlanColor(tenant.plan)}`}>
                          {tenant.plan}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${tenant.monthlyRevenue}/mo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <Users className="inline h-3 w-3 mr-1" />
                      {tenant.contactCount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/tenants">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Tenants
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/analytics">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            <Button variant="outline" asChild>
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
