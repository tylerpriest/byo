import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hasRole, hasPermission } from '../rbac'
import { supabase } from '../supabase'

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('RBAC Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hasRole', () => {
    it('should return true if user has the role', async () => {
      const mockData = [
        {
          role_id: '1',
          roles: { name: 'Admin' },
        },
      ]

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      } as any)

      const result = await hasRole('user-123', 'Admin')
      expect(result).toBe(true)
    })

    it('should return false if user does not have the role', async () => {
      const mockData = [
        {
          role_id: '1',
          roles: { name: 'User' },
        },
      ]

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      } as any)

      const result = await hasRole('user-123', 'Admin')
      expect(result).toBe(false)
    })

    it('should return false on error', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        }),
      } as any)

      const result = await hasRole('user-123', 'Admin')
      expect(result).toBe(false)
    })
  })

  describe('hasPermission', () => {
    it('should return true if user has the permission', async () => {
      const mockData = [
        {
          role_id: '1',
          roles: {
            role_permissions: [
              {
                permissions: { name: 'users.read' },
              },
            ],
          },
        },
      ]

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      } as any)

      const result = await hasPermission('user-123', 'users.read')
      expect(result).toBe(true)
    })

    it('should return false if user does not have the permission', async () => {
      const mockData = [
        {
          role_id: '1',
          roles: {
            role_permissions: [
              {
                permissions: { name: 'users.read' },
              },
            ],
          },
        },
      ]

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      } as any)

      const result = await hasPermission('user-123', 'users.write')
      expect(result).toBe(false)
    })
  })
})
