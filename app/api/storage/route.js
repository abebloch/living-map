import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - retrieve a value by key
export async function GET(request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  if (!key) {
    return NextResponse.json({ error: 'Key required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('kv_store')
    .select('value')
    .eq('key', key)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ value: data?.value || null })
}

// POST - set a value by key (upsert)
export async function POST(request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const { key, value } = await request.json()
  
  if (!key) {
    return NextResponse.json({ error: 'Key required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('kv_store')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE - remove a key
export async function DELETE(request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Key required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('kv_store')
    .delete()
    .eq('key', key)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
