import { createContext, useContext, useState } from "react";
import { cn } from "cn";

const TabsContext = createContext(null);

function Tabs({ defaultValue, value: controlled, onValueChange, className, children, ...props }) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled !== undefined ? controlled : internal;
  return (
    <TabsContext.Provider value={{ value, setValue: onValueChange || setInternal }}>
      <div data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }) {
  return (
    <div
      data-slot="tabs-list"
      className={cn("inline-flex h-9 w-fit items-center rounded-lg bg-muted p-1 text-muted-foreground", className)}
      {...props}
    />
  );
}

function TabsTrigger({ value, className, children, ...props }) {
  const ctx = useContext(TabsContext);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      data-state={active ? "active" : "inactive"}
      onClick={() => ctx?.setValue(value)}
      className={cn(
        "inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-all cursor-pointer",
        "focus-visible:ring-3 focus-visible:ring-ring/50 outline-none",
        active ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, className, ...props }) {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return <div data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
