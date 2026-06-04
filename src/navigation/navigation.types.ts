export type AppRole = 'admin' | 'rm' | 'vendor' | 'client';

export type RootStackParamList = {
  Auth: undefined;
  Admin: undefined;
  RM: undefined;
  Vendor: undefined;
  Client: undefined;
};

export type SalonRouteData = {
  badge?: string;
  category?: string;
  chips?: string[];
  distance?: string;
  heroImage?: string;
  id: string;
  location: string;
  name: string;
  rating: string;
  reviewCount?: number;
};

export type AuthStackParamList = {
  SignIn: undefined;
};

export type VendorTabParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type ClientTabParamList = {
  Home: undefined;
  Discover: undefined;
  Bookings: undefined;
  Saved: undefined;
  Shopping: undefined;
};

export type ClientStackParamList = {
  Tabs: undefined;
  SalonDetails: {
    salon?: SalonRouteData;
  };
  SalonServices: {
    salonName?: string;
  };
  SelectTime: {
    serviceName?: string;
  };
  Checkout: {
    serviceName?: string;
  };
  BookingConfirmed: {
    serviceName?: string;
  };
};

export type AdminStackParamList = {
  AdminHome: undefined;
};

export type RMStackParamList = {
  RMHome: undefined;
};
