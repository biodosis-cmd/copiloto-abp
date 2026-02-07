import React from 'react';
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const Button = React.forwardRef(({ className, variant = "primary", size = "default", isLoading, children, ...props }, ref) => {
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
        secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm"
    };

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10 p-2"
    };

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
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
