export const PASSWORD = 'password123';

// ================= USERS =================

export const USERS = [
  {
    name: 'Arjun Mehta',
    email: 'arjun@studenthub.com',
    bio: 'Passionate engineering student building IoT and robotics based real-world systems.',
    username: 'arjun_mech',
    role: 'student',
    institution: 'National Institute of Technology',
    experienceLevel: 'intermediate',
    skills: ['Arduino', 'IoT', 'Robotics'],
  },
  {
    name: 'Priya Sharma',
    email: 'priya@innovate.com',
    bio: 'AI enthusiast focused on machine learning, deep learning and startup innovation.',
    username: 'priya_ai',
    role: 'student',
    institution: 'Tech University',
    experienceLevel: 'advanced',
    skills: ['Python', 'Machine Learning', 'TensorFlow'],
  },
  {
    name: 'Dr. Rahul Verma',
    email: 'rahul.prof@edu.com',
    bio: 'Professor in Electronics guiding students in embedded systems and communication projects.',
    username: 'dr_rahul',
    role: 'professor',
    institution: 'Global Engineering College',
    experienceLevel: 'advanced',
    skills: ['Embedded Systems', 'Signal Processing', 'Microcontrollers'],
  },
  {
    name: 'Sneha Kapoor',
    email: 'sneha.mentor@startup.com',
    bio: 'Startup mentor helping early-stage founders validate ideas and scale sustainably.',
    username: 'mentor_sneha',
    role: 'mentor',
    institution: 'Startup Accelerator India',
    experienceLevel: 'advanced',
    skills: ['Startup Strategy', 'Product Validation', 'Pitch Deck'],
  },
  {
    name: 'Vikram Rao',
    email: 'vikram@student.com',
    bio: 'EEE student working on renewable energy systems and smart grid projects.',
    username: 'vikram_eee',
    role: 'student',
    institution: 'State Engineering College',
    experienceLevel: 'beginner',
    skills: ['Power Systems', 'MATLAB'],
  },
];

// ================= POSTS =================

export const POSTS = [
  {
    title: 'AI Based Smart Attendance System',
    description: 'Building a face recognition attendance system using deep learning and Raspberry Pi.',
    authorIndex: 1,
    postType: 'idea',
    collaborationType: 'free',
    tags: ['AI', 'ComputerVision'],
  },
  {
    title: 'Low Cost Smart Irrigation Startup Idea',
    description: 'Looking to launch a startup that uses IoT soil sensors to automate irrigation for small farmers.',
    authorIndex: 0,
    postType: 'startup',
    collaborationType: 'paid',
    tags: ['IoT', 'AgriTech'],
    budget: 500,
    deadline: '2025-12-31',
  },
  {
    title: 'Embedded Systems Internship Resource',
    description: 'Sharing a curated list of embedded systems internship opportunities for 2025 batch.',
    authorIndex: 2,
    postType: 'resource',
    collaborationType: 'free',
    tags: ['Embedded', 'Internship'],
  },
  {
    title: 'Looking for Co-founder (EdTech Platform)',
    description: 'Developing an EdTech platform for engineering students. Need a technical co-founder.',
    authorIndex: 3,
    postType: 'startup',
    collaborationType: 'paid',
    tags: ['Startup', 'EdTech'],
    budget: 1000,
    deadline: '2025-10-01',
  },
  {
    title: 'Renewable Energy Monitoring Dashboard',
    description: 'Creating a real-time dashboard to monitor solar panel efficiency using IoT sensors.',
    authorIndex: 4,
    postType: 'idea',
    collaborationType: 'free',
    tags: ['Renewable', 'IoT'],
  },
];

// ================= COMMENTS =================

export const COMMENTS = [
  {
    postIndex: 0,
    authorIndex: 0,
    content: 'This looks interesting! I can help with hardware integration.',
  },
  {
    postIndex: 1,
    authorIndex: 3,
    content: 'Have you validated the market size for small farmers?',
  },
  {
    postIndex: 3,
    authorIndex: 1,
    content: 'I am interested in joining as ML engineer.',
  },
];

// ================= PROJECTS (Engineering Zone) =================

export const PROJECTS = [
  {
    title: 'Smart Library Management System',
    description: 'Web-based system to manage library records with authentication and fine calculation.',
    category: 'CSE',
    difficulty: 'beginner',
    tags: ['Java', 'Database'],
    links: [{ label: 'GitHub Repo', url: 'https://github.com/example/library-system' }],
    pptUrl: 'https://docs.google.com/presentation/d/example',
    circuitDetails: null,
  },
  {
    title: 'FPGA Based Digital Clock',
    description: 'Design and implement a digital clock using FPGA board.',
    category: 'ECE',
    difficulty: 'intermediate',
    tags: ['FPGA', 'VHDL'],
    links: [{ label: 'Datasheet', url: 'https://example.com/fpga-datasheet' }],
    pptUrl: null,
    circuitDetails: 'https://example.com/circuit-diagram.png',
  },
  {
    title: 'Solar Power Monitoring System',
    description: 'Monitor solar panel voltage, current and efficiency using sensors and microcontroller.',
    category: 'EEE',
    difficulty: 'intermediate',
    tags: ['Solar', 'IoT'],
    links: [{ label: 'Project Report', url: 'https://drive.google.com/example' }, { label: 'Code', url: 'https://github.com/example/solar-monitor' }],
    pptUrl: 'https://drive.google.com/presentation/example',
    circuitDetails: 'Voltage divider + ADC on ESP32; current sensor ACS712',
  },
  {
    title: 'Autonomous Line Following Robot',
    description: 'Build a robot that follows a path using IR sensors and microcontroller.',
    category: 'Robotics',
    difficulty: 'beginner',
    tags: ['Arduino', 'Sensors'],
    links: [],
    pptUrl: null,
    circuitDetails: 'IR sensor array (3 sensors) to Arduino pins 2,3,4; L298N motor driver',
  },
  {
    title: 'AI Chatbot for College Website',
    description: 'Develop a chatbot that answers student queries using NLP.',
    category: 'AI_ML',
    difficulty: 'advanced',
    tags: ['Python', 'NLP'],
    links: [{ label: 'Demo', url: 'https://example.com/chatbot' }],
    pptUrl: null,
    circuitDetails: null,
  },
];

// ================= COMMUNITIES =================

export const COMMUNITIES = [
  {
    name: 'AI Innovators Club',
    description: 'Community for students and professionals working on AI and ML projects.',
    creatorIndex: 1,
    memberIndices: [0, 3],
  },
  {
    name: 'IoT Builders Network',
    description: 'Discuss IoT hardware, sensors, automation and real-world deployments.',
    creatorIndex: 0,
    memberIndices: [4],
  },
  {
    name: 'Startup Founders Hub',
    description: 'For aspiring founders to discuss startup validation and funding.',
    creatorIndex: 3,
    memberIndices: [1, 2],
  },
];
