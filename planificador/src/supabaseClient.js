import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null

if (!supabase) {
  console.warn('Supabase no configurado. Usando localStorage.')
}

const USER_ID = 'eleazar'

export const storage = {
  async get(key) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('planner_data')
          .select('value')
          .eq('user_id', USER_ID)
          .eq('key', key)
          .single()
        if (error || !data) return null
        return { key, value: JSON.stringify(data.value) }
      } catch (e) {
        console.error('Supabase get error:', e)
      }
    }
    const val = localStorage.getItem(`planner_${key}`)
    return val !== null ? { key, value: val } : null
  },

  async set(key, value) {
    localStorage.setItem(`planner_${key}`, value)
    if (supabase) {
      try {
        const jsonValue = JSON.parse(value)
        const { error } = await supabase
          .from('planner_data')
          .upsert(
            { user_id: USER_ID, key, value: jsonValue, updated_at: new Date().toISOString() },
            { onConflict: 'user_id,key' }
          )
        if (error) console.error('Supabase save error:', error)
      } catch (e) {
        console.error('Supabase set error:', e)
      }
    }
    return { key, value }
  },

  async delete(key) {
    localStorage.removeItem(`planner_${key}`)
    if (supabase) {
      try {
        await supabase
          .from('planner_data')
          .delete()
          .eq('user_id', USER_ID)
          .eq('key', key)
      } catch (e) {
        console.error('Supabase delete error:', e)
      }
    }
    return { key, deleted: true }
  }
}
