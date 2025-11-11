import React from "react";

const base =
  "inline-flex items-center justify-center rounded-lg px-3.5 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export function Button(
  { children, variant = "primary", ...props }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }
) {
  const styles = {
    primary: `${base} bg-[#21808d] text-white hover:bg-[#1b6a74] focus-visible:outline-[#21808d]`,
    secondary: `${base} bg-white/5 text-white hover:bg-white/10 border border-gray-700 focus-visible:outline-[#21808d]`,
    danger: `${base} bg-[#c0152f] text-white hover:bg-[#9e1228] focus-visible:outline-[#c0152f]`,
  }[variant];
  return <button className={styles} {...props}>{children}</button>;
}
