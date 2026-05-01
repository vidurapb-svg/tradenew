import { Activity, TrendingUp, Target as TargetIcon, Clock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const mockEquityData = [
  { day: 'Mon', equity: 100000 },
  { day: 'Tue', equity: 100500 },
  { day: 'Wed', equity: 100200 },
  { day: 'Thu', equity: 101100 },
  { day: 'Fri', equity: 101800 },
  { day: 'Sat', equity: 101800 },
  { day: 'Sun', equity: 102450 },
];

const stats = [
  { name: 'Account Balance', value: '$102,450.00', change: '+2.45%', up: true },
  { name: 'Win Rate', value: '48.5%', change: '-1.2%', up: false },
  { name: 'Profit Factor', value: '1.82', change: '+0.15', up: true },
  { name: 'Active Challenge', value: 'Phase 1', change: '80% passed', up: true },
];

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-ink-muted text-sm mt-1">Check your performance metrics and active challenges.</p>
        </div>
        <button className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
          New Session
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-panel border border-line rounded-xl p-5">
            <p className="text-sm font-medium text-ink-muted">{stat.name}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-semibold">{stat.value}</p>
              <span className={`text-xs font-medium font-mono ${stat.up ? 'text-buy' : 'text-sell'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-panel border border-line rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Equity Curve</h2>
            <div className="flex space-x-2">
              <button className="text-xs font-medium text-ink-muted hover:text-ink px-2 py-1 rounded bg-bg">1W</button>
              <button className="text-xs font-medium text-accent px-2 py-1 rounded bg-bg">1M</button>
              <button className="text-xs font-medium text-ink-muted hover:text-ink px-2 py-1 rounded bg-bg">All</button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockEquityData}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#1E293B" tick={{fill: '#94A3B8', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#1E293B" tick={{fill: '#94A3B8', fontSize: 12}} tickLine={false} axisLine={false} domain={['dataMin - 1000', 'dataMax + 1000']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151924', borderColor: '#1E293B', borderRadius: '8px' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Area type="monotone" dataKey="equity" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-panel border border-line rounded-xl p-5 flex flex-col">
          <h2 className="text-base font-semibold mb-4">Active Challenge</h2>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ink-muted">Profit Target ($8,000)</span>
                <span className="text-buy font-mono">$6,450</span>
              </div>
              <div className="w-full bg-bg rounded-full h-2">
                <div className="bg-buy h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ink-muted">Max Daily Loss ($5,000)</span>
                <span className="text-ink font-mono">$0</span>
              </div>
              <div className="w-full bg-bg rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ink-muted">Max Drawdown ($10,000)</span>
                <span className="text-sell font-mono">-$2,100</span>
              </div>
              <div className="w-full bg-bg rounded-full h-2">
                <div className="bg-sell h-2 rounded-full" style={{ width: '21%' }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-line">
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-muted">Minimum Days (5)</span>
                <span className="text-sm font-medium">3 / 5 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Trades Stub */}
      <div className="bg-panel border border-line rounded-xl p-5">
        <h2 className="text-base font-semibold mb-4">Recent Trades</h2>
        <div className="text-center text-sm text-ink-muted py-8 font-mono border border-dashed border-line rounded-lg">
          [Trade List Table Goes Here]
        </div>
      </div>
    </div>
  );
}
