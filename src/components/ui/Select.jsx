import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div className="relative">
            <select
                className={cn(
                    "flex h-10 w-full appearance-none items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow pr-8",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown className="h-4 w-4" />
            </div>
        </div>
    )
})
Select.displayName = "Select"
export { Select }
