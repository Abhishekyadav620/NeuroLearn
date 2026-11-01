import User from '../models/User.js';
import Course from '../models/Course.js';

/**
 * Seed initial administrative instructor and realistic NeuroLearn courses
 * if none exist in the database.
 */
export const seedInitialCourses = async () => {
  try {
    // 1. Ensure an Admin / Lead Instructor account exists
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.findOne({ email: 'admin@neurolearn.ai' });
    }

    if (!adminUser) {
      adminUser = new User({
        fullName: 'Dr. Elena Vance (Lead Instructor)',
        username: 'admin_neuro',
        email: 'admin@neurolearn.ai',
        password: 'Admin@123',
        role: 'admin',
        isActive: true,
      });
      await adminUser.save();
      console.log('Seeded default Admin user: admin@neurolearn.ai / Admin@123');
    }

    // 2. Check if courses collection already contains data
    const existingCount = await Course.countDocuments();
    if (existingCount > 0) {
      return;
    }

    console.log('No courses found in MongoDB. Seeding initial NeuroLearn courses...');

    const sampleCourses = [
      {
        title: 'Foundations of Neural Networks & Adaptive Learning',
        slug: 'foundations-of-neural-networks-adaptive-learning',
        shortDescription:
          'Master deep learning architectures, perceptron mathematics, and adaptive attention mechanisms tailored for cognitive systems.',
        description:
          'An intensive immersion into biological neural networks, backpropagation calculus, activation functions, and modern attention-based transformers. Designed specifically for engineers building adaptive cognitive software.',
        thumbnail:
          'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
        category: 'Artificial Intelligence',
        level: 'Intermediate',
        language: 'English',
        instructor: adminUser._id,
        price: 0,
        isFree: true,
        duration: 14,
        prerequisites: ['Basic Linear Algebra & Matrix Calculus', 'Python 3 Proficiency'],
        learningOutcomes: [
          'Implement backpropagation from first principles',
          'Construct multi-layer perceptrons with PyTorch',
          'Design self-attention layers for adaptive cognitive models',
          'Benchmark model latency under edge constraints',
        ],
        tags: ['Neural Networks', 'Deep Learning', 'PyTorch', 'Artificial Intelligence'],
        modules: [
          {
            moduleTitle: 'Mathematical Foundations & Perceptrons',
            moduleDescription: 'Core linear transformations and biological motivation.',
            order: 1,
            lessons: [
              {
                lessonTitle: 'Biological vs Artificial Neurons',
                lessonDescription: 'Synaptic plasticity and mathematical weights.',
                lessonType: 'video',
                duration: 15,
                order: 1,
              },
              {
                lessonTitle: 'Activation Functions & Non-Linearity',
                lessonDescription: 'ReLU, Sigmoid, GELU, and gradient saturation.',
                lessonType: 'reading',
                duration: 20,
                order: 2,
              },
              {
                lessonTitle: 'Forward Propagation in Code',
                lessonDescription: 'Pure NumPy matrix vectorization.',
                lessonType: 'interactive',
                duration: 30,
                order: 3,
              },
            ],
          },
          {
            moduleTitle: 'Gradient Descent & Backpropagation',
            moduleDescription: 'Optimization landscapes and automated differentiation.',
            order: 2,
            lessons: [
              {
                lessonTitle: 'Cost Functions & Convexity',
                lessonDescription: 'Mean squared error vs binary cross-entropy.',
                lessonType: 'video',
                duration: 18,
                order: 1,
              },
              {
                lessonTitle: 'Chain Rule in Matrix Form',
                lessonDescription: 'Jacobians and backprop graph traversal.',
                lessonType: 'reading',
                duration: 25,
                order: 2,
              },
            ],
          },
        ],
        isPublished: true,
        totalEnrollments: 42,
        averageRating: 4.9,
      },
      {
        title: 'Full-Stack AI Web Applications with MERN',
        slug: 'full-stack-ai-web-applications-mern',
        shortDescription:
          'Build production-ready, AI-augmented web platforms with React, Node.js, Express, and MongoDB.',
        description:
          'Learn to design scalable EdTech architectures incorporating telemetry streaming, secure HttpOnly cookie session management, and microservice integration with machine learning inference pipelines.',
        thumbnail:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
        category: 'Web Development',
        level: 'Beginner',
        language: 'English',
        instructor: adminUser._id,
        price: 0,
        isFree: true,
        duration: 18,
        prerequisites: ['Basic JavaScript ES6', 'HTML & CSS fundamentals'],
        learningOutcomes: [
          'Architect resilient MERN stack REST APIs',
          'Implement secure JWT HttpOnly cookie authentication',
          'Build responsive EdTech dashboards using Tailwind & Recharts',
          'Deploy secure web applications to cloud infrastructure',
        ],
        tags: ['React', 'NodeJS', 'Express', 'MongoDB', 'FullStack'],
        modules: [
          {
            moduleTitle: 'Modern Full-Stack Architecture',
            moduleDescription: 'Client-server communications and data design.',
            order: 1,
            lessons: [
              {
                lessonTitle: 'Client-Server Telemetry Patterns',
                lessonDescription: 'REST vs WebSockets for telemetry ingestion.',
                lessonType: 'video',
                duration: 20,
                order: 1,
              },
              {
                lessonTitle: 'MongoDB Schemas & Compound Indexes',
                lessonDescription: 'Designing models for sub-millisecond lookups.',
                lessonType: 'reading',
                duration: 25,
                order: 2,
              },
            ],
          },
          {
            moduleTitle: 'Authentication & Session Security',
            moduleDescription: 'Defending against XSS and CSRF in modern SPAs.',
            order: 2,
            lessons: [
              {
                lessonTitle: 'HttpOnly Cookies vs LocalStorage',
                lessonDescription: 'Token storage security tradeoffs.',
                lessonType: 'video',
                duration: 15,
                order: 1,
              },
              {
                lessonTitle: 'Role-Based Access Control Middleware',
                lessonDescription: 'Implementing protect and authorize guards.',
                lessonType: 'interactive',
                duration: 25,
                order: 2,
              },
            ],
          },
        ],
        isPublished: true,
        totalEnrollments: 89,
        averageRating: 4.8,
      },
      {
        title: 'Cognitive Interaction Design & Human Pacing',
        slug: 'cognitive-interaction-design-human-pacing',
        shortDescription:
          'Design digital experiences that reduce cognitive friction and monitor learner focus signals.',
        description:
          'Explore user interface psychology, cognitive load theory, micro-interaction design, and non-intrusive telemetry collection for adaptive EdTech platforms.',
        thumbnail:
          'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop',
        category: 'Design',
        level: 'Beginner',
        language: 'English',
        instructor: adminUser._id,
        price: 49,
        isFree: false,
        duration: 10,
        prerequisites: ['Curiosity about Cognitive Psychology & UX'],
        learningOutcomes: [
          "Apply Sweller's Cognitive Load Theory to SaaS interfaces",
          'Detect interaction churn through behavioral signals',
          'Design micro-breaks and chunked learning cards',
        ],
        tags: ['UI/UX', 'Cognitive Science', 'Design Systems'],
        modules: [
          {
            moduleTitle: 'Cognitive Load Theory in Digital Systems',
            moduleDescription: 'Intrinsic, extraneous, and germane cognitive friction.',
            order: 1,
            lessons: [
              {
                lessonTitle: 'Visual Hierarchy and Typography Pacing',
                lessonDescription: 'Designing clean lavender SaaS typography.',
                lessonType: 'video',
                duration: 15,
                order: 1,
              },
              {
                lessonTitle: 'Chunking Dense Academic Content',
                lessonDescription: 'Structuring modular learning cards.',
                lessonType: 'reading',
                duration: 20,
                order: 2,
              },
            ],
          },
        ],
        isPublished: true,
        totalEnrollments: 31,
        averageRating: 4.7,
      },
      {
        title: 'Python for Data Science & Predictive Analytics',
        slug: 'python-for-data-science-predictive-analytics',
        shortDescription:
          'Manipulate datasets, compute statistical signals, and build predictive behavioral models.',
        description:
          'Master NumPy, Pandas, Scikit-Learn, and statistical telemetry analysis to identify trends and learning drift patterns.',
        thumbnail:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
        category: 'Data Science',
        level: 'Advanced',
        language: 'English',
        instructor: adminUser._id,
        price: 0,
        isFree: true,
        duration: 22,
        prerequisites: ['Python Fundamentals', 'Basic Probability'],
        learningOutcomes: [
          'Clean and analyze telemetry time-series',
          'Train behavioral classifier models with Scikit-Learn',
          'Interpret feature importance in learner attention dropouts',
        ],
        tags: ['Python', 'Data Science', 'Pandas', 'Scikit-Learn'],
        modules: [
          {
            moduleTitle: 'Telemetry Data Wrangling',
            moduleDescription: 'Data preparation and feature engineering.',
            order: 1,
            lessons: [
              {
                lessonTitle: 'Time-Series Data Wrangling',
                lessonDescription: 'Handling null signals and sampling jitter.',
                lessonType: 'video',
                duration: 25,
                order: 1,
              },
              {
                lessonTitle: 'Feature Extraction from Interaction Logs',
                lessonDescription: 'Computing rolling engagement indices.',
                lessonType: 'reading',
                duration: 25,
                order: 2,
              },
            ],
          },
        ],
        isPublished: true,
        totalEnrollments: 65,
        averageRating: 4.9,
      },
      {
        title: 'Advanced Cloud Deployments & Microservices (Draft)',
        slug: 'advanced-cloud-deployments-microservices-draft',
        shortDescription:
          'Containerizing MERN and ML inference engines with Docker and Kubernetes.',
        description:
          'Draft course currently in development for enterprise container orchestration.',
        thumbnail: '',
        category: 'Cloud Computing',
        level: 'Advanced',
        language: 'English',
        instructor: adminUser._id,
        price: 99,
        isFree: false,
        duration: 8,
        prerequisites: ['Linux Shell Fundamentals'],
        learningOutcomes: ['Write production Dockerfiles', 'Manage Kubernetes clusters'],
        tags: ['Docker', 'Kubernetes', 'Cloud'],
        modules: [
          {
            moduleTitle: 'Docker Fundamentals',
            moduleDescription: 'Building lightweight containers.',
            order: 1,
            lessons: [
              {
                lessonTitle: 'Dockerizing Express APIs',
                lessonDescription: 'Multi-stage builds and security hardening.',
                lessonType: 'video',
                duration: 15,
                order: 1,
              },
            ],
          },
        ],
        isPublished: false, // Draft unpublished course!
        totalEnrollments: 0,
        averageRating: 5.0,
      },
    ];

    for (const c of sampleCourses) {
      const courseDoc = new Course(c);
      await courseDoc.save();
    }

    console.log(`Successfully seeded ${sampleCourses.length} initial courses in MongoDB.`);
  } catch (err) {
    console.error('Error seeding initial courses:', err.message);
  }
};

export default seedInitialCourses;
