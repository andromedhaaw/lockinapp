/**
 * Accountability Pods System
 * 5-person cohorts who hold each other accountable
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Users, 
  Plus, 
  Crown,
  Flame,
  Trophy,
  Bell,
  Settings,
  UserPlus,
  Copy,
  Check,
  Zap,
  Target,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { Card } from '../ui';

// Demo pod data
const DEMO_POD = {
  id: 'pod-demo',
  name: 'Productivity Legends',
  code: 'LOCK-7X9K',
  members: [
    { id: 1, name: 'You', avatar: '🧑‍💻', streak: 12, todayHours: 4.5, weekHours: 28.5, isLeader: true, isYou: true },
    { id: 2, name: 'Sarah K.', avatar: '👩‍🎨', streak: 8, todayHours: 3.2, weekHours: 24.0, isLeader: false },
    { id: 3, name: 'Mike R.', avatar: '👨‍🔬', streak: 15, todayHours: 5.1, weekHours: 32.5, isLeader: false },
    { id: 4, name: 'Emma L.', avatar: '👩‍💼', streak: 6, todayHours: 2.8, weekHours: 18.0, isLeader: false },
    { id: 5, name: 'Alex T.', avatar: '🧑‍🚀', streak: 3, todayHours: 0, weekHours: 12.5, needsPing: true },
  ],
  weeklyGoal: 25,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
};

export const AccountabilityPods = ({ workHistory = {}, todayHours = 0 }) => {
  const [hasPod, setHasPod] = useState(true); // Demo: user has a pod
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pingedMembers, setPingedMembers] = useState(new Set());

  const pod = hasPod ? DEMO_POD : null;

  const handleCopyCode = async () => {
    if (pod) {
      await navigator.clipboard.writeText(pod.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePingMember = (memberId) => {
    setPingedMembers(prev => new Set([...prev, memberId]));
    // In a real app, this would send a notification
  };

  // Sort members by week hours for leaderboard
  const sortedMembers = pod ? [...pod.members].sort((a, b) => b.weekHours - a.weekHours) : [];

  if (!hasPod) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-900">
        {/* No Pod State */}
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Join an Accountability Pod
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Team up with 4 others to stay accountable. See each other's streaks and cheer each other on!
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => setHasPod(true)} // Demo: instantly create pod
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Create a Pod
            </button>
            <button
              onClick={() => setHasPod(true)} // Demo
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Join with Code
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pod Header Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white p-6">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{pod.name}</h2>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <span>{pod.members.length}/5 members</span>
                  <span>•</span>
                  <span>Week {Math.ceil((Date.now() - pod.createdAt) / (7 * 24 * 60 * 60 * 1000))}</span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Invite Code */}
          <div className="flex items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
            <span className="text-sm text-white/70">Invite Code:</span>
            <span className="font-mono font-bold flex-1">{pod.code}</span>
            <button
              onClick={handleCopyCode}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-300" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* Pod Leaderboard */}
      <Card className="p-6 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">This Week's Leaderboard</h3>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Goal: {pod.weeklyGoal}h each
          </div>
        </div>

        <div className="space-y-3">
          {sortedMembers.map((member, index) => (
            <div 
              key={member.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                member.isYou 
                  ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' 
                  : 'bg-gray-50 dark:bg-slate-800'
              }`}
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                index === 1 ? 'bg-gray-200 text-gray-600' :
                index === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>

              {/* Avatar & Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{member.avatar}</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {member.name}
                  </span>
                  {member.isLeader && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                  {member.isYou && (
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 text-xs rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    {member.streak} day streak
                  </span>
                  <span>
                    Today: {member.todayHours}h
                  </span>
                </div>
              </div>

              {/* Week Hours */}
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {member.weekHours}h
                </div>
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${Math.min((member.weekHours / pod.weeklyGoal) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Ping Button (for members who need motivation) */}
              {member.needsPing && !member.isYou && (
                <button
                  onClick={() => handlePingMember(member.id)}
                  disabled={pingedMembers.has(member.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    pingedMembers.has(member.id)
                      ? 'bg-green-100 text-green-600'
                      : 'bg-orange-100 hover:bg-orange-200 text-orange-600'
                  }`}
                >
                  {pingedMembers.has(member.id) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Challenge */}
      <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-100 dark:border-orange-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
            <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Weekly Pod Challenge</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Everyone hits 25h this week!</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Pod Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {sortedMembers.filter(m => m.weekHours >= pod.weeklyGoal).length}/5 completed
            </span>
          </div>
          <div className="h-3 bg-orange-100 dark:bg-orange-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all"
              style={{ width: `${(sortedMembers.filter(m => m.weekHours >= pod.weeklyGoal).length / 5) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            🎁 Complete to unlock: "Pod Champions" badge
          </div>
        </div>
      </Card>

      {/* Pod Chat Teaser */}
      <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900 dark:text-white">Pod Chat</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">3 new messages</div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
};

AccountabilityPods.propTypes = {
  workHistory: PropTypes.object,
  todayHours: PropTypes.number,
};

export default AccountabilityPods;
