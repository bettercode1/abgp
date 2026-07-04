/**
 * Firebase auth helpers. Uses shared client from ./firebaseClient.
 */
import type { User } from 'firebase/auth';
import { getFirebaseAuth } from './firebaseClient';

export function isFirebaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      import.meta.env.VITE_FIREBASE_APP_ID
  );
}

export type UserRoleResult = { role: string | null; prant: string | null };

export async function getUserRoleAndPrantFromUser(user: User): Promise<UserRoleResult> {
  const tokenResult = await user.getIdTokenResult(true);
  const claims = tokenResult.claims;
  return {
    role: typeof claims.role === 'string' ? claims.role : null,
    prant: typeof claims.prant === 'string' ? claims.prant : null,
  };
}

export async function getFirebaseIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) return null;
  return auth.currentUser.getIdToken();
}
