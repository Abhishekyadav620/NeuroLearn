import mongoose from 'mongoose';
import Course, { slugify } from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { validateYouTubeVideo, buildSafeEmbedUrl } from '../utils/youtubeHelper.js';

/**
 * Controller: Get published courses with search, filtering, sorting, and pagination
 * GET /api/courses
 */
export const getCourses = async (req, res, next) => {
  try {
    const {
      search = '',
      category = 'All',
      level = 'All',
      price = 'all',
      sort = 'newest',
      page = 1,
      limit = 9,
      includeUnpublished = false,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    // Base query: Only show published courses unless authorized admin explicitly requests all
    const query = {};

    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin || includeUnpublished !== 'true') {
      query.isPublished = true;
    }

    // Category filter
    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    // Level filter
    if (level && level !== 'All' && level !== 'all') {
      query.level = level;
    }

    // Price filter (free vs paid)
    if (price === 'free') {
      query.isFree = true;
    } else if (price === 'paid') {
      query.isFree = false;
    }

    // Search query (matches title, shortDescription, tags)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    // Sort order definition
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'popular') {
      sortOption = { totalEnrollments: -1, averageRating: -1 };
    } else if (sort === 'rating') {
      sortOption = { averageRating: -1 };
    } else if (sort === 'duration') {
      sortOption = { duration: 1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    // Execute queries in parallel for optimal throughput
    const [courses, totalCourses] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'fullName username profileImage')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Course.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCourses / limitNum) || 1;

    return successResponse(res, {
      statusCode: 200,
      message: 'Courses retrieved successfully',
      data: {
        courses,
        pagination: {
          totalCourses,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get course categories with course counts
 * GET /api/courses/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categoriesWithCount = await Course.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const standardCategories = [
      'Programming',
      'Web Development',
      'Artificial Intelligence',
      'Data Science',
      'Machine Learning',
      'Cloud Computing',
      'Cybersecurity',
      'Design',
    ];

    const categoryMap = new Map();
    standardCategories.forEach((cat) => categoryMap.set(cat, 0));
    categoriesWithCount.forEach((item) => {
      categoryMap.set(item._id, item.count);
    });

    const result = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    return successResponse(res, {
      statusCode: 200,
      message: 'Categories retrieved successfully',
      data: { categories: result },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get single course by slug or ID
 * GET /api/courses/:slug
 */
export const getCourseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Check if slug is an ObjectId fallback or standard slug
    const isObjectId = mongoose.Types.ObjectId.isValid(slug);
    const query = isObjectId ? { $or: [{ slug }, { _id: slug }] } : { slug };

    const course = await Course.findOne(query).populate(
      'instructor',
      'fullName username email profileImage'
    );

    if (!course) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Course not found with the requested identifier',
      });
    }

    const isAdmin = req.user && req.user.role === 'admin';

    // Access control: Unpublished courses can only be viewed by administrators
    if (!course.isPublished && !isAdmin) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Course not found or is currently unpublished',
      });
    }

    let courseObj = course.toObject();
    if (!isAdmin) {
      // Filter out unpublished modules and lessons for students
      if (courseObj.modules && Array.isArray(courseObj.modules)) {
        courseObj.modules = courseObj.modules
          .filter((m) => m.isPublished !== false)
          .map((m) => ({
            ...m,
            lessons: (m.lessons || []).filter((l) => l.isPublished !== false),
          }));
      }
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Course details retrieved successfully',
      data: { course: courseObj },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get course by ID (Internal / Admin edit use)
 * GET /api/courses/id/:courseId
 */
export const getCourseById = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid course ID format',
      });
    }

    const course = await Course.findById(courseId).populate(
      'instructor',
      'fullName username email profileImage'
    );

    if (!course) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Course not found',
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Course retrieved successfully',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Create a new course (Admin only)
 * POST /api/courses
 */
export const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      shortDescription,
      description,
      thumbnail,
      category,
      level,
      price,
      duration,
      prerequisites,
      learningOutcomes,
      tags,
      modules,
      isPublished,
    } = req.body;

    // Required field validation
    if (!title || !shortDescription || !description || !category || !level) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Please provide all required course fields (title, short description, description, category, level)',
      });
    }

    // Instructor is the authenticated user or an explicitly assigned instructor
    const instructor = req.body.instructor || req.user._id;

    // Generate unique slug
    let baseSlug = slugify(title);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await Course.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newCourse = new Course({
      title: title.trim(),
      slug: finalSlug,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      thumbnail: thumbnail || '',
      category,
      level,
      instructor,
      price: Number(price) || 0,
      isFree: Number(price) === 0,
      duration: Number(duration) || 0,
      prerequisites: Array.isArray(prerequisites) ? prerequisites : [],
      learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : [],
      tags: Array.isArray(tags) ? tags : [],
      modules: Array.isArray(modules) ? modules : [],
      isPublished: Boolean(isPublished),
    });

    await newCourse.save();

    return successResponse(res, {
      statusCode: 201,
      message: 'Course created successfully',
      data: { course: newCourse },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return errorResponse(res, {
        statusCode: 400,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Controller: Update existing course (Admin only)
 * PUT /api/courses/:courseId
 */
export const updateCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid course ID format',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Course not found',
      });
    }

    // Fields allowed to update
    const allowedFields = [
      'title',
      'shortDescription',
      'description',
      'thumbnail',
      'category',
      'level',
      'language',
      'price',
      'duration',
      'prerequisites',
      'learningOutcomes',
      'tags',
      'modules',
      'isPublished',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    // If title changed, update slug
    if (req.body.title && req.body.title !== course.title) {
      let baseSlug = slugify(req.body.title);
      let finalSlug = baseSlug;
      let counter = 1;
      while (
        await Course.findOne({ slug: finalSlug, _id: { $ne: course._id } })
      ) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      course.slug = finalSlug;
    }

    await course.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Course updated successfully',
      data: { course },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return errorResponse(res, {
        statusCode: 400,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Controller: Delete course and associated enrollments (Admin only)
 * DELETE /api/courses/:courseId
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid course ID format',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Course not found',
      });
    }

    // Delete course
    await Course.findByIdAndDelete(courseId);

    // Clean up associated enrollments
    await Enrollment.deleteMany({ course: courseId });

    return successResponse(res, {
      statusCode: 200,
      message: 'Course and associated enrollments deleted successfully',
      data: { courseId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Toggle publication status of course (Admin only)
 * PATCH /api/courses/:courseId/publish
 */
export const toggleCoursePublish = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid course ID format',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Course not found',
      });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    return successResponse(res, {
      statusCode: 200,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      data: {
        courseId: course._id,
        isPublished: course.isPublished,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return errorResponse(res, {
        statusCode: 400,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Controller: Validate YouTube Video URL (Admin utility)
 * POST /api/courses/validate-youtube
 */
export const validateYouTubeUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    const result = validateYouTubeVideo(url);

    if (!result.isValid) {
      return errorResponse(res, {
        statusCode: 400,
        message: result.error,
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'YouTube video link verified successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Create Module inside Course (Admin)
 * POST /api/courses/:courseId/modules
 */
export const createModule = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { moduleTitle, moduleDescription, isPublished } = req.body;

    if (!moduleTitle || !moduleTitle.trim()) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Module title is required',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, { statusCode: 404, message: 'Course not found' });
    }

    const newOrder = (course.modules?.length || 0) + 1;
    course.modules.push({
      moduleTitle: moduleTitle.trim(),
      moduleDescription: moduleDescription ? moduleDescription.trim() : '',
      order: newOrder,
      isPublished: isPublished !== false,
      lessons: [],
    });

    await course.save();

    const createdModule = course.modules[course.modules.length - 1];
    return successResponse(res, {
      statusCode: 201,
      message: 'Module created successfully',
      data: { module: createdModule, course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update Module (Admin)
 * PUT /api/courses/:courseId/modules/:moduleId
 */
export const updateModule = async (req, res, next) => {
  try {
    const { courseId, moduleId } = req.params;
    const { moduleTitle, moduleDescription, order, isPublished } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, { statusCode: 404, message: 'Course not found' });
    }

    const mod = course.modules.id(moduleId);
    if (!mod) {
      return errorResponse(res, { statusCode: 404, message: 'Module not found' });
    }

    if (moduleTitle !== undefined) mod.moduleTitle = moduleTitle.trim();
    if (moduleDescription !== undefined) mod.moduleDescription = moduleDescription.trim();
    if (order !== undefined) mod.order = Number(order);
    if (isPublished !== undefined) mod.isPublished = Boolean(isPublished);

    await course.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Module updated successfully',
      data: { module: mod, course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Delete Module (Admin)
 * DELETE /api/courses/:courseId/modules/:moduleId
 */
export const deleteModule = async (req, res, next) => {
  try {
    const { courseId, moduleId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, { statusCode: 404, message: 'Course not found' });
    }

    const mod = course.modules.id(moduleId);
    if (!mod) {
      return errorResponse(res, { statusCode: 404, message: 'Module not found' });
    }

    course.modules.pull(moduleId);
    await course.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Module deleted successfully',
      data: { courseId, moduleId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Reorder Modules (Admin)
 * PATCH /api/courses/:courseId/modules/reorder
 */
export const reorderModules = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { moduleIds } = req.body;

    if (!Array.isArray(moduleIds)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'moduleIds must be an array of module IDs',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, { statusCode: 404, message: 'Course not found' });
    }

    moduleIds.forEach((id, index) => {
      const mod = course.modules.id(id);
      if (mod) mod.order = index + 1;
    });

    course.modules.sort((a, b) => a.order - b.order);
    await course.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Modules reordered successfully',
      data: { modules: course.modules },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Create Lesson inside Module (Admin)
 * POST /api/courses/:courseId/modules/:moduleId/lessons
 */
export const createLesson = async (req, res, next) => {
  try {
    const { courseId, moduleId } = req.params;
    const {
      lessonTitle,
      lessonDescription,
      lessonType = 'video',
      duration = 10,
      videoUrl,
      content,
      resources,
      learningObjectives,
      isPublished = true,
    } = req.body;

    if (!lessonTitle || !lessonTitle.trim()) {
      return errorResponse(res, { statusCode: 400, message: 'Lesson title is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, { statusCode: 404, message: 'Course not found' });
    }

    const mod = course.modules.id(moduleId);
    if (!mod) {
      return errorResponse(res, { statusCode: 404, message: 'Module not found' });
    }

    let youtubeVideoId = '';
    if (lessonType === 'video') {
      if (!videoUrl || !videoUrl.trim()) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'YouTube video URL is required for video lessons',
        });
      }
      const validation = validateYouTubeVideo(videoUrl);
      if (!validation.isValid) {
        return errorResponse(res, { statusCode: 400, message: validation.error });
      }
      youtubeVideoId = validation.videoId;
    }

    const newLesson = {
      lessonTitle: lessonTitle.trim(),
      lessonDescription: lessonDescription ? lessonDescription.trim() : '',
      lessonType,
      duration: Number(duration) || 10,
      videoUrl: videoUrl ? videoUrl.trim() : '',
      youtubeVideoId,
      content: content || '',
      resources: Array.isArray(resources) ? resources : [],
      learningObjectives: Array.isArray(learningObjectives) ? learningObjectives : [],
      isPublished: isPublished !== false,
      order: (mod.lessons?.length || 0) + 1,
    };

    mod.lessons.push(newLesson);
    await course.save();

    const createdLesson = mod.lessons[mod.lessons.length - 1];
    return successResponse(res, {
      statusCode: 201,
      message: 'Lesson created successfully',
      data: { lesson: createdLesson, course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update Lesson (Admin)
 * PUT /api/courses/:courseId/modules/:moduleId/lessons/:lessonId
 */
export const updateLesson = async (req, res, next) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const {
      lessonTitle,
      lessonDescription,
      lessonType,
      duration,
      videoUrl,
      content,
      resources,
      learningObjectives,
      isPublished,
      order,
    } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, { statusCode: 404, message: 'Course not found' });
    }

    const mod = course.modules.id(moduleId);
    if (!mod) {
      return errorResponse(res, { statusCode: 404, message: 'Module not found' });
    }

    const lesson = mod.lessons.id(lessonId);
    if (!lesson) {
      return errorResponse(res, { statusCode: 404, message: 'Lesson not found' });
    }

    if (lessonTitle !== undefined) lesson.lessonTitle = lessonTitle.trim();
    if (lessonDescription !== undefined) lesson.lessonDescription = lessonDescription.trim();
    if (lessonType !== undefined) lesson.lessonType = lessonType;
    if (duration !== undefined) lesson.duration = Number(duration);
    if (content !== undefined) lesson.content = content;
    if (resources !== undefined) lesson.resources = resources;
    if (learningObjectives !== undefined) lesson.learningObjectives = learningObjectives;
    if (isPublished !== undefined) lesson.isPublished = Boolean(isPublished);
    if (order !== undefined) lesson.order = Number(order);

    if (lesson.lessonType === 'video' && videoUrl !== undefined) {
      lesson.videoUrl = videoUrl.trim();
      if (lesson.videoUrl) {
        const validation = validateYouTubeVideo(lesson.videoUrl);
        if (!validation.isValid) {
          return errorResponse(res, { statusCode: 400, message: validation.error });
        }
        lesson.youtubeVideoId = validation.videoId;
      }
    }

    await course.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Lesson updated successfully',
      data: { lesson, course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Delete Lesson (Admin)
 * DELETE /api/courses/:courseId/modules/:moduleId/lessons/:lessonId
 */
export const deleteLesson = async (req, res, next) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, { statusCode: 404, message: 'Course not found' });
    }

    const mod = course.modules.id(moduleId);
    if (!mod) {
      return errorResponse(res, { statusCode: 404, message: 'Module not found' });
    }

    const lesson = mod.lessons.id(lessonId);
    if (!lesson) {
      return errorResponse(res, { statusCode: 404, message: 'Lesson not found' });
    }

    mod.lessons.pull(lessonId);
    await course.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Lesson deleted successfully',
      data: { courseId, moduleId, lessonId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Reorder Lessons inside Module (Admin)
 * PATCH /api/courses/:courseId/modules/:moduleId/lessons/reorder
 */
export const reorderLessons = async (req, res, next) => {
  try {
    const { courseId, moduleId } = req.params;
    const { lessonIds } = req.body;

    if (!Array.isArray(lessonIds)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'lessonIds must be an array of lesson IDs',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, { statusCode: 404, message: 'Course not found' });
    }

    const mod = course.modules.id(moduleId);
    if (!mod) {
      return errorResponse(res, { statusCode: 404, message: 'Module not found' });
    }

    lessonIds.forEach((id, index) => {
      const lesson = mod.lessons.id(id);
      if (lesson) lesson.order = index + 1;
    });

    mod.lessons.sort((a, b) => a.order - b.order);
    await course.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Lessons reordered successfully',
      data: { lessons: mod.lessons },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Retrieve Single Lesson Details for Learning Player
 * GET /api/courses/:slugOrId/lessons/:lessonId
 * Access: Authenticated (Student/Admin)
 */
export const getLessonDetails = async (req, res, next) => {
  try {
    const slugOrId = req.params.slugOrId || req.params.slug;
    const { lessonId } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(slugOrId);
    const query = isObjectId ? { $or: [{ slug: slugOrId }, { _id: slugOrId }] } : { slug: slugOrId };

    const course = await Course.findOne(query);
    if (!course) {
      return errorResponse(res, { statusCode: 404, message: 'Course not found' });
    }

    const isAdmin = req.user && req.user.role === 'admin';
    if (!course.isPublished && !isAdmin) {
      return errorResponse(res, { statusCode: 404, message: 'Course is currently unpublished' });
    }

    let targetModule = null;
    let targetLesson = null;

    for (const mod of course.modules || []) {
      const l = mod.lessons?.find((les) => String(les._id) === String(lessonId));
      if (l) {
        targetModule = mod;
        targetLesson = l;
        break;
      }
    }

    if (!targetLesson) {
      return errorResponse(res, { statusCode: 404, message: 'Lesson not found in course' });
    }

    if ((!targetModule.isPublished || !targetLesson.isPublished) && !isAdmin) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'This module or lesson is currently unpublished',
      });
    }

    // Check student enrollment if not free or if auth required
    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: course._id,
      });
      isEnrolled = Boolean(enrollment);
    }

    // Embed metadata
    let embedUrl = null;
    if (targetLesson.lessonType === 'video' && targetLesson.youtubeVideoId) {
      embedUrl = buildSafeEmbedUrl(targetLesson.youtubeVideoId);
    }

    // Build ordered list of all lessons for Next/Prev navigation
    const flatLessons = [];
    (course.modules || [])
      .filter((m) => isAdmin || m.isPublished !== false)
      .forEach((m) => {
        (m.lessons || [])
          .filter((l) => isAdmin || l.isPublished !== false)
          .forEach((l) => {
            flatLessons.push({
              _id: l._id,
              lessonTitle: l.lessonTitle,
              lessonType: l.lessonType,
              duration: l.duration,
              moduleId: m._id,
              moduleTitle: m.moduleTitle,
            });
          });
      });

    const currentIndex = flatLessons.findIndex((l) => String(l._id) === String(targetLesson._id));
    const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

    return successResponse(res, {
      statusCode: 200,
      message: 'Lesson retrieved successfully',
      data: {
        course: {
          _id: course._id,
          title: course.title,
          slug: course.slug,
          category: course.category,
        },
        module: {
          _id: targetModule._id,
          moduleTitle: targetModule.moduleTitle,
        },
        currentModule: {
          _id: targetModule._id,
          moduleTitle: targetModule.moduleTitle,
        },
        lesson: {
          ...(targetLesson.toObject ? targetLesson.toObject() : targetLesson),
          embedUrl,
        },
        embedUrl,
        isEnrolled,
        navigation: {
          previousLesson: prevLesson,
          nextLesson: nextLesson,
        },
        prevLesson,
        nextLesson,
        totalCourseLessons: flatLessons.length,
        currentLessonIndex: currentIndex + 1,
        modules: (course.modules || []).filter((m) => isAdmin || m.isPublished !== false),
      },
    });
  } catch (error) {
    next(error);
  }
};
