"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SelectContextType = {
  value: string | undefined
  onValueChange?: (v: string) => void
  disabled?: boolean
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  registerItem: (value: string, label: React.ReactNode) => void
  unregisterItem: (value: string) => void
}

const SelectContext = React.createContext<SelectContextType | null>(null)

type SelectProps = {
  value?: string
  onValueChange?: (v: string) => void
  disabled?: boolean
  children?: React.ReactNode
}

export function Select({ value, onValueChange, disabled, children }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const itemsRef = React.useRef<Record<string, React.ReactNode>>({})

  const registerItem = (val: string, label: React.ReactNode) => {
    itemsRef.current[val] = label
  }

  const unregisterItem = (val: string) => {
    delete itemsRef.current[val]
  }

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange,
        disabled,
        isOpen,
        setIsOpen,
        registerItem,
        unregisterItem,
      }}
    >
      <div className="relative inline-block">{children}</div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(SelectContext)
    if (!ctx) return null

    const { disabled, isOpen, setIsOpen } = ctx

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        {children}
        <span className="ml-2 opacity-50">▾</span>
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const ctx = React.useContext(SelectContext)
  if (!ctx) return null
  const { value } = ctx
  const label = value ? (ctx.registerItem ? (ctx as any).itemsRef?.current?.[value] : null) : null
  // fallback: show value or placeholder
  return <span>{label ?? value ?? placeholder}</span>
}

export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(SelectContext)
    if (!ctx) return null
    const { isOpen } = ctx

    if (!isOpen) return null

    return (
      <div
        ref={ref}
        role="listbox"
        className={cn(
          "absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

export const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className, children, value, ...props }, ref) => {
    const ctx = React.useContext(SelectContext)
    if (!ctx) return null
    const { onValueChange, setIsOpen, registerItem, unregisterItem } = ctx

    React.useEffect(() => {
      registerItem(value, children)
      return () => unregisterItem(value)
    }, [value, children, registerItem, unregisterItem])

    return (
      <div
        ref={ref}
        role="option"
        className={cn(
          "flex cursor-pointer items-center justify-between py-2 px-3 text-sm hover:bg-accent hover:text-accent-foreground",
          className
        )}
        onClick={() => {
          onValueChange?.(value)
          setIsOpen(false)
        }}
        {...props}
      >
        <span>{children}</span>
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

export const SelectGroup = ({ children }: { children?: React.ReactNode }) => (
  <div className="py-1">{children}</div>
)

export const SelectSeparator = () => <div className="my-1 h-px bg-muted" />

