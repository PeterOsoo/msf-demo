import DonationForm from './components/DonationForm';
import SecurityBanner from './components/SecurityBanner';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 md:p-8 selection:bg-red-200">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Organization Header */}
        <div className="text-center space-y-1 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-red-600 uppercase">
            Médecins Sans Frontières
          </h1>
          <h2 className="text-sm md:text-base font-bold text-slate-700 uppercase tracking-widest">
            Doctors Without Borders
          </h2>
          <p className="text-slate-500 mt-4 text-sm">
            Eastern Africa Digital Donations Portal
          </p>
        </div>

        {/* Main Interactive Form */}
        <DonationForm />

        {/* Security Trust Assurance */}
        <SecurityBanner />

      </div>
    </main>
  );
}