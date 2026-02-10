"use client";

import React from "react";

export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="w-full h-[85vh] max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 min-h-0 flex flex-col gap-6 bg-[#F5F7FA] text-[#1F2933] border border-[#D0D7E2] rounded-md shadow-xl overflow-hidden"
    style={{ colorScheme: "light" }}
  >
    {children}
  </div>
);

export const SectionHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-[15px] font-semibold border-l-4 border-[#2563EB] pl-2 text-[#1F2933]">
        {title}
      </h2>
      {subtitle && <p className="text-sm text-[#6B7280] mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export const FilterBar = ({
  children,
  onSubmit,
}: {
  children: React.ReactNode;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}) => (
  <form
    onSubmit={onSubmit}
    className="border border-[#D0D7E2] bg-white p-4 flex flex-wrap items-end gap-4 rounded-md shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
  >
    {children}
  </form>
);

export const AlertBox = ({ message }: { message: string }) => (
  <div className="border border-[#DC2626] bg-[#FEF2F2] text-[#DC2626] text-sm px-3 py-2 rounded-md">
    {message}
  </div>
);

export const ButtonPrimary = ({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={cn(
      "h-9 bg-[#2563EB] text-white text-sm font-semibold px-3.5 py-2 rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed",
      className
    )}
  />
);

export const ButtonSecondary = ({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={cn(
      "h-9 border border-[#D0D7E2] bg-white text-[#1F2933] text-sm font-semibold px-3.5 py-2 rounded-[4px] hover:bg-[#F1F5F9] disabled:opacity-60 disabled:cursor-not-allowed",
      className
    )}
  />
);
