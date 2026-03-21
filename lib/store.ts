"use client"

import type { Tenant, User, Contact, Campaign, TenantSettings, AnalyticsData, AdminUser, TenantWithStats, PlatformStats, SystemSettings } from './types'

const STORAGE_KEYS = {
  TENANT: 'dashboard_tenant',
  USER: 'dashboard_user',
  CONTACTS: 'dashboard_contacts',
  CAMPAIGNS: 'dashboard_campaigns',
  SETTINGS: 'dashboard_settings',
  ADMIN_USER: 'admin_user',
  ALL_TENANTS: 'all_tenants',
  SYSTEM_SETTINGS: 'system_settings',
}

// Mock API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Generate unique ID
export const generateId = () => Math.random().toString(36).substring(2, 9)

// Initial mock data
const getInitialContacts = (tenantId: string): Contact[] => [
  { id: generateId(), name: 'John Smith', email: 'john@example.com', phone: '+1234567890', tags: ['vip', 'customer'], tenantId, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1234567891', tags: ['customer'], tenantId, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Mike Wilson', email: 'mike@example.com', phone: '+1234567892', tags: ['lead'], tenantId, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Emily Brown', email: 'emily@example.com', phone: '+1234567893', tags: ['vip', 'partner'], tenantId, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'David Lee', email: 'david@example.com', phone: '+1234567894', tags: ['customer'], tenantId, createdAt: new Date().toISOString() },
]

const getInitialCampaigns = (tenantId: string): Campaign[] => [
  { id: generateId(), name: 'Welcome Email Series', type: 'email', status: 'sent', message: '<p>Welcome to our platform!</p>', subject: 'Welcome aboard!', sentAt: '2024-01-15T10:00:00Z', recipients: 1250, openRate: 42.5, clickRate: 12.3, tenantId, createdAt: '2024-01-15T09:00:00Z' },
  { id: generateId(), name: 'Flash Sale SMS', type: 'sms', status: 'sent', message: 'Flash sale! 50% off everything today only. Shop now: link.co/sale', sentAt: '2024-01-18T14:00:00Z', recipients: 3420, openRate: 89.2, clickRate: 28.7, tenantId, createdAt: '2024-01-18T13:00:00Z' },
  { id: generateId(), name: 'Newsletter Q1', type: 'email', status: 'scheduled', message: '<p>Check out our quarterly update...</p>', subject: 'Q1 Newsletter', scheduledAt: '2024-02-01T09:00:00Z', recipients: 5600, openRate: 0, clickRate: 0, tenantId, createdAt: '2024-01-20T11:00:00Z' },
  { id: generateId(), name: 'Product Launch', type: 'email', status: 'draft', message: '<p>Introducing our new product...</p>', subject: 'Something new is coming!', recipients: 0, openRate: 0, clickRate: 0, tenantId, createdAt: '2024-01-22T16:00:00Z' },
  { id: generateId(), name: 'Appointment Reminder', type: 'sms', status: 'sent', message: 'Reminder: Your appointment is tomorrow at 2pm. Reply YES to confirm.', sentAt: '2024-01-10T08:00:00Z', recipients: 450, openRate: 95.1, clickRate: 45.2, tenantId, createdAt: '2024-01-10T07:00:00Z' },
]

const getInitialSettings = (tenantId: string): TenantSettings => ({
  tenantId,
  smsCredits: 5000,
  emailCredits: 25000,
  apiKeys: [
    { id: generateId(), name: 'Production API Key', key: 'pk_live_' + generateId() + generateId(), createdAt: '2024-01-01T00:00:00Z', lastUsed: '2024-01-22T15:30:00Z' },
    { id: generateId(), name: 'Development Key', key: 'pk_test_' + generateId() + generateId(), createdAt: '2024-01-05T00:00:00Z' },
  ],
})

// Storage helpers
const getFromStorage = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

const setToStorage = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

// Auth functions
export async function signup(email: string, password: string, companyName: string): Promise<{ tenant: Tenant; user: User }> {
  await delay()
  console.log('[API] Signup:', { email, companyName })
  
  const tenantId = generateId()
  const tenant: Tenant = {
    id: tenantId,
    name: companyName,
    createdAt: new Date().toISOString(),
  }
  
  const user: User = {
    id: generateId(),
    email,
    name: email.split('@')[0],
    role: 'admin',
    tenantId,
  }
  
  setToStorage(STORAGE_KEYS.TENANT, tenant)
  setToStorage(STORAGE_KEYS.USER, user)
  setToStorage(STORAGE_KEYS.CONTACTS, getInitialContacts(tenantId))
  setToStorage(STORAGE_KEYS.CAMPAIGNS, getInitialCampaigns(tenantId))
  setToStorage(STORAGE_KEYS.SETTINGS, getInitialSettings(tenantId))
  
  return { tenant, user }
}

export async function login(email: string, password: string): Promise<{ tenant: Tenant; user: User } | null> {
  await delay()
  console.log('[API] Login:', { email })
  
  const user = getFromStorage<User>(STORAGE_KEYS.USER)
  const tenant = getFromStorage<Tenant>(STORAGE_KEYS.TENANT)
  
  if (user && tenant && user.email === email) {
    return { tenant, user }
  }
  
  // For demo, create new user if none exists
  return signup(email, password, 'My Company')
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.USER)
}

export function getCurrentUser(): User | null {
  return getFromStorage<User>(STORAGE_KEYS.USER)
}

export function getTenant(): Tenant | null {
  return getFromStorage<Tenant>(STORAGE_KEYS.TENANT)
}

export function updateTenant(updates: Partial<Tenant>): Tenant | null {
  const tenant = getTenant()
  if (!tenant) return null
  const updated = { ...tenant, ...updates }
  setToStorage(STORAGE_KEYS.TENANT, updated)
  return updated
}

// Contact functions
export async function getContacts(): Promise<Contact[]> {
  await delay(200)
  return getFromStorage<Contact[]>(STORAGE_KEYS.CONTACTS) || []
}

export async function addContact(contact: Omit<Contact, 'id' | 'createdAt' | 'tenantId'>): Promise<Contact> {
  await delay()
  console.log('[API] Add contact:', contact)
  
  const tenant = getTenant()
  const contacts = await getContacts()
  const newContact: Contact = {
    ...contact,
    id: generateId(),
    tenantId: tenant?.id || '',
    createdAt: new Date().toISOString(),
  }
  
  setToStorage(STORAGE_KEYS.CONTACTS, [...contacts, newContact])
  return newContact
}

export async function deleteContact(id: string): Promise<void> {
  await delay()
  console.log('[API] Delete contact:', id)
  
  const contacts = await getContacts()
  setToStorage(STORAGE_KEYS.CONTACTS, contacts.filter(c => c.id !== id))
}

// Campaign functions
export async function getCampaigns(): Promise<Campaign[]> {
  await delay(200)
  return getFromStorage<Campaign[]>(STORAGE_KEYS.CAMPAIGNS) || []
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  await delay(200)
  const campaigns = await getCampaigns()
  return campaigns.find(c => c.id === id) || null
}

export async function createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'tenantId' | 'openRate' | 'clickRate'>): Promise<Campaign> {
  await delay()
  console.log('[API] Create campaign:', campaign)
  
  const tenant = getTenant()
  const campaigns = await getCampaigns()
  const newCampaign: Campaign = {
    ...campaign,
    id: generateId(),
    tenantId: tenant?.id || '',
    openRate: 0,
    clickRate: 0,
    createdAt: new Date().toISOString(),
  }
  
  setToStorage(STORAGE_KEYS.CAMPAIGNS, [...campaigns, newCampaign])
  return newCampaign
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
  await delay()
  console.log('[API] Update campaign:', { id, updates })
  
  const campaigns = await getCampaigns()
  const index = campaigns.findIndex(c => c.id === id)
  if (index === -1) return null
  
  campaigns[index] = { ...campaigns[index], ...updates }
  setToStorage(STORAGE_KEYS.CAMPAIGNS, campaigns)
  return campaigns[index]
}

export async function deleteCampaign(id: string): Promise<void> {
  await delay()
  console.log('[API] Delete campaign:', id)
  
  const campaigns = await getCampaigns()
  setToStorage(STORAGE_KEYS.CAMPAIGNS, campaigns.filter(c => c.id !== id))
}

// Settings functions
export function getSettings(): TenantSettings | null {
  return getFromStorage<TenantSettings>(STORAGE_KEYS.SETTINGS)
}

export function updateSettings(updates: Partial<TenantSettings>): TenantSettings | null {
  const settings = getSettings()
  if (!settings) return null
  const updated = { ...settings, ...updates }
  setToStorage(STORAGE_KEYS.SETTINGS, updated)
  return updated
}

// Analytics mock data
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

// Dashboard stats
export async function getDashboardStats() {
  const campaigns = await getCampaigns()
  const sentCampaigns = campaigns.filter(c => c.status === 'sent')
  
  const totalSent = campaigns.length
  const totalContacts = (await getContacts()).length
  const avgOpenRate = sentCampaigns.length > 0 
    ? sentCampaigns.reduce((sum, c) => sum + c.openRate, 0) / sentCampaigns.length 
    : 0
  const avgClickRate = sentCampaigns.length > 0 
    ? sentCampaigns.reduce((sum, c) => sum + c.clickRate, 0) / sentCampaigns.length 
    : 0
  
  return {
    totalCampaigns: totalSent,
    totalContacts,
    openRate: avgOpenRate.toFixed(1),
    clickRate: avgClickRate.toFixed(1),
    recentCampaigns: campaigns.slice(0, 5),
  }
}

// ==========================================
// ADMIN / SYSTEM OWNER FUNCTIONS
// ==========================================

const ADMIN_EMAIL = 'admin@platform.com'
const ADMIN_PASSWORD = 'admin123'

// Initialize mock tenants data
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
  {
    id: 'tenant_2',
    name: 'Digital Solutions Inc',
    logo: '',
    createdAt: '2024-01-05T00:00:00Z',
    status: 'active',
    plan: 'enterprise',
    contactCount: 58000,
    campaignCount: 120,
    smsCredits: 25000,
    emailCredits: 150000,
    monthlyRevenue: 799,
    lastActiveAt: '2024-01-22T14:00:00Z',
  },
  {
    id: 'tenant_3',
    name: 'StartupXYZ',
    logo: '',
    createdAt: '2024-01-10T00:00:00Z',
    status: 'trial',
    plan: 'free',
    contactCount: 250,
    campaignCount: 3,
    smsCredits: 100,
    emailCredits: 500,
    monthlyRevenue: 0,
    lastActiveAt: '2024-01-21T10:00:00Z',
  },
  {
    id: 'tenant_4',
    name: 'RetailMax',
    logo: '',
    createdAt: '2023-12-15T00:00:00Z',
    status: 'active',
    plan: 'starter',
    contactCount: 3200,
    campaignCount: 28,
    smsCredits: 2000,
    emailCredits: 10000,
    monthlyRevenue: 49,
    lastActiveAt: '2024-01-22T09:15:00Z',
  },
  {
    id: 'tenant_5',
    name: 'HealthCare Plus',
    logo: '',
    createdAt: '2023-11-20T00:00:00Z',
    status: 'suspended',
    plan: 'pro',
    contactCount: 8900,
    campaignCount: 0,
    smsCredits: 0,
    emailCredits: 0,
    monthlyRevenue: 0,
    lastActiveAt: '2024-01-05T12:00:00Z',
  },
  {
    id: 'tenant_6',
    name: 'TechFlow Agency',
    logo: '',
    createdAt: '2024-01-15T00:00:00Z',
    status: 'active',
    plan: 'pro',
    contactCount: 5600,
    campaignCount: 12,
    smsCredits: 4500,
    emailCredits: 22000,
    monthlyRevenue: 299,
    lastActiveAt: '2024-01-22T16:45:00Z',
  },
]

const getInitialSystemSettings = (): SystemSettings => ({
  defaultSmsCredits: 100,
  defaultEmailCredits: 500,
  trialDays: 14,
  smsPricePerCredit: 0.02,
  emailPricePerCredit: 0.001,
  supportEmail: 'support@platform.com',
})

// Admin Auth
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
    
    // Initialize tenants if not exists
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
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.ADMIN_USER)
}

export function getAdminUser(): AdminUser | null {
  return getFromStorage<AdminUser>(STORAGE_KEYS.ADMIN_USER)
}

// Tenant management
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
    id: 'tenant_' + generateId(),
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

// Platform stats
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

// System settings
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

// Admin analytics
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
