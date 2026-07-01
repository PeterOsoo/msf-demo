import React from 'react';

export default function SecurityBanner() {
  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start space-x-3 mt-6 shadow-sm">
      <div className="text-emerald-600 mt-0.5 shrink-0">
        {/* Secure Shield Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-800">Your transaction is completely secure</h4>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          This portal uses standard encryption to safely process your submission. We do not store your M-Pesa PIN or complete Card details on our servers.
        </p>
      </div>
    </div>
  );
} 
