"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send, Users, Mail, MousePointerClick, Plus, ArrowRight, TrendingUp, Sparkles } from "lucide-react"
import { getDashboardStats } from "@/lib/store"
import type { Campaign } from "@/lib/types"
import { format } from "date-fns"

interface DashboardStats {
  totalCampaigns: number
  totalContacts: number
  openRate: string
  clickRate: string
  recentCampaigns: Campaign[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const data = await getDashboardStats()
      setStats(data)
      setIsLoading(false)
    }
    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-premium">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Campaigns",
      value: stats?.totalCampaigns || 0,
      icon: Send,
      description: "Campaigns sent",
      gradient: "from-chart-1/20 to-chart-1/5",
      iconBg: "bg-chart-1/10",
      iconColor: "text-chart-1",
      trend: "+12%",
    },
    {
      title: "Total Contacts",
      value: stats?.totalContacts || 0,
      icon: Users,
      description: "In your database",
      gradient: "from-gold/20 to-gold/5",
      iconBg: "bg-gold/10",
      iconColor: "text-gold-dark",
      trend: "+8%",
    },
    {
      title: "Open Rate",
      value: `${stats?.openRate || 0}%`,
      icon: Mail,
      description: "Average across campaigns",
      gradient: "from-chart-3/20 to-chart-3/5",
      iconBg: "bg-chart-3/10",
      iconColor: "text-chart-3",
      trend: "+5%",
    },
    {
      title: "Click Rate",
      value: `${stats?.clickRate || 0}%`,
      icon: MousePointerClick,
      description: "Average across campaigns",
      gradient: "from-chart-4/20 to-chart-4/5",
      iconBg: "bg-chart-4/10",
      iconColor: "text-chart-4",
      trend: "+3%",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold font-serif tracking-tight">Dashboard</h1>
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10 border border-gold/20">
              <Sparkles className="h-3 w-3 text-gold" />
              <span className="text-xs font-medium text-gold">Pro</span>
            </div>
          </div>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your campaigns.
          </p>
        </div>
        <Button asChild className="bg-gradient-gold text-primary hover:opacity-90 shadow-gold font-semibold">
          <Link href="/dashboard/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
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
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  {stat.trend}
                </span>
                <span className="text-xs text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Campaigns */}
      <Card className="border-0 shadow-premium">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-1/10">
              <Send className="h-4 w-4 text-chart-1" />
            </div>
            <div>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your latest campaign activity</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-gold hover:text-gold-dark hover:bg-gold/10">
            <Link href="/dashboard/campaigns">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats?.recentCampaigns && stats.recentCampaigns.length > 0 ? (
            <div className="space-y-3">
              {stats.recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${campaign.type === "email" ? "bg-chart-1/10" : "bg-gold/10"}`}>
                      {campaign.type === "email" ? (
                        <Mail className={`h-5 w-5 text-chart-1`} />
                      ) : (
                        <Send className={`h-5 w-5 text-gold`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.sentAt
                          ? format(new Date(campaign.sentAt), "MMM d, yyyy")
                          : campaign.scheduledAt
                          ? `Scheduled: ${format(new Date(campaign.scheduledAt), "MMM d, yyyy")}`
                          : "Draft"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        campaign.status === "sent"
                          ? "default"
                          : campaign.status === "scheduled"
                          ? "secondary"
                          : campaign.status === "draft"
                          ? "outline"
                          : "destructive"
                      }
                      className={campaign.status === "sent" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : ""}
                    >
                      {campaign.status}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`hidden sm:inline-flex ${campaign.type === "email" ? "border-chart-1/30 text-chart-1" : "border-gold/30 text-gold"}`}
                    >
                      {campaign.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl bg-secondary/30 border border-dashed border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
                <Send className="h-6 w-6 text-gold" />
              </div>
              <p className="font-medium mb-1">No campaigns yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first campaign to get started</p>
              <Button asChild className="bg-gradient-gold text-primary hover:opacity-90 shadow-gold">
                <Link href="/dashboard/campaigns/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
