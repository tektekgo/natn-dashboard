/**
 * Standalone invite code input component.
 * Can be used inline or in a modal.
 */

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface InviteCodeInputProps {
  onValidCode?: (code: string) => void
}

export default function InviteCodeInput({ onValidCode }: InviteCodeInputProps) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [message, setMessage] = useState('')

  async function validateCode() {
    if (!code.trim()) return

    setStatus('checking')
    const { data, error } = await supabase
      .from('invite_codes')
      .select('id, is_active, max_uses, current_uses, expires_at')
      .eq('code', code.trim())
      .single()

    if (error || !data) {
      setStatus('invalid')
      setMessage('Invalid invite code.')
      return
    }

    if (!data.is_active) {
      setStatus('invalid')
      setMessage('This code is no longer active.')
      return
    }

    if (data.current_uses >= data.max_uses) {
      setStatus('invalid')
      setMessage('This code has been fully used.')
      return
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setStatus('invalid')
      setMessage('This code has expired.')
      return
    }

    setStatus('valid')
    setMessage('Valid invite code!')
    onValidCode?.(code.trim())
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => {
            setCode(e.target.value)
            setStatus('idle')
          }}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          placeholder="Enter invite code"
        />
        <button
          type="button"
          onClick={validateCode}
          disabled={status === 'checking' || !code.trim()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
        >
          {status === 'checking' ? 'Checking...' : 'Verify'}
        </button>
      </div>
      {message && (
        <p className={`mt-1 text-sm ${status === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
