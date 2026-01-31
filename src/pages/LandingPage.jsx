import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Zap, Shield, Trophy, Users, Clock, TrendingUp } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-green-100 selection:text-green-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            LockIn.
          </div>
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/pricing')} className="text-sm font-medium hover:text-green-600 transition-colors">Pricing</button>
            <button onClick={() => navigate('/login')} className="text-sm font-medium hover:text-green-600 transition-colors">Login</button>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition-all hover:scale-105 active:scale-95"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Ogilvy Style: Lead with the benefit */}
      <section className="pt-32 pb-16 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center">
          {/* Specific claim - Ogilvy believed in specificity */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Users className="w-4 h-4" />
            2,847 professionals tracked 14,392 hours last week
          </div>
          
          {/* Headline - Promise a benefit */}
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
            How To Do 4 Hours of Deep Work<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Every Single Day</span>
          </h1>
          
          {/* Subheadline - Expand on the promise */}
          <p className="text-xl text-gray-600 max-w-2xl mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            The average knowledge worker manages only 2.5 hours of real work per day. 
            Our users average 4.2 hours. The secret? <strong>Social accountability</strong> and 
            <strong> friendly competition</strong>.
          </p>

          {/* CTA - Clear, action-oriented */}
          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
            <button 
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-green-200 hover:bg-green-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              Try Free for 14 Days <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/app')}
              className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              See Live Demo
            </button>
          </div>

          {/* Social Proof - Ogilvy: Use testimonials */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500 animate-in fade-in duration-1000 delay-500">
             <div className="flex -space-x-3">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                   {['ML', 'PL', 'NB', 'IH', 'SK'][i-1]}
                 </div>
               ))}
             </div>
             <div className="text-left">
               <div className="font-semibold text-gray-800">"I shipped my SaaS in 6 weeks instead of 6 months."</div>
               <div className="text-gray-500">— Marc L., Indie Hacker</div>
             </div>
          </div>
        </div>
      </section>

      {/* Feature Screenshots Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Stay Focused</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Five powerful features that turn procrastinators into top performers.
            </p>
          </div>

          {/* First Row - 3 Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Timer Feature */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow group">
              <div className="aspect-square bg-gray-900 flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/timer.png" 
                  alt="Deep Work Timer" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-green-600 font-semibold text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  DEEP WORK TIMER
                </div>
                <h3 className="text-xl font-bold mb-2">Track Every Minute</h3>
                <p className="text-gray-600 text-sm">
                  One-click start. See your hours stack up. Know exactly where your time goes.
                </p>
              </div>
            </div>

            {/* Leaderboard Feature */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow group">
              <div className="aspect-square bg-gray-900 flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/leaderboard.png" 
                  alt="Competitive Leaderboard" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm mb-2">
                  <Trophy className="w-4 h-4" />
                  LEADERBOARD
                </div>
                <h3 className="text-xl font-bold mb-2">Compete With Peers</h3>
                <p className="text-gray-600 text-sm">
                  Nothing motivates like seeing your rival outwork you. Climb the ranks weekly.
                </p>
              </div>
            </div>

            {/* Live Feed Feature */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow group">
              <div className="aspect-square bg-gray-900 flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/livefeed.png" 
                  alt="Live Activity Feed" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-2">
                  <TrendingUp className="w-4 h-4" />
                  LIVE FEED
                </div>
                <h3 className="text-xl font-bold mb-2">Social Accountability</h3>
                <p className="text-gray-600 text-sm">
                  See when others are working. Get encouraged. Never feel alone in the grind.
                </p>
              </div>
            </div>
          </div>

          {/* Second Row - 2 Larger Features */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Productivity Graph - HIGHLIGHTED */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl border-2 border-green-200 overflow-hidden hover:shadow-2xl transition-shadow group relative">
              <div className="absolute top-4 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                ⭐ MOST LOVED
              </div>
              <div className="aspect-video bg-gray-900 flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/graph.png" 
                  alt="Productivity Analytics Graph" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-green-600 font-semibold text-sm mb-2">
                  <TrendingUp className="w-4 h-4" />
                  ANALYTICS DASHBOARD
                </div>
                <h3 className="text-xl font-bold mb-2">Beautiful Productivity Graphs</h3>
                <p className="text-gray-600 text-sm">
                  See your weekly progress at a glance. Watch those green bars grow. Average 4.2h daily hours, 85% focus score—know your numbers.
                </p>
              </div>
            </div>

            {/* History Tracker */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow group">
              <div className="aspect-video bg-gray-900 flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/history.png" 
                  alt="Work History Log" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  WORK HISTORY
                </div>
                <h3 className="text-xl font-bold mb-2">Every Session Logged</h3>
                <p className="text-gray-600 text-sm">
                  Browse your work history by day, week, or month. See session counts, total hours, and build your streak.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Works Section - Ogilvy: Explain the mechanism */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Psychology Behind LockIn</h2>
            <p className="text-gray-600">
              We don't just track time. We engineer an environment where deep work is inevitable.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                number: "01",
                title: "Public Commitment Effect",
                description: "When you set a goal that others can see, you're 65% more likely to complete it. That's not motivation—that's social psychology."
              },
              {
                number: "02", 
                title: "Friendly Competition",
                description: "The leaderboard triggers your competitive instinct. Suddenly, 'one more hour' becomes 'I need to beat Sarah's streak.'"
              },
              {
                number: "03",
                title: "Positive Reinforcement",
                description: "Every session ends with encouragement. We celebrate what you did, not shame what you didn't. Progress begets progress."
              }
            ].map((item) => (
              <div key={item.number} className="flex gap-6 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                <div className="text-4xl font-bold text-green-200">{item.number}</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Ogilvy: Repeat the offer */}
      <section className="py-20 bg-green-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Double Your Deep Work Hours?
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Join 2,847 professionals who've stopped "trying to be productive" and started actually being productive.
          </p>
          <button 
            onClick={() => navigate('/signup')}
            className="px-10 py-4 bg-white text-green-700 rounded-xl font-bold text-lg shadow-xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95"
          >
            Start Your Free 14-Day Trial
          </button>
          <p className="mt-4 text-green-200 text-sm">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-sm text-gray-500">
          <p>© 2026 LockIn Inc. — Built for focused professionals.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900">Twitter</a>
            <a href="#" className="hover:text-gray-900">Manifesto</a>
            <button onClick={() => navigate('/login')} className="hover:text-gray-900">Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
