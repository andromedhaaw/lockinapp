/**
 * Deep Work Score Calculator
 * Analyzes work patterns and calculates a 0-100 focus quality score
 */

import { getDateKey, getWeekRange } from './timeUtils';

/**
 * Calculate Deep Work Score for a single day
 * @param {Array} sessions - Array of session objects for the day
 * @returns {Object} Score breakdown with total and components
 */
export const calculateDailyDeepWorkScore = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return {
      total: 0,
      components: {
        duration: 0,
        consistency: 0,
        focusBlocks: 0,
        peakAlignment: 0,
      },
      insights: ['No sessions recorded for this day.'],
    };
  }

  const insights = [];
  
  // 1. Duration Score (0-30 points)
  // Optimal: 4-6 hours of deep work per day
  const totalHours = sessions.reduce((sum, s) => sum + (s.duration / (1000 * 60 * 60)), 0);
  let durationScore = 0;
  
  if (totalHours >= 4 && totalHours <= 6) {
    durationScore = 30; // Perfect range
    insights.push('✨ Perfect deep work duration (4-6 hours)');
  } else if (totalHours >= 3 && totalHours < 4) {
    durationScore = 25;
    insights.push('📈 Good work duration, aim for 4+ hours');
  } else if (totalHours > 6 && totalHours <= 8) {
    durationScore = 25;
    insights.push('⚠️ Great effort, but watch for burnout');
  } else if (totalHours >= 2 && totalHours < 3) {
    durationScore = 18;
    insights.push('💪 Solid start, try to extend focus sessions');
  } else if (totalHours > 8) {
    durationScore = 20;
    insights.push('🔥 Intense day! Remember to rest');
  } else if (totalHours >= 1) {
    durationScore = 10;
    insights.push('🌱 Keep building momentum');
  } else {
    durationScore = 5;
    insights.push('📅 Short session - every minute counts!');
  }

  // 2. Consistency Score (0-25 points)
  // Based on session distribution throughout the day
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.startTime) - new Date(b.startTime)
  );
  
  let consistencyScore = 0;
  if (sessions.length >= 3) {
    // Check for breaks between sessions (healthy pattern)
    let hasHealthyBreaks = true;
    for (let i = 1; i < sortedSessions.length; i++) {
      const gap = new Date(sortedSessions[i].startTime) - new Date(sortedSessions[i-1].endTime);
      const gapMinutes = gap / (1000 * 60);
      if (gapMinutes < 15) hasHealthyBreaks = false;
    }
    
    consistencyScore = hasHealthyBreaks ? 25 : 18;
    if (hasHealthyBreaks) {
      insights.push('🧘 Great work-break rhythm');
    }
  } else if (sessions.length === 2) {
    consistencyScore = 20;
  } else {
    consistencyScore = 12;
    insights.push('💡 Try breaking work into multiple focus blocks');
  }

  // 3. Focus Blocks Score (0-25 points)
  // Based on individual session quality (length)
  const avgSessionLength = totalHours / sessions.length;
  let focusBlocksScore = 0;
  
  if (avgSessionLength >= 1.5) {
    focusBlocksScore = 25; // 90+ min sessions = elite
    insights.push('🏆 Elite focus blocks (90+ min avg)');
  } else if (avgSessionLength >= 1) {
    focusBlocksScore = 22;
    insights.push('🎯 Strong focus sessions');
  } else if (avgSessionLength >= 0.5) {
    focusBlocksScore = 18;
    insights.push('👍 Decent session length');
  } else if (avgSessionLength >= 0.25) {
    focusBlocksScore = 12;
    insights.push('⏱️ Try longer focus blocks (25+ min)');
  } else {
    focusBlocksScore = 5;
    insights.push('🔄 Very short sessions detected');
  }

  // 4. Peak Alignment Score (0-20 points)
  // Are sessions during productive hours (8AM-12PM or 2PM-6PM)?
  let peakHours = 0;
  sessions.forEach(session => {
    const startHour = new Date(session.startTime).getHours();
    if ((startHour >= 8 && startHour < 12) || (startHour >= 14 && startHour < 18)) {
      peakHours += session.duration / (1000 * 60 * 60);
    }
  });
  
  const peakRatio = totalHours > 0 ? peakHours / totalHours : 0;
  let peakAlignmentScore = Math.round(peakRatio * 20);
  
  if (peakRatio >= 0.7) {
    insights.push('☀️ Working during peak productivity hours');
  } else if (peakRatio < 0.3 && totalHours > 2) {
    insights.push('🌙 Consider shifting to morning/afternoon blocks');
  }

  const total = durationScore + consistencyScore + focusBlocksScore + peakAlignmentScore;

  return {
    total: Math.min(100, total),
    components: {
      duration: durationScore,
      consistency: consistencyScore,
      focusBlocks: focusBlocksScore,
      peakAlignment: peakAlignmentScore,
    },
    insights: insights.slice(0, 3), // Top 3 insights
    stats: {
      totalHours: Math.round(totalHours * 100) / 100,
      sessionCount: sessions.length,
      avgSessionLength: Math.round(avgSessionLength * 60), // in minutes
    },
  };
};

/**
 * Calculate weekly Deep Work Score
 * @param {Object} sessionsByDate - Object with dateKey -> sessions array
 * @returns {Object} Weekly score with daily breakdown
 */
export const calculateWeeklyDeepWorkScore = (sessionsByDate) => {
  const dailyScores = {};
  let totalScore = 0;
  let daysWithWork = 0;
  let totalHours = 0;
  
  Object.entries(sessionsByDate).forEach(([dateKey, sessions]) => {
    const dayScore = calculateDailyDeepWorkScore(sessions);
    dailyScores[dateKey] = dayScore;
    
    if (sessions.length > 0) {
      totalScore += dayScore.total;
      daysWithWork++;
      totalHours += dayScore.stats.totalHours;
    }
  });

  const avgScore = daysWithWork > 0 ? Math.round(totalScore / daysWithWork) : 0;
  
  // Weekly insights
  const weeklyInsights = [];
  
  if (daysWithWork >= 5) {
    weeklyInsights.push('🔥 Consistent 5+ day work week!');
  } else if (daysWithWork >= 3) {
    weeklyInsights.push('📈 Building momentum this week');
  } else if (daysWithWork >= 1) {
    weeklyInsights.push('🌱 Every day counts - keep going!');
  }

  if (totalHours >= 30) {
    weeklyInsights.push('⚡ 30+ hours of deep work this week');
  } else if (totalHours >= 20) {
    weeklyInsights.push('💪 Solid 20+ hours logged');
  }

  if (avgScore >= 80) {
    weeklyInsights.push('🏆 Elite focus quality this week');
  } else if (avgScore >= 60) {
    weeklyInsights.push('✨ Great focus patterns');
  }

  return {
    avgScore,
    totalScore,
    daysWithWork,
    totalHours: Math.round(totalHours * 100) / 100,
    dailyScores,
    insights: weeklyInsights,
  };
};

/**
 * Get score grade and color
 */
export const getScoreGrade = (score) => {
  if (score >= 90) return { grade: 'S', label: 'Elite', color: 'from-yellow-400 to-orange-500' };
  if (score >= 80) return { grade: 'A', label: 'Excellent', color: 'from-green-400 to-emerald-500' };
  if (score >= 70) return { grade: 'B', label: 'Great', color: 'from-blue-400 to-cyan-500' };
  if (score >= 60) return { grade: 'C', label: 'Good', color: 'from-purple-400 to-pink-500' };
  if (score >= 50) return { grade: 'D', label: 'Fair', color: 'from-orange-400 to-red-400' };
  return { grade: 'F', label: 'Needs Work', color: 'from-gray-400 to-gray-500' };
};

/**
 * Get personalized tips based on score components
 */
export const getPersonalizedTips = (scoreData) => {
  const tips = [];
  const { components } = scoreData;

  if (components.duration < 20) {
    tips.push({
      icon: '⏰',
      title: 'Increase Work Duration',
      description: 'Aim for 4-6 hours of deep work daily for optimal productivity.',
    });
  }

  if (components.consistency < 18) {
    tips.push({
      icon: '🔄',
      title: 'Add More Focus Blocks',
      description: 'Break your work into 3-4 focused sessions with breaks in between.',
    });
  }

  if (components.focusBlocks < 18) {
    tips.push({
      icon: '🎯',
      title: 'Extend Session Length',
      description: 'Try the Pomodoro technique: 25-50 min focused work blocks.',
    });
  }

  if (components.peakAlignment < 14) {
    tips.push({
      icon: '☀️',
      title: 'Optimize Work Hours',
      description: 'Schedule deep work during 8AM-12PM or 2PM-6PM for peak focus.',
    });
  }

  // Default tip if doing well
  if (tips.length === 0) {
    tips.push({
      icon: '🌟',
      title: 'Keep It Up!',
      description: 'Your work patterns are excellent. Maintain this consistency!',
    });
  }

  return tips.slice(0, 3);
};
