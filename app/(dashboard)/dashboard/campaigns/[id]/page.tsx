"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, Users, Mail, MousePointerClick, Send } from "lucide-react"
import { getCampaign } from "@/lib/store"
import type { Campaign } from "@/lib/types"
import { format } from "date-fns"

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getCampaign(id)
      if (!data) {
        router.push("/dashboard/campaigns")
        return
      }
      setCampaign(data)
      setIsLoading(false)
    }
    load()
  }, [id, router])

  if (isLoading || !campaign) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse w-20" />
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

  const stats = [
    { label: "Recipients", value: campaign.recipients, icon: Users },
    { label: "Open Rate", value: `${campaign.openRate}%`, icon: Mail },
    { label: "Click Rate", value: `${campaign.clickRate}%`, icon: MousePointerClick },
    { label: "Type", value: campaign.type.toUpperCase(), icon: Send },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
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
            </div>
            <p className="text-muted-foreground">
              {campaign.sentAt
                ? `Sent on ${format(new Date(campaign.sentAt), "MMMM d, yyyy 'at' h:mm a")}`
                : campaign.scheduledAt
                ? `Scheduled for ${format(new Date(campaign.scheduledAt), "MMMM d, yyyy 'at' h:mm a")}`
                : "Draft - not yet scheduled"}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Campaign
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Preview</CardTitle>
          <CardDescription>
            {campaign.type === "email" ? `Subject: ${campaign.subject || "(No subject)"}` : "SMS Message"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaign.type === "email" ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/50 rounded-lg"
              dangerouslySetInnerHTML={{ __html: campaign.message }}
            />
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
              {campaign.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
