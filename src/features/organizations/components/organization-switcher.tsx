import { Check, ChevronsUpDown, PlusCircle, Building2 } from 'lucide-react'
import { useState } from 'react'

import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useOrganization } from '../context/organization-context'

interface OrganizationSwitcherProps {
  onCreateOrganization?: () => void
}

export function OrganizationSwitcher({ onCreateOrganization }: OrganizationSwitcherProps) {
  const { currentOrganization, organizations, switchOrganization, loading } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        <span className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Loading...
        </span>
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2 truncate">
            {currentOrganization?.avatar_url ? (
              <Avatar className="h-5 w-5">
                <img src={currentOrganization.avatar_url} alt={currentOrganization.name} />
              </Avatar>
            ) : (
              <Building2 className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{currentOrganization?.name || 'Select organization'}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onSelect={() => {
              switchOrganization(org.id)
              setIsOpen(false)
            }}
            className="flex items-center gap-2"
          >
            <Check
              className={`h-4 w-4 ${currentOrganization?.id === org.id ? 'opacity-100' : 'opacity-0'}`}
            />
            {org.avatar_url ? (
              <Avatar className="h-5 w-5">
                <img src={org.avatar_url} alt={org.name} />
              </Avatar>
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="truncate">{org.name}</span>
              <span className="text-xs text-muted-foreground truncate">
                {org.membership?.role}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        {onCreateOrganization && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                onCreateOrganization()
                setIsOpen(false)
              }}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Create organization
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
