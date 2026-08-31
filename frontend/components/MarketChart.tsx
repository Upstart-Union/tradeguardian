"use client";

import { useEffect, useRef } from "react";

import {
  CandlestickSeries,
  ColorType,
  createChart,
} from "lightweight-charts";

import type {
  Time,
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

function getIntervalSeconds(
  timeframe: string,
): number {
  if (timeframe === "1D") {
    return 5 * 60;
  }

  if (timeframe === "5D") {
    return 15 * 60;
  }

  if (timeframe === "1M") {
    return 24 * 60 * 60;
  }

  return 24 * 60 * 60;
}
function getCandleKey(
  timestamp: string,
  intervalSeconds: number,
): number {
  const timestampSeconds =
    Math.floor(
      new Date(timestamp).getTime() / 1000,
    );

  return Math.floor(
    timestampSeconds / intervalSeconds,
  );
}
function isValidMarketBar(
  bar: MarketBar,
): boolean {
  if (
    !Number.isFinite(bar.open) ||
    !Number.isFinite(bar.high) ||
    !Number.isFinite(bar.low) ||
    !Number.isFinite(bar.close)
  ) {
    return false;
  }

  if (
    bar.open <= 0 ||
    bar.high <= 0 ||
    bar.low <= 0 ||
    bar.close <= 0
  ) {
    return false;
  }

  if (bar.high < bar.low) {
    return false;
  }

  if (
    bar.high < bar.open ||
    bar.high < bar.close
  ) {
    return false;
  }

  if (
    bar.low > bar.open ||
    bar.low > bar.close
  ) {
    return false;
  }

  return true;
}
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

  const validBarsRef =
    useRef<MarketBar[]>([]);

  const timeframeRef =
    useRef(timeframe);

  const liveIndexRef =
    useRef(
      Math.max(
        bars.filter(
          isValidMarketBar,
        ).length - 1,
        0,
      ),
    );

  const liveCandleKeyRef =
    useRef<number | null>(null);

  timeframeRef.current =
    timeframe;
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
          barSpacing: 4,
          rightOffset: 0,
          fixLeftEdge: true,
          fixRightEdge: true,
          timeVisible: true,
          secondsVisible: false,

          tickMarkFormatter: (
            time: Time,
          ) => {
            if (
              typeof time !== "number"
            ) {
              return "";
            }

            const currentTimeframe =
              timeframeRef.current;

            const index = Number(time);

            const bar =
              validBarsRef.current[index];

            if (!bar) {
              return "";
            }

            const date =
              new Date(bar.timestamp);

            const isIntraday =
              currentTimeframe === "1D" ||
              currentTimeframe === "5D";

            if (isIntraday) {
              return date.toLocaleTimeString(
                "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                },
              );
            }

            return date.toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
              },
            );
          },
        },

        localization: {
          timeFormatter: (
            time: Time,
          ) => {
            if (
              typeof time !== "number"
            ) {
              return "";
            }

            const currentTimeframe =
              timeframeRef.current;

            const index = Number(time);

            const bar =
              validBarsRef.current[index];

            if (!bar) {
              return "";
            }

            const date =
              new Date(bar.timestamp);

            const isIntraday =
              currentTimeframe === "1D" ||
              currentTimeframe === "5D";

            if (isIntraday) {
              return date.toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                },
              );
            }

            return date.toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            );
          },
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

    const intervalSeconds =
      getIntervalSeconds(
        timeframe,
      );

    const validBars =
      bars
        .filter(
          isValidMarketBar,
        )
        .sort(
          (a, b) =>
            new Date(
              a.timestamp,
            ).getTime() -
            new Date(
              b.timestamp,
            ).getTime(),
        );

    validBarsRef.current =
      validBars;

    console.table(
      validBars.map(
        (bar, index) => ({
          index,
          timestamp: new Date(
            bar.timestamp,
          ).toLocaleString(
            "en-US",
            {
              timeZone: "Asia/Manila",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            },
          ),
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        }),
      ),
    );

    const candleData = validBars.map(
      (bar, index) => ({
        time: index as UTCTimestamp,

        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
      }),
    );

    console.log(
      "CANDLE COUNT:",
      candleData.length,
    );

    console.log(
      "CANDLE TIMES:",
      candleData.map(
        (candle) => candle.time,
      ).join(", "),
    );

    console.table(
      candleData.map((candle, index) => ({
        arrayIndex: index,
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      })),
    );

    for (let i = 1; i < candleData.length; i++) {
      const previous =
        candleData[i - 1];

      const current =
        candleData[i];

      const previousBar =
        validBars[i - 1];

      const currentBar =
        validBars[i];

      const priceGap =
        current.open -
        previous.close;

      if (Math.abs(priceGap) >= 1) {
        console.log(
          "PRICE GAP:",
          {
            previousIndex: i - 1,

            previousTimestamp:
              previousBar.timestamp,

            previousClose:
              previous.close,

            currentIndex: i,

            currentTimestamp:
              currentBar.timestamp,

            currentOpen:
              current.open,

            gap: priceGap,
          },
        );
      }
    }

    for (let i = 1; i < candleData.length; i++) {
      const previousTime = Number(candleData[i - 1].time);
      const currentTime = Number(candleData[i].time);

      if (currentTime - previousTime !== 1) {
        console.error(
          "TIME GAP DETECTED",
          {
            previousIndex: i - 1,
            previousTime,
            currentIndex: i,
            currentTime,
          },
        );
      }
    }

    liveIndexRef.current =
      Math.max(
        candleData.length - 1,
        -1,
      );

    liveCandleKeyRef.current =
      validBars.length > 0
        ? getCandleKey(
            validBars[
              validBars.length - 1
            ].timestamp,
            intervalSeconds,
          )
        : null;

    console.log(
      "CANDLE DEBUG",
      candleData.map((candle, index) => ({
        index,
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      })),
    );

    candleSeries.setData(
      candleData,
    );

    chart.timeScale().applyOptions({
      barSpacing: 2,
      rightOffset: 0,
    });
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

        if (!isValidMarketBar(bar)) {
          console.warn(
            "Ignoring invalid live market bar:",
            bar,
          );

          return;
        }

        const candleSeries =
          candleSeriesRef.current;

        if (!candleSeries) {
          return;
        }

        const intervalSeconds =
          getIntervalSeconds(
            timeframeRef.current,
          );

        const candleKey =
          getCandleKey(
            bar.timestamp,
            intervalSeconds,
          );

        const currentCandleKey =
          liveCandleKeyRef.current;

        /*
        * FIRST LIVE CANDLE
        */
        if (currentCandleKey === null) {
          liveIndexRef.current =
            validBarsRef.current.length;

          liveCandleKeyRef.current =
            candleKey;

          validBarsRef.current.push(
            bar,
          );
        }

        /*
        * NEWER CANDLE
        */
        else if (candleKey > currentCandleKey) {
          liveIndexRef.current += 1;

          liveCandleKeyRef.current =
            candleKey;

          validBarsRef.current.push(
            bar,
          );
        }

        /*
        * CURRENT CANDLE
        */
        else if (candleKey === currentCandleKey) {
          validBarsRef.current[
            liveIndexRef.current
          ] = bar;
        }

        /*
        * OLD / DELAYED CANDLE
        */
        else {
          console.warn(
            "Ignoring old live candle:",
            {
              candleKey,
              currentCandleKey,
              timestamp: bar.timestamp,
            },
          );

          return;
        }

        /*
        * IMPORTANT:
        * The chart uses candle indexes as time.
        *
        * Historical candles:
        * 0, 1, 2, 3...
        *
        * Live candles continue:
        * 141, 142, 143...
        */
        const time =
          liveIndexRef.current as UTCTimestamp;

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