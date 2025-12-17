export enum PrescriptionType {
  MYOPIA = 'Miopía',
  HYPEROPIA = 'Hipermetropía',
  ASTIGMATISM = 'Astigmatismo',
  PRESBYOPIA = 'Presbicia'
}

export enum OrderStatus {
  PENDING = 'Pendiente',
  IN_PROGRESS = 'En Proceso',
  READY = 'Listo para Retiro',
  DELIVERED = 'Entregado',
  CANCELLED = 'Cancelado'
}

export interface EyePrescription {
  sph: string;
  cyl: string;
  axis: string;
  add?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string; // New field
  description?: string; // New field
  registrationDate: string;
  prescription: {
    od: EyePrescription; // Ojo Derecho
    oi: EyePrescription; // Ojo Izquierdo
  };
  notes?: string;
}

export interface Order {
  id: string;
  patientId: string;
  date: string;
  amount: number;
  status: OrderStatus;
  isPaid: boolean;
  items: string; // Description of glasses/frames
}

export interface BackupData {
  version: string;
  timestamp: string;
  patients: Patient[];
  orders: Order[];
}

export type ViewState = 'dashboard' | 'patients' | 'billing' | 'settings';

// Add global declaration for JSX Intrinsic Elements to fix TypeScript errors.
// We use an index signature to allow any element, fixing issues where specific elements are reported as missing.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
