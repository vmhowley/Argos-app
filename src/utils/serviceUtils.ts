import { ServiceResponse } from '../types';

/**
 * Utility to handle service errors and return a standardized ServiceResponse.
 */
export async function handleServiceCall<T>(
  call: Promise<{ data: T | null; error: any }>
): Promise<ServiceResponse<T>> {
  try {
    const { data, error } = await call;

    if (error) {
      console.error('Service error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Unknown error occurred',
      };
    }

    return {
      success: true,
      data,
      error: null,
    };
  } catch (err: any) {
    console.error('Service exception:', err);
    return {
      success: false,
      data: null,
      error: err.message || 'Service unreachable',
    };
  }
}
