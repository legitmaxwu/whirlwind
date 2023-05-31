import React, { useMemo, useCallback } from "react";
import { AxisBottom } from "@visx/axis";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AreaClosed } from "@visx/shape";
import { curveBasis } from "@visx/curve";
import { TooltipWithBounds, useTooltip } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { bisector } from "d3-array";
import format from "date-fns/format";
import { formatNumber } from "../lib/utils";

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

const bisectDate = bisector<DataPoint, Date>((d) => d.date).left;

export default function StackedLineChart({ data }: StackedLineChartProps) {
  const width = 740;
  const height = 300;
  const margin = { top: 50, right: 0, bottom: 50, left: 0 };

  const xScale = useMemo(
    () =>
      scaleTime({
        domain: [
          new Date(Math.min(...data.map((d) => d.date.getTime()))),
          new Date(Math.max(...data.map((d) => d.date.getTime()))),
        ],
        range: [margin.left, width - margin.right],
      }),
    [data, margin.left, margin.right, width]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [
          0,
          Math.max(
            ...data.map((d) =>
              Math.max(d.balanceTop, d.balanceBottom, d.balanceMiddle)
            )
          ),
        ],
        range: [height - margin.bottom, margin.top],
        nice: true,
      }),
    [data, height, margin.bottom, margin.top]
  );

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    hideTooltip,
    showTooltip,
  } = useTooltip<DataPoint>();

  const handleTooltip = useCallback(
    (
      event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>
    ) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      const d =
        d0 &&
        d1 &&
        x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime()
          ? d1
          : d0;
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: yScale(d.balanceTop),
      });
    },
    [showTooltip, xScale, yScale, data]
  );

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <AxisBottom top={height - margin.bottom} scale={xScale} numTicks={10} />
        <AreaClosed
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.balanceTop)}
          yScale={yScale}
          stroke={"transparent"}
          fill={"#c8b1e4"}
          curve={curveBasis}
        />
        <AreaClosed
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.balanceMiddle)}
          yScale={yScale}
          stroke={"transparent"}
          fill={"#9b72cf"}
          curve={curveBasis}
        />
        <AreaClosed
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.balanceBottom)}
          yScale={yScale}
          stroke={"transparent"}
          fill={"#532b88"}
          curve={curveBasis}
        />
        <rect
          width={width}
          height={height}
          fill="transparent"
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={hideTooltip}
        />
      </svg>
      {tooltipOpen && tooltipData && (
        <>
          <TooltipWithBounds
            key={Math.random()}
            top={tooltipTop ?? 0 + 12}
            left={tooltipLeft}
            style={{
              // ...defaultStyles,
              minWidth: 60,
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "white",
            }}
            className="absolute rounded-md px-2 py-2 text-xs"
          >
            <div className="mb-1 underline">
              {format(tooltipData.date, "MMM d, yyyy")}
            </div>
            <div className="flex items-center gap-1">
              <div
                className="inline h-3 w-3 rounded-full"
                style={{ backgroundColor: "#c8b1e4" }}
              />
              <div>
                $
                {formatNumber(
                  tooltipData.balanceTop - tooltipData.balanceMiddle
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="inline h-3 w-3 rounded-full"
                style={{ backgroundColor: "#9b72cf" }}
              />
              <div>
                $
                {formatNumber(
                  tooltipData.balanceMiddle - tooltipData.balanceBottom
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="inline h-3 w-3 rounded-full"
                style={{ backgroundColor: "#532b88" }}
              />
              <div>${formatNumber(tooltipData.balanceMiddle)}</div>
            </div>
          </TooltipWithBounds>
          <div
            style={{ left: tooltipLeft, top: 0 }}
            className="pointer-events-none absolute h-full w-px bg-black"
          ></div>
        </>
      )}
    </div>
  );
}
