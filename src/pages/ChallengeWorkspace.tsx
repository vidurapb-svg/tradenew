import { Target, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function ChallengeWorkspace() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Active Challenges</h1>
        <p className="text-ink-muted text-sm mt-1">Monitor your progression through the evaluation phases.</p>
      </div>

      <div className="bg-panel rounded-xl border border-line overflow-hidden">
        <div className="p-6 border-b border-line flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold">Standard 100k Evaluation</h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-accent text-white">Phase 1</span>
            </div>
            <p className="text-ink-muted mt-1 text-sm">Account: #SIM-CHAL-8921</p>
          </div>
          <div className="flex space-x-3 text-sm">
            <div className="bg-bg border border-line px-4 py-2 rounded-lg flex flex-col items-center">
              <span className="text-ink-muted text-xs uppercase font-semibold">Start Date</span>
              <span className="font-mono mt-1">Oct 12, 2023</span>
            </div>
            <div className="bg-bg border border-line px-4 py-2 rounded-lg flex flex-col items-center">
              <span className="text-ink-muted text-xs uppercase font-semibold">End Date</span>
              <span className="font-mono mt-1">Nov 11, 2023</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-semibold text-lg border-b border-line pb-2">Trading Objectives</h3>
              
              <div className="space-y-5">
                {/* Profit Target */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-ink-muted" />
                      <span className="font-medium">Profit Target (8%)</span>
                    </div>
                    <span className="font-mono text-sm">$8,000.00 / $6,450.00</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-bg rounded-full h-2.5 overflow-hidden border border-line">
                      <div className="bg-buy h-full" style={{ width: '80%' }}></div>
                    </div>
                    <span className="text-xs font-mono text-ink-muted w-8 text-right">80%</span>
                  </div>
                </div>

                {/* Minimum Trading Days */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-buy" />
                      <span className="font-medium">Minimum Trading Days</span>
                    </div>
                    <span className="font-mono text-sm">5 / 5 Days</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-bg rounded-full h-2.5 overflow-hidden border border-line">
                      <div className="bg-buy h-full" style={{ width: '100%' }}></div>
                    </div>
                    <span className="text-xs font-mono text-buy w-8 text-right font-bold">Passed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-semibold text-lg border-b border-line pb-2">Loss Limits</h3>
              
              <div className="space-y-5">
                {/* Daily Loss */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-accent" />
                      <span className="font-medium">Max Daily Loss (5%)</span>
                    </div>
                    <span className="font-mono text-sm text-ink-muted">Allowed: $5,000 / Current: $0</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-bg rounded-full h-2.5 overflow-hidden border border-line">
                      <div className="bg-accent h-full" style={{ width: '5%' }}></div>
                    </div>
                    <span className="text-xs font-mono text-ink-muted w-8 text-right">Safe</span>
                  </div>
                </div>

                {/* Max Drawdown */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-5 h-5 text-sell" />
                      <span className="font-medium">Max Drawdown (10%)</span>
                    </div>
                    <span className="font-mono text-sm text-ink-muted">Allowed: $10,000 / Current: $2,100</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-bg rounded-full h-2.5 overflow-hidden border border-line">
                      <div className="bg-sell h-full" style={{ width: '21%' }}></div>
                    </div>
                    <span className="text-xs font-mono text-ink-muted w-8 text-right">Safe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Templates List */}
      <div>
         <h2 className="text-lg font-semibold tracking-tight mb-4 mt-8">Available Challenge Templates</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { size: '50K', title: 'Standard Evaluation', fee: 'Free (Simulated)', target: '8%', daily: '5%', max: '10%' },
              { size: '100K', title: 'Pro Evaluation', fee: 'Free (Simulated)', target: '10%', daily: '5%', max: '12%' },
              { size: '200K', title: 'Elite Evaluation', fee: 'Free (Simulated)', target: '10%', daily: '4%', max: '8%' },
            ].map(t => (
               <div key={t.size} className="bg-panel border border-line rounded-xl p-5 hover:border-accent transition-colors cursor-pointer group">
                  <div className="flex justify-between items-end mb-4 border-b border-line pb-4">
                     <div>
                        <h3 className="text-2xl font-bold">{t.size}</h3>
                        <p className="text-sm text-ink-muted mt-1">{t.title}</p>
                     </div>
                     <span className="text-xs font-semibold bg-bg px-2 py-1 rounded text-ink-muted">{t.fee}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                     <div className="flex justify-between">
                        <span className="text-ink-muted">Profit Target</span>
                        <span className="font-mono">{t.target}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-ink-muted">Max Daily Loss</span>
                        <span className="font-mono">{t.daily}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-ink-muted">Max Drawdown</span>
                        <span className="font-mono">{t.max}</span>
                     </div>
                  </div>
                  <button className="w-full mt-6 py-2.5 bg-bg group-hover:bg-accent group-hover:text-white rounded-md text-sm font-semibold transition-colors border border-line group-hover:border-transparent">
                     Start Challenge
                  </button>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
