import { useRef } from 'react';
import { Download, X, Share2, Flame, Trophy } from 'lucide-react';
import html2canvas from 'html2canvas';

const ShareModal = ({ isOpen, onClose, stats }) => {
  const cardRef = useRef(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#10B981', // green-500 background
      });
      
      const link = document.createElement('a');
      link.download = 'lock-in-stats.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Share Your Progress</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-6">
          {/* Share Card */}
          <div 
            ref={cardRef}
            className="w-full aspect-[4/5] bg-gradient-to-br from-green-500 to-emerald-700 p-8 rounded-xl text-white flex flex-col justify-between relative shadow-lg"
          >
            {/* Design Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <div className="font-bold tracking-wider text-sm uppercase">Lock In Work</div>
              </div>
              <h2 className="text-3xl font-bold leading-tight">
                I just Locked In for {stats.sessionHours} hours today.
              </h2>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-100 mb-1">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Streak</span>
                </div>
                <div className="text-2xl font-bold">{stats.streak} Days</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-100 mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Level</span>
                </div>
                <div className="text-2xl font-bold">{stats.level}</div>
              </div>
            </div>

            <div className="relative z-10 text-center opacity-70 text-sm">
              Can you beat my focus?
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
