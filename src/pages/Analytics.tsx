import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const mockWinRateData = [
  { pair: 'EURUSD', win: 65, loss: 35 },
  { pair: 'GBPUSD', win: 40, loss: 60 },
  { pair: 'XAUUSD', win: 55, loss: 45 },
  { pair: 'US30', win: 30, loss: 70 },
  { pair: 'AUDUSD', win: 70, loss: 30 },
];

const mockDailyPnL = [
  { day: 'Mon', pnl: -150 },
  { day: 'Tue', pnl: 320 },
  { day: 'Wed', pnl: 450 },
  { day: 'Thu', pnl: -80 },
  { day: 'Fri', pnl: 600 },
];

export function Analytics() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Advanced Analytics</h1>
        <p className="text-ink-muted text-sm mt-1">Deep dive into your trading performance and behavior.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Win Rate by Pair */}
        <div className="bg-panel border border-line rounded-xl p-5">
          <h2 className="text-base font-semibold mb-6">Win Rate by Asset</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockWinRateData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="pair" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#1E2330'}}
                  contentStyle={{ backgroundColor: '#151924', borderColor: '#1E293B', borderRadius: '8px' }}
                />
                <Bar dataKey="win" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} barSize={20} />
                <Bar dataKey="loss" stackId="a" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center items-center space-x-6 mt-4 pt-4 border-t border-line text-sm border-dashed">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-buy rounded-full"></div>
              <span className="text-ink-muted">Win</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-sell rounded-full"></div>
              <span className="text-ink-muted">Loss</span>
            </div>
          </div>
        </div>

        {/* Daily PnL */}
        <div className="bg-panel border border-line rounded-xl p-5">
          <h2 className="text-base font-semibold mb-6">Daily PnL Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDailyPnL} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{fill: '#1E2330'}}
                   contentStyle={{ backgroundColor: '#151924', borderColor: '#1E293B', borderRadius: '8px' }}
                   formatter={(value: number) => [`$${value}`, 'PnL']}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]} barSize={32}>
                   {mockDailyPnL.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Stats Cards */}
         <div className="bg-panel border border-line rounded-xl p-5 flex flex-col justify-center items-center text-center">
            <span className="text-ink-muted text-sm font-medium mb-2">Average Risk:Reward</span>
            <span className="text-3xl font-bold">1:2.4</span>
            <span className="text-buy text-xs font-medium mt-2 bg-buy/10 px-2 py-1 rounded">Excellent</span>
         </div>
         <div className="bg-panel border border-line rounded-xl p-5 flex flex-col justify-center items-center text-center">
            <span className="text-ink-muted text-sm font-medium mb-2">Longest Winning Streak</span>
            <span className="text-3xl font-bold">7</span>
            <span className="text-ink text-xs font-medium mt-2 bg-bg px-2 py-1 rounded border border-line">Trades</span>
         </div>
         <div className="bg-panel border border-line rounded-xl p-5 flex flex-col justify-center items-center text-center">
            <span className="text-ink-muted text-sm font-medium mb-2">Average Hold Time</span>
            <span className="text-3xl font-bold">1h 45m</span>
            <span className="text-ink text-xs font-medium mt-2 bg-bg px-2 py-1 rounded border border-line">Intraday</span>
         </div>
      </div>
    </div>
  );
}
