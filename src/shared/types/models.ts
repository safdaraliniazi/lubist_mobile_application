export type Salon = {
  id: string;
  name: string;
  city: string;
};

export type Booking = {
  id: string;
  salonId: string;
  serviceName: string;
  dateTime: string;
};
