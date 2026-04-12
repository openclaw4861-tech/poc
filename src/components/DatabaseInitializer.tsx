import { cookies } from 'next/headers';
import { initializeDatabase } from '@/lib/db/actions';

export default async function DatabaseInitializer() {
  // Only initialize once per session
  const cookieStore = await cookies();
  const hasInitialized = cookieStore.get('db_initialized');
  if (!hasInitialized) {
    try {
      await initializeDatabase();
      // Set cookie to prevent re-initialization
      cookieStore.set('db_initialized', 'true', {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  return null;
}
