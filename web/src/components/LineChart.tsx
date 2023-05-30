import React, { useMemo, useState } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { curveBasis } from "@visx/curve";
import { scaleTime, scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { cn } from "../lib/utils";

const allKeys = ["1D", "1W", "1M", "3M", "1Y", "YTD"];

type DataPoint = { date: Date; balance: number };

interface LineChartProps {
  data: DataPoint[];
}

export default function LineChart({ data }: LineChartProps) {
  // dimensions
  const width = 600;
  const height = 300;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };

  // scales
  const xScale = useMemo(
    () =>
      scaleTime({
        domain: [
          new Date(
            Math.min.apply(
              null,
              data.map((d) => d.date.getTime())
            )
          ),
          new Date(
            Math.max.apply(
              null,
              data.map((d) => d.date.getTime())
            )
          ),
        ],
        range: [margin.left, width - margin.right],
      }),
    [data, margin.left, margin.right]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, Math.max(...data.map((d) => d.balance))],
        range: [height - margin.bottom, margin.top],
        nice: true,
      }),
    [data, height, margin.bottom, margin.top]
  );

  return (
    <div>
      <svg width={width} height={height}>
        {/* <GridRows scale={yScale} width={width} strokeDasharray="2,2" />
        <GridColumns scale={xScale} height={height} strokeDasharray="2,2" /> */}
        <AxisBottom top={height - margin.bottom} scale={xScale} numTicks={10} />
        <AxisLeft scale={yScale} left={margin.left} />
        <LinePath
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.balance)}
          stroke={"#000"}
          strokeWidth={2}
          curve={curveBasis}
        />
      </svg>
      <div>
        {allKeys.map((key) => (
          <button
            key={key}
            onClick={() => {
              // This is where you'd handle switching between different time intervals
            }}
            className={cn({
              "mx-1 font-medium text-primary": true,
              "text-gray-400": !allKeys.includes(key),
            })}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
