'use client';

import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  amount: string;
  paymentMethod: 'mpesa' | 'card';
  phoneNumber: string;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

export default function DonationForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    amount: '',
    paymentMethod: 'mpesa',
    phoneNumber: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const [status, setStatus] = useState({
    loading: false,
    success: null as string | null,
    error: null as string | null
  });

  // Dynamic Validation Check
  const isFormValid = (() => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.amount) return false;
    
    if (formData.paymentMethod === 'mpesa') {
      if (!/^0\d{9}$/.test(formData.phoneNumber.trim())) return false;
    }
    
    if (formData.paymentMethod === 'card') {
      const cleanCardNumber = formData.cardNumber.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(cleanCardNumber)) return false;

      // Expiry syntax rule check
      if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiry.trim())) return false;

      // Real-time logical future date check
      const [inputMonth, inputYear] = formData.expiry.split('/').map(Number);
      if (inputMonth && inputYear) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // Months are 0-indexed
        const currentYear = now.getFullYear() % 100; // Get last 2 digits of year (e.g., 26)

        if (inputYear < currentYear) return false;
        if (inputYear === currentYear && inputMonth < currentMonth) return false;
      }

      if (!/^\d{3}$/.test(formData.cvc.trim())) return false;
      if (!formData.cardName.trim()) return false;
    }
    return true;
  })();

  // Smart input masking handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // 1. Masking for Card Number (Auto-space every 4 digits, max 16 digits)
    if (name === 'cardNumber') {
      const numericValue = value.replace(/\D/g, '').slice(0, 16);
      const maskedValue = numericValue.match(/.{1,4}/g)?.join(' ') || numericValue;
      setFormData((prev) => ({ ...prev, [name]: maskedValue }));
      return;
    }

    // 2. Masking for Expiry Date (Auto-insert slash, max 5 characters MM/YY)
    if (name === 'expiry') {
      let cleanValue = value.replace(/\D/g, '').slice(0, 4);
      if (cleanValue.length > 2) {
        cleanValue = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
      }
      setFormData((prev) => ({ ...prev, [name]: cleanValue }));
      return;
    }

    // 3. Masking for CVC (Max 3 digits)
    if (name === 'cvc') {
      const numericValue = value.replace(/\D/g, '').slice(0, 3);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return; 

    setStatus({ loading: true, success: null, error: null });

    try {
      const response = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setStatus({ loading: false, success: data.message, error: null });
      setFormData({
        name: '', email: '', amount: '', paymentMethod: formData.paymentMethod,
        phoneNumber: '', cardName: '', cardNumber: '', expiry: '', cvc: ''
      });
    } catch (err: any) {
      setStatus({ loading: false, success: null, error: err.message });
    }
  };

  return (
    <>
      <div className="w-full bg-white shadow-sm border border-slate-200 rounded-xl p-6 sm:p-8 relative">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-slate-900" placeholder="Jane Doe" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-slate-900" placeholder="jane@example.com" />
            </div>
          </div>

          {/* Donation Details */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Donation Amount (KSh)</label>
            <input type="number" id="amount" name="amount" required min="1" value={formData.amount} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-slate-900" placeholder="e.g. 2500" />
            <p className="text-xs text-slate-500 mt-1">Tip: Use 404 for Gateway Error, or 408 for M-Pesa Timeout.</p>
          </div>

          {/* Payment Method Toggle */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'mpesa' ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <input type="radio" name="paymentMethod" value="mpesa" checked={formData.paymentMethod === 'mpesa'} onChange={handleChange} className="sr-only" />
                <span className="text-sm font-semibold">M-Pesa</span>
              </label>
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} className="sr-only" />
                <span className="text-sm font-semibold">Credit / Debit Card</span>
              </label>
            </div>
          </div>

          {/* Dynamic Fields: M-Pesa */}
          {formData.paymentMethod === 'mpesa' && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-1">M-Pesa Phone Number</label>
              <input type="tel" id="phoneNumber" name="phoneNumber" required maxLength={10} value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-900" placeholder="0722777222" />
              <p className="text-xs text-slate-500 mt-1">Must be exactly 10 digits starting with 0.</p>
            </div>
          )}

          {/* Dynamic Fields: Card */}
          {formData.paymentMethod === 'card' && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-slate-700 mb-1">Name on Card</label>
                <input type="text" id="cardName" name="cardName" required={formData.paymentMethod === 'card'} value={formData.cardName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-900" placeholder="Jane Doe" />
              </div>
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                <input type="text" id="cardNumber" name="cardNumber" required={formData.paymentMethod === 'card'} value={formData.cardNumber} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-900" placeholder="0000 0000 0000 0000" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-slate-700 mb-1">Expiry (MM/YY)</label>
                  <input type="text" id="expiry" name="expiry" required={formData.paymentMethod === 'card'} value={formData.expiry} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-900" placeholder="12/28" />
                </div>
                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                  <input type="text" id="cvc" name="cvc" required={formData.paymentMethod === 'card'} value={formData.cvc} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-900" placeholder="123" />
                </div>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {status.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
              {status.error}
            </div>
          )}
          {status.success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium">
              {status.success}
            </div>
          )}

          {/* Dynamically Styled Submit Button */}
          <button
            type="submit"
            disabled={status.loading || !isFormValid}
            className={`w-full flex items-center justify-center py-3 px-4 font-bold rounded-lg transition-all duration-200 ${
              !isFormValid || status.loading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md active:transform active:scale-[0.99]'
            }`}
          >
            {status.loading && formData.paymentMethod === 'card' ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Card...
              </>
            ) : status.loading && formData.paymentMethod === 'mpesa' ? (
              'Awaiting M-Pesa...'
            ) : (
              'Complete Donation'
            )}
          </button>
        </form>
      </div>

      {/* M-PESA STK PUSH SIMULATION MODAL */}
      {status.loading && formData.paymentMethod === 'mpesa' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-600 animate-pulse">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900">Check your phone</h3>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              We have sent a payment request to <br/>
              <span className="font-bold text-slate-900 text-base">{formData.phoneNumber}</span>
            </p>
            
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg mt-2">
              <p className="text-xs text-slate-600 font-medium">
                Please enter your M-Pesa PIN on your phone to confirm the payment of <span className="font-bold text-emerald-700">KSh {formData.amount}</span>.
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center pt-4">
              <svg className="animate-spin h-6 w-6 text-emerald-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Awaiting Confirmation...</p>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}