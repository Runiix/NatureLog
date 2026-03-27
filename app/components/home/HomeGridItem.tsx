import React from "react";

export default function HomeGridItem({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg shadow-black shadow-lg flex justify-center bg-gradient-to-br  from-gray-900 to-70% transition-all duration-200 to-gray-950 border hover:border-green-600 border-slate-200  ${className}`}
    >
      {children}
    </div>
  );
}
