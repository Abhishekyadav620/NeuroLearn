import crypto from 'crypto';
import { ENV } from '../config/env.js';

/**
 * Format a Date object into YYYY-MM-DD string
 */
export const formatDateKey = (d = new Date()) => {
  const date = new Date(d);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns an array of the last 7 calendar days with ISO date strings and day labels
 */
export const getLast7DaysMetadata = () => {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = formatDateKey(d);
    const dayLabel = dayNames[d.getUTCDay()];
    days.push({ date: dateStr, day: dayLabel });
  }

  return days;
};

/**
 * Calculate consecutive day learning streak from sorted daily activity array
 */
export const calculateStreak = (dailyActivity = []) => {
  if (!dailyActivity || dailyActivity.length === 0) return 0;

  const activityDates = new Set(
    dailyActivity
      .filter((a) => (a.learningTimeMinutes || 0) > 0 || (a.eventsCount || 0) > 0)
      .map((a) => a.date)
  );

  const todayStr = formatDateKey(new Date());
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = formatDateKey(yesterday);

  // Check if active today or yesterday
  let currentCheck = activityDates.has(todayStr)
    ? new Date()
    : activityDates.has(yesterdayStr)
    ? yesterday
    : null;

  if (!currentCheck) return 0;

  let streak = 0;
  while (true) {
    const checkStr = formatDateKey(currentCheck);
    if (activityDates.has(checkStr)) {
      streak++;
      currentCheck.setUTCDate(currentCheck.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Generates an irreversible pseudonymized identifier for ML dataset export
 */
export const anonymizeStudentId = (studentId) => {
  const salt = ENV.JWT_SECRET || 'neurolearn_salt';
  return (
    'student_' +
    crypto
      .createHmac('sha256', salt)
      .update(String(studentId))
      .digest('hex')
      .slice(0, 12)
  );
};

/**
 * Bounds a numeric value between min and max with a safe fallback
 */
export const clamp = (val, min = 0, max = 100, defaultVal = 0) => {
  const num = Number(val);
  if (isNaN(num)) return defaultVal;
  return Math.min(max, Math.max(min, num));
};
