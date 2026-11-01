import mongoose from 'mongoose';
import { extractYouTubeVideoId } from '../utils/youtubeHelper.js';

/**
 * Lesson Subdocument Schema
 */
const lessonSchema = new mongoose.Schema(
  {
    lessonTitle: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [150, 'Lesson title cannot exceed 150 characters'],
    },
    lessonDescription: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Lesson description cannot exceed 1000 characters'],
    },
    lessonType: {
      type: String,
      enum: ['video', 'reading', 'quiz', 'interactive', 'assignment', 'resource'],
      default: 'video',
    },
    duration: {
      type: Number,
      min: [0, 'Lesson duration cannot be negative'],
      default: 10, // minutes
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    learningObjectives: {
      type: [String],
      default: [],
    },
    content: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    youtubeVideoId: {
      type: String,
      trim: true,
      default: '',
    },
    resources: [
      {
        title: { type: String, trim: true },
        url: { type: String, trim: true },
      },
    ],
    quizData: {
      questions: [
        {
          questionText: { type: String, trim: true },
          options: [{ type: String, trim: true }],
          correctAnswer: { type: Number, min: 0 },
          explanation: { type: String, default: '' },
        },
      ],
    },
  },
  { _id: true }
);

/**
 * Module Subdocument Schema
 */
const moduleSchema = new mongoose.Schema(
  {
    moduleTitle: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
      maxlength: [150, 'Module title cannot exceed 150 characters'],
    },
    moduleDescription: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Module description cannot exceed 1000 characters'],
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    lessons: [lessonSchema],
  },
  { _id: true }
);

/**
 * Course Schema
 */
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [5, 'Course title must be at least 5 characters'],
      maxlength: [120, 'Course title cannot exceed 120 characters'],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [280, 'Short description cannot exceed 280 characters'],
    },
    description: {
      type: String,
      required: [true, 'Full course description is required'],
      trim: true,
    },
    thumbnail: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      enum: [
        'Programming',
        'Web Development',
        'Artificial Intelligence',
        'Data Science',
        'Machine Learning',
        'Cloud Computing',
        'Cybersecurity',
        'Design',
        'Other',
      ],
      default: 'Artificial Intelligence',
      index: true,
    },
    level: {
      type: String,
      required: [true, 'Course level is required'],
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner',
      index: true,
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Course instructor reference is required'],
      index: true,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Course price cannot be negative'],
    },
    isFree: {
      type: Boolean,
      default: true,
      index: true,
    },
    duration: {
      type: Number, // Total estimated hours
      default: 0,
      min: [0, 'Duration cannot be negative'],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    modules: [moduleSchema],
    totalLessons: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEnrollments: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound and Text Indexes for Optimized Retrieval
 */
courseSchema.index({ isPublished: 1, category: 1, level: 1 });
courseSchema.index({ isPublished: 1, isFree: 1 });
courseSchema.index({ isPublished: 1, createdAt: -1 });
courseSchema.index({ isPublished: 1, totalEnrollments: -1 });
courseSchema.index(
  {
    title: 'text',
    shortDescription: 'text',
    description: 'text',
    tags: 'text',
  },
  {
    weights: {
      title: 10,
      tags: 5,
      shortDescription: 3,
      description: 1,
    },
    name: 'CourseTextIndex',
  }
);

/**
 * Helper to generate URL-safe slug from title
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Pre-validation hook:
 * 1. Synchronize slug with title if missing or title changed
 * 2. Synchronize isFree and price
 * 3. Calculate totalLessons and duration from modules
 * 4. Prevent publishing invalid courses
 */
courseSchema.pre('validate', function (next) {
  // Sync isFree and price
  if (this.price === 0) {
    this.isFree = true;
  } else if (this.price > 0) {
    this.isFree = false;
  }

  // Calculate totalLessons from all module lessons
  if (this.modules && Array.isArray(this.modules)) {
    let lessonCount = 0;
    let totalMinutes = 0;

    this.modules.forEach((mod) => {
      if (mod.lessons && Array.isArray(mod.lessons)) {
        lessonCount += mod.lessons.length;
        mod.lessons.forEach((l) => {
          totalMinutes += Number(l.duration) || 0;
          if (l.videoUrl && !l.youtubeVideoId) {
            const extracted = extractYouTubeVideoId(l.videoUrl);
            if (extracted) {
              l.youtubeVideoId = extracted;
            }
          }
        });
      }
    });

    this.totalLessons = lessonCount;
    // If duration not explicitly set or is 0, estimate from lesson minutes
    if (!this.duration || this.duration === 0) {
      this.duration = Math.max(1, Math.round(totalMinutes / 60));
    }
  }

  // Generate slug if empty
  if (!this.slug && this.title) {
    const baseSlug = slugify(this.title);
    const suffix = Math.floor(1000 + Math.random() * 9000);
    this.slug = `${baseSlug}-${suffix}`;
  }

  // Publication integrity check: must have at least 1 module and 1 lesson to be published
  if (this.isPublished) {
    if (!this.modules || this.modules.length === 0 || this.totalLessons === 0) {
      this.invalidate(
        'isPublished',
        'Cannot publish course without at least one module and one lesson.'
      );
    }
  }

  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
