import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Search,
  LineChart,
  X,
  History,
  Activity,
  Scissors,
  BarChart2,
  TrendingDown,
  TrendingUp,
  Square,
  AlignEndHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  MousePointer2
} from 'lucide-react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, Time, CrosshairMode, CandlestickSeries, HistogramSeries, LineSeries, IPriceLine } from 'lightweight-charts';
import { DrawingManager, TrendLine, FibRetracement, LongPosition, ShortPosition, Rectangle as ChartRectangle } from 'lightweight-charts-drawing';

export type CustomBarData = CandlestickData & {
  volume: number;
};

const SUGGESTED_MARKETS = [
  { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin / TetherUS' },
  { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum / TetherUS' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'GC=F', name: 'Gold Futures' },
];

const TIMEFRAMES = [
  { label: '1m', tv: '1', yahoo: '1m', range: '7d', aggregate: 1 },
  { label: '3m', tv: '3', yahoo: '1m', range: '7d', aggregate: 3 },
  { label: '5m', tv: '5', yahoo: '5m', range: '60d', aggregate: 1 },
  { label: '15m', tv: '15', yahoo: '15m', range: '60d', aggregate: 1 },
  { label: '1H', tv: '60', yahoo: '1h', range: '730d', aggregate: 1 },
  { label: '4H', tv: '240', yahoo: '4h', range: '730d', aggregate: 1 },
  { label: '1D', tv: 'D', yahoo: '1d', range: null, aggregate: 1 },
  { label: '1W', tv: 'W', yahoo: '1wk', range: null, aggregate: 1 },
  { label: '1M', tv: 'M', yahoo: '1mo', range: null, aggregate: 1 },
];

export function ReplayWorkspace() {
  const { symbol: urlSymbol, mode: initialMode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlMode = (searchParams.get('mode') as 'live' | 'replay') || initialMode || 'replay';
  
  const [mode, setModeState] = useState<'live' | 'replay'>(urlMode);
  
  const setMode = (m: 'live' | 'replay') => {
    setModeState(m);
    setSearchParams(prev => {
      prev.set('mode', m);
      return prev;
    });
  };

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const [symbol, setSymbol] = useState('AAPL');
  const [searchInput, setSearchInput] = useState('');
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const [isJumpMode, setIsJumpMode] = useState(false);
  
  const [timeframe, setTimeframe] = useState('1D');
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);
  
  const currentTimeframeData = TIMEFRAMES.find(t => t.label === timeframe) || TIMEFRAMES[6];
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null); // Use any to avoid complex lightweight-charts type issues
  const volumeSeriesRef = useRef<any>(null);
  const sma20SeriesRef = useRef<any>(null);
  const sma50SeriesRef = useRef<any>(null);
  const drawingManagerRef = useRef<any>(null);
  const priceLinesRef = useRef<Map<string, IPriceLine>>(new Map());
  
  const [activeDrawTool, setActiveDrawTool] = useState<string | null>(null);
  const drawPointsRef = useRef<{time: any, price: number}[]>([]);
  const activeDrawToolRef = useRef<string | null>(null);

  // Sync state to ref for click handler
  useEffect(() => {
    activeDrawToolRef.current = activeDrawTool;
    drawPointsRef.current = [];
  }, [activeDrawTool]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);
  const [qty, setQty] = useState(1.0);
  
  const [historicalData, setHistoricalData] = useState<CustomBarData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showVolume, setShowVolume] = useState(false);
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);

  const [positions, setPositions] = useState<{id: string, type: 'BUY'|'SELL', entry: number, lots: number, pnl: number}[]>([]);
  const [livePrice, setLivePrice] = useState<number | null>(null);

  // Fetch Live Price for Demo Trading
  useEffect(() => {
    if (mode !== 'live') return;
    
    let isMounted = true;
    const fetchLivePrice = async () => {
       try {
         let querySymbol = symbol;
         if (querySymbol.includes('BINANCE:')) {
            const pair = querySymbol.replace('BINANCE:', '');
            if (pair.endsWith('USDT')) {
              querySymbol = pair.replace('USDT', '-USD');
            }
         }
         const res = await fetch(`/api/yahoo?symbol=${querySymbol}&range=1d&interval=1m`);
         const data = await res.json();
         const result = data.chart?.result?.[0];
         if (result && isMounted) {
            const meta = result.meta;
            const currentYahooPrice = meta.regularMarketPrice;
            if (currentYahooPrice) {
               setLivePrice(currentYahooPrice);
            } else {
               const quote = result.indicators.quote[0];
               const prices = quote.close;
               const latestPrice = prices.filter((p: any) => p !== null).pop();
               if (latestPrice) {
                  setLivePrice(latestPrice);
               }
            }
         }
       } catch (e) {
         console.error("Live price fetch failed", e);
       }
    };

    fetchLivePrice();
    const interval = setInterval(fetchLivePrice, 10000); // Update every 10s to avoid rate limits
    return () => {
       isMounted = false;
       clearInterval(interval);
    };
  }, [mode, symbol]);

  // Calculate current price for replay or live
  const lastHistoryPrice = historicalData.length > 0 ? historicalData[historicalData.length-1].close : 0;
  const currentPrice = mode === 'live' ? (livePrice || lastHistoryPrice) : historicalData[currentIndex]?.close || 0;
  
  // Calculate PnL for active positions
  const totalPnL = positions.reduce((sum, p) => {
    let pnl = 0;
    if (p.type === 'BUY') {
      pnl = (currentPrice - p.entry) * p.lots;
    } else {
      pnl = (p.entry - currentPrice) * p.lots;
    }
    return sum + pnl;
  }, 0);
  
  const equity = 100000 + totalPnL;

  // Notification state
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch Data for both Replay and Live with polling for Live mode
  useEffect(() => {
    let isMounted = true;
    let pollInterval: any = null;

    const fetchData = async () => {
      if (historicalData.length === 0) setIsLoading(true);
      try {
        let querySymbol = symbol;
        if (querySymbol.includes('BINANCE:')) {
           const pair = querySymbol.replace('BINANCE:', '');
           if (pair.endsWith('USDT')) {
             querySymbol = pair.replace('USDT', '-USD');
           }
        }
        
        let url = `/api/yahoo?symbol=${querySymbol}&interval=${currentTimeframeData.yahoo}`;
        if (currentTimeframeData.range) {
          url += `&range=${currentTimeframeData.range}`;
        } else {
          url += `&period1=0&period2=9999999999`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        const result = data.chart?.result?.[0];
        if (!result) throw new Error("No data returned");

        const timestamps = result.timestamp;
        if (!timestamps) throw new Error("No timestamps");
        const quotes = result.indicators.quote[0];
        
        const formattedData: CustomBarData[] = [];
        let lastTime = 0;

        let currentAggBar: any = null;
        let aggCount = 0;

        for (let i = 0; i < timestamps.length; i++) {
          const t = timestamps[i];
          if (quotes.close[i] !== null && quotes.high[i] !== null && t > lastTime) {
            const d = new Date(t * 1000);
            const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
            const timeValue = currentTimeframeData.range ? t as Time : dateStr as Time;

            const bar = {
              time: timeValue,
              open: quotes.open[i],
              high: quotes.high[i],
              low: quotes.low[i],
              close: quotes.close[i],
              volume: quotes.volume?.[i] || 0,
            };
            
            if (currentTimeframeData.aggregate > 1) {
               if (!currentAggBar) {
                 currentAggBar = { ...bar };
                 aggCount = 1;
               } else {
                 currentAggBar.high = Math.max(currentAggBar.high, bar.high);
                 currentAggBar.low = Math.min(currentAggBar.low, bar.low);
                 currentAggBar.close = bar.close;
                 currentAggBar.volume += bar.volume;
                 aggCount++;
               }
               
               if (aggCount === currentTimeframeData.aggregate) {
                 formattedData.push(currentAggBar);
                 currentAggBar = null;
                 aggCount = 0;
               }
            } else {
               formattedData.push(bar);
            }
            lastTime = t;
          }
        }
        
        if (currentAggBar) formattedData.push(currentAggBar);
        
        if (isMounted) {
          setHistoricalData(formattedData);
          if (mode === 'replay' && historicalData.length === 0) {
            setCurrentIndex(Math.max(0, formattedData.length - 100));
          }
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
      if (isMounted) setIsLoading(false);
    };

    fetchData();
    
    if (mode === 'live') {
      pollInterval = setInterval(fetchData, 60000); // Poll chart history every 60s
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [symbol, mode, currentTimeframeData]);

  // Init Chart for both Replay and Live
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#D1D4DC',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#758696', width: 1, style: 1, labelBackgroundColor: '#2B2B43' },
        horzLine: { color: '#758696', width: 1, style: 1, labelBackgroundColor: '#2B2B43' },
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
        autoScale: true,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#089981',
      downColor: '#F23645',
      borderVisible: false,
      wickUpColor: '#089981',
      wickDownColor: '#F23645',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // set as an overlay
    });
    chart.priceScale('').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 }, // Position exactly at the bottom
    });

    const sma20Series = chart.addSeries(LineSeries, {
      color: '#2962FF',
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
    });

    const sma50Series = chart.addSeries(LineSeries, {
      color: '#FF9800',
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;
    volumeSeriesRef.current = volumeSeries;
    sma20SeriesRef.current = sma20Series;
    sma50SeriesRef.current = sma50Series;

    const manager = new DrawingManager();
    if (chartContainerRef.current) {
        manager.attach(chart, series, chartContainerRef.current);
        drawingManagerRef.current = manager;
    }

    chart.subscribeClick((param) => {
      // If we are using drawing tools
      if (activeDrawToolRef.current && param.point && param.time) {
          const price = series.coordinateToPrice(param.point.y);
          if (price !== null) {
              drawPointsRef.current.push({ time: param.time, price });
              
              const requiredPoints = activeDrawToolRef.current === 'TrendLine' ? 2 :
                                   activeDrawToolRef.current === 'FibRetracement' ? 2 :
                                   activeDrawToolRef.current === 'Rectangle' ? 2 :
                                   activeDrawToolRef.current === 'LongPosition' ? 2 :
                                   activeDrawToolRef.current === 'ShortPosition' ? 2 : 2;
                                   
              if (drawPointsRef.current.length >= requiredPoints) {
                  const pts = drawPointsRef.current;
                  const id = Date.now().toString();
                  let tool;
                  
                  if (activeDrawToolRef.current === 'TrendLine') {
                      tool = new TrendLine(id, pts, { lineColor: '#2962FF', lineWidth: 2 });
                  } else if (activeDrawToolRef.current === 'FibRetracement') {
                      tool = new FibRetracement(id, pts);
                  } else if (activeDrawToolRef.current === 'Rectangle') {
                      tool = new ChartRectangle(id, pts, { lineColor: '#2962FF' }, { filled: true });
                  } else if (activeDrawToolRef.current === 'LongPosition') {
                      // Map the 2 points to entry and take profit. The exact mapping depends on how the tool expects it.
                      // Usually point 1 is entry, point 2 is take profit. We might need a stop loss logic but let's pass 2 points.
                      tool = new LongPosition(id, pts);
                  } else if (activeDrawToolRef.current === 'ShortPosition') {
                      tool = new ShortPosition(id, pts);
                  }
                  
                  if (tool) manager.addDrawing(tool);
                  setActiveDrawTool(null); // Reset after drawing
              }
          }
          return; // Prevents triggering jump or other chart clicks
      }

      if (!param.point || !param.time) return;
      
      setIsJumpMode(false);
      
      // We need to use state setter callback to access latest historicalData
      setHistoricalData(currentData => {
         const idx = currentData.findIndex(d => d.time === param.time);
         if (idx !== -1) {
            setCurrentIndex(idx);
            setIsPlaying(false);
         }
         return currentData;
      });
    });

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [mode]);

  // Compute full indicators for current historical data
  const { fullVolume, fullSMA20, fullSMA50 } = React.useMemo(() => {
    const vol = historicalData.map(d => ({
      time: d.time,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(242, 54, 69, 0.5)'
    }));
    
    const calculateSMA = (period: number) => {
      const sma: { time: Time, value: number }[] = [];
      for (let i = 0; i < historicalData.length; i++) {
        if (i < period - 1) continue;
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += historicalData[i - j].close;
        }
        sma.push({ time: historicalData[i].time, value: sum / period });
      }
      return sma;
    };
    
    return {
      fullVolume: vol,
      fullSMA20: calculateSMA(20),
      fullSMA50: calculateSMA(50)
    };
  }, [historicalData]);

  // Update chart data on replay or live
  useEffect(() => {
    if (seriesRef.current && historicalData.length > 0) {
      if (mode === 'replay') {
        seriesRef.current.setData(historicalData.slice(0, currentIndex + 1));
        
        if (volumeSeriesRef.current) {
          volumeSeriesRef.current.setData(showVolume ? fullVolume.slice(0, currentIndex + 1) : []);
        }
        if (sma20SeriesRef.current) {
          const slicedSMA20 = fullSMA20.filter(d => historicalData.findIndex(h => h.time === d.time) <= currentIndex);
          sma20SeriesRef.current.setData(showSMA20 ? slicedSMA20 : []);
        }
        if (sma50SeriesRef.current) {
          const slicedSMA50 = fullSMA50.filter(d => historicalData.findIndex(h => h.time === d.time) <= currentIndex);
          sma50SeriesRef.current.setData(showSMA50 ? slicedSMA50 : []);
        }
      } else {
        // Live mode: show all data
        seriesRef.current.setData(historicalData);
        if (volumeSeriesRef.current) {
          volumeSeriesRef.current.setData(showVolume ? fullVolume : []);
        }
        if (sma20SeriesRef.current) {
          sma20SeriesRef.current.setData(showSMA20 ? fullSMA20 : []);
        }
        if (sma50SeriesRef.current) {
          sma50SeriesRef.current.setData(showSMA50 ? fullSMA50 : []);
        }
      }

      setPositions(prev => [...prev]); // Trigger re-render for PnL
    }
  }, [currentIndex, historicalData, mode, fullVolume, fullSMA20, fullSMA50, showVolume, showSMA20, showSMA50]);

  // Sync Positions to Price Lines on Chart
  useEffect(() => {
    if (!seriesRef.current) return;

    // Remove lines for closed positions
    const activeIds = new Set(positions.map(p => p.id));
    for (const [id, line] of priceLinesRef.current.entries()) {
      if (!activeIds.has(id)) {
        seriesRef.current.removePriceLine(line);
        priceLinesRef.current.delete(id);
      }
    }

    // Add or update lines for current positions
    positions.forEach(pos => {
      const existingLine = priceLinesRef.current.get(pos.id);
      if (!existingLine) {
        const newLine = seriesRef.current.createPriceLine({
          price: pos.entry,
          color: pos.type === 'BUY' ? '#089981' : '#F23645',
          lineWidth: 2,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: `${pos.type} ${pos.lots.toFixed(2)} @ ${pos.entry.toFixed(2)}`,
        });
        priceLinesRef.current.set(pos.id, newLine);
      }
    });
  }, [positions]);

  // Replay Loop
  useEffect(() => {
    if (mode === 'live' || !isPlaying) return;
    
    // 5 speed settings: 1=3000ms, 2=1500ms, 3=800ms, 4=300ms, 5=100ms
    const speeds = [3000, 1500, 800, 300, 100];
    const intervalTime = speeds[speed - 1] || 800;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= historicalData.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);
    
    return () => clearInterval(interval);
  }, [isPlaying, speed, historicalData.length, mode]);

  const handleRewind = () => {
    setCurrentIndex(prev => Math.max(0, prev - 10)); // Rewind 10 bars
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
       setSymbol(searchInput.trim().toUpperCase());
       setIsPlaying(false);
    }
  };

  const placeOrder = (type: 'BUY' | 'SELL') => {
     if (currentPrice <= 0) {
       setNotification({ message: 'Cannot place order: Price unavailable', type: 'error' });
       return;
     }

     const newPos = {
       id: Math.random().toString(36).substring(7),
       type,
       entry: currentPrice,
       lots: qty,
       pnl: 0
     };
     setPositions(prev => [...prev, newPos]);
     setNotification({ message: `${type} Order Executed at ${currentPrice.toFixed(2)}`, type: 'success' });
  };

  const formatDisplayTime = (time: Time | undefined) => {
    if (!time) return '--';
    if (typeof time === 'string') return time;
    const d = new Date((time as number) * 1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')} ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
  };

  return (
    <div className="flex flex-col bg-[#131722] w-full h-screen font-sans">
      {/* Top Toolbar */}
      {notification && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-2xl flex items-center space-x-3 animate-in fade-in zoom-in duration-300 ${notification.type === 'success' ? 'bg-[#089981] text-white' : 'bg-[#F23645] text-white'}`}>
           <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}
      <div className="h-14 bg-[#1e222d] border-b border-[#2a2e39] flex items-center justify-between px-4 shrink-0 z-10 w-full relative">
        <div className="flex items-center space-x-4">
           {/* Symbol Search */}
           <form onSubmit={handleSearch} className="flex items-center space-x-2">
             <div className="relative group">
               <input 
                 type="text" 
                 value={searchInput}
                 onChange={(e) => setSearchInput(e.target.value)}
                 onFocus={() => setIsSearchFocused(true)}
                 onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                 className="bg-[#131722] text-[#D1D4DC] rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none border border-[#434651] w-64 focus:border-[#2962FF] uppercase font-semibold transition-colors"
                 placeholder="Search Symbol (e.g. AAPL)"
               />
               <Search className="w-4 h-4 text-[#787b86] absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#2962FF] transition-colors" />
               
               {/* Search Suggestions Dropdown */}
               {isSearchFocused && searchInput.length > 0 && (
                 <div className="absolute top-full left-0 mt-2 w-full bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-2xl z-50 overflow-hidden">
                    {SUGGESTED_MARKETS.filter(m => m.symbol.toLowerCase().includes(searchInput.toLowerCase()) || m.name.toLowerCase().includes(searchInput.toLowerCase())).slice(0, 6).map(m => (
                       <div 
                         key={m.symbol} 
                         className="px-4 py-2.5 hover:bg-[#2a2e39] cursor-pointer flex justify-between items-center transition-colors"
                         onMouseDown={(e) => {
                           e.preventDefault(); // Prevent onBlur before click
                           setSymbol(m.symbol);
                           setSearchInput(m.symbol);
                           setIsSearchFocused(false);
                           setIsPlaying(false);
                           setPositions([]);
                         }}
                       >
                          <span className="text-[#D1D4DC] font-bold text-sm tracking-wide">{m.symbol}</span>
                          <span className="text-[#787b86] text-xs font-medium">{m.name}</span>
                       </div>
                    ))}
                    {SUGGESTED_MARKETS.filter(m => m.symbol.toLowerCase().includes(searchInput.toLowerCase()) || m.name.toLowerCase().includes(searchInput.toLowerCase())).length === 0 && (
                       <div className="px-4 py-3 text-[#787b86] text-sm text-center">
                         Press Enter to search anyway
                       </div>
                    )}
                 </div>
               )}
             </div>
             <button type="submit" className="hidden">Search</button>
           </form>

           <div className="w-px h-6 bg-[#2a2e39]"></div>
           <div className="text-sm font-semibold text-[#D1D4DC] uppercase tracking-wide">
             {symbol}
           </div>

           <div className="w-px h-6 bg-[#2a2e39]"></div>
           <div className="relative">
             <button 
               onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
               className="text-sm font-semibold text-[#D1D4DC] hover:text-white uppercase tracking-wide px-2 py-1 rounded hover:bg-[#2a2e39] transition-colors"
             >
               {timeframe}
             </button>
             {isTimeframeOpen && (
               <div className="absolute top-full left-0 mt-1 w-24 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col">
                 {TIMEFRAMES.map((t) => (
                   <button
                     key={t.label}
                     onClick={() => {
                       setTimeframe(t.label);
                       setIsTimeframeOpen(false);
                       setIsPlaying(false);
                       setPositions([]);
                     }}
                     className={`px-3 py-2 text-left text-sm font-medium transition-colors ${timeframe === t.label ? 'text-[#2962FF] bg-[#2a2e39]' : 'text-[#D1D4DC] hover:bg-[#2a2e39]'}`}
                   >
                     {t.label}
                   </button>
                 ))}
               </div>
             )}
           </div>

           <div className="w-px h-6 bg-[#2a2e39]"></div>
           <div className="flex bg-[#131722] p-1 rounded-lg border border-[#2a2e39]">
              <button 
                onClick={() => { setMode('live'); setIsPlaying(false); }}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded text-sm font-medium transition-colors ${mode === 'live' ? 'bg-[#2962FF] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'}`}
              >
                <Activity className="w-4 h-4" />
                <span>Live Chart</span>
              </button>
              <button 
                onClick={() => setMode('replay')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded text-sm font-medium transition-colors ${mode === 'replay' ? 'bg-[#089981] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'}`}
              >
                <History className="w-4 h-4" />
                <span>Bar Replay</span>
              </button>
           </div>
        </div>

        {/* Replay Controls (Only visible in replay mode) */}
        {mode === 'replay' && (
          <div className="flex items-center space-x-2 bg-[#2a2e39] rounded-lg p-1">
             <button 
               onClick={() => setIsJumpMode(!isJumpMode)}
               className={`p-1.5 rounded transition-colors ${isJumpMode ? 'bg-[#2962FF] text-white' : 'hover:bg-[#363a45] text-[#D1D4DC] hover:text-white'}`}
               title="Jump To (Select starting point)"
             >
               <Scissors className="w-4 h-4" />
             </button>
             <div className="w-px h-4 bg-[#434651] mx-0.5"></div>
             <button 
               onClick={handleRewind}
               className="p-1.5 rounded hover:bg-[#363a45] text-[#D1D4DC] hover:text-white transition-colors"
               title="Rewind 10 bars"
             >
               <SkipBack className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setIsPlaying(!isPlaying)}
               className={`p-1.5 rounded transition-colors flex items-center space-x-1 ${isPlaying ? 'bg-[#089981]/20 text-[#089981]' : 'hover:bg-[#363a45] text-[#D1D4DC] hover:text-white'}`}
               title="Play / Pause Replay"
             >
               {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
             </button>
             <button 
               onClick={() => setCurrentIndex(prev => Math.min(historicalData.length - 1, prev + 1))}
               className="p-1.5 rounded hover:bg-[#363a45] text-[#D1D4DC] hover:text-white transition-colors"
               title="Forward 1 bar"
             >
               <SkipForward className="w-4 h-4" />
             </button>
             <div className="w-px h-4 bg-[#434651] mx-1"></div>
             <div className="flex items-center group relative px-2 pr-4 text-[#D1D4DC]">
               <span className="text-xs mr-2 border border-[#434651] px-1 rounded">Speed</span>
               <input 
                 type="range" 
                 min="1" 
                 max="5" 
                 value={speed} 
                 onChange={(e) => setSpeed(parseInt(e.target.value))}
                 className="w-20 accent-[#089981] h-1 bg-[#131722] rounded-lg appearance-none cursor-pointer" 
               />
             </div>
          </div>
        )}

        {/* Right tools */}
        <div className="flex items-center space-x-4">
           {mode === 'replay' && (
             <div className="flex items-center space-x-2 bg-[#2a2e39] rounded-lg p-1 mr-2">
                <button 
                  onClick={() => setShowVolume(!showVolume)}
                  className={`px-3 py-1 text-xs font-semibold rounded uppercase tracking-wide transition-colors ${showVolume ? 'bg-[#2962FF] text-white' : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#363a45]'}`}
                  title="Toggle Volume"
                >
                  <div className="flex items-center space-x-1"><BarChart2 className="w-3 h-3"/><span>Vol</span></div>
                </button>
                <button 
                  onClick={() => setShowSMA20(!showSMA20)}
                  className={`px-3 py-1 text-xs font-semibold rounded uppercase tracking-wide transition-colors ${showSMA20 ? 'bg-[#2962FF] text-white' : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#363a45]'}`}
                  title="Toggle SMA 20"
                >
                  <div className="flex items-center space-x-1"><TrendingUp className="w-3 h-3"/><span>SMA 20</span></div>
                </button>
                <button 
                  onClick={() => setShowSMA50(!showSMA50)}
                  className={`px-3 py-1 text-xs font-semibold rounded uppercase tracking-wide transition-colors ${showSMA50 ? 'bg-[#FF9800] text-white' : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#363a45]'}`}
                  title="Toggle SMA 50"
                >
                  <div className="flex items-center space-x-1"><TrendingDown className="w-3 h-3"/><span>SMA 50</span></div>
                </button>
             </div>
           )}
           {mode === 'replay' && (
             <button 
               onClick={() => setIsOrderPanelOpen(!isOrderPanelOpen)}
               className={`px-4 py-1.5 text-sm font-medium rounded transition-colors box-border ${isOrderPanelOpen ? 'bg-[#1E53E5] text-white' : 'bg-[#2962FF] hover:bg-[#1E53E5] text-white'}`}
             >
               Trade Panel
             </button>
           )}
           {mode === 'live' && (
             <button 
               onClick={() => setIsOrderPanelOpen(!isOrderPanelOpen)}
               className={`px-4 py-1.5 text-sm font-medium rounded transition-colors box-border ${isOrderPanelOpen ? 'bg-[#1E53E5] text-white' : 'bg-[#2962FF] hover:bg-[#1E53E5] text-white'}`}
             >
               Trade Panel
             </button>
           )}
        </div>
      </div>

      <div className="flex-1 flex min-h-0 relative">
        {/* Main Chart Area */}
        <div className="flex-1 relative bg-[#131722]">
           <div className="h-full w-full absolute inset-0 flex flex-col">
              <div className="flex-1 relative w-full">
                {mode === 'replay' && isJumpMode && (
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-[#2962FF] text-white px-5 py-2.5 rounded-full shadow-2xl font-medium text-sm animate-bounce pointer-events-none flex items-center space-x-2">
                     <Scissors className="w-4 h-4" />
                     <span>Click anywhere on the chart to select the starting point</span>
                  </div>
                )}
                {isLoading && (
                  <div className="absolute top-4 right-4 z-40 bg-[#1e222d]/90 border border-[#2a2e39] px-4 py-2 rounded-lg shadow-xl flex items-center space-x-3">
                     <div className="w-4 h-4 border-2 border-[#089981] border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-[#D1D4DC] font-mono text-xs font-medium">Fetching data...</p>
                  </div>
                )}
                <div ref={chartContainerRef} className="h-full w-full absolute inset-0" />
                
                {/* Drawing Toolbar */}
                <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-[#1e222d]/90 backdrop-blur-sm border border-[#2a2e39] rounded-lg shadow-xl p-1.5 flex flex-col space-y-1.5 z-20">
                    <button title="Cursor" onClick={() => setActiveDrawTool(null)} className={`p-2 rounded transition-colors ${activeDrawTool === null ? 'bg-[#2962FF]/20 text-[#2962FF]' : 'text-[#787b86] hover:bg-[#363a45] hover:text-[#d1d4dc]'}`}>
                       <MousePointer2 className="w-4 h-4" />
                    </button>
                    <div className="w-full h-px bg-[#434651]"></div>
                    <button title="Trend Line" onClick={() => setActiveDrawTool('TrendLine')} className={`p-2 rounded transition-colors ${activeDrawTool === 'TrendLine' ? 'bg-[#2962FF]/20 text-[#2962FF]' : 'text-[#787b86] hover:bg-[#363a45] hover:text-[#d1d4dc]'}`}>
                       <TrendingUp className="w-4 h-4" />
                    </button>
                    <button title="Fib Retracement" onClick={() => setActiveDrawTool('FibRetracement')} className={`p-2 rounded transition-colors ${activeDrawTool === 'FibRetracement' ? 'bg-[#2962FF]/20 text-[#2962FF]' : 'text-[#787b86] hover:bg-[#363a45] hover:text-[#d1d4dc]'}`}>
                       <AlignEndHorizontal className="w-4 h-4" />
                    </button>
                    <button title="Long Position" onClick={() => setActiveDrawTool('LongPosition')} className={`p-2 rounded transition-colors ${activeDrawTool === 'LongPosition' ? 'bg-[#089981]/20 text-[#089981]' : 'text-[#787b86] hover:bg-[#363a45] hover:text-[#d1d4dc]'}`}>
                       <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button title="Short Position" onClick={() => setActiveDrawTool('ShortPosition')} className={`p-2 rounded transition-colors ${activeDrawTool === 'ShortPosition' ? 'bg-[#F23645]/20 text-[#F23645]' : 'text-[#787b86] hover:bg-[#363a45] hover:text-[#d1d4dc]'}`}>
                       <ArrowDownRight className="w-4 h-4" />
                    </button>
                    <button title="Rectangle" onClick={() => setActiveDrawTool('Rectangle')} className={`p-2 rounded transition-colors ${activeDrawTool === 'Rectangle' ? 'bg-[#2962FF]/20 text-[#2962FF]' : 'text-[#787b86] hover:bg-[#363a45] hover:text-[#d1d4dc]'}`}>
                       <Square className="w-4 h-4" />
                    </button>
                    <div className="w-full h-px bg-[#434651]"></div>
                    <button title="Clear All Drawings" onClick={() => { drawingManagerRef.current?.clearAll(); setActiveDrawTool(null); }} className={`p-2 rounded transition-colors text-[#787b86] hover:bg-[#363a45] hover:text-[#F23645]`}>
                       <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Date Overlay */}
                <div className="absolute top-4 left-16 z-10 font-mono text-sm tracking-wide text-[#787b86] pointer-events-none">
                  {formatDisplayTime(mode === 'replay' ? historicalData[currentIndex]?.time : historicalData[historicalData.length-1]?.time)}
                </div>
                
                {/* Fixed current price indicator */}
                <div className="absolute top-4 right-16 z-10 bg-[#1e222d]/90 border border-[#2a2e39] px-3 py-1.5 rounded-lg shadow-lg flex items-center space-x-2 pointer-events-none">
                   <span className="text-xs text-[#787b86] uppercase font-bold">Price</span>
                   <span className={`font-mono font-medium ${
                     mode === 'replay' 
                       ? (currentIndex > 0 && currentPrice > (historicalData[currentIndex-1]?.close || 0) ? 'text-[#089981]' : currentPrice < (historicalData[currentIndex-1]?.close || 0) ? 'text-[#F23645]' : 'text-[#D1D4DC]')
                       : (historicalData.length > 1 && currentPrice > historicalData[historicalData.length-2].close ? 'text-[#089981]' : historicalData.length > 1 && currentPrice < historicalData[historicalData.length-2].close ? 'text-[#F23645]' : 'text-[#D1D4DC]')
                   }`}>
                     ${currentPrice.toFixed(2)}
                   </span>
                </div>

                {/* Open Positions Overlay */}
                {positions.length > 0 && (
                  <div className="absolute bottom-6 left-4 bg-[#1e222d]/90 backdrop-blur-sm border border-[#2a2e39] rounded-lg shadow-xl p-3 flex flex-col z-20 min-w-[320px]">
                    <h4 className="text-xs font-semibold text-[#787b86] uppercase mb-2">Active Simulator Positions</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {positions.map((pos) => (
                         <div key={pos.id} className="flex items-center justify-between text-sm bg-[#131722]/80 p-2 rounded border border-[#2A2E39]">
                            <div className="flex items-center space-x-2">
                               <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pos.type === 'BUY' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#F23645]/20 text-[#F23645]'}`}>
                                  {pos.type}
                               </span>
                               <span className="font-mono text-[#D1D4DC] text-xs">${pos.entry.toFixed(2)}</span>
                               <span className="text-[#787b86] text-xs">· {pos.lots.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                               <span className={`font-mono text-sm ${pos.pnl >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                                  {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                               </span>
                               <button onClick={() => setPositions(prev => prev.filter(p => p.id !== pos.id))} className="text-[#787B86] hover:text-white hover:bg-[#2A2E39] rounded p-1">
                                  <X className="w-3 h-3" />
                               </button>
                            </div>
                         </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#2A2E39]">
                       <span className="text-xs text-[#787B86]">Total PnL:</span>
                       <span className={`font-mono text-sm font-bold tracking-tight ${totalPnL >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                          {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
                       </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Scrubber */}
              {mode === 'replay' && historicalData.length > 0 && (
                <div className="w-full shrink-0 bg-[#1e222d] border-t border-[#2a2e39] px-6 py-3 z-20 flex flex-col items-center">
                   <div className="text-[10px] text-[#787b86] font-bold uppercase tracking-widest mb-1.5 w-full text-center">
                     Timeline (Click chart to Jump, Play/Pause up top)
                   </div>
                   <div className="w-full flex items-center space-x-4 max-w-4xl">
                      <span className="text-xs text-[#787b86] font-mono w-32 text-right truncate">
                         {formatDisplayTime(historicalData[0]?.time)}
                      </span>
                      <div className="flex-1 relative flex items-center">
                        <input 
                           type="range"
                           min="0"
                           max={historicalData.length - 1}
                           value={currentIndex}
                           onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
                           className="w-full accent-[#089981] h-1.5 hover:h-2 bg-[#131722] rounded-lg appearance-none cursor-pointer transition-all"
                        />
                      </div>
                      <span className="text-xs text-[#D1D4DC] font-mono w-32 text-left font-bold truncate">
                         {formatDisplayTime(historicalData[currentIndex]?.time)}
                      </span>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Right Order Panel - Collapsible (Only in Replay) */}
        {isOrderPanelOpen && (
          <div className="w-80 bg-[#1e222d] border-l border-[#2a2e39] flex flex-col shrink-0 animate-in slide-in-from-right-10 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[#2A2E39]">
              <h3 className="font-semibold text-[#D1D4DC]">Order Entry</h3>
              <button 
                onClick={() => setIsOrderPanelOpen(false)}
                className="text-[#787B86] hover:text-white transition-colors p-1 rounded hover:bg-[#2A2E39]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-5 bg-[#131722]/50 flex-1 overflow-y-auto">
              <div className="flex bg-[#131722] p-1 rounded-lg border border-[#2A2E39] text-sm font-medium">
                <button className="flex-1 py-1.5 bg-[#2A2E39] rounded shadow-[0_1px_2px_rgba(0,0,0,0.5)] text-white">Market</button>
                <button className="flex-1 py-1.5 text-[#787B86] hover:text-[#D1D4DC]" title="Limit orders coming soon">Limit</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#787B86] mb-1.5 block">Quantity</label>
                  <div className="flex items-center bg-[#131722] border border-[#2A2E39] rounded-lg overflow-hidden focus-within:border-[#2962FF] transition-colors">
                     <button onClick={() => setQty(Math.max(0.01, qty - 0.1))} className="px-4 py-2 hover:bg-[#2A2E39] text-[#787B86] transition-colors">-</button>
                     <input 
                        type="number" 
                        value={qty.toFixed(2)} 
                        onChange={(e) => setQty(parseFloat(e.target.value) || 0.01)}
                        step="0.01"
                        className="flex-1 bg-transparent text-center font-mono outline-none py-2 text-[#D1D4DC] text-sm" 
                     />
                     <button onClick={() => setQty(qty + 0.1)} className="px-4 py-2 hover:bg-[#2A2E39] text-[#787B86] transition-colors">+</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => placeOrder('SELL')}
                  className="bg-[#F23645] hover:bg-[#FF4A59] text-white font-semibold py-3 rounded-lg transition-colors flex flex-col items-center active:scale-95"
                >
                  <span className="text-sm tracking-wide">Sell</span>
                  <span className="text-xs opacity-80 font-mono mt-0.5">{currentPrice.toFixed(2)}</span>
                </button>
                <button 
                  onClick={() => placeOrder('BUY')}
                  className="bg-[#089981] hover:bg-[#10B981] text-white font-semibold py-3 rounded-lg transition-colors flex flex-col items-center active:scale-95"
                >
                  <span className="text-sm tracking-wide">Buy</span>
                  <span className="text-xs opacity-80 font-mono mt-0.5">{currentPrice.toFixed(2)}</span>
                </button>
              </div>
            </div>
            
            <div className="border-t border-[#2A2E39] p-4 bg-[#1E222D]">
               <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-[#787B86]">Simulated Equity</span>
                  <span className={`font-mono ${totalPnL < 0 ? 'text-[#F23645]' : 'text-[#D1D4DC]'}`}>
                     ${equity.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits:2})}
                  </span>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
