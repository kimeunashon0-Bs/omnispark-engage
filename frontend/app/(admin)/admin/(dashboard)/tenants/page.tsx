"use client"

import { useEffect, useState } from "react"
import { 
  Building2, 
  Plus, 
  Search,
  MoreHorizontal,
  Users,
  Mail,
  MessageSquare,
  Pause,
  Play,
  Trash2,
  Edit,
  CreditCard
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { 
  getAllTenants, 
  createTenant, 
  suspendTenant, 
  activateTenant, 
  deleteTenantAdmin,
  addCreditsToTenant 
} from "@/lib/store"
import type { TenantWithStats } from "@/lib/types"

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isCreditsOpen, setIsCreditsOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<TenantWithStats | null>(null)
  const [newTenant, setNewTenant] = useState({ name: "", email: "", plan: "starter" as const })
  const [newCredits, setNewCredits] = useState({ sms: 1000, email: 5000 })

  useEffect(() => {
    loadTenants()
  }, [])

  async function loadTenants() {
    const data = await getAllTenants()
    setTenants(data)
    setLoading(false)
  }

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || tenant.status === statusFilter
    const matchesPlan = planFilter === "all" || tenant.plan === planFilter
    return matchesSearch && matchesStatus && matchesPlan
  })

  const handleAddTenant = async () => {
    await createTenant(newTenant)
    setNewTenant({ name: "", email: "", plan: "starter" })
    setIsAddOpen(false)
    loadTenants()
  }

  const handleSuspend = async (id: string) => {
    await suspendTenant(id)
    loadTenants()
  }

  const handleActivate = async (id: string) => {
    await activateTenant(id)
    loadTenants()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this tenant? This action cannot be undone.")) {
      await deleteTenantAdmin(id)
      loadTenants()
    }
  }

  const handleAddCredits = async () => {
    if (selectedTenant) {
      await addCreditsToTenant(selectedTenant.id, newCredits.sms, newCredits.email)
      setIsCreditsOpen(false)
      setSelectedTenant(null)
      setNewCredits({ sms: 1000, email: 5000 })
      loadTenants()
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">Manage all platform tenants</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
              <DialogDescription>
                Create a new tenant account on the platform
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Company Name</FieldLabel>
                <Input
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  placeholder="Acme Inc"
                />
              </Field>
              <Field>
                <FieldLabel>Admin Email</FieldLabel>
                <Input
                  type="email"
                  value={newTenant.email}
                  onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                  placeholder="admin@company.com"
                />
              </Field>
              <Field>
                <FieldLabel>Plan</FieldLabel>
                <Select
                  value={newTenant.plan}
                  onValueChange={(value: 'free' | 'starter' | 'pro' | 'enterprise') => 
                    setNewTenant({ ...newTenant, plan: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free Trial</SelectItem>
                    <SelectItem value="starter">Starter ($49/mo)</SelectItem>
                    <SelectItem value="pro">Pro ($299/mo)</SelectItem>
                    <SelectItem value="enterprise">Enterprise ($799/mo)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTenant} disabled={!newTenant.name || !newTenant.email}>
                Create Tenant
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>{tenants.length} total tenants on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Contacts</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tenant.campaignCount} campaigns
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(tenant.status)}>
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${getPlanColor(tenant.plan)}`}>
                        {tenant.plan}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {tenant.contactCount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-end gap-1">
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                          {tenant.smsCredits.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {tenant.emailCredits.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${tenant.monthlyRevenue}/mo
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedTenant(tenant)
                            setIsCreditsOpen(true)
                          }}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Add Credits
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {tenant.status === 'suspended' ? (
                            <DropdownMenuItem onClick={() => handleActivate(tenant.id)}>
                              <Play className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleSuspend(tenant.id)}>
                              <Pause className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDelete(tenant.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTenants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No tenants found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreditsOpen} onOpenChange={setIsCreditsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credits</DialogTitle>
            <DialogDescription>
              Add SMS and Email credits to {selectedTenant?.name}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>SMS Credits</FieldLabel>
              <Input
                type="number"
                value={newCredits.sms}
                onChange={(e) => setNewCredits({ ...newCredits, sms: parseInt(e.target.value) || 0 })}
              />
            </Field>
            <Field>
              <FieldLabel>Email Credits</FieldLabel>
              <Input
                type="number"
                value={newCredits.email}
                onChange={(e) => setNewCredits({ ...newCredits, email: parseInt(e.target.value) || 0 })}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreditsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCredits}>
              Add Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
