import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/server';

/**
 * Verifies admin credentials.
 * Supports both:
 *  1. Master password (from ADMIN_PASSWORD env var, no email needed)
 *  2. Email + hashed password check against the AdminUsers Supabase table
 */
export async function isAdmin(request: Request): Promise<boolean> {
  const authEmail = request.headers.get('x-admin-email');
  const authPass = request.headers.get('x-admin-password');

  if (!authPass) return false;

  // 1. Master password bypass (env var, no email required)
  const masterPassword = process.env.ADMIN_PASSWORD;
  if (masterPassword && !authEmail) {
    return authPass.trim() === masterPassword.trim();
  }

  // 2. Email + password check against AdminUsers table
  if (authEmail && authPass) {
    const supabase = createAdminClient(); // Use service role to bypass RLS
    const { data: admin, error } = await supabase
      .from('AdminUsers')
      .select('password')
      .eq('email', authEmail.trim())
      .single();

    if (error || !admin) return false;

    // Compare submitted password against the stored bcrypt hash
    const isValid = await bcrypt.compare(authPass.trim(), admin.password);
    return isValid;
  }

  return false;
}

/**
 * Hashes a plaintext password using bcrypt.
 * Use this once to generate hashes to store in the DB.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, 12);
}
