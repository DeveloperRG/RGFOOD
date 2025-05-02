"use client";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Sector,
} from "recharts";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import Link from "next/link";

interface DashboardMetricCardProps {
  title: string;
  value: number;
  description: string;
  data: { name: string; value: number; fill: string }[];
  link?: string;
  href?: string;
  className?: string;
  extraContent?: React.ReactNode;
}

export function DashboardMetricCard({
  title,
  value,
  description,
  data,
  link,
}: DashboardMetricCardProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const onPieEnter = (_: any, index: number) => {
    setHoverIndex(index);
  };

  const onPieLeave = () => {
    setHoverIndex(null);
  };

  const onPieClick = (_: any, index: number) => {
    setClickedIndex(index === clickedIndex ? null : index);
  };

  const localizedData = data.map((entry) => ({
    ...entry,
    name:
      entry.name === "Active"
        ? "Buka"
        : entry.name === "Inactive"
          ? "Tutup"
          : entry.name === "Aktif"
            ? "Aktif"
            : entry.name === "Tidak Aktif"
              ? "Tidak Aktif"
              : entry.name,
  }));

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;

    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
  };

  const cardContent = (
    <Card className="flex flex-col rounded-xl bg-white shadow-md transition-shadow duration-500 hover:shadow-xl">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col items-center gap-2 pb-4">
        <div className="mx-auto aspect-square max-h-[250px]">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <defs>
                <linearGradient id="gradBuka" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <linearGradient id="gradTutup" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
                <linearGradient id="gradAktif" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="gradTidakAktif" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>

              <Pie
                data={localizedData.map((entry) => ({
                  ...entry,
                  fill:
                    entry.name === "Buka"
                      ? "url(#gradBuka)"
                      : entry.name === "Tutup"
                        ? "url(#gradTutup)"
                        : entry.name === "Aktif"
                          ? "url(#gradAktif)"
                          : entry.name === "Tidak Aktif"
                            ? "url(#gradTidakAktif)"
                            : entry.fill,
                }))}
                dataKey="value"
                innerRadius={60}
                outerRadius={80}
                activeIndex={hoverIndex ?? clickedIndex ?? undefined}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                onClick={onPieClick}
                animationDuration={500}
              >
                {localizedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#1f2937"
                fontSize={24}
                fontWeight="bold"
              >
                {value}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Label breakdown langsung di bawah grafik */}
        <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm">
          {localizedData.map((entry, index) => (
            <span
              key={index}
              className="flex items-center gap-1 font-semibold"
              style={{
                color: entry.fill.includes("url") ? "#000" : entry.fill,
              }}
            >
              {entry.name}: {entry.value}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return link ? (
    <Link
      href={link}
      className="block rounded-xl transition-shadow hover:shadow-lg"
    >
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
}
