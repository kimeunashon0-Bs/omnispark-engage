"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send, Users, Mail, MousePointerClick, Plus, ArrowRight } from "lucide-react"
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
            <Card key={i}>
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
    },
    {
      title: "Total Contacts",
      value: stats?.totalContacts || 0,
      icon: Users,
      description: "In your database",
    },
    {
      title: "Open Rate",
      value: `${stats?.openRate || 0}%`,
      icon: Mail,
      description: "Average across campaigns",
    },
    {
      title: "Click Rate",
      value: `${stats?.clickRate || 0}%`,
      icon: MousePointerClick,
      description: "Average across campaigns",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your campaigns.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
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
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Your latest campaign activity</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/campaigns">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats?.recentCampaigns && stats.recentCampaigns.length > 0 ? (
            <div className="space-y-4">
              {stats.recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-muted">
                      {campaign.type === "email" ? (
                        <Mail className="h-4 w-4" />
                      ) : (
                        <Send className="h-4 w-4" />
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
                    >
                      {campaign.status}
                    </Badge>
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {campaign.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No campaigns yet</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/dashboard/campaigns/new">Create your first campaign</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
