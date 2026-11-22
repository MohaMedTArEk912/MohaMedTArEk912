import { PORTFOLIO_DATA } from '../../data/portfolioData';

const { profile, projects, certifications } = PORTFOLIO_DATA;
const [akasha, icu, quiz, library] = projects;

export const resumeUrl = `${import.meta.env.BASE_URL}resume/`;
export const resumePdfUrl = `${import.meta.env.BASE_URL}mohamed-tarek-hussien-resume.pdf`;

export const resumeTitle = 'Full-Stack Software Engineer';

export const resumeSummary =
  'Full-stack software engineer building MERN applications with MongoDB, Express.js, React, and Node.js. Builds REST APIs, adds real-time features with Socket.IO, and deploys containerized services.';

export const resumeSkills = [
  ['Programming', 'JavaScript, TypeScript, Python, Java, C'],
  ['Frontend', 'React, HTML, CSS, Tailwind CSS'],
  ['Backend', 'Node.js, Express.js, REST APIs, Socket.IO, WebSockets, authentication'],
  ['Databases', 'MongoDB, MySQL, Neo4j'],
  ['DevOps & CI/CD', 'Git, GitHub Actions, Jenkins, Docker, Kubernetes, AWS, Terraform, Ansible'],
  ['Monitoring', 'Prometheus, Grafana'],
] as const;

export const resumeExperience = [
  {
    role: 'Project Coordinator',
    organization: 'Eyouth · Digilians',
    period: 'May 2026 – Present',
    detail: 'Coordinate training schedules and onboarding, track milestones, and resolve issues with mentors.',
  },
  {
    role: 'Programming Instructor',
    organization: '3C School',
    period: 'Jun 2025 – May 2026',
    detail: 'Taught programming and algorithms through hands-on lessons, debugging exercises, and student projects.',
  },
  {
    role: 'Technical Support Representative',
    organization: 'Vodafone · Data & Fixed',
    period: 'Jul 2024 – Dec 2024',
    detail: 'Diagnosed broadband, DSL, and router issues and escalated infrastructure incidents to network engineers.',
  },
  {
    role: 'Technical Support Representative',
    organization: 'Vodafone · Corporate',
    period: 'Sep 2023 – Jan 2024',
    detail: 'Resolved enterprise connectivity requests with account managers and technical teams within SLA targets.',
  },
];

export const resumeProjects = [
  {
    title: akasha.title,
    role: akasha.role,
    detail: 'Led the graduation team building an AI-assisted workspace for system architecture, database schemas, and REST API design. Integrated Git and real-time collaboration.',
    url: akasha.githubUrl,
  },
  {
    title: quiz.title,
    role: quiz.role,
    detail: 'Built a multiplayer quiz app with React, Node.js, Express.js, and MongoDB. Added authentication and live score synchronization with Socket.IO.',
    url: quiz.githubUrl,
  },
  {
    title: icu.title,
    role: icu.role,
    detail: 'Built Node.js and Express.js REST APIs for patient records in MongoDB and streamed updates via Socket.IO.',
    url: icu.githubUrl,
  },
  {
    title: library.title,
    role: library.role,
    detail: 'Led a five-member team, reviewed pull requests, and built reusable React components with Tailwind CSS.',
    url: library.githubUrl,
  },
  {
    title: 'DEPI Cloud Infrastructure',
    role: 'DevOps Engineer',
    detail: 'Placed third for Best Project. Deployed Docker services on Kubernetes, automated CI/CD with GitHub Actions and Jenkins, and provisioned AWS with Terraform and Ansible.',
    url: icu.githubUrl,
  },
];

export const resumeTraining = [
  { title: 'DevOps Engineer Track', issuer: 'Digital Egypt Pioneers Initiative', date: 'Jun 2025 – Dec 2025' },
  ...certifications,
];

const resumeLanguages = profile.languages
  .map(({ name, proficiency }) => `${name} (${proficiency.toLowerCase()})`)
  .join(', ');

export function getPlainTextResume() {
  const { degree, department, university, period } = profile.education;

  return [
    [profile.name, resumeTitle, [profile.location, ...profile.emails, ...profile.phones].join(' | '), profile.github, profile.linkedin].join('\n'),
    `PROFESSIONAL SUMMARY\n${resumeSummary}`,
    ['TECHNICAL SKILLS', ...resumeSkills.map(([label, skills]) => `${label}: ${skills}`)].join('\n'),
    ['PROJECTS', ...resumeProjects.map(({ title, role, detail, url }) =>
      `${title} · ${role}\n${detail}\n${url}`)].join('\n'),
    ['PROFESSIONAL EXPERIENCE', ...resumeExperience.map(({ role, organization, period, detail }) =>
      `${role} · ${organization} | ${period}\n${detail}`)].join('\n'),
    `EDUCATION\n${university} | ${period}\n${degree} · ${department}`,
    ['CERTIFICATIONS & TRAINING', ...resumeTraining.map(({ title, issuer, date }) =>
      `${title} · ${issuer} | ${date}`)].join('\n'),
    `ADDITIONAL INFORMATION\nLanguages: ${resumeLanguages}\nMilitary service: ${profile.militaryStatus}`,
  ].join('\n\n');
}
