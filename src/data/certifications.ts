export type Certification = {
  shortLabel: string;
  title: string;
  issuer: string;
  details: string;
  finalProject?: string;
  certificateUrl: string;
};

export const certifications: Certification[] = [
  {
    shortLabel: "CS50P",
    title: "CS50's Introduction to Programming with Python",
    issuer: "Harvard University / CS50",
    details:
      "Completed the course and received the certificate after successfully submitting all required assignments and the final project.",
    finalProject: "Personal Expense Tracker",
    certificateUrl: "/certificates/cs50p-cert.pdf"
  },
  {
    shortLabel: "PRE SEC",
    title: "TryHackMe Pre Security Learning Path",
    issuer: "TryHackMe",
    details:
      "Completed foundational modules covering cybersecurity concepts, networking, Linux, Windows, the web, virtualisation, cloud computing and basic security principles.",
    certificateUrl: "/certificates/tryhackme-pre-security.pdf"
  }
];
