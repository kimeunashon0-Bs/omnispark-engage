"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CampaignForm } from "@/components/campaigns/campaign-form"
import { getCampaign } from "@/lib/store"
import type { Campaign } from "@/lib/types"

export default function EditCampaignPage({
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Campaign</h1>
          <p className="text-muted-foreground">
            Update your campaign details
          </p>
        </div>
      </div>

      {campaign && <CampaignForm campaign={campaign} />}
    </div>
  )
}
