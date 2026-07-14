export type SkillLevel = "Comfortable" | "Foundational";

export type SkillGroup = {
  level: SkillLevel;
  description: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    level: "Comfortable",
    description: "Tools I use regularly in my own projects.",
    items: ["Python", "Git", "GitHub"]
  },
  {
    level: "Foundational",
    description: "Skills I am actively studying and practising.",
    items: [
      "Linux basics",
      "Windows command line",
      "Networking fundamentals",
      "TCP/IP",
      "Port scanning concepts",
      "Log analysis",
      "Basic threat detection",
      "SQL basics",
      "HTML and CSS basics",
      "PyCharm",
      "TryHackMe"
    ]
  }
];

export const goals = {
  shortTerm: [
    "Begin undergraduate study in computer science",
    "Strengthen Linux and networking knowledge",
    "Improve both cybersecurity projects",
    "Participate in beginner CTF challenges",
    "Build more practical security tools",
    "Continue developing my technical portfolio"
  ],
  longTerm: [
    "Specialise in cybersecurity",
    "Become an ethical hacker and penetration tester",
    "Work in red-team security",
    "Study network security and cryptography",
    "Build tools that help identify and prevent real security threats"
  ]
};
