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
  OtpVerify: {
    phone: string;
    countryCode: string;
    verificationId: string;
    // 'login' = existing verified customer, 'signup' = new number (account created after OTP)
    mode: 'login' | 'signup';
    customerName?: string;
  };
  Signup: {
    phone: string;
    countryCode: string;
    // Issued by /auth/signup/phone/verify-otp; proves the phone was just verified.
    verificationToken: string;
  };
  EmailLogin: undefined;
  ForgotPassword: undefined;
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
  Profile: undefined;
  SalonDetails: {
    salon?: SalonRouteData;
  };
  SalonServices: {
    salonId: string;
    salonName?: string;
  };
  SelectTime: {
    salonId: string;
    salonName?: string;
  };
  Checkout: {
    salonId: string;
    salonName?: string;
    bookingDate: string;
    timeSlots: string[];
  };
  BookingConfirmed: {
    bookingNumber?: string;
    salonName?: string;
    bookingDate?: string;
    timeSlots?: string[];
  };
  ProductCatalog: {
    category?: string;
    search?: string;
  };
  ProductDetail: {
    productId?: string;
    productName?: string;
  };
  Cart: undefined;
  MyReviews: undefined;
};

export type AdminStackParamList = {
  AdminHome: undefined;
};

export type RMStackParamList = {
  RMHome: undefined;
};
