"use client"

import type { Tenant, User, Contact, Campaign, TenantSettings, AnalyticsData, AdminUser, TenantWithStats, PlatformStats, SystemSettings } from './types'

const STORAGE_KEYS = {
  TOKEN: 'access_token',
  USER: 'user',
  TENANT: 'tenant',
  // Keep old keys for backward compatibility if needed
  CONTACTS: 'dashboard_contacts',
  CAMPAIGNS: 'dashboard_campaigns',
  SETTINGS: 'dashboard_settings',
  ADMIN_USER: 'admin_user',
  ALL_TENANTS: 'all_tenants',
  SYSTEM_SETTINGS: 'system_settings',
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  }
}

// Helper for API requests
const api = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || `API error: ${res.status}`)
  }
  return res.json()
}

// ========================
// Auth functions
// ========================
export async function signup(email: string, password: string, companyName: string): Promise<{ tenant: Tenant; user: User }> {
  const data = await api<{ access_token: string; tenant: Tenant; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      tenantName: companyName,
      email,
      password,
    }),
  })

  localStorage.setItem(STORAGE_KEYS.TOKEN, data.access_token)
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
  localStorage.setItem(STORAGE_KEYS.TENANT, JSON.stringify(data.tenant))

  return { tenant: data.tenant, user: data.user }
}

export async function login(email: string, password: string): Promise<{ tenant: Tenant; user: User } | null> {
  try {
    const data = await api<{ access_token: string; tenant: Tenant; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    localStorage.setItem(STORAGE_KEYS.TOKEN, data.access_token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
    localStorage.setItem(STORAGE_KEYS.TENANT, JSON.stringify(data.tenant))

    return { tenant: data.tenant, user: data.user }
  } catch (err) {
    console.error('Login failed', err)
    return null
  }
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.TENANT)
}

export function getCurrentUser(): User | null {
  const user = localStorage.getItem(STORAGE_KEYS.USER)
  return user ? JSON.parse(user) : null
}

export function getTenant(): Tenant | null {
  const tenant = localStorage.getItem(STORAGE_KEYS.TENANT)
  return tenant ? JSON.parse(tenant) : null
}

export async function updateTenant(updates: Partial<Tenant>): Promise<Tenant | null> {
  const tenant = getTenant()
  if (!tenant) return null

  const data = await api<Tenant>(`/tenants/${tenant.id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    headers: getAuthHeaders(),
  })
  localStorage.setItem(STORAGE_KEYS.TENANT, JSON.stringify(data))
  return data
}

// ========================
// Contacts
// ========================
export async function getContacts(): Promise<Contact[]> {
  return api<Contact[]>('/contacts', { headers: getAuthHeaders() })
}

export async function addContact(contact: Omit<Contact, 'id' | 'createdAt' | 'tenantId'>): Promise<Contact> {
  return api<Contact>('/contacts', {
    method: 'POST',
    body: JSON.stringify(contact),
    headers: getAuthHeaders(),
  })
}

export async function deleteContact(id: string): Promise<void> {
  await api(`/contacts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
}

// ========================
// Campaigns
// ========================
// Helper to map backend Campaign to frontend Campaign (adds openRate, clickRate, recipients)
function mapCampaign(campaign: any): Campaign {
  return {
    id: campaign.id,
    tenantId: campaign.tenant_id,
    name: campaign.name,
    type: campaign.type,
    status: campaign.status,
    message: campaign.content,          // backend uses 'content'
    subject: campaign.subject,
    scheduledAt: campaign.scheduled_at,
    sentAt: campaign.sent_at,
    recipients: 0,                      // not yet tracked; we could calculate from recipients count
    openRate: campaign.openRate || 0,   // backend doesn't have this yet – set to 0
    clickRate: campaign.clickRate || 0,
    createdAt: campaign.created_at,
  }
}

export async function getCampaigns(): Promise<Campaign[]> {
  const data = await api<any[]>('/campaigns', { headers: getAuthHeaders() })
  return data.map(mapCampaign)
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  try {
    const data = await api<any>(`/campaigns/${id}`, { headers: getAuthHeaders() })
    return mapCampaign(data)
  } catch (err) {
    return null
  }
}

export async function createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'tenantId' | 'openRate' | 'clickRate'>): Promise<Campaign> {
  const payload = {
    name: campaign.name,
    type: campaign.type,
    status: campaign.status,
    content: campaign.message,
    subject: campaign.subject,
    scheduled_at: campaign.scheduledAt,
  }
  const data = await api<any>('/campaigns', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  })
  return mapCampaign(data)
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
  const payload: any = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.type !== undefined) payload.type = updates.type
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.message !== undefined) payload.content = updates.message
  if (updates.subject !== undefined) payload.subject = updates.subject
  if (updates.scheduledAt !== undefined) payload.scheduled_at = updates.scheduledAt

  const data = await api<any>(`/campaigns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  })
  return mapCampaign(data)
}

export async function deleteCampaign(id: string): Promise<void> {
  await api(`/campaigns/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
}

// Recipient management (used when adding contacts to campaign)
export async function addRecipientsToCampaign(campaignId: string, contactIds: string[]): Promise<void> {
  await api(`/campaigns/${campaignId}/recipients`, {
    method: 'POST',
    body: JSON.stringify({ contactIds }),
    headers: getAuthHeaders(),
  })
}

export async function getCampaignRecipients(campaignId: string): Promise<any[]> {
  return api(`/campaigns/${campaignId}/recipients`, { headers: getAuthHeaders() })
}

export async function sendCampaign(campaignId: string): Promise<void> {
  await api(`/campaigns/${campaignId}/send`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
}

// ========================
// Settings (still using localStorage for demo)
// ========================
export function getSettings(): TenantSettings | null {
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  return settings ? JSON.parse(settings) : null
}

export function updateSettings(updates: Partial<TenantSettings>): TenantSettings | null {
  const settings = getSettings()
  if (!settings) return null
  const updated = { ...settings, ...updates }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated))
  return updated
}

// ========================
// Analytics (mock)
// ========================
export function getAnalyticsData(): AnalyticsData[] {
  const data: AnalyticsData[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      delivered: Math.floor(Math.random() * 500) + 200,
      opened: Math.floor(Math.random() * 300) + 100,
      clicked: Math.floor(Math.random() * 100) + 20,
    })
  }
  return data
}

// ========================
// Dashboard stats (combines real data)
// ========================
export async function getDashboardStats() {
  const campaigns = await getCampaigns()
  const sentCampaigns = campaigns.filter(c => c.status === 'sent')
  const totalContacts = (await getContacts()).length

  const avgOpenRate = sentCampaigns.length > 0
    ? sentCampaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) / sentCampaigns.length
    : 0
  const avgClickRate = sentCampaigns.length > 0
    ? sentCampaigns.reduce((sum, c) => sum + (c.clickRate || 0), 0) / sentCampaigns.length
    : 0

  return {
    totalCampaigns: campaigns.length,
    totalContacts,
    openRate: avgOpenRate.toFixed(1),
    clickRate: avgClickRate.toFixed(1),
    recentCampaigns: campaigns.slice(0, 5),
  }
}

// ========================
// ADMIN / SYSTEM OWNER FUNCTIONS (mocked for now)
// ========================
const ADMIN_EMAIL = 'admin@platform.com'
const ADMIN_PASSWORD = 'admin123'

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

const getInitialTenants = (): TenantWithStats[] => [
  {
    id: 'tenant_1',
    name: 'Acme Marketing Co',
    logo: '',
    createdAt: '2024-01-01T00:00:00Z',
    status: 'active',
    plan: 'pro',
    contactCount: 12500,
    campaignCount: 45,
    smsCredits: 8500,
    emailCredits: 45000,
    monthlyRevenue: 299,
    lastActiveAt: '2024-01-22T15:30:00Z',
  },
  // ... (keep all your mock tenants)
]

const getInitialSystemSettings = (): SystemSettings => ({
  defaultSmsCredits: 100,
  defaultEmailCredits: 500,
  trialDays: 14,
  smsPricePerCredit: 0.02,
  emailPricePerCredit: 0.001,
  supportEmail: 'support@platform.com',
})

const getFromStorage = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

const setToStorage = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

export async function adminLogin(email: string, password: string): Promise<AdminUser | null> {
  await delay()
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const admin: AdminUser = {
      id: 'admin_1',
      email: ADMIN_EMAIL,
      name: 'System Admin',
      role: 'super_admin',
      createdAt: '2023-01-01T00:00:00Z',
    }
    setToStorage(STORAGE_KEYS.ADMIN_USER, admin)
    if (!getFromStorage<TenantWithStats[]>(STORAGE_KEYS.ALL_TENANTS)) {
      setToStorage(STORAGE_KEYS.ALL_TENANTS, getInitialTenants())
    }
    if (!getFromStorage<SystemSettings>(STORAGE_KEYS.SYSTEM_SETTINGS)) {
      setToStorage(STORAGE_KEYS.SYSTEM_SETTINGS, getInitialSystemSettings())
    }
    return admin
  }
  return null
}

export function adminLogout(): void {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_USER)
}

export function getAdminUser(): AdminUser | null {
  return getFromStorage<AdminUser>(STORAGE_KEYS.ADMIN_USER)
}

export async function getAllTenants(): Promise<TenantWithStats[]> {
  await delay(200)
  let tenants = getFromStorage<TenantWithStats[]>(STORAGE_KEYS.ALL_TENANTS)
  if (!tenants) {
    tenants = getInitialTenants()
    setToStorage(STORAGE_KEYS.ALL_TENANTS, tenants)
  }
  return tenants
}

export async function getTenantById(id: string): Promise<TenantWithStats | null> {
  const tenants = await getAllTenants()
  return tenants.find(t => t.id === id) || null
}

export async function createTenant(data: {
  name: string
  email: string
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
}): Promise<TenantWithStats> {
  await delay()
  const settings = getSystemSettings()
  const tenants = await getAllTenants()
  const newTenant: TenantWithStats = {
    id: 'tenant_' + Math.random().toString(36).substring(2, 9),
    name: data.name,
    createdAt: new Date().toISOString(),
    status: data.plan === 'free' ? 'trial' : 'active',
    plan: data.plan,
    contactCount: 0,
    campaignCount: 0,
    smsCredits: settings?.defaultSmsCredits || 100,
    emailCredits: settings?.defaultEmailCredits || 500,
    monthlyRevenue: data.plan === 'free' ? 0 : data.plan === 'starter' ? 49 : data.plan === 'pro' ? 299 : 799,
    lastActiveAt: new Date().toISOString(),
  }
  setToStorage(STORAGE_KEYS.ALL_TENANTS, [...tenants, newTenant])
  return newTenant
}

export async function updateTenantAdmin(id: string, updates: Partial<TenantWithStats>): Promise<TenantWithStats | null> {
  await delay()
  const tenants = await getAllTenants()
  const index = tenants.findIndex(t => t.id === id)
  if (index === -1) return null
  tenants[index] = { ...tenants[index], ...updates }
  setToStorage(STORAGE_KEYS.ALL_TENANTS, tenants)
  return tenants[index]
}

export async function deleteTenantAdmin(id: string): Promise<void> {
  await delay()
  const tenants = await getAllTenants()
  setToStorage(STORAGE_KEYS.ALL_TENANTS, tenants.filter(t => t.id !== id))
}

export async function suspendTenant(id: string): Promise<TenantWithStats | null> {
  return updateTenantAdmin(id, { status: 'suspended' })
}

export async function activateTenant(id: string): Promise<TenantWithStats | null> {
  return updateTenantAdmin(id, { status: 'active' })
}

export async function addCreditsToTenant(id: string, smsCredits: number, emailCredits: number): Promise<TenantWithStats | null> {
  const tenant = await getTenantById(id)
  if (!tenant) return null
  return updateTenantAdmin(id, {
    smsCredits: tenant.smsCredits + smsCredits,
    emailCredits: tenant.emailCredits + emailCredits,
  })
}

export async function getPlatformStats(): Promise<PlatformStats> {
  await delay(200)
  const tenants = await getAllTenants()
  const activeTenants = tenants.filter(t => t.status === 'active').length
  const totalRevenue = tenants.reduce((sum, t) => sum + t.monthlyRevenue, 0)
  const totalCampaigns = tenants.reduce((sum, t) => sum + t.campaignCount, 0)
  const totalContacts = tenants.reduce((sum, t) => sum + t.contactCount, 0)
  const totalSmsSent = tenants.reduce((sum, t) => sum + (10000 - t.smsCredits), 0)
  const totalEmailsSent = tenants.reduce((sum, t) => sum + (50000 - t.emailCredits), 0)
  return {
    totalTenants: tenants.length,
    activeTenants,
    totalRevenue,
    totalCampaigns,
    totalContacts,
    totalSmsSent: Math.max(0, totalSmsSent),
    totalEmailsSent: Math.max(0, totalEmailsSent),
    revenueGrowth: 12.5,
    tenantGrowth: 8.3,
  }
}

export function getSystemSettings(): SystemSettings | null {
  let settings = getFromStorage<SystemSettings>(STORAGE_KEYS.SYSTEM_SETTINGS)
  if (!settings) {
    settings = getInitialSystemSettings()
    setToStorage(STORAGE_KEYS.SYSTEM_SETTINGS, settings)
  }
  return settings
}

export function updateSystemSettings(updates: Partial<SystemSettings>): SystemSettings | null {
  const settings = getSystemSettings()
  if (!settings) return null
  const updated = { ...settings, ...updates }
  setToStorage(STORAGE_KEYS.SYSTEM_SETTINGS, updated)
  return updated
}

export function getAdminRevenueData(): { month: string; revenue: number; tenants: number }[] {
  return [
    { month: 'Aug', revenue: 8200, tenants: 42 },
    { month: 'Sep', revenue: 9100, tenants: 48 },
    { month: 'Oct', revenue: 10500, tenants: 55 },
    { month: 'Nov', revenue: 11200, tenants: 61 },
    { month: 'Dec', revenue: 12800, tenants: 68 },
    { month: 'Jan', revenue: 14500, tenants: 76 },
  ]
}

export function getAdminUsageData(): { date: string; sms: number; email: number }[] {
  const data: { date: string; sms: number; email: number }[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      sms: Math.floor(Math.random() * 5000) + 2000,
      email: Math.floor(Math.random() * 25000) + 10000,
    })
  }
  return data
}