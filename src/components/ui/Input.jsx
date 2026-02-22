import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-11 w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-2 text-sm text-slate-100 ring-offset-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})

Input.displayName = "Input"

export { Input }
