import { useEffect, useMemo, useState } from 'react';
import { BatteryMedium, Heart, Moon, Play, Sparkles, Sun, Utensils } from 'lucide-react';
import './petOverrides.css';

const PetPage = ({ onStartFocus }) => {
  const [petType, setPetType] = useState(() => localStorage.getItem('lockin_pet_type') || 'bunny');
  const [action, setAction] = useState('idle');
  const [lastVisit] = useState(() => Number(localStorage.getItem('lockin_pet_last_visit') || Date.now()));
  const [memories, setMemories] = useState(() => { try { return JSON.parse(localStorage.getItem('lockin_pet_memories') || '[]'); } catch { return []; } });
  const [care, setCare] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lockin_pet_care') || 'null');
      if (saved) {
        const hoursAway = Math.max(0, (Date.now() - Number(saved.updatedAt || Date.now())) / 3600000);
        return { hunger: Math.max(5, Number(saved.hunger ?? 72) - Math.floor(hoursAway * 2)), energy: Math.max(5, Number(saved.energy ?? 76) - Math.floor(hoursAway)), sleeping: Boolean(saved.sleeping) };
      }
    } catch {}
    return { hunger: 72, energy: 76, sleeping: false };
  });
  const sessions = useMemo(() => { try { return JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]'); } catch { return []; } }, []);
  const completedProjects = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('lockin_projects') || '[]').filter((project) => {
        const tasks = (project.milestones || []).flatMap((milestone) => milestone.tasks || []);
        return project.status === 'Done' || (tasks.length > 0 && tasks.every((task) => task.done));
      }).map((project) => project.name);
    } catch { return []; }
  }, []);
  const xp = Math.min(100, sessions.reduce((sum, session) => sum + Number(session.durationMinutes || 0), 0) % 100);
  useEffect(() => { localStorage.setItem('lockin_pet_care', JSON.stringify({ ...care, updatedAt: Date.now() })); }, [care]);
  useEffect(() => {
    localStorage.setItem('lockin_pet_last_visit', String(Date.now()));
    if (completedProjects.length) {
      setMemories((current) => {
        const next = [...new Set([...completedProjects, ...current])].slice(0, 8);
        localStorage.setItem('lockin_pet_memories', JSON.stringify(next));
        return next;
      });
    }
  }, [completedProjects]);
  const react = (next) => { setAction(next); window.setTimeout(() => setAction('idle'), 1800); };
  const feedPet = () => { if (care.sleeping) return; setCare((current) => ({ ...current, hunger: Math.min(100, current.hunger + 25) })); react('feed'); };
  const toggleSleep = () => {
    setCare((current) => ({ ...current, sleeping: !current.sleeping, energy: current.sleeping ? Math.min(100, current.energy + 30) : current.energy }));
    setAction('idle');
  };
  const hungerColor = care.hunger < 35 ? '#ef4444' : care.hunger < 65 ? '#f59e0b' : '#34C759';
  const hungerLabel = care.hunger < 35 ? 'Could use a snack' : care.hunger < 85 ? 'Satisfied' : 'Full';
  const energyLabel = care.sleeping ? 'Sleeping' : care.energy < 35 ? 'Sleepy' : 'Awake';
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMood = Number(localStorage.getItem(`lockin_mood_${todayKey}`) || 0);
  const userNeedsRest = todayMood > 0 && todayMood <= 2;
  const daysAway = Math.floor((Date.now() - lastVisit) / 86400000);
  const latestSession = sessions[0];
  const recentlyFocused = latestSession?.completedAt && Date.now() - new Date(latestSession.completedAt).getTime() < 6 * 3600000;
  const petName = petType === 'bunny' ? 'Mochi' : 'Pip';
  const companionMessage = care.sleeping
    ? 'Shh... having a cozy nap.'
    : action === 'focus'
      ? 'I am right here. One small step together!'
      : action === 'feed'
        ? 'That was lovely. Thank you!'
        : recentlyFocused
          ? `You focused for ${latestSession.durationMinutes || latestSession.minutes || 0} minutes. I’m proud of you!`
          : daysAway >= 1
            ? 'I’m happy you’re back. Want to start gently?'
            : care.hunger < 35
              ? `${petName} could use a snack.`
              : userNeedsRest || care.energy < 35
                ? 'You look tired. We can rest together.'
                : 'Ready when you are. No rush.';
  const choosePet = (type) => { setPetType(type); localStorage.setItem('lockin_pet_type', type); };
  return <div className="min-h-[calc(100vh-2rem)] bg-gradient-to-br from-white via-[#fff7f8] to-[#ffe3eb] p-4 sm:p-8"><div className="mx-auto max-w-4xl space-y-6"><header className="text-center"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#b47c72]">Your pet</p><h1 className="mt-2 font-serif text-4xl tracking-tight text-slate-900">Meet your little companion.</h1><p className="mt-2 text-sm text-slate-500">Show up for yourself, and your pet grows with you.</p><div className="mx-auto mt-5 flex w-fit rounded-2xl border border-rose-100 bg-white p-1 shadow-sm"><button type="button" onClick={() => choosePet('bunny')} className={`rounded-xl px-4 py-2 text-xs font-black ${petType === 'bunny' ? 'bg-rose-100 text-rose-700' : 'text-slate-400'}`}>🐰 Mochi</button><button type="button" onClick={() => choosePet('penguin')} className={`rounded-xl px-4 py-2 text-xs font-black ${petType === 'penguin' ? 'bg-blue-100 text-blue-700' : 'text-slate-400'}`}>🐧 Pip</button></div></header>
    <section className={`relative overflow-hidden rounded-[32px] border border-[#f4dbe2] bg-white px-6 pb-8 pt-8 text-center shadow-xl ${care.sleeping ? 'pet-room-sleeping' : ''}`}><div className="absolute left-8 top-8 h-20 w-20 rounded-full bg-pink-200/40 blur-2xl" /><div className="absolute bottom-0 right-8 h-24 w-32 rounded-full bg-blue-200/30 blur-2xl" />{care.sleeping && <div className="absolute right-8 top-7 text-2xl font-black text-indigo-300 pet-zzz">Zzz</div>}<div className={`pet-stage pet-${petType} ${care.sleeping ? 'pet-sleeping' : action !== 'idle' ? `pet-${action}` : recentlyFocused ? 'pet-celebrate' : care.energy < 35 ? 'pet-sleepy' : ''}`}><div className="pet-ear pet-ear-left" /><div className="pet-ear pet-ear-right" /><div className="pet-head"><div className="pet-eye pet-eye-left" /><div className="pet-eye pet-eye-right" /><div className="pet-nose" /><div className="pet-mouth" /><div className="pet-cheek pet-cheek-left" /><div className="pet-cheek pet-cheek-right" /></div><div className="pet-body"><div className="pet-arm pet-arm-left" /><div className="pet-arm pet-arm-right" /><div className="pet-belly" /><div className="pet-leg pet-leg-left" /><div className="pet-leg pet-leg-right" /></div></div><h2 className="relative mt-2 text-xl font-black text-slate-900">{petName}</h2><p className="relative mx-auto mt-1 max-w-md text-sm font-semibold leading-relaxed text-slate-500">{companionMessage}</p>{daysAway >= 1 && !care.sleeping && <button type="button" onClick={() => onStartFocus?.()} className="relative mt-4 rounded-xl bg-[#eaf8ee] px-4 py-2 text-xs font-black text-[#249653] transition active:scale-95">Start gently · 2 minutes</button>}</section>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-xs font-bold text-slate-500"><span className="flex items-center gap-2"><Utensils className="h-4 w-4" style={{ color: hungerColor }} />Hunger</span><span style={{ color: hungerColor }}>{hungerLabel}</span></div><div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${care.hunger}%`, backgroundColor: hungerColor }} /></div><div className="mt-2 text-xs font-bold text-slate-400">{care.hunger}% full</div></div><div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-xs font-bold text-slate-500"><span className="flex items-center gap-2"><BatteryMedium className="h-4 w-4 text-indigo-400" />Energy</span><span className="text-indigo-500">{energyLabel}</span></div><div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-400 transition-all duration-500" style={{ width: `${care.energy}%` }} /></div><div className="mt-2 text-xs font-bold text-slate-400">{care.energy}% rested</div></div><div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Sparkles className="h-4 w-4 text-amber-400" />Focus XP</div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#f0bd72]" style={{ width: `${xp}%` }} /></div><div className="mt-2 text-xs font-bold text-slate-400">{xp}/100 to next level</div></div><div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Heart className="h-4 w-4 text-rose-400" />Care</div><div className="mt-2 text-lg font-black text-slate-800">{sessions.length} sessions</div></div></div>
    <div className="flex flex-wrap justify-center gap-3"><button type="button" disabled={care.sleeping || care.hunger >= 100} onClick={feedPet} className="rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"><Utensils className="mr-2 inline h-4 w-4 text-amber-500" />{care.hunger >= 100 ? 'Already full' : 'Feed'}</button><button type="button" disabled={care.sleeping} onClick={() => { react('focus'); onStartFocus?.(); }} className="rounded-2xl bg-[#f0bd72] px-5 py-3 text-xs font-black text-slate-900 shadow-sm transition hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"><Play className="mr-2 inline h-4 w-4 fill-current" />Focus together</button><button type="button" onClick={toggleSleep} className={`rounded-2xl px-4 py-3 text-xs font-black shadow-sm transition hover:-translate-y-0.5 active:scale-95 ${care.sleeping ? 'bg-indigo-500 text-white' : 'bg-white text-slate-700'}`}>{care.sleeping ? <Sun className="mr-2 inline h-4 w-4" /> : <Moon className="mr-2 inline h-4 w-4 text-indigo-400" />}{care.sleeping ? 'Wake up' : 'Put to sleep'}</button></div>
    {memories.length > 0 && <section className="rounded-[28px] border border-[#eee7dc] bg-[#fffdf8] p-5 shadow-sm"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100"><Sparkles className="h-5 w-5 text-amber-600" /></div><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-amber-600">Our journey</p><h3 className="mt-1 text-base font-black text-slate-900">{petName} remembers what you built.</h3><p className="mt-1 text-sm text-slate-500">We finished <span className="font-bold text-slate-700">{memories[0]}</span> together. That progress is part of our story now.</p></div></div></section>}
    <style>{`.pet-stage{position:relative;margin:8px auto 0;width:250px;height:320px;animation:pet-breathe 3.2s ease-in-out infinite;transform-origin:bottom center}.pet-head{position:absolute;z-index:2;left:43px;top:42px;width:164px;height:154px;border-radius:48%;background:linear-gradient(145deg,#fffdfb,#fff 65%,#eadfe0);box-shadow:inset -10px -8px 14px rgba(130,79,66,.12)}.pet-ear{position:absolute;z-index:1;top:26px;width:54px;height:145px;border-radius:70% 35% 65% 45%;background:linear-gradient(90deg,#fff 40%,#f4aebc 100%);box-shadow:inset -5px -6px 8px rgba(180,110,120,.18)}.pet-ear-left{left:27px;transform:rotate(-28deg)}.pet-ear-right{right:27px;transform:rotate(28deg)}.pet-eye{position:absolute;top:78px;width:15px;height:18px;border-radius:50%;background:#4f493c}.pet-eye-left{left:42px}.pet-eye-right{right:42px}.pet-nose{position:absolute;left:78px;top:98px;width:7px;height:5px;border-radius:50%;background:#98715e}.pet-mouth{position:absolute;left:72px;top:108px;width:20px;height:10px;border-bottom:4px solid #9d5c59;border-radius:50%}.pet-cheek{position:absolute;top:105px;width:19px;height:10px;border-radius:50%;background:#ed9b8c88;filter:blur(1px)}.pet-cheek-left{left:20px}.pet-cheek-right{right:20px}.pet-body{position:absolute;left:81px;top:176px;width:88px;height:110px;border-radius:45% 45% 30% 30%;background:linear-gradient(145deg,#fffdfb,#fff 65%,#eadfe0);box-shadow:inset -9px -10px 14px rgba(130,79,66,.12)}.pet-arm,.pet-leg{position:absolute;background:linear-gradient(145deg,#fff,#f4e8e8);border-radius:99px;box-shadow:inset -4px -5px 7px rgba(174,113,113,.18);z-index:3}.pet-arm{top:16px;width:24px;height:73px}.pet-arm-left{left:-17px;transform:rotate(8deg)}.pet-arm-right{right:-17px;transform:rotate(-8deg)}.pet-leg{top:86px;width:30px;height:73px}.pet-leg-left{left:10px;transform:rotate(4deg)}.pet-leg-right{right:10px;transform:rotate(-4deg)}.pet-belly{display:none}.pet-penguin .pet-ear{display:none}.pet-penguin .pet-head{left:29px;top:24px;width:192px;height:198px;border:5px solid #27345d;border-bottom:0;border-radius:49% 49% 42% 42%;background:linear-gradient(145deg,#79aaff,#3978c9);box-shadow:inset 10px 8px 0 rgba(170,210,255,.25),inset -12px -10px 16px rgba(20,50,100,.22)}.pet-penguin .pet-head:after{content:'';position:absolute;left:18px;top:35px;width:146px;height:157px;border-radius:48% 48% 52% 52%;background:#fffdf0;clip-path:polygon(0 0,42% 0,50% 14%,58% 0,100% 0,100% 75%,84% 92%,50% 100%,16% 92%,0 75%)}.pet-penguin .pet-body{left:46px;top:171px;width:158px;height:136px;border:5px solid #27345d;border-top:0;border-radius:44% 44% 30% 30%;background:#3978c9;box-shadow:inset 12px 0 0 rgba(170,210,255,.22),inset -12px 0 16px rgba(20,50,100,.22)}.pet-penguin .pet-belly{display:block;position:absolute;left:19px;top:3px;width:110px;height:128px;border-radius:48% 48% 42% 42%;background:#fffdf0}.pet-penguin .pet-arm{top:18px;width:60px;height:116px;border:5px solid #27345d;background:#3978c9}.pet-penguin .pet-arm-left{left:-52px;transform:rotate(24deg);border-radius:65% 35% 70% 40%}.pet-penguin .pet-arm-right{right:-52px;transform:rotate(-24deg);border-radius:35% 65% 40% 70%}.pet-penguin .pet-eye{z-index:4;top:83px;width:21px;height:29px;background:#29305f;box-shadow:5px 5px 0 #fff}.pet-penguin .pet-eye-left{left:68px}.pet-penguin .pet-eye-right{right:68px}.pet-penguin .pet-nose{z-index:4;left:75px;top:111px;width:42px;height:27px;border:5px solid #27345d;border-radius:50%;background:#f4bf3c}.pet-penguin .pet-nose:after{content:'';position:absolute;left:3px;right:3px;top:10px;border-top:4px solid #27345d}.pet-penguin .pet-leg{z-index:4;top:116px;width:44px;height:27px;border:4px solid #8e6725;border-radius:50%;background:#e5b34a}.pet-penguin .pet-leg-left{left:22px}.pet-penguin .pet-leg-right{right:22px}.pet-feed{animation:pet-hop .6s ease-in-out 2}.pet-feed .pet-arm-left{animation:feed-left .6s ease-in-out 2}.pet-feed .pet-arm-right{animation:feed-right .6s ease-in-out 2}.pet-focus{animation:pet-hop .8s ease-in-out 2}.pet-rest{animation:pet-rest 1.8s ease-in-out}.pet-rest .pet-eye{transform:scaleY(.2)}@keyframes pet-breathe{50%{transform:translateY(-5px) scale(1.01)}}@keyframes pet-hop{50%{transform:translateY(-18px) rotate(2deg)}}@keyframes pet-rest{50%{transform:translateY(8px) scale(.98)}}@keyframes feed-left{50%{transform:rotate(-42deg) translateY(-18px)}}@keyframes feed-right{50%{transform:rotate(42deg) translateY(-18px)}}`}</style></div></div>;
};

export default PetPage;
