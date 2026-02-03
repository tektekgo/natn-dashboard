/**
 * Standalone invite code input component.
 * Can be used inline or in a modal.
 */

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
        <Input
          type="text"
          value={code}
          onChange={e => {
            setCode(e.target.value)
            setStatus('idle')
          }}
          className="flex-1"
          placeholder="Enter invite code"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={validateCode}
          disabled={status === 'checking' || !code.trim()}
        >
          {status === 'checking' ? 'Checking...' : 'Verify'}
        </Button>
      </div>
      {message && (
        <p className={`mt-1 text-sm ${status === 'valid' ? 'text-success' : 'text-destructive'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
