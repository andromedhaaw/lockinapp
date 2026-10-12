import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Check, Clock3, Coins, Focus, Gift, Heart, Leaf, LockKeyhole, Moon, PackageOpen, Pencil, Play, Share2, ShoppingBag, Sparkles, Star, Sun, Utensils, Volume2, VolumeX, X } from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './farm.css';

const ANIMALS = [
  { id: 'chicken', name: 'Sunny', kind: 'Curious chicken', cost: 0, requires: 0, farm: 'coop', product: 'eggs', productName: 'Egg basket', personality: 'Sunny loves morning focus, sunflowers, and short writing sessions.', accent: '#f5c85b' },
  { id: 'duck', name: 'Puddle', kind: 'Playful duck', cost: 1200, requires: 10, farm: 'duck-pond', product: 'feathers', productName: 'Soft feathers', personality: 'Puddle celebrates completed sessions with a little swim.', accent: '#75bde7' },
  { id: 'goat', name: 'Milo', kind: 'Curious goat', cost: 4500, requires: 30, farm: 'highland', product: 'cheese', productName: 'Cheese basket', personality: 'Milo climbs higher whenever a project milestone is finished.', accent: '#b4a798' },
  { id: 'sheep', name: 'Cloud', kind: 'Gentle sheep', cost: 3200, requires: 25, farm: 'highland', product: 'wool', productName: 'Warm wool', personality: 'Cloud settles down when you take a healthy break.', accent: '#c8b8e8' },
  { id: 'cow', name: 'Moochi', kind: 'Calm cow', cost: 8000, requires: 48, farm: 'pasture', product: 'milk', productName: 'Fresh milk', personality: 'Moochi enjoys long, unhurried deep-work blocks.', accent: '#93bd84' },
  { id: 'pig', name: 'Peaches', kind: 'Cheerful pig', cost: 2500, requires: 18, farm: 'orchard', product: 'truffles', productName: 'Truffle', personality: 'Peaches turns long focus blocks into playful mud dances.', accent: '#ef9cae' },
  { id: 'horse', name: 'Comet', kind: 'Brave horse', cost: 12000, requires: 60, farm: 'ranch', product: 'horseshoes', productName: 'Lucky horseshoe', personality: 'Comet remembers long projects and celebrates every finish line.', accent: '#b98058' },
];

const FARMS = {
  coop: { name: 'Chicken Coop', detail: 'Sunny · nesting house', requirement: 0 },
  'duck-pond': { name: 'Duck Pond', detail: 'Lilies · bridge · reeds', requirement: 10 },
  highland: { name: 'Highland', detail: 'Goats · sheep · stone hills', requirement: 25 },
  pasture: { name: 'Cow Pasture', detail: 'Windmill · feeding field', requirement: 40 },
  orchard: { name: 'Pig Orchard', detail: 'Apple trees · mud patch', requirement: 18 },
  ranch: { name: 'Horse Ranch', detail: 'Stable · hay · open trail', requirement: 60 },
};

const RECIPES = [
  { id: 'farmhouse-breakfast', name: 'Farmhouse breakfast', detail: 'A shared meal raises every companion bond.', cost: { eggs: 2, milk: 1 }, effect: 'bond' },
  { id: 'resting-nook', name: 'Soft resting nook', detail: 'A permanent quiet corner for healthy breaks.', cost: { wool: 2, feathers: 1 }, effect: 'rest' },
  { id: 'golden-signpost', name: 'Golden signpost', detail: 'A prestige landmark made from rare produce.', cost: { cheese: 1, truffles: 1, horseshoes: 1 }, effect: 'prestige' },
];

const MATERIAL_NAMES = { eggs: 'Eggs', feathers: 'Feathers', cheese: 'Cheese', wool: 'Wool', milk: 'Milk', truffles: 'Truffles', horseshoes: 'Horseshoes' };

const POSITIONS = [
  { x: 20, y: 69 }, { x: 39, y: 78 }, { x: 61, y: 67 },
  { x: 79, y: 78 }, { x: 50, y: 54 }, { x: 76, y: 47 },
];

const blankLayouts = () => ({ coop: ['chicken', null, null, null, null, null], 'duck-pond': Array(6).fill(null), highland: Array(6).fill(null), pasture: Array(6).fill(null), orchard: Array(6).fill(null), ranch: Array(6).fill(null) });
const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };
const readSessions = () => readJSON('lockin_focus_sessions', []);
const normalizeLayouts = () => {
  const saved = readJSON('lockin_farm_layouts', null);
  const next = blankLayouts();
  if (!saved) return next;
  const ids = [...new Set(Object.values(saved).flat().filter(Boolean))];
  ids.forEach((id) => {
    const animal = ANIMALS.find((item) => item.id === id);
    if (!animal) return;
    const slots = next[animal.farm];
    if (!slots.includes(id)) { const empty = slots.findIndex((slot) => !slot); if (empty >= 0) slots[empty] = id; }
  });
  return next;
};
const stageFor = (minutes) => minutes < 50 ? { id: 'egg', label: 'Egg', next: 50 } : minutes < 150 ? { id: 'baby', label: 'Chick', next: 150 } : minutes < 400 ? { id: 'growing', label: 'Growing', next: 400 } : { id: 'companion', label: 'Companion', next: null };
const localDay = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const FarmCreature = ({ animal, stage, action }) => <span className={`farm-creature creature-${animal.id} stage-${stage} action-${action || 'idle'}`} aria-hidden="true">
  <span className="farm-creature-shadow" />
  <span className="farm-creature-leg leg-left" /><span className="farm-creature-leg leg-right" />
  <span className="farm-creature-body" />
  <span className="farm-creature-wing wing-left" /><span className="farm-creature-wing wing-right" />
  <span className="farm-creature-head"><i className="farm-eye eye-left" /><i className="farm-eye eye-right" /><i className="farm-muzzle" /><i className="farm-blush blush-left" /><i className="farm-blush blush-right" /></span>
</span>;

const FarmPage = ({ onStartFocus }) => {
  const { coins, spendCoins } = useGarden();
  const { user } = useAuth();
  const { visitCode } = useParams();
  const shopRef = useRef(null);
  const [sessions, setSessions] = useState(readSessions);
  const [farmState, setFarmState] = useState(() => readJSON('lockin_animal_farm', {}));
  const [owned, setOwned] = useState(() => readJSON('lockin_farm_owned', ['chicken']));
  const [layouts, setLayouts] = useState(normalizeLayouts);
  const [activeFarm, setActiveFarm] = useState('coop');
  const [selectedId, setSelectedId] = useState('chicken');
  const [detailOpen, setDetailOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [action, setAction] = useState('idle');
  const [sessionMoment, setSessionMoment] = useState(null);
  const [reactions, setReactions] = useState(() => readJSON('lockin_farm_reactions', { cozy: 0, beautiful: 0, growing: 0 }));
  const [journal, setJournal] = useState(() => readJSON('lockin_farm_journal', []));
  const [materials, setMaterials] = useState(() => readJSON('lockin_farm_materials', {}));
  const [upgrades, setUpgrades] = useState(() => readJSON('lockin_farm_upgrades', {}));
  const [feedbackOn, setFeedbackOn] = useState(() => localStorage.getItem('lockin_farm_feedback') !== 'off');
  const [ambientAction, setAmbientAction] = useState('idle');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [remoteFarm, setRemoteFarm] = useState(null);
  const [remoteError, setRemoteError] = useState('');

  const totals = useMemo(() => {
    const minutes = sessions.reduce((sum, session) => sum + Number(session.actualMinutes || session.durationMinutes || 0), 0);
    const todaySessions = sessions.filter((session) => session.completedAt && localDay(new Date(session.completedAt)) === localDay());
    const todayMinutes = todaySessions.reduce((sum, session) => sum + Number(session.actualMinutes || session.durationMinutes || 0), 0);
    const careEarned = sessions.reduce((sum, session) => sum + (Number(session.durationMinutes || 0) >= 50 ? 2 : Number(session.durationMinutes || 0) >= 10 ? 1 : 0), 0);
    const used = Object.values(farmState).reduce((sum, item) => sum + Number(item.feeds || 0), 0);
    return { minutes, blocks: sessions.length, todaySessions, todayMinutes, careEnergy: Math.max(0, careEarned - used), stars: Math.floor(sessions.length / 25) };
  }, [sessions, farmState]);

  const selected = ANIMALS.find((animal) => animal.id === selectedId) || ANIMALS[0];
  const selectedCare = farmState[selected.id] || {};
  const selectedName = selectedCare.name || selected.name;
  const selectedMinutes = (selected.id === 'chicken' ? totals.minutes : 0) + Number(selectedCare.growthMinutes || 0);
  const selectedStage = stageFor(selectedMinutes);
  const stageStart = selectedStage.id === 'egg' ? 0 : selectedStage.id === 'baby' ? 50 : selectedStage.id === 'growing' ? 150 : 400;
  const stageProgress = selectedStage.next ? Math.min(100, ((selectedMinutes - stageStart) / (selectedStage.next - stageStart)) * 100) : 100;
  const activeSlots = layouts[activeFarm] || Array(6).fill(null);
  const timeLabel = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening';
  const lastVisit = Number(localStorage.getItem('lockin_farm_last_visit') || Date.now());
  const daysAway = Math.floor((Date.now() - lastVisit) / 86400000);
  const nextUnlock = totals.blocks < 5 ? `First wildflowers at ${5 - totals.blocks} more blocks` : totals.blocks < 10 ? `Pond Farm at ${10 - totals.blocks} more blocks` : totals.blocks < 25 ? `Hill Farm at ${25 - totals.blocks} more blocks` : totals.blocks < 50 ? `A little pond at ${50 - totals.blocks} more blocks` : 'Your farm keeps growing with every block';

  const playFeedback = (kind = 'soft') => {
    if (!feedbackOn) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = kind === 'celebrate' ? 660 : kind === 'collect' ? 520 : 390;
      gain.gain.setValueAtTime(.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(.06, context.currentTime + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .22);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .24);
      navigator.vibrate?.(kind === 'celebrate' ? [18, 35, 24] : 18);
    } catch {}
  };

  const recordJournal = (entry) => setJournal((current) => {
    if (current.some((item) => item.id === entry.id)) return current;
    const next = [{ ...entry, createdAt: entry.createdAt || new Date().toISOString() }, ...current].slice(0, 100);
    localStorage.setItem('lockin_farm_journal', JSON.stringify(next));
    return next;
  });

  useEffect(() => {
    localStorage.setItem('lockin_farm_last_visit', String(Date.now()));
    const sync = () => setSessions(readSessions());
    window.addEventListener('local-data-updated', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('local-data-updated', sync); window.removeEventListener('storage', sync); };
  }, []);

  useEffect(() => {
    const pending = readJSON('lockin_farm_pending_session', null);
    const seen = localStorage.getItem('lockin_farm_seen_session');
    if (!pending || pending.id === seen) return undefined;
    setSessionMoment(pending);
    setSelectedId('chicken');
    setAction('celebrate');
    playFeedback('celebrate');
    const timer = window.setTimeout(() => {
      localStorage.setItem('lockin_farm_seen_session', pending.id);
      localStorage.removeItem('lockin_farm_pending_session');
      setSessionMoment(null);
      setAction('idle');
    }, 2800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => { localStorage.setItem('lockin_animal_farm', JSON.stringify(farmState)); }, [farmState]);
  useEffect(() => { localStorage.setItem('lockin_farm_layouts', JSON.stringify(layouts)); }, [layouts]);
  useEffect(() => { localStorage.setItem('lockin_farm_materials', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('lockin_farm_upgrades', JSON.stringify(upgrades)); }, [upgrades]);

  useEffect(() => {
    const actions = ['curious', 'walk', 'idle', 'interact', 'idle'];
    const interval = window.setInterval(() => {
      setAmbientAction(actions[Math.floor(Math.random() * actions.length)]);
      window.setTimeout(() => setAmbientAction('idle'), 1500);
    }, 5200);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const stage = stageFor(totals.minutes);
    if (totals.blocks >= 1) recordJournal({ id: 'first-focus', title: 'Sunny’s home came alive', detail: `Your first focus block prepared the coop and began your farm story.` });
    if (stage.id !== 'egg') recordJournal({ id: `sunny-${stage.id}`, title: `Sunny reached ${stage.label}`, detail: `${Math.round(totals.minutes)} focused minutes became visible growth.` });
    [5, 10, 25, 50, 100].filter((value) => totals.blocks >= value).forEach((value) => recordJournal({ id: `blocks-${value}`, title: `${value} focus blocks completed`, detail: value === 10 ? 'Duck Pond became available.' : value === 25 ? 'Highland became available.' : value === 50 ? 'A permanent water feature appeared.' : value === 100 ? 'The farmhouse became part of your world.' : 'The first wildflowers appeared.' }));
    try {
      const projects = readJSON('lockin_projects', []);
      projects.forEach((project) => {
        const tasks = (project.milestones || []).flatMap((milestone) => milestone.tasks || []);
        if (project.status === 'Done' || (tasks.length && tasks.every((task) => task.done))) recordJournal({ id: `project-${project.id}`, title: `${project.name} became a farm landmark`, detail: 'A completed project is now part of the farm’s permanent history.' });
      });
    } catch {}
  }, [totals.blocks, totals.minutes]);

  useEffect(() => {
    if (!visitCode) return undefined;
    let active = true;
    api.get(`/farm/${visitCode}`).then((response) => { if (active) setRemoteFarm(response.data); }).catch(() => { if (active) setRemoteError('This farm could not be found.'); });
    return () => { active = false; };
  }, [visitCode]);

  const interact = (nextAction, duration = 1500) => {
    setAction(nextAction);
    window.setTimeout(() => setAction('idle'), duration);
  };

  const feedSelected = () => {
    if (totals.careEnergy < 1 || !owned.includes(selected.id)) return;
    setFarmState((current) => ({ ...current, [selected.id]: { ...current[selected.id], feeds: Number(current[selected.id]?.feeds || 0) + 1, growthMinutes: Number(current[selected.id]?.growthMinutes || 0) + 25, bond: Math.min(100, Number(current[selected.id]?.bond || 35) + 6) } }));
    interact('eat');
    playFeedback('soft');
  };

  const restTogether = () => {
    setFarmState((current) => ({ ...current, [selected.id]: { ...current[selected.id], rested: Math.min(100, Number(current[selected.id]?.rested || 68) + 12), bond: Math.min(100, Number(current[selected.id]?.bond || 35) + 2) } }));
    interact('sleep', 1800);
    playFeedback('soft');
  };

  const buyAnimal = (animal) => {
    if (owned.includes(animal.id) || totals.blocks < animal.requires || !spendCoins(animal.cost)) return;
    const nextOwned = [...owned, animal.id];
    setOwned(nextOwned);
    localStorage.setItem('lockin_farm_owned', JSON.stringify(nextOwned));
    setLayouts((current) => {
      const slots = [...(current[animal.farm] || Array(6).fill(null))];
      const empty = slots.findIndex((slot) => !slot);
      if (empty >= 0) slots[empty] = animal.id;
      return { ...current, [animal.farm]: slots };
    });
    setActiveFarm(animal.farm);
    setSelectedId(animal.id);
    interact('celebrate');
    playFeedback('celebrate');
    recordJournal({ id: `adopt-${animal.id}`, title: `${animal.name} joined the farm`, detail: `${FARMS[animal.farm].name} gained a new companion.` });
  };

  const claimProduct = () => {
    const available = Math.max(0, Math.floor(totals.blocks / 2) - Number(selectedCare.claimed || 0));
    if (selectedStage.id !== 'companion' || available < 1) return;
    setFarmState((current) => ({ ...current, [selected.id]: { ...current[selected.id], claimed: Number(current[selected.id]?.claimed || 0) + 1, products: Number(current[selected.id]?.products || 0) + 1 } }));
    setMaterials((current) => ({ ...current, [selected.product]: Number(current[selected.product] || 0) + 1 }));
    interact('happy');
    playFeedback('collect');
    recordJournal({ id: `produce-${selected.id}-${Number(selectedCare.claimed || 0) + 1}`, title: `${selectedName} produced ${selected.productName.toLowerCase()}`, detail: 'Two completed focus blocks turned into something useful.' });
  };

  const shareFarm = async () => {
    if (!user) { setShareStatus('Sign in to publish a real visit link.'); return; }
    const snapshot = {
      activeFarm,
      blocks: totals.blocks,
      minutes: totals.minutes,
      stage: stageFor(totals.minutes).id,
      upgrades,
      journal: journal.slice(0, 6),
      animals: owned.map((id) => { const animal = ANIMALS.find((item) => item.id === id); return animal ? { id, name: farmState[id]?.name || animal.name, stage: stageFor((id === 'chicken' ? totals.minutes : 0) + Number(farmState[id]?.growthMinutes || 0)).id, farm: animal.farm } : null; }).filter(Boolean),
    };
    try {
      const response = await api.put('/farm', { snapshot });
      const url = `${window.location.origin}/farm/${response.data.visitCode}`;
      const text = `I completed ${totals.blocks} focus blocks and helped ${farmState.chicken?.name || 'Sunny'} become a ${stageFor(totals.minutes).label}.`;
      if (navigator.share) await navigator.share({ title: 'Visit my Lock In Farm', text, url }); else await navigator.clipboard.writeText(url);
      setShareStatus('Visit link published and copied.');
      setReactions(response.data.reactions || reactions);
    } catch { setShareStatus('Could not publish yet. Make sure the server is running.'); }
  };

  const saveName = () => {
    const name = nameDraft.trim().slice(0, 22);
    if (!name) return;
    setFarmState((current) => ({ ...current, [selected.id]: { ...current[selected.id], name } }));
    setEditingName(false);
    recordJournal({ id: `rename-${selected.id}-${name.toLowerCase()}`, title: `${selected.name} is now ${name}`, detail: 'A companion received a name chosen by you.' });
  };

  const craft = (recipe) => {
    const canCraft = Object.entries(recipe.cost).every(([key, value]) => Number(materials[key] || 0) >= value);
    if (!canCraft || upgrades[recipe.id]) return;
    setMaterials((current) => Object.entries(recipe.cost).reduce((next, [key, value]) => ({ ...next, [key]: Number(next[key] || 0) - value }), current));
    setUpgrades((current) => ({ ...current, [recipe.id]: true }));
    if (recipe.effect === 'bond') setFarmState((current) => Object.fromEntries(Object.entries(current).map(([id, value]) => [id, { ...value, bond: Math.min(100, Number(value.bond || 35) + 10) }])));
    if (recipe.effect === 'rest') setFarmState((current) => Object.fromEntries(Object.entries(current).map(([id, value]) => [id, { ...value, rested: Math.min(100, Number(value.rested || 68) + 20) }])));
    playFeedback('celebrate');
    recordJournal({ id: `craft-${recipe.id}`, title: `${recipe.name} was built`, detail: 'Materials earned through focus permanently improved the farm.' });
  };

  const reactToRemoteFarm = async (key) => {
    if (!visitCode) return;
    try { const response = await api.post(`/farm/${visitCode}/reactions`, { reaction: key }); setRemoteFarm((current) => ({ ...current, reactions: response.data.reactions })); playFeedback('soft'); } catch {}
  };

  const topTask = useMemo(() => {
    const counts = sessions.reduce((map, session) => { const name = session.taskName || 'Focus session'; map[name] = (map[name] || 0) + Number(session.durationMinutes || 0); return map; }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Your first meaningful task';
  }, [sessions]);

  if (visitCode) return <FarmVisit profile={remoteFarm} error={remoteError} onReact={reactToRemoteFarm} feedbackOn={feedbackOn} setFeedbackOn={setFeedbackOn} />;

  return <div className="min-h-full bg-[#faf9f6] p-4 sm:p-8">
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e9e7e1] pb-5"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#4d8d56]">Living focus diary</p><h1 className="mt-1 text-4xl font-extrabold tracking-[-.045em] text-[#2d352e]">Farm</h1><p className="mt-1 text-sm font-medium text-[#748078]">Every focused block makes this little world feel more alive.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { const next = !feedbackOn; setFeedbackOn(next); localStorage.setItem('lockin_farm_feedback', next ? 'on' : 'off'); }} className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-[#e9e7e1] bg-white text-[#748078]" title={feedbackOn ? 'Sound and haptics on' : 'Sound and haptics off'}>{feedbackOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button><Resource icon={Focus} label="Care" value={totals.careEnergy} color="#4dcd7d" /><Resource icon={Coins} label="Coins" value={coins.toLocaleString()} color="#b68a3a" /><Resource icon={Star} label="Stars" value={totals.stars} color="#8b6cd9" /></div></header>

      {daysAway >= 1 && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e9e7e1] bg-white px-4 py-3"><div><p className="text-sm font-extrabold text-[#2d352e]">Sunny missed you. Want to start with two minutes?</p><p className="text-xs text-[#748078]">Nothing was lost while you were away.</p></div><button type="button" onClick={() => onStartFocus?.({ name: 'Gentle farm focus', estimatedTime: '2m' })} className="inline-flex items-center gap-2 rounded-xl bg-[#4dcd7d] px-3 py-2 text-xs font-black text-[#17211b]"><Play className="h-3.5 w-3.5 fill-current" />Start gently</button></div>}

      <nav className="flex gap-2 overflow-x-auto pb-1">{Object.entries(FARMS).map(([id, farm]) => { const locked = totals.blocks < farm.requirement; return <button key={id} type="button" disabled={locked} onClick={() => { setActiveFarm(id); const first = layouts[id]?.find(Boolean); if (first) setSelectedId(first); }} className={`min-w-fit rounded-xl border px-4 py-2.5 text-left transition-colors duration-200 ${activeFarm === id ? 'border-[#5f7b58] bg-[#2f4734] text-white' : 'border-[#e9e7e1] bg-white text-[#748078] hover:text-[#2d352e]'} disabled:cursor-not-allowed disabled:opacity-50`}><span className="flex items-center gap-2 text-xs font-extrabold">{locked && <LockKeyhole className="h-3.5 w-3.5" />}{farm.name}</span><span className={`mt-0.5 block text-[9px] font-semibold ${activeFarm === id ? 'text-white/60' : 'text-[#a0a8a2]'}`}>{locked ? `Unlock at ${farm.requirement} blocks` : farm.detail}</span></button>; })}</nav>

      <section className={`farm-scene farm-theme-${activeFarm} ${sessionMoment ? 'is-cinematic' : ''}`}>
        <div className="farm-scene-sky"><span className="farm-scene-sun" /><span className="farm-scene-cloud cloud-a" /><span className="farm-scene-cloud cloud-b" /></div>
        <div className="farm-land land-back" /><div className="farm-land land-front" />
        {['coop','pasture','ranch'].includes(activeFarm) && <div className={`farm-scene-barn barn-${activeFarm}`}><span className="roof" /><span className="window" /><span className="door" /></div>}
        {activeFarm === 'duck-pond' && <div className="farm-bridge"><i /><i /><i /><i /></div>}
        {activeFarm === 'highland' && <><div className="farm-stone-shed"><i /></div><div className="farm-rocks"><i /><i /><i /></div></>}
        {activeFarm === 'pasture' && <div className="farm-windmill"><i /><i /><i /><i /></div>}
        {activeFarm === 'orchard' && <><div className="farm-orchard-tree tree-one"><i /><i /><i /></div><div className="farm-orchard-tree tree-two"><i /><i /></div><div className="farm-mud-patch" /></>}
        {activeFarm === 'ranch' && <div className="farm-hay"><i /><i /></div>}
        {totals.blocks >= 10 && <div className="farm-scene-fence" />}
        {(activeFarm === 'duck-pond' || (activeFarm === 'coop' && totals.blocks >= 50)) && <div className="farm-scene-pond"><i /><i /><i /></div>}
        {totals.blocks >= 5 && <div className="farm-wildflowers"><i /><i /><i /><i /><i /></div>}
        {totals.blocks >= 100 && <div className="farm-house"><i /></div>}
        {activeSlots.map((animalId, index) => {
          if (!animalId) return null;
          const animal = ANIMALS.find((item) => item.id === animalId);
          if (!animal) return null;
          const growth = (animal.id === 'chicken' ? totals.minutes : 0) + Number(farmState[animal.id]?.growthMinutes || 0);
          const stage = stageFor(growth);
          const displayName = farmState[animal.id]?.name || animal.name;
          return <button key={`${activeFarm}-${animal.id}`} type="button" onClick={() => { setSelectedId(animal.id); setDetailOpen(true); interact('curious'); }} className={`farm-scene-animal ${selectedId === animal.id ? 'is-selected' : ''}`} style={{ left: `${POSITIONS[index].x}%`, top: `${POSITIONS[index].y}%`, '--delay': `${index * -.53}s` }}><FarmCreature animal={animal} stage={stage.id} action={selectedId === animal.id && action !== 'idle' ? action : ambientAction} /><span className="farm-animal-label">{displayName}<small>{stage.label}</small></span></button>;
        })}
        {totals.blocks === 0 && <div className="farm-onboarding"><p>Meet Sunny</p><strong>Your first farm companion is waiting.</strong><span>Complete one focus block to prepare the coop.</span><button type="button" onClick={() => onStartFocus?.({ name: 'Prepare Sunny’s home', estimatedTime: '10m' })}>Start a focus block <ArrowRight /></button></div>}
        {sessionMoment && <div className="farm-session-moment"><span className="falling-feed" /><p>Focus block complete</p><strong>{sessionMoment.durationMinutes || 25} focused minutes</strong><small>Sunny grew a little. The coop feels warmer.</small></div>}
        <div className="farm-scene-caption"><div><span>{timeLabel} · {totals.todaySessions.length} focus blocks today</span><strong>{totals.todayMinutes} focused minutes</strong></div><div className="text-right"><span>Next unlock</span><strong>{nextUnlock}</strong></div></div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e9e7e1] bg-white px-4 py-3.5"><div className="flex items-center gap-3"><FarmCreature animal={ANIMALS[0]} stage={stageFor(totals.minutes).id} action={action} /><div><p className="text-sm font-extrabold text-[#2d352e]">{totals.blocks ? `${farmState.chicken?.name || 'Sunny'} is enjoying the ${timeLabel.toLowerCase()}.` : 'Sunny is waiting to hatch.'}</p><p className="text-xs text-[#748078]">{nextUnlock}</p></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setSelectedId('chicken'); setDetailOpen(true); }} className="rounded-xl border border-[#e9e7e1] px-3.5 py-2.5 text-xs font-bold text-[#2d352e] hover:bg-[#faf9f6]">Care for {farmState.chicken?.name || 'Sunny'}</button><button type="button" onClick={() => { setShopOpen(true); window.setTimeout(() => shopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }} className="inline-flex items-center gap-2 rounded-xl bg-[#2f4734] px-3.5 py-2.5 text-xs font-bold text-white"><ShoppingBag className="h-3.5 w-3.5" />Open Farm Shop</button></div></section>

      {shopOpen && <section ref={shopRef} className="rounded-2xl border border-[#e9e7e1] bg-white p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#4d8d56]">Farm shop</p><h2 className="mt-1 text-xl font-extrabold text-[#2d352e]">Choose the next companion.</h2><p className="mt-1 text-xs text-[#748078]">Coins help, but focused work unlocks every animal.</p></div><button type="button" onClick={() => setShopOpen(false)} className="rounded-lg p-2 text-[#748078] hover:bg-[#faf9f6]"><X className="h-4 w-4" /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{ANIMALS.filter((animal) => animal.id !== 'chicken').map((animal) => { const isOwned = owned.includes(animal.id); const workUnlocked = totals.blocks >= animal.requires; const canBuy = workUnlocked && coins >= animal.cost; return <article key={animal.id} className="rounded-2xl border border-[#efede8] bg-[#faf9f6] p-4"><div className="flex items-center gap-3"><FarmCreature animal={animal} stage="baby" action="idle" /><div><p className="text-sm font-extrabold text-[#2d352e]">{animal.name}</p><p className="text-[10px] font-semibold text-[#748078]">{animal.kind} · {FARMS[animal.farm].name}</p></div></div><p className="mt-3 min-h-9 text-xs leading-relaxed text-[#748078]">{animal.personality}</p><div className="mt-3 flex items-center justify-between"><div><p className="text-xs font-extrabold text-[#2d352e]">{animal.cost.toLocaleString()} coins</p><p className={`text-[9px] font-bold ${workUnlocked ? 'text-[#4d8d56]' : 'text-[#ef5350]'}`}>{workUnlocked ? 'Focus requirement met' : `Requires ${animal.requires} blocks`}</p></div><button type="button" disabled={isOwned || !canBuy} onClick={() => buyAnimal(animal)} className={`rounded-xl px-3 py-2 text-[10px] font-black ${isOwned ? 'bg-[#eaf8ee] text-[#249653]' : canBuy ? 'bg-[#2f4734] text-white' : 'bg-[#e9e7e1] text-[#9aa19c]'}`}>{isOwned ? <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" />Owned</span> : 'Adopt'}</button></div></article>; })}</div></section>}

      <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]"><FarmJournal sessions={sessions} blocks={totals.blocks} stage={stageFor(totals.minutes)} topTask={topTask} /><div className="rounded-2xl border border-[#e9e7e1] bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#8b6cd9]">Farm visits</p><h2 className="mt-1 text-lg font-extrabold text-[#2d352e]">A small social signal.</h2></div><button type="button" onClick={shareFarm} className="rounded-lg p-2 text-[#748078] hover:bg-[#faf9f6]" aria-label="Share farm"><Share2 className="h-4 w-4" /></button></div><p className="mt-2 text-xs leading-relaxed text-[#748078]">Friends can react without turning your farm into a noisy feed.</p><div className="mt-4 flex flex-wrap gap-2">{[['cozy','Cozy'],['beautiful','Beautiful'],['growing','Keep growing']].map(([key,label]) => <button key={key} type="button" onClick={() => addReaction(key)} className="rounded-xl border border-[#e9e7e1] px-3 py-2 text-[10px] font-bold text-[#59645c] hover:bg-[#faf9f6]">{label} · {reactions[key]}</button>)}</div></div></section>
    </div>

    {detailOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/25 p-4 backdrop-blur-sm" onMouseDown={() => setDetailOpen(false)}><section onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-[#e9e7e1] bg-white p-6 shadow-[0_22px_70px_rgba(29,48,34,.18)]"><div className="flex items-start justify-between"><div className="flex items-center gap-4"><FarmCreature animal={selected} stage={selectedStage.id} action={action} /><div><p className="text-xl font-extrabold text-[#2d352e]">{selected.name}</p><p className="text-xs font-bold text-[#748078]">{selectedStage.label} {selected.kind}</p></div></div><button type="button" onClick={() => setDetailOpen(false)} className="rounded-lg p-2 text-[#748078] hover:bg-[#faf9f6]"><X className="h-4 w-4" /></button></div><p className="mt-4 rounded-xl bg-[#faf9f6] px-4 py-3 text-sm font-medium leading-relaxed text-[#59645c]">{selected.personality}</p><div className="mt-5 space-y-4"><CareBar icon={Utensils} label="Fed" value={Math.min(100, 45 + Number(selectedCare.feeds || 0) * 8)} color="#4dcd7d" message={totals.careEnergy ? `${selected.name} could enjoy a snack.` : 'Focus for ten minutes to earn care energy.'} /><CareBar icon={Moon} label="Rested" value={Number(selectedCare.rested || 72)} color="#8b6cd9" message="Rest never reduces progress." /><CareBar icon={Heart} label="Bond" value={Number(selectedCare.bond || 35)} color="#ef9cae" message={`${selected.name} remembers your consistency.`} /></div><div className="mt-5"><div className="flex justify-between text-[10px] font-bold text-[#748078]"><span>Growth · {selectedStage.label}</span><span>{selectedStage.next ? `${Math.round(selectedMinutes)}/${selectedStage.next} focused min` : `${Math.round(selectedMinutes)} focused min`}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#efede8]"><div className="h-full rounded-full bg-[#4dcd7d] transition-[width] duration-200" style={{ width: `${stageProgress}%` }} /></div></div><div className="mt-5 rounded-xl border border-[#e9e7e1] px-4 py-3"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#748078]">Memory</p><p className="mt-1 text-sm font-semibold text-[#2d352e]">“{selected.name} grew while you were working on {topTask}.”</p></div><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" disabled={totals.careEnergy < 1} onClick={feedSelected} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4dcd7d] px-3 py-3 text-xs font-black text-[#17211b] disabled:cursor-not-allowed disabled:opacity-40"><Utensils className="h-4 w-4" />Feed</button><button type="button" onClick={restTogether} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e9e7e1] px-3 py-3 text-xs font-bold text-[#2d352e]"><Moon className="h-4 w-4 text-[#8b6cd9]" />Rest together</button></div>{selectedStage.id === 'companion' && <button type="button" onClick={claimProduct} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#fff8e8] px-3 py-3 text-xs font-bold text-[#9a7027]"><Gift className="h-4 w-4" />Collect {selected.product}</button>}</section></div>}
  </div>;
};

const Resource = ({ icon: Icon, label, value, color }) => <div className="flex items-center gap-2 rounded-xl border border-[#e9e7e1] bg-white px-3 py-2"><Icon className="h-4 w-4" style={{ color }} /><div><p className="text-[8px] font-black uppercase tracking-[.1em] text-[#9aa19c]">{label}</p><p className="text-xs font-extrabold text-[#2d352e]">{value}</p></div></div>;
const CareBar = ({ icon: Icon, label, value, color, message }) => <div><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-bold text-[#59645c]"><Icon className="h-3.5 w-3.5" style={{ color }} />{label}</span><span className="text-[10px] font-bold text-[#748078]">{value}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#efede8]"><div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${value}%`, backgroundColor: color }} /></div><p className="mt-1 text-[10px] font-medium text-[#9aa19c]">{message}</p></div>;
const FarmJournal = ({ sessions, blocks, stage, topTask }) => {
  const latest = sessions[0];
  return <section className="rounded-2xl border border-[#e9e7e1] bg-white p-5"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef6ec] text-[#4d8d56]"><Leaf className="h-4 w-4" /></span><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#4d8d56]">Farm journal</p><h2 className="text-lg font-extrabold text-[#2d352e]">Your work became a memory.</h2></div></div><div className="mt-5 space-y-4 border-l border-[#e9e7e1] pl-4"><JournalRow icon={Sparkles} title={`Sunny reached ${stage.label}`} detail={`${blocks} completed focus blocks helped the farm grow.`} /><JournalRow icon={Clock3} title={latest ? `${latest.durationMinutes || 0} minutes on ${latest.taskName || 'Focus session'}` : 'Your first session will begin the story'} detail={latest ? new Date(latest.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'Sunny is ready when you are.'} /><JournalRow icon={Sun} title={`Most focused: ${topTask}`} detail="A meaningful part of your farm’s history." /></div></section>;
};
const JournalRow = ({ icon: Icon, title, detail }) => <div className="relative"><span className="absolute -left-[25px] top-0 flex h-5 w-5 items-center justify-center rounded-full border border-[#dce8d9] bg-white"><Icon className="h-2.5 w-2.5 text-[#4d8d56]" /></span><p className="text-sm font-bold text-[#2d352e]">{title}</p><p className="mt-0.5 text-[11px] text-[#748078]">{detail}</p></div>;

export default FarmPage;
