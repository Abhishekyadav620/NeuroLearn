export const NAV_LINKS = [
  { name: 'Overview', path: '/' },
  { name: 'Student Dashboard', path: '/dashboard' },
];

export const CORE_SIGNALS = [
  {
    id: 'scroll',
    title: 'Scrolling Behaviour',
    description: 'Tracks velocity and erratic scroll patterns that signal frustration or disengagement.',
    icon: 'MousePointer',
    badge: 'Real-time',
  },
  {
    id: 'mouse',
    title: 'Mouse Movement',
    description: 'Detects cursor trajectory jitter, idle states, and unfocused browsing motions.',
    icon: 'Activity',
    badge: 'Micro-metrics',
  },
  {
    id: 'reading',
    title: 'Reading Time',
    description: 'Benchmarks pacing against content complexity to measure cognitive absorption.',
    icon: 'Clock',
    badge: 'Adaptive',
  },
  {
    id: 'quiz',
    title: 'Quiz Performance',
    description: 'Evaluates dynamic comprehension spikes and knowledge retention under varied formats.',
    icon: 'CheckCircle2',
    badge: 'Evaluative',
  },
  {
    id: 'gaze',
    title: 'Gaze & Blink Patterns',
    description: 'Optional optical attention metrics active strictly with explicit student privacy consent.',
    icon: 'Eye',
    badge: 'Privacy-Gated',
  },
];
