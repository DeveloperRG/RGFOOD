import React from "react";
import { Card, CardContent } from "~/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

interface DashboardMetricCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  trend: {
    value: number;
    isPositive: boolean;
  } | null;
  href?: string;
}

export function DashboardMetricCard({
  title,
  value,
  description,
  icon,
  trend,
  href,
}: DashboardMetricCardProps) {
  const content = (
    <Card className="cursor-pointer transition hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <span className="text-muted-foreground text-sm font-medium">
              {title}
            </span>
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-muted-foreground pt-1 text-xs">
              {description}
            </span>
          </div>
          <div className="rounded-full bg-gray-100 p-3">{icon}</div>
        </div>

        {trend && (
          <div className="mt-3 flex items-center text-xs">
            {trend.isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span
              className={trend.isPositive ? "text-green-500" : "text-red-500"}
            >
              {trend.isPositive ? "+" : "-"}
              {trend.value}%
            </span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
