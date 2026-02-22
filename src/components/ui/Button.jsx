import React from 'react';
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const Button = React.forwardRef(({ className, variant = "primary", size = "default", isLoading, children, ...props }, ref) => {
    const variants = {
        primary: "btn-primary",
        secondary: "bg-slate-800/50 text-slate-200 border border-slate-700/50 hover:bg-slate-800 hover:text-white shadow-xl shadow-slate-900/20",
        ghost: "text-slate-400 hover:bg-slate-800/50 hover:text-white",
        outline: "border border-slate-700/50 bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white",
        accent: "btn-accent",
        danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/10"
    };

    const sizes = {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-10 text-lg",
        icon: "h-11 w-11 p-2.5"
    };

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});


Button.displayName = "Button";
