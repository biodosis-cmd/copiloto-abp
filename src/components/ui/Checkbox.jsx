import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
    <div className="relative flex items-center justify-center">
        <input
            type="checkbox"
            className={cn(
                "peer h-5 w-5 shrink-0 rounded border border-gray-300 shadow-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-white checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer",
                className
            )}
            ref={ref}
            {...props}
        />
        <Check className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
    </div>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
