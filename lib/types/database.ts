/**
 * Database types for Supabase
 * Generated from Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nickname: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nickname: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nickname?: string
          avatar_url?: string | null
          updated_at?: string
        }
      }
      pets: {
        Row: {
          id: string
          owner_id: string
          name: string
          species: 'dog' | 'cat'
          birth_date: string
          weight_kg: number | null
          tags: string[] | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          species: 'dog' | 'cat'
          birth_date: string
          weight_kg?: number | null
          tags?: string[] | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          species?: 'dog' | 'cat'
          birth_date?: string
          weight_kg?: number | null
          tags?: string[] | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      review_logs: {
        Row: {
          id: string
          pet_id: string
          owner_id: string
          category: 'feed' | 'snack' | 'supplement' | 'toilet'
          brand: string
          product: string
          status: 'feeding' | 'paused' | 'completed'
          period_start: string
          period_end: string | null
          duration_days: number | null
          rating: number | null
          recommend: boolean | null
          continue_reasons: string[] | null
          stop_reasons: string[] | null
          excerpt: string
          notes: string | null
          likes: number
          views: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          owner_id: string
          category: 'feed' | 'snack' | 'supplement' | 'toilet'
          brand: string
          product: string
          status: 'feeding' | 'paused' | 'completed'
          period_start: string
          period_end?: string | null
          duration_days?: number | null
          rating?: number | null
          recommend?: boolean | null
          continue_reasons?: string[] | null
          stop_reasons?: string[] | null
          excerpt: string
          notes?: string | null
          likes?: number
          views?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          owner_id?: string
          category?: 'feed' | 'snack' | 'supplement' | 'toilet'
          brand?: string
          product?: string
          status?: 'feeding' | 'paused' | 'completed'
          period_start?: string
          period_end?: string | null
          duration_days?: number | null
          rating?: number | null
          recommend?: boolean | null
          continue_reasons?: string[] | null
          stop_reasons?: string[] | null
          excerpt?: string
          notes?: string | null
          likes?: number
          views?: number
          comments_count?: number
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          log_id: string
          author_id: string
          content: string
          parent_id: string | null
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          log_id: string
          author_id: string
          content: string
          parent_id?: string | null
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          log_id?: string
          author_id?: string
          content?: string
          parent_id?: string | null
          likes?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

