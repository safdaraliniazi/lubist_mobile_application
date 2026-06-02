import type { SalonRouteData } from '@/navigation/navigation.types';

export const luminaStudio: SalonRouteData = {
  badge: '40% OFF',
  chips: ['UNISEX', 'HAIR & SPA', 'MASSAGE'],
  distance: '1.2 km',
  heroImage:
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
  id: 'lumina-studio',
  location: 'Downtown Ave',
  name: 'Lumina Studio',
  rating: '5.0',
  reviewCount: 124,
};

export const auraWellness: SalonRouteData = {
  badge: 'GIFT CARD DEAL',
  chips: ['UNISEX', 'BODY CARE', 'SPA'],
  distance: '2.5 km',
  heroImage:
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80',
  id: 'aura-wellness',
  location: 'Westside District',
  name: 'Aura Wellness',
  rating: '4.9',
  reviewCount: 120,
};

export const lumiereBeautyStudio: SalonRouteData = {
  chips: ['UNISEX', 'HAIR & SPA'],
  distance: '0.8 miles away',
  heroImage:
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
  id: 'lumiere-beauty-studio',
  location: 'Zoaharabagh 4/250B',
  name: 'Looks Salon',
  rating: '4.8',
  reviewCount: 120,
};

export const maisonGlowAtelier: SalonRouteData = {
  chips: ['UNISEX', 'SPA'],
  distance: '1.3 km',
  heroImage:
    'https://images.unsplash.com/photo-1633681926035-ec1ac984418a?auto=format&fit=crop&w=1200&q=80',
  id: 'maison-glow-atelier',
  location: 'Palm Jumeirah',
  name: 'Maison Glow Atelier',
  rating: '4.8',
  reviewCount: 98,
};

export const theGlowRoom: SalonRouteData = {
  badge: '20% OFF',
  chips: ['UNISEX', 'SKIN'],
  distance: '3.1 km',
  heroImage:
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
  id: 'the-glow-room',
  location: 'Park Lane',
  name: 'The Glow Room',
  rating: '4.8',
  reviewCount: 87,
};

export const discoverSalons: SalonRouteData[] = [
  luminaStudio,
  auraWellness,
  theGlowRoom,
  {
    badge: 'MEMBER PERK',
    chips: ['UNISEX', 'HAIR & SPA'],
    distance: '1.9 km',
    heroImage:
      'https://images.unsplash.com/photo-1633681926035-ec1ac984418a?auto=format&fit=crop&w=1200&q=80',
    id: 'lumiere-discover',
    location: 'Beauty Square',
    name: 'Lumiere Beauty Studio',
    rating: '4.9',
    reviewCount: 112,
  },
];
