export interface ProjectStation {
  id: string;
  stationKey: 'akasha' | 'icu' | 'quiz' | 'library';
  title: string;
  subtitle: string;
  category: 'Full-Stack' | 'System Architecture' | 'AI & Distributed' | 'Real-Time';
  role: string;
  impactMetrics: {
    label: string;
    value: string;
  }[];
  architectureSummary: string;
  techStack: string[];
  keyFeatures: string[];
  githubUrl: string;
  liveUrl?: string;
  accentColor: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  highlight: string;
  description: string[];
  technologies?: string[];
  badge?: string;
}

export const PORTFOLIO_DATA = {
  profile: {
    name: 'Mohamed Tarek Hussien',
    title: 'Full-Stack Software Engineer (MERN & DevOps)',
    location: 'Cairo, Egypt',
    emails: ['mohaamedtariq12@gmail.com'],
    gmailComposeUrl:
      'https://mail.google.com/mail/?view=cm&fs=1&to=mohaamedtariq12@gmail.com&su=Hello%20Mohamed%20%E2%80%94%20Portfolio%20Inquiry&body=Hi%20Mohamed%2C%0A%0AI%20came%20across%20your%20portfolio%20and%20would%20love%20to%20connect%20with%20you%20about%20',
    phones: ['+20 101 579 1368'],
    github: 'https://github.com/MohaMedTArEk912',
    githubUsername: 'MohaMedTArEk912',
    linkedin: 'https://www.linkedin.com/in/mohamed-tarek-184510337/',
    education: {
      degree: 'B.Sc. in Computer Science and Information',
      department: 'Software Engineering Department',
      university: 'Helwan University',
      period: '2022 – 2026',
      status: 'Class of 2026',
    },
    militaryStatus: 'Exempt',
    languages: [
      { name: 'Arabic', proficiency: 'Native' },
      { name: 'English', proficiency: 'Fluent in writing and proficient in speaking' },
    ],
  },

  projects: [
    {
      "id": "akasha",
      "stationKey": "akasha",
      "title": "Akasha Platform",
      "subtitle": "Software architecture and project planning",
      "category": "AI & Distributed",
      "role": "Team Lead & Full-Stack Engineer",
      "impactMetrics": [
        {
          "label": "Context",
          "value": "Graduation project"
        },
        {
          "label": "University",
          "value": "Helwan"
        }
      ],
      "architectureSummary": "A shared workspace for turning software ideas into engineering blueprints.",
      "techStack": [
        "Architecture planning",
        "Database design",
        "REST APIs",
        "Git"
      ],
      "keyFeatures": [
        "Led the graduation team building an AI-assisted planning platform.",
        "Built modules for system architecture, database schemas, and REST API specifications.",
        "Integrated Git workflows and real-time collaboration."
      ],
      "githubUrl": "https://github.com/MohaMedTArEk912/Akasha",
      "accentColor": "#F2C94C"
    },
    {
      "id": "icu",
      "stationKey": "icu",
      "title": "ICU Management System",
      "subtitle": "Patient records and live clinical updates",
      "category": "Real-Time",
      "role": "Backend & Integration Developer",
      "impactMetrics": [
        {
          "label": "Data store",
          "value": "MongoDB"
        },
        {
          "label": "Events",
          "value": "Socket.IO"
        }
      ],
      "architectureSummary": "Backend services for intensive care operations, patient records, and live updates.",
      "techStack": [
        "Node.js",
        "Express",
        "MongoDB",
        "Socket.IO",
        "REST APIs"
      ],
      "keyFeatures": [
        "Built Node.js services and MongoDB schemas with a backend teammate.",
        "Designed REST endpoints for patient records and user operations.",
        "Broadcast updates with Socket.IO and integrated the APIs with the frontend."
      ],
      "githubUrl": "https://github.com/Devopsians12/Devopsians",
      "accentColor": "#10b981"
    },
    {
      "id": "quiz",
      "stationKey": "quiz",
      "title": "Competitive Quiz Platform",
      "subtitle": "Multiplayer rooms and live scores",
      "category": "Full-Stack",
      "role": "Sole Full-Stack Developer",
      "impactMetrics": [
        {
          "label": "Ownership",
          "value": "Solo project"
        },
        {
          "label": "Stack",
          "value": "MERN"
        }
      ],
      "architectureSummary": "A multiplayer quiz platform built with the MERN stack.",
      "techStack": [
        "MongoDB",
        "Express",
        "React",
        "Node.js",
        "Socket.IO"
      ],
      "keyFeatures": [
        "Built the application independently, including authentication and REST APIs.",
        "Connected multiplayer rooms with Socket.IO.",
        "Synchronized scores and added interactive game features."
      ],
      "githubUrl": "https://github.com/MohaMedTArEk912/FutureRobins",
      "liveUrl": "https://futurerobins.vercel.app/demo",
      "accentColor": "#E62E25"
    },
    {
      "id": "library",
      "stationKey": "library",
      "title": "Library Management System",
      "subtitle": "Team delivery and responsive interface design",
      "category": "Full-Stack",
      "role": "Team Lead & Frontend Developer",
      "impactMetrics": [
        {
          "label": "Team",
          "value": "5 members"
        },
        {
          "label": "Interface",
          "value": "React"
        }
      ],
      "architectureSummary": "A team-built library application with a reusable, responsive frontend.",
      "techStack": [
        "React",
        "Tailwind CSS",
        "REST APIs",
        "Git"
      ],
      "keyFeatures": [
        "Led a five-member team, assigned sprint work, and reviewed pull requests.",
        "Built reusable, responsive components with React and Tailwind CSS.",
        "Coordinated API integration with backend developers for on-time delivery."
      ],
      "githubUrl": "https://github.com/Faculty-Team-2026/IA-library-management-system",
      "accentColor": "#F2C94C"
    }
  ] as ProjectStation[],

  certifications: [
    {
      title: 'MERN-Stack Development',
      issuer: 'Mahara-Tech (ITI)',
      date: 'Aug 2024 – Jan 2025',
      desc: 'Training in full-stack application development with MongoDB, Express, React, and Node.js.',
    },
    {
      title: 'Cyber Security & Ethical Hacking',
      issuer: 'Mahara-Tech (ITI)',
      date: 'Aug 2023 – Nov 2023',
      desc: 'Training in network security protocols, ethical hacking, and API hardening.',
    },
  ],
};
