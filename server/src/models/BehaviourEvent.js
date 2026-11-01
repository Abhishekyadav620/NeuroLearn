import mongoose from 'mongoose';

/**
 * Valid behavioural event types defined in Section 3
 */
export const ALLOWED_EVENT_TYPES = [
  // Reading behaviour
  'reading_started',
  'reading_progress',
  'reading_completed',
  'reading_paused',
  'reading_resumed',

  // Video behaviour
  'video_started',
  'video_paused',
  'video_resumed',
  'video_seeked',
  'video_progress',
  'video_completed',

  // Quiz behaviour
  'quiz_started',
  'question_answered',
  'quiz_submitted',
  'quiz_completed',
  'quiz_retried',

  // Lesson interaction behaviour
  'lesson_opened',
  'lesson_completed',
  'lesson_revisited',
  'next_lesson_clicked',
  'previous_lesson_clicked',
  'resource_opened',
];

/**
 * BehaviourEvent Schema
 * Captures granular learner interaction events for adaptive learning analysis and ML dataset generation.
 */
const behaviourEventSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID reference is required'],
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID reference is required'],
      index: true,
    },
    lessonId: {
      type: String,
      required: [true, 'Lesson identifier is required'],
      trim: true,
      index: true,
    },
    sessionId: {
      type: String,
      trim: true,
      default: () => new mongoose.Types.ObjectId().toString(),
      index: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: {
        values: ALLOWED_EVENT_TYPES,
        message: 'Invalid behavioural event type: {VALUE}',
      },
      index: true,
    },
    eventTimestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    eventData: {
      durationSeconds: {
        type: Number,
        min: [0, 'Duration cannot be negative'],
        default: 0,
      },
      progressPercentage: {
        type: Number,
        min: [0, 'Progress percentage cannot be less than 0'],
        max: [100, 'Progress percentage cannot exceed 100'],
        default: 0,
      },
      scrollDepthPercentage: {
        type: Number,
        min: [0, 'Scroll depth cannot be less than 0'],
        max: [100, 'Scroll depth cannot exceed 100'],
        default: 0,
      },
      playbackSpeed: {
        type: Number,
        min: [0.25, 'Playback speed too slow'],
        max: [4.0, 'Playback speed too fast'],
        default: 1.0,
      },
      pauseCount: {
        type: Number,
        min: 0,
        default: 0,
      },
      seekCount: {
        type: Number,
        min: 0,
        default: 0,
      },
      questionId: {
        type: String,
        trim: true,
        default: '',
      },
      isCorrect: {
        type: Boolean,
        default: null,
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      attemptNumber: {
        type: Number,
        min: 1,
        default: 1,
      },
      resourceTitle: {
        type: String,
        trim: true,
        default: '',
      },
      metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound Indexes for High-Throughput Aggregation and ML Pipelines
 */
behaviourEventSchema.index({ student: 1, eventTimestamp: -1 });
behaviourEventSchema.index({ student: 1, course: 1, eventType: 1 });
behaviourEventSchema.index({ student: 1, eventType: 1, eventTimestamp: -1 });
behaviourEventSchema.index({ course: 1, eventType: 1 });
behaviourEventSchema.index({ sessionId: 1, eventTimestamp: 1 });

const BehaviourEvent = mongoose.model('BehaviourEvent', behaviourEventSchema);

export default BehaviourEvent;
