import { Search, Filter, Download } from 'lucide-react';

const MOCK_TRADES = [
  { id: 'TRD-1092', pair: 'EURUSD', type: 'BUY', size: 2.5, entry: 1.08241, exit: 1.08310, pnl: 172.50, date: '2023-10-25 14:22:00', duration: '45m' },
  { id: 'TRD-1091', pair: 'GBPUSD', type: 'SELL', size: 1.0, entry: 1.21500, exit: 1.21650, pnl: -150.00, date: '2023-10-24 09:15:00', duration: '2h 10m' },
  { id: 'TRD-1090', pair: 'XAUUSD', type: 'BUY', size: 0.5, entry: 1980.50, exit: 1988.00, pnl: 375.00, date: '2023-10-24 08:30:00', duration: '1h 20m' },
  { id: 'TRD-1089', pair: 'US30', type: 'SELL', size: 0.1, entry: 33100, exit: 33050, pnl: 50.00, date: '2023-10-23 15:45:00', duration: '15m' },
  { id: 'TRD-1088', pair: 'EURUSD', type: 'BUY', size: 2.0, entry: 1.08000, exit: 1.07920, pnl: -160.00, date: '2023-10-22 11:10:00', duration: '3h 5m' },
  { id: 'TRD-1087', pair: 'AUDUSD', type: 'SELL', size: 3.0, entry: 0.63500, exit: 0.63200, pnl: 900.00, date: '2023-10-21 18:00:00', duration: '4h 30m' },
];

export function TradeHistory() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trade Journal</h1>
          <p className="text-ink-muted text-sm mt-1">Review your past trades and journal entries.</p>
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 bg-panel border border-line hover:bg-panel-hover px-4 py-2 rounded-md font-medium text-sm transition-colors text-ink">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 bg-panel border border-line hover:bg-panel-hover px-4 py-2 rounded-md font-medium text-sm transition-colors text-ink">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-panel border border-line rounded-xl overflow-hidden flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-line flex items-center space-x-3 bg-bg/50">
          <Search className="w-5 h-5 text-ink-muted" />
          <input 
            type="text" 
            placeholder="Search by pair, ID, or notes..." 
            className="bg-transparent border-none outline-none flex-1 text-sm text-ink placeholder-ink-muted"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg/50 border-b border-line">
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Ticket</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Asset</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Size</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Entry</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Exit</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider text-right">PnL</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider text-right pl-8">Date/Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {MOCK_TRADES.map((trade) => (
                <tr key={trade.id} className="hover:bg-panel-hover transition-colors group cursor-pointer">
                  <td className="py-3 px-4 text-sm font-mono text-ink-muted">{trade.id}</td>
                  <td className="py-3 px-4 text-sm font-bold">{trade.pair}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold leading-4 ${
                      trade.type === 'BUY' ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-mono">{trade.size.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm font-mono text-ink-muted">{trade.entry}</td>
                  <td className="py-3 px-4 text-sm font-mono text-ink-muted">{trade.exit}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm font-mono font-medium ${trade.pnl >= 0 ? 'text-buy' : 'text-sell'}`}>
                      {trade.pnl >= 0 ? '+' : '-'}${Math.abs(trade.pnl).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right pl-8">
                    <div className="flex flex-col items-end">
                       <span className="text-sm font-mono">{trade.date.split(' ')[0]}</span>
                       <span className="text-xs text-ink-muted font-mono">{trade.date.split(' ')[1]}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Stub */}
        <div className="p-4 border-t border-line flex items-center justify-between bg-bg/50 text-sm">
           <span className="text-ink-muted">Showing 1 to 6 of 124 trades</span>
           <div className="flex space-x-1">
              <button className="px-3 py-1 bg-panel border border-line rounded text-ink-muted hover:text-ink disabled:opacity-50" disabled>Prev</button>
              <button className="px-3 py-1 bg-accent border border-accent rounded text-white">1</button>
              <button className="px-3 py-1 bg-panel border border-line rounded text-ink-muted hover:text-ink">2</button>
              <button className="px-3 py-1 bg-panel border border-line rounded text-ink-muted hover:text-ink">3</button>
              <button className="px-3 py-1 bg-panel border border-line rounded text-ink-muted hover:text-ink">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
}
