import type { ReactNode } from "react";

type BadgeColor = "blue" | "green" | "red" | "amber" | "gray";

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
}

const colors: Record<BadgeColor, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  green: "bg-green-50 text-green-700 border-green-200",
  red: "bg-red-50 text-red-700 border-red-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
};

export function Badge({ children, color = "gray" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colors[color],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
