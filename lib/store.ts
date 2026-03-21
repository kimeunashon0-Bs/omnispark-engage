"use client"

import type { Tenant, User, Contact, Campaign, TenantSettings, AnalyticsData } from './types'

const STORAGE_KEYS = {
  TENANT: 'dashboard_tenant',
  USER: 'dashboard_user',
  CONTACTS: 'dashboard_contacts',
  CAMPAIGNS: 'dashboard_campaigns',
  SETTINGS: 'dashboard_settings',
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
