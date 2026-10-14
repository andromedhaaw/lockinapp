import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Check, Play, RotateCw, Sparkles, X, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const SLICE_COLORS = ['#F7A8C4', '#8ADCAD', '#91C8F6', '#F2D66B', '#F3AD79', '#B7A4ED'];
const TAU = Math.PI * 2;

const taskLabel = (task, index = 0) => task?.name || task?.title || `Task ${index + 1}`;

const TaskSpinnerModal = ({ isOpen, onClose, tasks = [], onStartTask }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const rotationRef = useRef(-Math.PI / 2);
  const lastTickRef = useRef(-1);
  const audioContextRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const activeTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const sliceCount = Math.max(activeTasks.length, 1);
  const sliceAngle = TAU / sliceCount;

  const drawWheel = useCallback((rotation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    context.clearRect(0, 0, size, size);

    if (activeTasks.length === 0) {
      context.beginPath();
      context.arc(center, center, radius, 0, TAU);
      context.fillStyle = '#F0F1EE';
      context.fill();
      context.strokeStyle = '#DFE3DE';
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = '#748078';
      context.font = '600 14px Inter, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('No active tasks', center, center);
      return;
    }

    activeTasks.forEach((task, index) => {
      const start = rotation + index * sliceAngle;
      const end = start + sliceAngle;

      context.beginPath();
      context.moveTo(center, center);
      context.arc(center, center, radius, start, end);
      context.closePath();
      context.fillStyle = SLICE_COLORS[index % SLICE_COLORS.length];
      context.fill();
      context.strokeStyle = '#FFFFFF';
      context.lineWidth = 3;
      context.stroke();

      context.save();
      context.translate(center, center);
      context.rotate(start + sliceAngle / 2);
      const upsideDown = Math.cos(start + sliceAngle / 2) < 0;
      if (upsideDown) context.rotate(Math.PI);
      context.fillStyle = '#17211B';
      context.font = '700 12px Inter, sans-serif';
      context.textAlign = upsideDown ? 'left' : 'right';
      context.textBaseline = 'middle';
      const label = taskLabel(task, index);
      context.fillText(label.length > 19 ? `${label.slice(0, 17)}...` : label, upsideDown ? -radius + 24 : radius - 24, 0);
      context.restore();
    });

    context.beginPath();
    context.arc(center, center, radius, 0, TAU);
    context.strokeStyle = '#17211B';
    context.lineWidth = 3;
    context.stroke();

    context.beginPath();
    context.arc(center, center, 29, 0, TAU);
    context.fillStyle = '#FFFFFF';
    context.fill();
    context.strokeStyle = '#17211B';
    context.lineWidth = 3;
    context.stroke();
    context.fillStyle = '#17211B';
    context.font = '800 10px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('SPIN', center, center);
  }, [activeTasks, sliceAngle]);

  const playTick = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audio = audioContextRef.current;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(620, audio.currentTime);
      gain.gain.setValueAtTime(0.025, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.025);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.03);
    } catch {
      // Sound is optional and may be blocked by the browser.
    }
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    setSelectedTask(null);
    setIsSpinning(false);
    const frame = requestAnimationFrame(() => drawWheel(rotationRef.current));
    return () => cancelAnimationFrame(frame);
  }, [isOpen, drawWheel]);

  useEffect(() => stopAnimation, [stopAnimation]);

  const closeModal = () => {
    stopAnimation();
    setIsSpinning(false);
    onClose();
  };

  const handleSpin = () => {
    if (isSpinning || activeTasks.length === 0) return;

    stopAnimation();
    setSelectedTask(null);
    setIsSpinning(true);
    lastTickRef.current = -1;

    const winnerIndex = Math.floor(Math.random() * activeTasks.length);
    const winner = activeTasks[winnerIndex];
    const start = rotationRef.current;
    const startNormalized = ((start % TAU) + TAU) % TAU;
    const winnerCenter = winnerIndex * sliceAngle + sliceAngle / 2;
    const targetNormalized = ((-Math.PI / 2 - winnerCenter) % TAU + TAU) % TAU;
    const extraTurns = 4 + Math.floor(Math.random() * 2);
    const deltaToTarget = (targetNormalized - startNormalized + TAU) % TAU;
    const finish = start + extraTurns * TAU + deltaToTarget;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 650 : 2200;
    const startedAt = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const rotation = start + (finish - start) * eased;
      rotationRef.current = rotation;
      drawWheel(rotation);

      const pointerSlice = Math.floor((((-Math.PI / 2 - rotation) % TAU + TAU) % TAU) / sliceAngle);
      if (pointerSlice !== lastTickRef.current && progress < 0.93) {
        lastTickRef.current = pointerSlice;
        playTick();
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      animationRef.current = null;
      rotationRef.current = finish;
      setIsSpinning(false);
      setSelectedTask(winner);
      confetti({ particleCount: 28, spread: 48, startVelocity: 18, scalar: 0.7, origin: { y: 0.55 } });
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[140] grid place-items-center overflow-y-auto bg-[#17211b]/35 p-4 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-spinner-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section className="relative my-auto w-full max-w-[520px] overflow-hidden rounded-2xl border border-[#e2e5e0] bg-white shadow-[0_24px_80px_rgba(23,33,27,.22)]">
        <header className="flex items-start justify-between gap-4 border-b border-[#e9e7e1] px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#8b6cd9]">
              <Sparkles className="h-3.5 w-3.5" /> Decision helper
            </div>
            <h2 id="task-spinner-title" className="mt-1.5 text-2xl font-extrabold tracking-[-.035em] text-[#17211b]">Pick the next task</h2>
            <p className="mt-1 text-xs leading-relaxed text-[#748078]">One spin, one clear next action.</p>
          </div>
          <button type="button" onClick={closeModal} className="rounded-lg p-2 text-[#748078] transition-colors hover:bg-[#f3f4f1] hover:text-[#17211b]" aria-label="Close spinner">
            <X className="h-4 w-4" />
          </button>
        </header>

        {activeTasks.length > 0 ? (
          <div className="px-6 pb-6 pt-5">
            <div className="relative mx-auto w-full max-w-[320px]">
              <div className="pointer-events-none absolute left-1/2 top-[-7px] z-10 -translate-x-1/2 drop-shadow-sm">
                <div className="h-0 w-0 border-l-[11px] border-r-[11px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#17211b]" />
              </div>
              <button type="button" onClick={handleSpin} disabled={isSpinning} className="block aspect-square w-full rounded-full transition-transform duration-200 active:scale-[.985] disabled:cursor-wait" aria-label="Spin the task wheel">
                <canvas ref={canvasRef} width={320} height={320} className="h-full w-full rounded-full" />
              </button>
            </div>

            {!selectedTask ? (
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="mx-auto mt-5 flex min-w-44 items-center justify-center gap-2 rounded-xl bg-[#17211b] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(23,33,27,.14)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#26342c] active:translate-y-0 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70"
              >
                <RotateCw className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`} />
                {isSpinning ? 'Picking your task...' : `Spin ${activeTasks.length} tasks`}
              </button>
            ) : (
              <div className="mt-5 rounded-2xl border border-[#cfe8d7] bg-[#f4fbf6] p-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4dcd7d] text-white"><Check className="h-4 w-4" strokeWidth={3} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[.13em] text-[#27884b]">Start here</p>
                    <p className="mt-1 truncate text-base font-extrabold text-[#17211b]">{taskLabel(selectedTask)}</p>
                  </div>
                  <button type="button" onClick={handleSpin} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-[#748078] hover:bg-white hover:text-[#17211b]"><RotateCw className="h-3 w-3" /> Again</button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { onStartTask(selectedTask, 25); closeModal(); }} className="flex items-center justify-center gap-2 rounded-xl bg-[#17211b] px-3 py-2.5 text-xs font-bold text-white transition-transform active:scale-[.98]"><Play className="h-3.5 w-3.5 fill-current" /> Focus 25m</button>
                  <button type="button" onClick={() => { onStartTask(selectedTask, 2); closeModal(); }} className="flex items-center justify-center gap-2 rounded-xl border border-[#dfe3de] bg-white px-3 py-2.5 text-xs font-bold text-[#17211b] transition-colors hover:border-[#4dcd7d]"><Zap className="h-3.5 w-3.5 text-[#d5a72f]" /> Start 2m</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <AlertCircle className="mx-auto h-6 w-6 text-[#a0a7a2]" />
            <p className="mt-3 text-sm font-bold text-[#17211b]">No active tasks yet</p>
            <p className="mt-1 text-xs text-[#748078]">Add at least one task before spinning.</p>
          </div>
        )}
      </section>
    </div>,
    document.body,
  );
};

export default TaskSpinnerModal;
