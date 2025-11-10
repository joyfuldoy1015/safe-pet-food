/**
 * Server-side Supabase Admin Client
 * Uses service role key for admin operations
 * NEVER expose this client to the client-side
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

let adminClient: ReturnType<typeof createClient<Database>> | null = null

export function getAdminClient() {
  if (adminClient) {
    return adminClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin credentials are missing')
  }

  adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return adminClient
}

/**
 * Check if user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = getAdminClient()
  
  const { data, error } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single()

  if (error || !data) {
    return false
  }

  return (data as { role: string }).role === 'admin'
}

/**
 * Check if user has moderator or admin role
 */
export async function isModerator(userId: string): Promise<boolean> {
  const supabase = getAdminClient()
  
  const { data, error } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['admin', 'moderator'])
    .single()

  if (error || !data) {
    return false
  }

  return true
}

/**
 * Log moderation action
 */
export async function logModerationAction({
  actorId,
  targetTable,
  targetId,
  action,
  reason
}: {
  actorId: string
  targetTable: string
  targetId: string
  action: 'hide' | 'unhide' | 'soft_delete' | 'restore' | 'flag' | 'note'
  reason?: string
}) {
  const supabase = getAdminClient()

  const { error } = await supabase
    .from('moderation_actions' as any)
    .insert({
      actor_id: actorId,
      target_table: targetTable,
      target_id: targetId,
      action,
      reason
    } as any)

  if (error) {
    console.error('[logModerationAction] Error:', error)
    throw error
  }
}

/**
 * Set admin status on a record
 */
export async function setAdminStatus({
  table,
  id,
  status,
  actorId,
  reason
}: {
  table: 'review_logs' | 'comments' | 'qa_threads' | 'qa_posts'
  id: string
  status: 'visible' | 'hidden' | 'deleted'
  actorId: string
  reason?: string
}) {
  const supabase = getAdminClient()

  // Update the record
  // Use type assertion to bypass strict typing for dynamic table names
  const tableClient = supabase.from(table as keyof Database['public']['Tables']) as any
  const { error: updateError } = await tableClient
    .update({ admin_status: status })
    .eq('id', id)

  if (updateError) {
    console.error(`[setAdminStatus] Error updating ${table}:`, updateError)
    throw updateError
  }

  // Log the action
  await logModerationAction({
    actorId,
    targetTable: table,
    targetId: id,
    action: status === 'hidden' ? 'hide' : status === 'deleted' ? 'soft_delete' : 'unhide',
    reason
  })
}


