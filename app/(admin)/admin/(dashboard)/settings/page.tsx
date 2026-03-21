"use client"

import { useEffect, useState } from "react"
import { Save, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { getSystemSettings, updateSystemSettings, getAdminUser } from "@/lib/store"
import type { SystemSettings, AdminUser } from "@/lib/types"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSettings(getSystemSettings())
    setAdmin(getAdminUser())
    setLoading(false)
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    updateSystemSettings(settings)
    setSaving(false)
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="defaults" className="space-y-6">
        <TabsList>
          <TabsTrigger value="defaults">Default Settings</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="admin">Admin Account</TabsTrigger>
        </TabsList>

        <TabsContent value="defaults" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trial Settings</CardTitle>
              <CardDescription>Configure default trial period and credits for new tenants</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-6 md:grid-cols-3">
                  <Field>
                    <FieldLabel>Trial Period (days)</FieldLabel>
                    <Input
                      type="number"
                      value={settings.trialDays}
                      onChange={(e) => setSettings({ ...settings, trialDays: parseInt(e.target.value) || 0 })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Default SMS Credits</FieldLabel>
                    <Input
                      type="number"
                      value={settings.defaultSmsCredits}
                      onChange={(e) => setSettings({ ...settings, defaultSmsCredits: parseInt(e.target.value) || 0 })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Default Email Credits</FieldLabel>
                    <Input
                      type="number"
                      value={settings.defaultEmailCredits}
                      onChange={(e) => setSettings({ ...settings, defaultEmailCredits: parseInt(e.target.value) || 0 })}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support Configuration</CardTitle>
              <CardDescription>Configure support contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field className="max-w-md">
                  <FieldLabel>Support Email</FieldLabel>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Credit Pricing</CardTitle>
              <CardDescription>Set the price per credit for SMS and Email</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field>
                    <FieldLabel>SMS Price per Credit ($)</FieldLabel>
                    <Input
                      type="number"
                      step="0.001"
                      value={settings.smsPricePerCredit}
                      onChange={(e) => setSettings({ ...settings, smsPricePerCredit: parseFloat(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: ${settings.smsPricePerCredit.toFixed(3)} per SMS
                    </p>
                  </Field>
                  <Field>
                    <FieldLabel>Email Price per Credit ($)</FieldLabel>
                    <Input
                      type="number"
                      step="0.0001"
                      value={settings.emailPricePerCredit}
                      onChange={(e) => setSettings({ ...settings, emailPricePerCredit: parseFloat(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: ${settings.emailPricePerCredit.toFixed(4)} per email
                    </p>
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan Pricing</CardTitle>
              <CardDescription>Current subscription plan pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <p className="font-medium">Free</p>
                  <p className="text-2xl font-bold mt-1">$0</p>
                  <p className="text-xs text-muted-foreground">Limited features</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="font-medium">Starter</p>
                  <p className="text-2xl font-bold mt-1">$49</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
                <div className="p-4 rounded-lg border border-primary">
                  <p className="font-medium text-primary">Pro</p>
                  <p className="text-2xl font-bold mt-1">$299</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="font-medium">Enterprise</p>
                  <p className="text-2xl font-bold mt-1">$799</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Account</CardTitle>
              <CardDescription>Your admin account information</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input value={admin?.name || "System Admin"} disabled />
                  </Field>
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input value={admin?.email || "admin@platform.com"} disabled />
                  </Field>
                  <Field>
                    <FieldLabel>Role</FieldLabel>
                    <Input value="Super Admin" disabled />
                  </Field>
                  <Field>
                    <FieldLabel>Account Created</FieldLabel>
                    <Input 
                      value={admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "N/A"} 
                      disabled 
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage admin security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline">Change Password</Button>
                <p className="text-sm text-muted-foreground">
                  Last password change: Never (demo mode)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
