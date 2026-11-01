import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Controller: Enroll authenticated student in a published course
 * POST /api/enrollments/:courseId
 */
export const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // Validate course ID format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid course ID format',
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Course not found',
      });
    }

    // Verify course publication status
    if (!course.isPublished) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Cannot enroll in an unpublished course',
      });
    }

    // Check for existing enrollment to prevent duplicates
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingEnrollment) {
      return errorResponse(res, {
        statusCode: 409,
        message: 'You are already enrolled in this course',
        data: {
          enrollmentId: existingEnrollment._id,
          enrolledAt: existingEnrollment.enrolledAt,
          progress: existingEnrollment.progress,
        },
      });
    }

    // Create enrollment record
    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
      enrolledAt: new Date(),
      status: 'active',
      progress: 0,
      lastAccessedAt: new Date(),
    });

    try {
      await enrollment.save();
    } catch (saveError) {
      // Handle MongoDB 11000 duplicate key race condition
      if (saveError.code === 11000) {
        return errorResponse(res, {
          statusCode: 409,
          message: 'You are already enrolled in this course',
        });
      }
      throw saveError;
    }

    // Atomically increment course total enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { totalEnrollments: 1 },
    });

    // Populate course details for immediate frontend rendering
    await enrollment.populate({
      path: 'course',
      select: 'title slug thumbnail category level duration totalLessons price isFree',
      populate: { path: 'instructor', select: 'fullName username' },
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Successfully enrolled in course',
      data: { enrollment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get authenticated student's enrolled courses ("My Courses")
 * GET /api/enrollments/my-courses
 */
export const getMyCourses = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const {
      status = 'all',
      sort = 'recent',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Query filter
    const query = { student: studentId };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Sort order
    let sortOption = { lastAccessedAt: -1 };
    if (sort === 'enrolled') {
      sortOption = { enrolledAt: -1 };
    } else if (sort === 'progress') {
      sortOption = { progress: -1 };
    }

    const [enrollments, totalEnrollments] = await Promise.all([
      Enrollment.find(query)
        .populate({
          path: 'course',
          select:
            'title slug thumbnail shortDescription category level duration totalLessons price isFree isPublished',
          populate: { path: 'instructor', select: 'fullName username profileImage' },
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Enrollment.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalEnrollments / limitNum) || 1;

    return successResponse(res, {
      statusCode: 200,
      message: 'Enrolled courses retrieved successfully',
      data: {
        enrollments,
        pagination: {
          totalEnrollments,
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
 * Controller: Check enrollment status and progress for a course
 * GET /api/enrollments/:courseId/status
 */
export const getEnrollmentStatus = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid course ID format',
      });
    }

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    }).lean();

    if (!enrollment) {
      return successResponse(res, {
        statusCode: 200,
        message: 'Student is not enrolled in this course',
        data: {
          isEnrolled: false,
          enrollment: null,
        },
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Student enrollment status retrieved',
      data: {
        isEnrolled: true,
        enrollment,
      },
    });
  } catch (error) {
    next(error);
  }
};
