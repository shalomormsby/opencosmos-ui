"use client";
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion } from "framer-motion"

import { cn } from "../../lib/utils"
import { useMotionPreference } from "../../hooks/useMotionPreference"

export type TabsVariant = "default" | "line"

interface TabsListContextValue {
  variant: TabsVariant
}

const TabsListContext = React.createContext<TabsListContextValue>({ variant: "default" })

const Tabs = TabsPrimitive.Root

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: TabsVariant
  ref?: React.Ref<React.ElementRef<typeof TabsPrimitive.List>>
}

const TabsList = ({ ref, className, variant = "default", children, ...props }: TabsListProps) => {
  if (variant === "line") {
    return (
      <TabsListContext.Provider value={{ variant }}>
        <LineTabsList ref={ref} className={className} {...props}>
          {children}
        </LineTabsList>
      </TabsListContext.Provider>
    )
  }

  return (
    <TabsListContext.Provider value={{ variant }}>
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    </TabsListContext.Provider>
  )
}

const LineTabsList = ({
  ref,
  className,
  children,
  ...props
}: Omit<TabsListProps, "variant">) => {
  const localRef = React.useRef<HTMLDivElement | null>(null)
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [ref]
  )

  const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null)
  const [ready, setReady] = React.useState(false)
  const { shouldAnimate } = useMotionPreference()

  const measure = React.useCallback(() => {
    const list = localRef.current
    if (!list) return
    const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]')
    if (!active) {
      setIndicator(null)
      return
    }
    const listRect = list.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()
    setIndicator({
      left: activeRect.left - listRect.left + list.scrollLeft,
      width: activeRect.width,
    })
  }, [])

  React.useLayoutEffect(() => {
    measure()
    const id = requestAnimationFrame(() => {
      measure()
      setReady(true)
    })
    return () => cancelAnimationFrame(id)
  }, [measure])

  React.useEffect(() => {
    const list = localRef.current
    if (!list) return

    const observer = new MutationObserver(measure)
    observer.observe(list, {
      attributes: true,
      attributeFilter: ["data-state"],
      subtree: true,
    })

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(list)
    Array.from(list.querySelectorAll('[role="tab"]')).forEach((el) => resizeObserver.observe(el))

    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
    }
  }, [measure])

  return (
    <TabsPrimitive.List
      ref={setRefs}
      className={cn(
        "relative flex w-full items-stretch gap-1 border-b border-border text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      {indicator && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute bottom-[-1px] left-0 h-[2px] rounded-full bg-foreground"
          initial={false}
          animate={{ x: indicator.left, width: indicator.width }}
          transition={
            shouldAnimate && ready
              ? { type: "spring", stiffness: 500, damping: 38, mass: 0.6 }
              : { duration: 0 }
          }
        />
      )}
    </TabsPrimitive.List>
  )
}

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  ref?: React.Ref<React.ElementRef<typeof TabsPrimitive.Trigger>>
}

const TabsTrigger = ({ ref, className, ...props }: TabsTriggerProps) => {
  const { variant } = React.useContext(TabsListContext)

  if (variant === "line") {
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
          "data-[state=active]:text-foreground",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  )
}

const TabsContent = (
  {
    ref,
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    ref?: React.Ref<React.ElementRef<typeof TabsPrimitive.Content>>;
  }
) => (<TabsPrimitive.Content
  ref={ref}
  className={cn(
    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    className
  )}
  {...props}
/>)

export { Tabs, TabsList, TabsTrigger, TabsContent }
