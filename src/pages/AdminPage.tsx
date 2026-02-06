/**
 * Admin page for invite code management.
 * Owner-only access.
 */

import { useEffect, useState } from 'react'
import { Copy, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Tables } from '@/types/database'

type InviteCode = Tables<'invite_codes'>

type CodeStatus = 'active' | 'exhausted' | 'expired' | 'inactive'

function getCodeStatus(code: InviteCode): CodeStatus {
  if (!code.is_active) return 'inactive'
  if (code.expires_at && new Date(code.expires_at) < new Date()) return 'expired'
  if (code.current_uses >= code.max_uses) return 'exhausted'
  return 'active'
}

function StatusBadge({ status }: { status: CodeStatus }) {
  const variants: Record<CodeStatus, { className: string; label: string }> = {
    active: { className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Active' },
    exhausted: { className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Exhausted' },
    expired: { className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Expired' },
    inactive: { className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', label: 'Inactive' },
  }
  const v = variants[status]
  return <Badge className={v.className}>{v.label}</Badge>
}

export default function AdminPage() {
  const { isOwner, user } = useAuth()
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Form state
  const [newCode, setNewCode] = useState('')
  const [maxUses, setMaxUses] = useState('10')
  const [expiresAt, setExpiresAt] = useState('')
  const [grantsTier, setGrantsTier] = useState('free')

  useEffect(() => {
    if (isOwner) {
      loadCodes()
    } else {
      setLoading(false)
    }
  }, [isOwner])

  async function loadCodes() {
    setLoading(true)
    const { data } = await supabase
      .from('invite_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setCodes(data)
    }
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newCode.trim() || !user) return

    setCreating(true)

    const { error } = await supabase.from('invite_codes').insert({
      code: newCode.trim().toUpperCase(),
      max_uses: parseInt(maxUses, 10) || 10,
      expires_at: expiresAt || null,
      grants_tier: grantsTier,
      created_by: user.id,
    })

    if (!error) {
      setNewCode('')
      setMaxUses('10')
      setExpiresAt('')
      setGrantsTier('free')
      await loadCodes()
    }

    setCreating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this invite code?')) return

    await supabase.from('invite_codes').delete().eq('id', id)
    await loadCodes()
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  // Access denied for non-owners
  if (!isOwner) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            This page is only accessible to administrators.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin</h1>
        <p className="text-muted-foreground mt-1">Manage invite codes and platform access.</p>
      </div>

      {/* Create New Code */}
      <Card>
        <CardHeader>
          <CardTitle>Create Invite Code</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  placeholder="BETA2024"
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={e => setMaxUses(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expires (optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier">Grants Tier</Label>
                <Select value={grantsTier} onValueChange={setGrantsTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" loading={creating} disabled={!newCode.trim()}>
              Create Code
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : codes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No invite codes yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map(code => {
                  const status = getCodeStatus(code)
                  return (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-medium">{code.code}</TableCell>
                      <TableCell>
                        {code.current_uses} / {code.max_uses}
                      </TableCell>
                      <TableCell className="capitalize">{code.grants_tier}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {code.expires_at
                          ? new Date(code.expires_at).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(code.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(code.code)}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="w-4 h-4" />
                            {copied === code.code && (
                              <span className="sr-only">Copied!</span>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(code.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
