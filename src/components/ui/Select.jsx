import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div className="relative group">
            <select
                className={cn(
                    "flex h-11 w-full appearance-none items-center justify-between rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-2 text-sm text-slate-100 ring-offset-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 pr-10",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 group-hover:text-indigo-400 transition-colors duration-300">
                <ChevronDown className="h-4 w-4" />
            </div>
        </div>
    )
})

Select.displayName = "Select"
export { Select }
