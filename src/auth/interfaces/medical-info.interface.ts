export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface MedicalInfo {
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  emergencyContact?: EmergencyContact;
}
