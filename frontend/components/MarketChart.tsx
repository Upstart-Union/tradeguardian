"use client";

import { useEffect, useRef } from "react";

import {
  CandlestickSeries,
  ColorType,
  createChart,
} from "lightweight-charts";

import type {
  UTCTimestamp,
} from "lightweight-charts";


type MarketBar = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};


type MarketChartProps = {
  bars: MarketBar[];
  timeframe: string;
  symbol: string;
};


export default function MarketChart({
  bars,
  timeframe,
  symbol,
}: MarketChartProps) {
  const chartContainerRef =
    useRef<HTMLDivElement | null>(null);

  const chartRef =
    useRef<ReturnType<typeof createChart> | null>(null);

  const candleSeriesRef =
    useRef<any>(null);


  /*
   * CHART CREATION
   */
  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    const chart = createChart(
      chartContainerRef.current,
      {
        width:
          chartContainerRef.current.clientWidth,

        height:
          chartContainerRef.current.clientHeight || 420,

        layout: {
          background: {
            type: ColorType.Solid,
            color: "#101010",
          },

          textColor: "#8a8a8a",
        },

        grid: {
          vertLines: {
            color: "#222222",
          },

          horzLines: {
            color: "#222222",
          },
        },

        rightPriceScale: {
          borderColor: "#292929",
        },

        timeScale: {
          borderColor: "#292929",
          barSpacing: 8,
          rightOffset: 2,
          timeVisible: true,
          secondsVisible: false,
        },
      },
    );


    const candleSeries =
      chart.addSeries(
        CandlestickSeries,
        {
          upColor: "#22c55e",
          downColor: "#ef4444",

          borderVisible: false,

          wickUpColor: "#22c55e",
          wickDownColor: "#ef4444",
        },
      );


    chartRef.current = chart;

    candleSeriesRef.current =
      candleSeries;


    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width:
            chartContainerRef.current.clientWidth,

          height:
            chartContainerRef.current.clientHeight,
        });
      }
    };


    window.addEventListener(
      "resize",
      handleResize,
    );


    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );

      chart.remove();

      chartRef.current = null;

      candleSeriesRef.current = null;
    };

  }, []);


  /*
   * HISTORICAL DATA
   */
  useEffect(() => {
    const candleSeries =
      candleSeriesRef.current;

    const chart =
      chartRef.current;

    if (!candleSeries || !chart) {
      return;
    }


    const isIntraday =
      timeframe === "1D" ||
      timeframe === "5D";


    const candleData =
      bars.map((bar) => {
        const date =
          new Date(bar.timestamp);

        return {
          time: isIntraday
            ? (
                Math.floor(
                  date.getTime() / 1000,
                ) as UTCTimestamp
              )
            : {
                year:
                  date.getUTCFullYear(),

                month:
                  date.getUTCMonth() + 1,

                day:
                  date.getUTCDate(),
              },

          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        };
      });


    candleSeries.setData(
      candleData,
    );


    chart.timeScale().fitContent();

  }, [bars, timeframe]);


  /*
   * LIVE MARKET STREAM
   *
   * Uses SSE from FastAPI.
   */
  useEffect(() => {
    const eventSource = new EventSource(
      `/api/live/market?symbol=${encodeURIComponent(
        symbol,
      )}&timeframe=${encodeURIComponent(
        timeframe,
      )}`,
    );


    eventSource.onopen = () => {
      console.log(
        "=== LIVE SSE CONNECTED ===",
        symbol,
        timeframe,
      );
    };


    eventSource.onmessage = (
      event,
    ) => {
      try {
        const bar =
          JSON.parse(
            event.data,
          ) as MarketBar;


        const candleSeries =
          candleSeriesRef.current;

        if (!candleSeries) {
          return;
        }


        const date =
          new Date(
            bar.timestamp,
          );


        const isIntraday =
          timeframe === "1D" ||
          timeframe === "5D";


        const time = isIntraday
          ? (
              Math.floor(
                date.getTime() / 1000,
              ) as UTCTimestamp
            )
          : {
              year:
                date.getUTCFullYear(),

              month:
                date.getUTCMonth() + 1,

              day:
                date.getUTCDate(),
            };


        candleSeries.update({
          time,

          open: bar.open,

          high: bar.high,

          low: bar.low,

          close: bar.close,
        });

      } catch (error) {
        console.error(
          "Live market update error:",
          error,
        );
      }
    };


    eventSource.onerror = () => {
      console.error(
        "=== LIVE SSE ERROR ===",
        symbol,
        timeframe,
      );
    };


    return () => {
      eventSource.close();

      console.log(
        "=== LIVE SSE CLOSED ===",
        symbol,
        timeframe,
      );
    };

  }, [symbol, timeframe]);


  return (
    <div
      ref={chartContainerRef}
      className="w-full"
    />
  );
}