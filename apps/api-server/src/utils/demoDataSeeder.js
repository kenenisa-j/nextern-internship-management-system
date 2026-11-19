// apps/api-server/src/utils/demoDataSeeder.js
// Idempotent seeder that populates realistic demo data for project reviewers.

const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const logger = require('./logger');

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'DemoReviewer2025!';

const DEMO_ACCOUNTS_METADATA = [
  {
    role: 'SUPERADMIN',
    name: 'Alex Mercer',
    email: 'superadmin.demo@nextern.app',
    title: 'Platform Director & System Administrator',
    badge: 'Platform Owner',
    description: 'Full administrative access across all tenant organizations, workspace approvals, system metrics, and platform governance.',
    highlights: [
      'Platform analytics and growth metrics',
      'Tenant workspace approval & suspension controls',
      'Global multi-tenant infrastructure visibility'
    ],
    defaultRoute: '/superadmin/dashboard'
  },
  {
    role: 'ORG_ADMIN',
    name: 'Sarah Jenkins',
    email: 'admin.demo@nextern.app',
    title: 'Director of Engineering & Workspace Admin',
    badge: 'Company Admin',
    description: 'Manages company workspace programs, candidate review pipelines, mentor assignments, and organizational branding.',
    highlights: [
      'Manage & publish internship programs',
      'Review applicant pipeline (Shortlist, Interview, Accept)',
      'Provision & assign mentors to tracks',
      'Custom company branding & profile settings'
    ],
    defaultRoute: '/admin/dashboard'
  },
  {
    role: 'MENTOR',
    name: 'David Chen',
    email: 'mentor.demo@nextern.app',
    title: 'Senior Staff Engineer & Track Mentor',
    badge: 'Technical Lead',
    description: 'Oversees interns, assigns engineering deliverables, grades submissions with feedback, and conducts skill evaluations.',
    highlights: [
      'Create and assign domain tasks',
      'Grade intern submissions & assign scores/feedback',
      'Submit weekly & final multi-skill evaluations',
      'Real-time workspace chat with interns'
    ],
    defaultRoute: '/mentor/dashboard'
  },
  {
    role: 'INTERN',
    name: 'Marcus Vance',
    email: 'intern.demo@nextern.app',
    title: 'Full-Stack Engineering Intern',
    badge: 'Active Intern',
    description: 'Actively participating in a cloud fellowship: submits deliverables, views mentor ratings, checks attendance, and views certificate.',
    highlights: [
      'View assigned program track & tasks',
      'Submit code, GitHub repositories, and deliverables',
      'View mentor evaluation feedback & progress charts',
      'Access verified completion certificate with QR validation'
    ],
    defaultRoute: '/intern/dashboard'
  },
  {
    role: 'STUDENT',
    name: 'Elena Rostova',
    email: 'student.demo@nextern.app',
    title: 'Prospective Student Candidate',
    badge: 'Candidate',
    description: 'Global candidate browsing public internships, submitting applications with CV/portfolio, tracking review statuses, and managing profile.',
    highlights: [
      'Explore & filter public internship opportunities',
      'Submit direct applications with resume & links',
      'Track real-time application review stages',
      'Manage student academic & portfolio profile'
    ],
    defaultRoute: '/student/dashboard'
  }
];

async function seedDemoData() {
  logger.info('Starting idempotent demo data seeding...');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 1. Create or update Demo Organization
  const demoTenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo-workspace' },
    update: {
      name: 'Softgrowtech Demo Lab',
      status: 'ACTIVE',
      tier: 'ENTERPRISE_100',
      isBillingActive: true,
      industry: 'Software Engineering & Cloud Computing',
      location: 'San Francisco, CA & Remote',
      website: 'https://softgrowtech-intern-hub.vercel.app',
      company_size: '100-500',
      phone: '+1 (555) 019-2834',
      linkedin_url: 'https://linkedin.com/company/softgrowtech',
      is_verified: true,
      description: 'Softgrowtech Demo Lab is a leading technology accelerator providing production-grade internship programs in Full-Stack Web Development, Cloud Infrastructure, and AI Engineering.',
      onboardingMode: 'PUBLIC'
    },
    create: {
      name: 'Softgrowtech Demo Lab',
      subdomain: 'demo-workspace',
      status: 'ACTIVE',
      tier: 'ENTERPRISE_100',
      isBillingActive: true,
      industry: 'Software Engineering & Cloud Computing',
      location: 'San Francisco, CA & Remote',
      website: 'https://softgrowtech-intern-hub.vercel.app',
      company_size: '100-500',
      phone: '+1 (555) 019-2834',
      linkedin_url: 'https://linkedin.com/company/softgrowtech',
      is_verified: true,
      description: 'Softgrowtech Demo Lab is a leading technology accelerator providing production-grade internship programs in Full-Stack Web Development, Cloud Infrastructure, and AI Engineering.',
      onboardingMode: 'PUBLIC',
      tenantSettings: {
        create: {
          brand_color_hex: '#2563EB',
          timezone: 'America/New_York'
        }
      },
      tenantCredits: {
        create: {
          monthly_credit_limit: 1000.00,
          credits_consumed: 42.50
        }
      }
    }
  });

  // Also create realistic pending and suspended dummy tenants for Superadmin review showcase
  await prisma.tenant.upsert({
    where: { subdomain: 'novasphere-demo' },
    update: { status: 'PENDING_APPROVAL' },
    create: {
      name: 'NovaSphere Robotics',
      subdomain: 'novasphere-demo',
      status: 'PENDING_APPROVAL',
      tier: 'FREE_25',
      industry: 'Robotics & Hardware',
      location: 'Boston, MA',
      description: 'Autonomous robotics software platform.'
    }
  });

  await prisma.tenant.upsert({
    where: { subdomain: 'quantum-demo' },
    update: { status: 'SUSPENDED' },
    create: {
      name: 'QuantumByte Labs (Archived)',
      subdomain: 'quantum-demo',
      status: 'SUSPENDED',
      tier: 'FREE_25',
      industry: 'Quantum Analytics',
      location: 'Seattle, WA',
      description: 'Workspace suspended due to account lifecycle closure.'
    }
  });

  // 2. Create / Upsert Demo Users
  // Superadmin (global, tenant_id: null)
  let superadminUser = await prisma.user.findFirst({
    where: { email: 'superadmin.demo@nextern.app' }
  });
  if (!superadminUser) {
    superadminUser = await prisma.user.create({
      data: {
        name: 'Alex Mercer',
        email: 'superadmin.demo@nextern.app',
        password_hash: passwordHash,
        role: 'SUPERADMIN',
        domain: 'Platform Governance',
        is_active: true,
        status: 'ACCEPTED',
        tenant_id: null
      }
    });
  } else {
    superadminUser = await prisma.user.update({
      where: { id: superadminUser.id },
      data: { password_hash: passwordHash, is_active: true, status: 'ACCEPTED' }
    });
  }

  // Org Admin (Sarah Jenkins)
  let adminUser = await prisma.user.findFirst({
    where: { email: 'admin.demo@nextern.app', tenant_id: demoTenant.id }
  });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        name: 'Sarah Jenkins',
        email: 'admin.demo@nextern.app',
        password_hash: passwordHash,
        role: 'ORG_ADMIN',
        domain: 'Full-Stack',
        is_active: true,
        status: 'ACCEPTED',
        tenant_id: demoTenant.id
      }
    });
  } else {
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: { password_hash: passwordHash, is_active: true, status: 'ACCEPTED' }
    });
  }

  // Mentor (David Chen)
  let mentorUser = await prisma.user.findFirst({
    where: { email: 'mentor.demo@nextern.app', tenant_id: demoTenant.id }
  });
  if (!mentorUser) {
    mentorUser = await prisma.user.create({
      data: {
        name: 'David Chen',
        email: 'mentor.demo@nextern.app',
        password_hash: passwordHash,
        role: 'MENTOR',
        domain: 'Full-Stack',
        is_active: true,
        status: 'ACCEPTED',
        tenant_id: demoTenant.id,
        bio: 'Senior Staff Software Architect with 10+ years building scalable microservices and distributed cloud systems.',
        github_url: 'https://github.com/davidchen-demo',
        linkedin_url: 'https://linkedin.com/in/davidchen-demo'
      }
    });
  } else {
    mentorUser = await prisma.user.update({
      where: { id: mentorUser.id },
      data: { password_hash: passwordHash, is_active: true, status: 'ACCEPTED' }
    });
  }

  // Intern (Marcus Vance)
  let internUser = await prisma.user.findFirst({
    where: { email: 'intern.demo@nextern.app', tenant_id: demoTenant.id }
  });
  if (!internUser) {
    internUser = await prisma.user.create({
      data: {
        name: 'Marcus Vance',
        email: 'intern.demo@nextern.app',
        password_hash: passwordHash,
        role: 'INTERN',
        domain: 'Full-Stack',
        is_active: true,
        status: 'ACCEPTED',
        tenant_id: demoTenant.id,
        university: 'Stanford University',
        department: 'Computer Science',
        graduation_year: 2026,
        bio: 'Passionate full-stack developer focusing on React, Node.js, and distributed database systems.',
        github_url: 'https://github.com/marcusvance-demo',
        linkedin_url: 'https://linkedin.com/in/marcusvance-demo',
        portfolio_url: 'https://marcusvance-demo.dev'
      }
    });
  } else {
    internUser = await prisma.user.update({
      where: { id: internUser.id },
      data: { password_hash: passwordHash, is_active: true, status: 'ACCEPTED' }
    });
  }

  // Student (Elena Rostova - global account)
  let studentUser = await prisma.user.findFirst({
    where: { email: 'student.demo@nextern.app', tenant_id: null }
  });
  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        name: 'Elena Rostova',
        email: 'student.demo@nextern.app',
        password_hash: passwordHash,
        role: 'STUDENT',
        domain: 'Student',
        is_active: true,
        status: 'ACCEPTED',
        tenant_id: null,
        university: 'University of Washington',
        department: 'Software Engineering',
        graduation_year: 2027,
        bio: 'Aspiring software engineer interested in modern web frameworks, AI integration, and cloud-native architecture.',
        github_url: 'https://github.com/elenarostova-demo',
        linkedin_url: 'https://linkedin.com/in/elenarostova-demo'
      }
    });
  } else {
    studentUser = await prisma.user.update({
      where: { id: studentUser.id },
      data: { password_hash: passwordHash, is_active: true, status: 'ACCEPTED' }
    });
  }

  // 3. Create Demo Programs
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAhead = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const tenDaysAhead = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  let program1 = await prisma.internshipProgram.findFirst({
    where: { tenant_id: demoTenant.id, title: 'Full-Stack Cloud Engineering Fellowship' }
  });

  if (!program1) {
    program1 = await prisma.internshipProgram.create({
      data: {
        tenant_id: demoTenant.id,
        title: 'Full-Stack Cloud Engineering Fellowship',
        description: 'Comprehensive 12-week immersive fellowship where interns build production-grade web applications, event-driven architectures, and distributed services under 1-on-1 staff mentorship.',
        category: 'Full-Stack Development',
        skills: 'React, Node.js, PostgreSQL, Docker, Redis, TypeScript',
        type: 'REMOTE',
        is_paid: true,
        stipend: 2500.00,
        duration: '3 Months',
        start_date: thirtyDaysAgo,
        end_date: sixtyDaysAhead,
        positions: 6,
        deadline: tenDaysAhead,
        status: 'OPEN',
        visibility: 'PUBLIC',
        location: 'Remote / United States',
        responsibilities: 'Develop responsive React frontends; build and document high-performance Express/Node REST APIs; write unit and integration tests; collaborate in daily agile standups.',
        benefits: 'Monthly stipend ($2,500), 1-on-1 mentorship with Senior Staff Engineers, real-world microservices experience, verified digital certificate upon completion.',
        preferred_quals: 'Proficiency in JavaScript/TypeScript, experience with relational databases, understanding of Git workflow.'
      }
    });
  }

  let program2 = await prisma.internshipProgram.findFirst({
    where: { tenant_id: demoTenant.id, title: 'AI & Machine Learning Infrastructure Fellowship' }
  });

  if (!program2) {
    program2 = await prisma.internshipProgram.create({
      data: {
        tenant_id: demoTenant.id,
        title: 'AI & Machine Learning Infrastructure Fellowship',
        description: 'Hands-on program working with LLM orchestration, retrieval-augmented generation (RAG) pipelines, vector search optimization, and model evaluation systems.',
        category: 'AI & Data Science',
        skills: 'Python, PyTorch, FastAPI, Vector DBs, LLMs, Docker',
        type: 'HYBRID',
        is_paid: true,
        stipend: 2800.00,
        duration: '4 Months',
        start_date: thirtyDaysAgo,
        end_date: sixtyDaysAhead,
        positions: 4,
        deadline: tenDaysAhead,
        status: 'OPEN',
        visibility: 'PUBLIC',
        location: 'San Francisco, CA (Hybrid)',
        responsibilities: 'Assist in fine-tuning and evaluating embeddings; optimize LLM inference pipelines; integrate automated evaluation metrics.',
        benefits: 'GPU compute access, competitive stipend ($2,800), mentorship from AI Research Engineers.'
      }
    });
  }

  // Link Mentor to Programs
  await prisma.programMentor.upsert({
    where: {
      program_id_user_id: {
        program_id: program1.id,
        user_id: mentorUser.id
      }
    },
    update: {},
    create: {
      program_id: program1.id,
      user_id: mentorUser.id
    }
  });

  // 4. Candidate Applications
  // Marcus Vance - ACCEPTED
  let appMarcus = await prisma.application.findFirst({
    where: { tenant_id: demoTenant.id, program_id: program1.id, applicant_user_id: internUser.id }
  });
  if (!appMarcus) {
    appMarcus = await prisma.application.create({
      data: {
        tenant_id: demoTenant.id,
        program_id: program1.id,
        applicant_user_id: internUser.id,
        name: 'Marcus Vance',
        email: 'intern.demo@nextern.app',
        cv_path: '/uploads/resumes/marcus_vance_cv.pdf',
        github_link: 'https://github.com/marcusvance-demo',
        linkedin_link: 'https://linkedin.com/in/marcusvance-demo',
        cover_letter: 'I am eager to contribute to Softgrowtech cloud architecture while deepening my knowledge of distributed systems.',
        status: 'ACCEPTED',
        assigned_mentor_id: mentorUser.id
      }
    });
  } else {
    await prisma.application.update({
      where: { id: appMarcus.id },
      data: { status: 'ACCEPTED', assigned_mentor_id: mentorUser.id }
    });
  }

  // Elena Rostova - SHORTLISTED
  let appElena = await prisma.application.findFirst({
    where: { tenant_id: demoTenant.id, program_id: program1.id, email: 'student.demo@nextern.app' }
  });
  if (!appElena) {
    appElena = await prisma.application.create({
      data: {
        tenant_id: demoTenant.id,
        program_id: program1.id,
        applicant_user_id: studentUser.id,
        name: 'Elena Rostova',
        email: 'student.demo@nextern.app',
        cv_path: '/uploads/resumes/elena_rostova_cv.pdf',
        github_link: 'https://github.com/elenarostova-demo',
        linkedin_link: 'https://linkedin.com/in/elenarostova-demo',
        cover_letter: 'I have hands-on experience building full-stack applications with React and TypeScript and would love the opportunity to grow at Softgrowtech.',
        status: 'SHORTLISTED',
        assigned_mentor_id: mentorUser.id
      }
    });
  }

  // Jordan Lee - INTERVIEW
  let appJordan = await prisma.application.findFirst({
    where: { tenant_id: demoTenant.id, program_id: program2.id, email: 'jordan.lee@example.com' }
  });
  if (!appJordan) {
    appJordan = await prisma.application.create({
      data: {
        tenant_id: demoTenant.id,
        program_id: program2.id,
        name: 'Jordan Lee',
        email: 'jordan.lee@example.com',
        cv_path: '/uploads/resumes/jordan_lee_cv.pdf',
        github_link: 'https://github.com/jordanlee-demo',
        cover_letter: 'Passionate about vector databases and LLM orchestration.',
        status: 'INTERVIEW',
        assigned_mentor_id: mentorUser.id
      }
    });
  }

  // Student saved internships
  await prisma.savedInternship.upsert({
    where: {
      user_id_program_id: {
        user_id: studentUser.id,
        program_id: program1.id
      }
    },
    update: {},
    create: {
      user_id: studentUser.id,
      program_id: program1.id
    }
  });

  // 5. Tasks and Submissions
  let task1 = await prisma.task.findFirst({
    where: { tenant_id: demoTenant.id, title: 'Build Scalable Rate Limiter Middleware' }
  });
  if (!task1) {
    task1 = await prisma.task.create({
      data: {
        tenant_id: demoTenant.id,
        title: 'Build Scalable Rate Limiter Middleware',
        description: 'Design and implement a distributed token-bucket rate limiter middleware using Redis to safeguard API endpoints from traffic spikes.',
        domain: 'Full-Stack',
        priority: 'HIGH',
        points: 100,
        created_by: mentorUser.id,
        deadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      }
    });
  }

  let task2 = await prisma.task.findFirst({
    where: { tenant_id: demoTenant.id, title: 'Implement JWT Session Rotation & Refresh Flow' }
  });
  if (!task2) {
    task2 = await prisma.task.create({
      data: {
        tenant_id: demoTenant.id,
        title: 'Implement JWT Session Rotation & Refresh Flow',
        description: 'Implement secure short-lived access tokens (15m) paired with rotating refresh tokens stored in secure HttpOnly cookies, including token revocation.',
        domain: 'Full-Stack',
        priority: 'MEDIUM',
        points: 90,
        created_by: mentorUser.id,
        deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    });
  }

  let task3 = await prisma.task.findFirst({
    where: { tenant_id: demoTenant.id, title: 'Database Indexing & Query Optimization' }
  });
  if (!task3) {
    task3 = await prisma.task.create({
      data: {
        tenant_id: demoTenant.id,
        title: 'Database Indexing & Query Optimization',
        description: 'Analyze query execution plans on frequently accessed tables and add composite indexes for multi-tenant tenant_id queries.',
        domain: 'Full-Stack',
        priority: 'LOW',
        points: 80,
        created_by: mentorUser.id,
        deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // Submission for Task 1 (Graded)
  const existingSub1 = await prisma.submission.findFirst({
    where: { task_id: task1.id, intern_id: internUser.id }
  });
  if (!existingSub1) {
    await prisma.submission.create({
      data: {
        task_id: task1.id,
        intern_id: internUser.id,
        status: 'approved',
        grade: 'A',
        score: 98,
        feedback: 'Superb implementation! Clean Redis atomicity using Lua scripts and 100% test coverage for concurrency scenarios.',
        github_link: 'https://github.com/marcusvance-demo/rate-limiter-middleware',
        submission_text: 'Completed Redis token-bucket middleware with configurable burst capacity and IP/token tracking.',
        submitted_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        graded_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // Submission for Task 2 (Pending review)
  const existingSub2 = await prisma.submission.findFirst({
    where: { task_id: task2.id, intern_id: internUser.id }
  });
  if (!existingSub2) {
    await prisma.submission.create({
      data: {
        task_id: task2.id,
        intern_id: internUser.id,
        status: 'pending',
        github_link: 'https://github.com/marcusvance-demo/jwt-refresh-rotation',
        submission_text: 'Implemented refresh token family tracking to detect reuse attacks with test suites.',
        submitted_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // 6. Attendance Records (Last 5 business days)
  for (let i = 1; i <= 5; i++) {
    const punchDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateOnly = new Date(punchDate.getFullYear(), punchDate.getMonth(), punchDate.getDate());
    const checkIn = new Date(dateOnly.getTime() + 9 * 60 * 60 * 1000); // 9:00 AM
    const checkOut = new Date(dateOnly.getTime() + 17 * 60 * 60 * 1000); // 5:00 PM

    await prisma.attendance.upsert({
      where: {
        intern_id_date: {
          intern_id: internUser.id,
          date: dateOnly
        }
      },
      update: {},
      create: {
        tenant_id: demoTenant.id,
        intern_id: internUser.id,
        date: dateOnly,
        check_in: checkIn,
        check_out: checkOut,
        status: 'APPROVED',
        approved_by: mentorUser.id
      }
    });
  }

  // 7. Mentor Evaluations
  // Weekly Evaluation
  const existingWeekly = await prisma.evaluation.findFirst({
    where: { intern_id: internUser.id, type: 'WEEKLY' }
  });
  if (!existingWeekly) {
    await prisma.evaluation.create({
      data: {
        tenant_id: demoTenant.id,
        intern_id: internUser.id,
        mentor_id: mentorUser.id,
        type: 'WEEKLY',
        technical_skills: 9,
        communication: 8,
        teamwork: 9,
        problem_solving: 9,
        attendance: 10,
        professionalism: 9,
        overall_score: 9.00,
        comments: 'Marcus hit the ground running, grasped the repository architecture rapidly, and contributed meaningful code in sprint 1.'
      }
    });
  }

  // Final Evaluation (Unlocks Certificate & Review)
  const existingFinal = await prisma.evaluation.findFirst({
    where: { intern_id: internUser.id, type: 'FINAL' }
  });
  if (!existingFinal) {
    await prisma.evaluation.create({
      data: {
        tenant_id: demoTenant.id,
        intern_id: internUser.id,
        mentor_id: mentorUser.id,
        type: 'FINAL',
        technical_skills: 10,
        communication: 9,
        teamwork: 9,
        problem_solving: 10,
        attendance: 10,
        professionalism: 10,
        overall_score: 9.67,
        comments: 'Marcus demonstrated outstanding technical depth, strong architectural instincts, and reliable teamwork throughout the program. Highly recommended!'
      }
    });
  }

  // 8. Verified Certificate of Completion
  let certificate = await prisma.certificate.findFirst({
    where: { intern_id: internUser.id }
  });
  if (!certificate) {
    certificate = await prisma.certificate.create({
      data: {
        id: 'demo-cert-marcus-vance-2025',
        intern_id: internUser.id,
        url: '/verify/demo-cert-marcus-vance-2025',
        generated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // 9. Intern Review
  const existingReview = await prisma.review.findFirst({
    where: { tenant_id: demoTenant.id, reviewer_id: internUser.id }
  });
  if (!existingReview) {
    await prisma.review.create({
      data: {
        tenant_id: demoTenant.id,
        reviewer_id: internUser.id,
        receiver_id: mentorUser.id,
        rating: 5,
        comment: 'An outstanding fellowship experience! The engineering mentorship was high quality and I learned production best practices every single week.'
      }
    });
  }

  // 10. Workspace Discussion Messages
  const existingMsg = await prisma.message.findFirst({
    where: { tenant_id: demoTenant.id, sender_id: mentorUser.id }
  });
  if (!existingMsg) {
    await prisma.message.create({
      data: {
        tenant_id: demoTenant.id,
        sender_id: mentorUser.id,
        receiver_id: internUser.id,
        content: 'Welcome to the team Marcus! Take a look at the rate limiter task and feel free to ping me if you have any questions on the architecture.',
        is_read: true
      }
    });
    await prisma.message.create({
      data: {
        tenant_id: demoTenant.id,
        sender_id: internUser.id,
        receiver_id: mentorUser.id,
        content: 'Thanks David! I am on it and reviewing the Redis Lua script atomicity patterns now.',
        is_read: true
      }
    });
  }

  logger.info('Demo data successfully seeded for all 5 roles.');
  return { success: true, message: 'Demo data seeded successfully.' };
}

module.exports = {
  seedDemoData,
  DEMO_ACCOUNTS_METADATA,
  DEMO_PASSWORD
};
