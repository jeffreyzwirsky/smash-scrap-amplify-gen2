import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-colors inline-flex items-center justify-center';
  const variantClasses = {
    primary: 'bg-brand-teal hover:bg-brand-tealDark text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    danger: 'bg-brand-red hover:bg-brand-redDark text-white',
    ghost: 'bg-transparent border border-slate-700 hover:bg-slate-800 text-white',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  return <button className={`   `} {...props}>{children}</button>;
}
