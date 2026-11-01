import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Lock, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import enrollmentService from '../../services/enrollmentService.js';
import Button from '../common/Button.jsx';

export const EnrollmentButton = ({
  course,
  onEnrollmentSuccess,
  className = '',
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);

  // Check enrollment status when authenticated
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      if (!isAuthenticated || !course?._id) return;

      setCheckingStatus(true);
      try {
        const response = await enrollmentService.getEnrollmentStatus(course._id);
        if (isMounted && response.success && response.data?.isEnrolled) {
          setIsEnrolled(true);
        }
      } catch (err) {
        // Silently treat as not enrolled
      } finally {
        if (isMounted) setCheckingStatus(false);
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, course?._id]);

  const handleEnrollClick = async () => {
    setEnrollmentError(null);

    // If not authenticated, preserve destination and redirect to login
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    // If already enrolled, go to My Courses
    if (isEnrolled) {
      navigate('/my-courses');
      return;
    }

    // Free course enrollment
    if (course.isFree) {
      setEnrolling(true);
      try {
        const response = await enrollmentService.enrollInCourse(course._id);
        if (response.success) {
          setIsEnrolled(true);
          if (onEnrollmentSuccess) {
            onEnrollmentSuccess(response.data.enrollment);
          }
        }
      } catch (err) {
        if (err.status === 409) {
          setIsEnrolled(true);
        } else {
          setEnrollmentError(err.message || 'Failed to complete enrollment. Please try again.');
        }
      } finally {
        setEnrolling(false);
      }
      return;
    }

    // Paid course (Payment gateway not implemented in prompt 6)
    alert(
      `Purchase for $${course.price}: Payment gateway integration will be introduced in upcoming milestones. Enrolling you in preview access.`
    );
  };

  if (!course) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {isEnrolled ? (
        <div className="space-y-2">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>You are enrolled in this course</span>
          </div>

          <Button
            variant="primary"
            className="w-full"
            icon={ArrowRight}
            onClick={() => navigate('/my-courses')}
          >
            Go to My Courses
          </Button>
        </div>
      ) : (
        <Button
          variant="primary"
          className="w-full text-sm font-bold shadow-purple-btn py-3"
          disabled={enrolling || checkingStatus}
          onClick={handleEnrollClick}
        >
          {enrolling ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enrolling...</span>
            </span>
          ) : course.isFree ? (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Enroll for Free</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Purchase Course (${course.price})</span>
            </span>
          )}
        </Button>
      )}

      {enrollmentError && (
        <p className="text-xs text-rose-600 font-medium text-center">
          {enrollmentError}
        </p>
      )}
    </div>
  );
};

export default EnrollmentButton;
