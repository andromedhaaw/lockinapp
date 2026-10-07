import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Zap, RotateCw, Sparkles, Dices, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

// Fun, cheerful pastel colors for wheel slices (Pink, Hijau Muda, Biru Muda, Kuning, dsb.)
const SLICE_COLORS = [
  '#F472B6', // Pink Pastel
  '#86EFAC', // Hijau Muda Pastel (Mint)
  '#93C5FD', // Biru Muda Pastel (Sky Blue)
  '#FDE047', // Kuning Pastel (Sunshine)
  '#FDBA74', // Oren / Peach Pastel
  '#C4B5FD', // Ungu Muda Pastel (Lavender)
  '#6EE7B7', // Toska Muda Pastel
  '#F9A8D4', // Soft Rose Pink
  '#BAE6FD', // Baby Blue Pastel
  '#FEF08A', // Creamy Butter Yellow
];

// Simple Web Audio API sound effects for dopamine & tactile feedback
const playTickSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(550, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // Ignore audio context errors if browser restricts autoplay
  }
};

const playVictorySound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.26);
    });
  } catch (e) {
    // Ignore
  }
};

const TaskSpinnerModal = ({ isOpen, onClose, tasks = [], onStartTask }) => {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const rotationAngleRef = useRef(0);
  const animFrameRef = useRef(null);
  const lastTickSliceRef = useRef(-1);

  const activeTasks = tasks.filter((t) => !t.completed);
  const numSlices = Math.max(activeTasks.length, 1);
  const arcSize = (2 * Math.PI) / numSlices;

  // Draw the wheel onto the canvas
  const drawWheel = useCallback((currentAngle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 14;

    ctx.clearRect(0, 0, width, height);

    if (activeTasks.length === 0) {
      // Empty wheel placeholder
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#E2E8F0';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#CBD5E1';
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Tidak ada tugas aktif', centerX, centerY);
      return;
    }

    // Draw slices
    for (let i = 0; i < numSlices; i++) {
      const sliceStart = currentAngle + i * arcSize;
      const sliceEnd = sliceStart + arcSize;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, sliceStart, sliceEnd);
      ctx.closePath();

      ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
      ctx.fill();

      // Border between slices
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Text label inside slice (High contrast on pastel background)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(sliceStart + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 12.5px sans-serif';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 4;

      const taskName = activeTasks[i]?.name || `Task ${i + 1}`;
      const truncated = taskName.length > 18 ? taskName.slice(0, 16) + '...' : taskName;
      ctx.fillText(truncated, radius - 18, 5);
      ctx.restore();
    }

    // Outer wheel ring (Clean white border for pastel wheel)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Center hub button circle (Playful pastel center)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#F472B6';
    ctx.stroke();

    // Center icon/text
    ctx.fillStyle = '#DB2777';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN ✨', centerX, centerY);
  }, [activeTasks, arcSize, numSlices]);

  // Initial draw & redraw when tasks change or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTask(null);
      setIsSpinning(false);
      // Small timeout to allow canvas element to render
      const timer = setTimeout(() => {
        drawWheel(rotationAngleRef.current);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, drawWheel]);

  // Spin function with smooth deceleration & tick feedback
  const handleSpin = () => {
    if (isSpinning || activeTasks.length === 0) return;

    setIsSpinning(true);
    setSelectedTask(null);

    // Pick random target task
    const winningIndex = Math.floor(Math.random() * activeTasks.length);
    const targetTask = activeTasks[winningIndex];

    // Pointer is at the top (which is -PI / 2 or 3*PI/2)
    // When pointer points at winning slice, angle must align
    const baseRotations = (6 + Math.floor(Math.random() * 3)) * 2 * Math.PI; // 6 to 8 full spins
    const pointerOffset = 1.5 * Math.PI; // Top indicator (270 deg)
    
    // Middle of the winning slice
    const sliceCenter = winningIndex * arcSize + arcSize / 2;
    const finalTargetAngle = pointerOffset - sliceCenter + baseRotations;

    const startAngle = rotationAngleRef.current % (2 * Math.PI);
    const totalDelta = finalTargetAngle - startAngle;
    const duration = 3800; // 3.8 seconds
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic formula
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + totalDelta * easeOut;

      rotationAngleRef.current = currentAngle;
      drawWheel(currentAngle);

      // Sound tick when passing each slice
      const currentSlice = Math.floor(((pointerOffset - (currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / arcSize);
      if (currentSlice !== lastTickSliceRef.current) {
        lastTickSliceRef.current = currentSlice;
        playTickSound();
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished!
        setIsSpinning(false);
        setSelectedTask(targetTask);
        playVictorySound();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden p-6 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spinner Wheel</span>
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
            Pilih Task dengan Cara Fun
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Otak lagi macet? Biarkan roda yang menentukan tugas pertamamu hari ini secara fun! 🎡
          </p>
        </div>

        {/* Wheel Container */}
        {activeTasks.length > 0 ? (
          <div className="relative flex flex-col items-center my-3">
            {/* Pointer arrow indicator at top (Cute pink pointer) */}
            <div className="absolute top-0 z-20 -translate-y-2 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-pink-500 filter drop-shadow-md"></div>
            </div>

            {/* Canvas Wheel */}
            <div className="relative p-1.5 rounded-full shadow-inner bg-gradient-to-br from-pink-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80">
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                className="rounded-full shadow-lg cursor-pointer transition-transform active:scale-95"
                onClick={handleSpin}
              />
            </div>

            {/* Spin CTA Button */}
            {!selectedTask && (
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="mt-5 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:via-rose-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSpinning ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Memutar Roda Seru...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>PUTAR RODA SEKARANG! 🎡</span>
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="py-8 px-4 my-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
              Belum Ada Tugas Aktif
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Tulis 1 atau 2 tugas di to-do list kamu dulu, baru kita acak tugas mana yang harus disikat lebih dulu.
            </p>
          </div>
        )}

        {/* Selected Task Result & Action Sheet */}
        {selectedTask && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100/60 dark:from-green-950/40 dark:to-emerald-900/30 border border-green-200 dark:border-green-800/50 space-y-3 animate-in zoom-in-95 duration-200 text-center">
            <div className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Target Terpilih!</span>
            </div>

            <div className="text-lg font-extrabold text-gray-900 dark:text-white px-2">
              "{selectedTask.name}"
            </div>

            <p className="text-[11px] text-gray-600 dark:text-gray-300">
              Jangan dipikirkan kerumitannya. Cukup ambil langkah pertama sekarang!
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onStartTask(selectedTask, 25);
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-md shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Mulai Fokus (25m)</span>
              </button>

              <button
                onClick={() => {
                  onStartTask(selectedTask, 2);
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                title="Hanya 2 menit saja. Jika setelah 2 menit masih enggan, boleh berhenti!"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Coba 2 Menit Saja</span>
              </button>
            </div>

            <button
              onClick={handleSpin}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline pt-1 inline-flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" />
              <span>Kurang cocok? Putar ulang</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskSpinnerModal;
