import React from "react";

export default function HomeGridItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="size-96 bg-gray-900 rounded-lg shadow-black shadow-lg flex justify-center">
      {children}
    </div>
  );
}
