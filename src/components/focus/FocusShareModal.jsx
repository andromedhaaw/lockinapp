import { useRef } from 'react';
import { Download, Share2, X } from 'lucide-react';
import html2canvas from 'html2canvas';

const FocusShareModal = ({ session, sessionCount, onClose }) => {
  const cardRef = useRef(null);
  const download = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = 'lock-in-focus-session.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white"><Share2 className="h-4 w-4 text-[#4dcd7d]" /> Share your win</div>
          <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">
          <div ref={cardRef} className="space-y-5 rounded-2xl bg-[#f8fbf9] p-6 text-slate-900">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#4dcd7d]">Lock In Work</div>
            <div><div className="text-2xl font-black leading-tight">I showed up today.</div><div className="mt-1 text-sm text-slate-500">Small starts count.</div></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white p-3"><div className="text-xl font-black">{session.durationMinutes}m</div><div className="text-[10px] font-bold uppercase text-slate-400">Focus</div></div>
              <div className="rounded-xl bg-white p-3"><div className="text-xl font-black">{sessionCount}</div><div className="text-[10px] font-bold uppercase text-slate-400">Sessions</div></div>
              <div className="rounded-xl bg-white p-3"><div className="text-xl">🌱</div><div className="text-[10px] font-bold uppercase text-slate-400">{session.rewardPlantId}</div></div>
            </div>
            <div className="text-xs font-semibold text-slate-400">lock-in-work.andromedhaches.chatgpt.site · Start small. Keep going.</div>
          </div>
          <button onClick={download} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4dcd7d] px-4 py-3 text-sm font-extrabold text-white"><Download className="h-4 w-4" /> Download share card</button>
        </div>
      </div>
    </div>
  );
};

export default FocusShareModal;
