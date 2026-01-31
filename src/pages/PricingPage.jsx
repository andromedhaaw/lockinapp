import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';

const PricingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Simple Nav */}
      <nav className="p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="font-bold text-xl cursor-pointer" onClick={() => navigate('/')}>LockIn.</div>
          <button onClick={() => navigate('/app')} className="text-sm font-medium hover:text-green-600">Login</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">An Investment, Not a Cost.</h1>
          <p className="text-xl text-gray-500">How much is one hour of deep work worth to you?</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          
          {/* Free Tier */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Visitor</h3>
            <div className="text-4xl font-bold mb-6">$0</div>
            <p className="text-sm text-gray-500 mb-8">Good for dipping your toes.</p>
            
            <button onClick={() => navigate('/app')} className="w-full py-3 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors mb-8">
              Start Free
            </button>

            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex gap-3"><Check className="w-5 h-5 text-gray-400" /> Basic Timer</li>
              <li className="flex gap-3"><Check className="w-5 h-5 text-gray-400" /> Simple Tasks</li>
              <li className="flex gap-3"><X className="w-5 h-5 text-gray-300" /> No Leaderboard</li>
              <li className="flex gap-3"><X className="w-5 h-5 text-gray-300" /> No Analytics</li>
            </ul>
          </div>

          {/* Pro Tier (Highlighted) */}
          <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 text-white relative shadow-2xl scale-105 z-10">
            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
              POPULAR
            </div>
            <h3 className="text-lg font-bold mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-6">$5<span className="text-lg font-normal text-gray-400">/mo</span></div>
            <p className="text-sm text-gray-400 mb-8">For builders who ship.</p>
            
            <button onClick={() => navigate('/app')} className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-900/20 mb-8">
              Get Started
            </button>

            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex gap-3"><Check className="w-5 h-5 text-green-400" /> Everything in Free</li>
              <li className="flex gap-3"><Check className="w-5 h-5 text-green-400" /> Global Leaderboard</li>
              <li className="flex gap-3"><Check className="w-5 h-5 text-green-400" /> Advanced Analytics</li>
              <li className="flex gap-3"><Check className="w-5 h-5 text-green-400" /> Social Notifications</li>
              <li className="flex gap-3"><Check className="w-5 h-5 text-green-400" /> Goal Setting</li>
            </ul>
          </div>

          {/* Lifetime Tier */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Believer</h3>
            <div className="text-4xl font-bold mb-6">$50</div>
            <p className="text-sm text-gray-500 mb-8">Pay once, own it forever.</p>
            
            <button onClick={() => navigate('/app')} className="w-full py-3 bg-white border-2 border-gray-100 text-gray-900 rounded-xl font-bold hover:border-gray-900 transition-colors mb-8">
              Buy Lifetime
            </button>

            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex gap-3"><Check className="w-5 h-5 text-gray-400" /> All Pro Features</li>
              <li className="flex gap-3"><Check className="w-5 h-5 text-gray-400" /> Future Updates</li>
              <li className="flex gap-3"><Check className="w-5 h-5 text-gray-400" /> Founder's Badge</li>
              <li className="flex gap-3"><Check className="w-5 h-5 text-gray-400" /> Priority Support</li>
            </ul>
          </div>

        </div>

        {/* FAQ - Ogilvy style */}
        <div className="mt-32 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Honest Answers</h2>
          
          <div className="space-y-8">
            <div>
              <h4 className="font-bold text-lg mb-2">Why should I pay for a timer?</h4>
              <p className="text-gray-600">You aren't paying for a timer. You are paying for the system that forces you to use it. If you spend $5, you will feel obligated to work. That's the hack.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Can I cancel?</h4>
              <p className="text-gray-600">Yes, instantly. No questions asked. We don't want your money if you aren't shipping.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PricingPage;
