import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type LocationPermission = 'undetermined' | 'granted' | 'denied';

export interface DeviceCoords {
  latitude: number;
  longitude: number;
}

interface DeviceLocationState {
  coords: DeviceCoords | null;
  permission: LocationPermission;
  loading: boolean;
  error: string | null;
}

/**
 * Requests location permission and reads the device's current position with
 * high accuracy. Exposes `refetch` so the UI can retry after a denial.
 */
export function useDeviceLocation(autoRequest = true) {
  const [state, setState] = useState<DeviceLocationState>({
    coords: null,
    permission: 'undetermined',
    loading: autoRequest,
    error: null,
  });

  const requestLocation = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState((s) => ({ ...s, permission: 'denied', loading: false }));
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setState({
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        permission: 'granted',
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err?.message ?? 'Unable to determine your location.',
      }));
    }
  }, []);

  useEffect(() => {
    if (autoRequest) {
      requestLocation();
    }
  }, [autoRequest, requestLocation]);

  return { ...state, refetch: requestLocation };
}
