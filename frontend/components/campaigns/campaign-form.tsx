"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Send } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createCampaign, updateCampaign } from "@/lib/store"
import type { Campaign } from "@/lib/types"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

const formSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  type: z.enum(["email", "sms"]),
  subject: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  recipients: z.number().min(0),
  scheduleEnabled: z.boolean(),
  scheduledDate: z.date().optional(),
  scheduledTime: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CampaignFormProps {
  campaign?: Campaign
}

export function CampaignForm({ campaign }: CampaignFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!campaign

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: campaign?.name || "",
      type: campaign?.type || "email",
      subject: campaign?.subject || "",
      message: campaign?.message || "",
      recipients: campaign?.recipients || 100,
      scheduleEnabled: !!campaign?.scheduledAt,
      scheduledDate: campaign?.scheduledAt ? new Date(campaign.scheduledAt) : undefined,
      scheduledTime: campaign?.scheduledAt 
        ? format(new Date(campaign.scheduledAt), "HH:mm")
        : "09:00",
    },
  })

  const watchType = form.watch("type")
  const watchScheduleEnabled = form.watch("scheduleEnabled")
  const watchMessage = form.watch("message")

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      let scheduledAt: string | undefined
      if (values.scheduleEnabled && values.scheduledDate && values.scheduledTime) {
        const [hours, minutes] = values.scheduledTime.split(":").map(Number)
        const date = new Date(values.scheduledDate)
        date.setHours(hours, minutes, 0, 0)
        scheduledAt = date.toISOString()
      }

      const campaignData = {
        name: values.name,
        type: values.type,
        subject: values.type === "email" ? values.subject : undefined,
        message: values.message,
        recipients: values.recipients,
        status: values.scheduleEnabled ? "scheduled" as const : "draft" as const,
        scheduledAt,
      }

      if (isEditing && campaign) {
        await updateCampaign(campaign.id, campaignData)
        toast.success("Campaign updated successfully")
      } else {
        await createCampaign(campaignData)
        toast.success("Campaign created successfully")
      }
      router.push("/dashboard/campaigns")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>Basic information about your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Welcome Email Series" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select channel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchType === "email" && (
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Line</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="recipients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipients</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(parseInt(val))} 
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select recipients" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="100">All Contacts (100)</SelectItem>
                          <SelectItem value="50">VIP Customers (50)</SelectItem>
                          <SelectItem value="25">New Leads (25)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Or upload a CSV file with contacts
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message</CardTitle>
                <CardDescription>
                  {watchType === "email" ? "Compose your email message" : "Write your SMS message"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={
                            watchType === "email"
                              ? "Write your email content here..."
                              : "Write your SMS message (160 characters recommended)"
                          }
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      {watchType === "sms" && (
                        <FormDescription>
                          {field.value.length}/160 characters
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>When should this campaign be sent?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="scheduleEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Schedule for later</FormLabel>
                        <FormDescription>
                          Schedule this campaign to be sent at a specific date and time
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchScheduleEnabled && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="scheduledDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduledTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See how your message will look</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
                    <TabsTrigger value="raw" className="flex-1">Raw</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview" className="mt-4">
                    {watchType === "email" ? (
                      <div className="border rounded-lg p-4 space-y-4">
                        <div className="border-b pb-2">
                          <p className="text-sm text-muted-foreground">Subject:</p>
                          <p className="font-medium">{form.watch("subject") || "(No subject)"}</p>
                        </div>
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: watchMessage || "<p class='text-muted-foreground'>Your message will appear here...</p>" 
                          }}
                        />
                      </div>
                    ) : (
                      <div className="bg-muted rounded-2xl p-4 max-w-xs mx-auto">
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-bl-sm p-3 text-sm">
                          {watchMessage || "Your SMS message will appear here..."}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="raw" className="mt-4">
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                      {watchMessage || "No message content"}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <Spinner className="mr-2" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isEditing ? "Update Campaign" : "Create Campaign"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
