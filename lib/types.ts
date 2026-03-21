export interface Tenant {
  id: string
  name: string
  logo?: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  tenantId: string
  avatar?: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  tags: string[]
  tenantId: string
  createdAt: string
}

export interface Campaign {
  id: string
  name: string
  type: 'email' | 'sms'
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  message: string
  subject?: string
  scheduledAt?: string
  sentAt?: string
  recipients: number
  openRate: number
  clickRate: number
  tenantId: string
  createdAt: string
}

export interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed?: string
}

export interface TenantSettings {
  tenantId: string
  smsCredits: number
  emailCredits: number
  apiKeys: ApiKey[]
}

export interface AnalyticsData {
  date: string
  delivered: number
  opened: number
  clicked: number
}

// Admin types
export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin'
  createdAt: string
}

export interface TenantWithStats extends Tenant {
  status: 'active' | 'suspended' | 'trial'
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  contactCount: number
  campaignCount: number
  smsCredits: number
  emailCredits: number
  monthlyRevenue: number
  lastActiveAt: string
}

export interface PlatformStats {
  totalTenants: number
  activeTenants: number
  totalRevenue: number
  totalCampaigns: number
  totalContacts: number
  totalSmsSent: number
  totalEmailsSent: number
  revenueGrowth: number
  tenantGrowth: number
}

export interface SystemSettings {
  defaultSmsCredits: number
  defaultEmailCredits: number
  trialDays: number
  smsPricePerCredit: number
  emailPricePerCredit: number
  supportEmail: string
}
