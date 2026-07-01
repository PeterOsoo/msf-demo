'use client';

import React, { useState } from 'react';

// Define the shape of our form data for TypeScript
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // Reset form on success (keep the payment method as is for UX)
      setFormData({
        name: '', email: '', amount: '', paymentMethod: formData.paymentMethod,
        phoneNumber: '', cardName: '', cardNumber: '', expiry: '', cvc: ''
      });
    } catch (err: any) {
      setStatus({ loading: false, success: null, error: err.message });
    }
  };

  return (
    <div className="w-full bg-white shadow-sm border border-slate-200 rounded-xl p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Personal Information */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-slate-900"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-slate-900"
              placeholder="jane@example.com"
            />
          </div>
        </div>

        {/* Donation Details */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Donation Amount (KSh)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            required
            min="1"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-slate-900"
            placeholder="e.g. 2500"
          />
          <p className="text-xs text-slate-500 mt-1">Tip: Enter 404 to test simulated errors.</p>
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
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-900"
              placeholder="0712 345 678"
            />
          </div>
        )}

        {/* Dynamic Fields: Card */}
        {formData.paymentMethod === 'card' && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-slate-700 mb-1">Name on Card</label>
              <input type="text" id="cardName" name="cardName" required value={formData.cardName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-900" placeholder="Jane Doe" />
            </div>
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
              <input type="text" id="cardNumber" name="cardNumber" required value={formData.cardNumber} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-900" placeholder="0000 0000 0000 0000" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-slate-700 mb-1">Expiry (MM/YY)</label>
                <input type="text" id="expiry" name="expiry" required value={formData.expiry} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-900" placeholder="12/28" />
              </div>
              <div>
                <label htmlFor="cvc" className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                <input type="text" id="cvc" name="cvc" required value={formData.cvc} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-900" placeholder="123" />
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status.loading}
          className={`w-full py-3 px-4 text-white font-bold rounded-lg shadow-sm transition-all ${status.loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:shadow-md active:transform active:scale-[0.99]'}`}
        >
          {status.loading ? 'Processing securely...' : 'Complete Donation'}
        </button>
      </form>
    </div>
  );
} 
