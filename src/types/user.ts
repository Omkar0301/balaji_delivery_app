export interface DeliveryAddress {
  id: string;
  tag: 'HOME' | 'WORK' | 'PARENTS' | 'OTHER';
  flatNumber: string;
  buildingName: string;
  street: string;
  landmark?: string;
  pincode: string;
  city: string;
  isDefault: boolean;
  recipientName: string;
  recipientPhone: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  fullName: string;
  preferredLanguage: 'en' | 'gu';
  dealsAlertsEnabled?: boolean;
  dispatchAlertsEnabled?: boolean;
  householdSize?: '1-2' | '3-4' | '5+';
  savedAddresses: DeliveryAddress[];
  isVerified: boolean;
}
