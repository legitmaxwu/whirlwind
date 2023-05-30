import React, { useMemo, useState } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { curveBasis } from "@visx/curve";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AreaClosed } from "@visx/shape";
import { cn } from "../lib/utils";

const allKeys = ["1D", "1W", "1M", "3M", "1Y", "YTD"];

type DataPoint = {
  date: Date;
  balanceTop: number;
  balanceMiddle: number;
  balanceBottom: number;
};

interface StackedLineChartProps {
  data: DataPoint[];
}

export default function StackedLineChart({ data }: StackedLineChartProps) {
  const width = 790;
  const height = 300;
  const margin = { top: 50, right: 0, bottom: 50, left: 0  };

  const xScale = useMemo(
    () =>
      scaleTime({
        domain: [
          new Date(Math.min(...data.map((d) => d.date.getTime()))),
          new Date(Math.max(...data.map((d) => d.date.getTime()))),
        ],
        range: [margin.left, width - margin.right],
      }),
    [data, margin.left, margin.right]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [
          0,
          Math.max(...data.map((d) => Math.max(d.balanceTop, d.balanceBottom))),
        ],
        range: [height - margin.bottom, margin.top],
        nice: true,
      }),
    [data, height, margin.bottom, margin.top]
  );

  return (
    <div>
      <svg width={width} height={height}>
        <AxisBottom top={height - margin.bottom} scale={xScale} numTicks={10} />
        {/* <AxisLeft scale={yScale} left={margin.left} /> */}
        <AreaClosed
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.balanceTop)}
          yScale={yScale}
          stroke={"transparent"}
          fill={"blue"}
          curve={curveBasis}
        />
        <AreaClosed
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.balanceMiddle)}
          yScale={yScale}
          stroke={"transparent"}
          fill={"green"}
          curve={curveBasis}
        />
        <AreaClosed
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.balanceBottom)}
          yScale={yScale}
          stroke={"transparent"}
          fill={"red"}
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
