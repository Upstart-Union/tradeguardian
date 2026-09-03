"use client";

import React, { useEffect, useRef, memo } from "react";

interface TradingViewChartProps {
  symbol: string;
  interval: string;
  chartStyle: string;
}

function TradingViewChartComponent({
  symbol,
  interval,
  chartStyle,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Suppress known benign TradingView iframe unmount race-condition error
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      if (
        event?.message &&
        (event.message.includes("Cannot listen to the event from the provided iframe") ||
         event.message.includes("contentWindow is not available"))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener("error", handleWindowError);
    return () => {
      window.removeEventListener("error", handleWindowError);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any previous script or iframe cleanly
    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    widgetDiv.style.backgroundColor = "#131315";
    container.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: interval,
      timezone: "exchange",
      colorTheme: "dark",
      theme: "dark",
      style: chartStyle,
      locale: "en",
      enable_publishing: false,
      backgroundColor: "#131315",
      gridColor: "rgba(43, 42, 44, 0.2)",
      hide_top_toolbar: true,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      overrides: {
        "scalesProperties.textColor": "#a1a1aa",
        "scalesProperties.lineColor": "rgba(19, 19, 21, 0)",
        "paneProperties.separatorColor": "rgba(19, 19, 21, 0)",
        "mainSeriesProperties.priceAxisProperties.linesColor": "rgba(19, 19, 21, 0)",
        "paneProperties.background": "#131315",
        "paneProperties.backgroundType": "solid",
        "paneProperties.vertGridProperties.color": "rgba(43, 42, 44, 0.15)",
        "paneProperties.horzGridProperties.color": "rgba(43, 42, 44, 0.15)",
      },
    });

    container.appendChild(script);

    return () => {
      // Safely empty container when unmounting or changing symbol
      if (container) {
        try {
          container.innerHTML = "";
        } catch {
          // ignore DOM detachment errors during unmount
        }
      }
    };
  }, [symbol, interval, chartStyle]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container tradingview-clean-chart w-full h-full bg-[#131315] border-0 outline-none"
      style={{ height: "100%", width: "100%", backgroundColor: "#131315" }}
    />
  );
}

export const TradingViewChart = memo(TradingViewChartComponent);
export default TradingViewChart;
