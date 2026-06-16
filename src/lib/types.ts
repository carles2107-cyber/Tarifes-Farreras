export interface Deal {
  id: string;
  name: string;
  amount: number;
  stage: string;
  closeDate: string;
  ownerId: string;
  ownerName: string;
  companyName: string;
  probability: number;
  createdAt: string;
  updatedAt: string;
  currency: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  lifecycleStage: string;
  ownerId: string;
  ownerName: string;
  lastActivity: string;
  createdAt: string;
  dealCount: number;
}

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userId?: number;
  teamId?: string;
  teamName?: string;
  activeDeals?: number;
  totalRevenue?: number;
  wonDeals?: number;
  lostDeals?: number;
}

export interface PipelineStage {
  id: string;
  label: string;
  probability: number;
  displayOrder: number;
}

export interface Pipeline {
  id: string;
  label: string;
  stages: PipelineStage[];
}

export interface KPI {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  color: "blue" | "green" | "yellow" | "red";
}

export interface MonthlySales {
  month: string;
  revenue: number;
  deals: number;
  target?: number;
}
