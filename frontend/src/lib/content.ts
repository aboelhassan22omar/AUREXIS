import {
  Bot,
  BrainCircuit,
  Cctv,
  Code2,
  Database,
  LayoutPanelTop,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type Detail = {
  what: string;
  does: string;
  benefits: string[];
  useCases: string[];
};

export const serviceIcons: Record<string, LucideIcon> = {
  "ai-solutions": BrainCircuit,
  "ai-chatbot-development": Bot,
  "web-application-development": Code2,
  "business-process-automation": Workflow,
  "cybersecurity-solutions": Cctv,
  "systems-integration": Database,
};

export const projectIcons: Record<string, LucideIcon> = {
  "Artificial Intelligence": Bot,
  "Web Development": Code2,
  Automation: Workflow,
  Cybersecurity: ShieldCheck,
  "Custom AI": BrainCircuit,
};

export function getServiceIcon(slug: string): LucideIcon {
  return serviceIcons[slug] ?? BrainCircuit;
}

export function getProjectIcon(category: string): LucideIcon {
  return projectIcons[category] ?? BrainCircuit;
}

export const serviceDetails: Record<string, Detail> = {
  "ai-solutions": {
    what:
      "AI Solutions use artificial intelligence to process information, automate decisions and add intelligent capabilities to software and business operations.",

    does:
      "These systems can analyze data, understand text, classify information, generate content and assist users or employees with tasks that normally require manual effort.",

    benefits: [
      "Reduce repetitive manual work",
      "Process large amounts of information faster",
      "Support better and faster decisions",
      "Add intelligent capabilities to existing products",
    ],

    useCases: [
      "Intelligent internal assistants",
      "Document and data analysis",
      "Automated classification",
      "Decision-support systems",
    ],
  },


  "ai-chatbot-development": {
    what:
      "AI Chatbot Development creates conversational systems that allow users to interact naturally with business information, services and support systems.",

    does:
      "The chatbot can understand user questions, search connected knowledge, provide relevant answers and guide users through common processes automatically.",

    benefits: [
      "Provide support around the clock",
      "Reduce repetitive support requests",
      "Give users faster access to information",
      "Create a consistent support experience",
    ],

    useCases: [
      "Customer support",
      "School and education assistants",
      "Internal employee support",
      "Knowledge-base assistants",
    ],
  },


  "web-application-development": {
    what:
      "Web Application Development transforms business requirements into secure, accessible and responsive applications that run through the browser.",

    does:
      "A web application can centralize business information, automate processes, provide dashboards and connect users to databases, APIs and other systems.",

    benefits: [
      "Access the system from modern browsers",
      "Centralize operational data",
      "Replace fragmented manual workflows",
      "Build around specific business requirements",
    ],

    useCases: [
      "Business management systems",
      "Customer portals",
      "Administrative dashboards",
      "Internal operational platforms",
    ],
  },


  "business-process-automation": {
    what:
      "Business Process Automation uses software to perform repeatable operational tasks automatically instead of relying on continuous manual execution.",

    does:
      "Automation connects applications, APIs, databases and business rules so information can move between systems and processes can execute consistently.",

    benefits: [
      "Reduce repetitive manual operations",
      "Improve speed and consistency",
      "Reduce operational errors",
      "Free teams for higher-value work",
    ],

    useCases: [
      "Data synchronization",
      "Approval workflows",
      "Automated notifications",
      "Recurring operational processes",
    ],
  },


  "cybersecurity-solutions": {
    what:
      "Security Systems combine smart cameras, AI video analytics and access control into one intelligent platform that protects people, sites and assets.",

    does:
      "The system watches every connected camera continuously, recognizes people, vehicles and unusual activity, controls who can enter where, and alerts your team the moment something needs attention.",

    benefits: [
      "Detect incidents in real time, not after the fact",
      "Monitor every site from one central dashboard",
      "Control and audit access to restricted areas",
      "Reduce false alarms with AI-powered analytics",
    ],

    useCases: [
      "Smart surveillance for schools and campuses",
      "Facility and perimeter monitoring",
      "Access control and visitor management",
      "Vehicle and license-plate recognition",
    ],
  },

  "systems-integration": {
    what:
      "Systems Integration connects separate applications, databases, APIs and services so they can exchange information and operate as one connected environment.",

    does:
      "Integration removes isolated systems by creating reliable communication paths between applications and automating the movement of information.",

    benefits: [
      "Reduce duplicated manual data entry",
      "Connect existing software systems",
      "Improve information consistency",
      "Create unified digital workflows",
    ],

    useCases: [
      "API integrations",
      "Database synchronization",
      "AI integration",
      "Third-party service connections",
    ],
  },
};

export const projectDetails: Record<string, Detail> = {
  "ai-customer-support-chatbot": {
    what:
      "An AI Customer Support Chatbot is a conversational application that provides users with automated assistance through natural-language interaction.",

    does:
      "The system receives user questions, understands the request and provides relevant answers from connected information or business knowledge. It can handle common support requests without requiring a human operator for every conversation.",

    benefits: [
      "Faster responses to customer questions",
      "Reduced repetitive support workload",
      "Consistent information for every user",
      "Support availability beyond working hours",
    ],

    useCases: [
      "Frequently asked questions",
      "Customer support",
      "Information retrieval",
      "Guided assistance",
    ],
  },


  "business-management-web-application": {
    what:
      "A Business Management Web Application is a centralized online system for managing operational information and administrative processes.",

    does:
      "The application provides authorized users with dashboards, management tools and access to business data from one controlled interface instead of relying on disconnected files and manual processes.",

    benefits: [
      "Centralized operational information",
      "Simpler administrative processes",
      "Improved visibility and control",
      "Accessible through a modern web interface",
    ],

    useCases: [
      "Administrative management",
      "Operational dashboards",
      "Business records",
      "Internal workflow management",
    ],
  },


  "workflow-automation-system": {
    what:
      "A Workflow Automation System connects repeatable business operations and executes defined processes automatically.",

    does:
      "The system can receive information, apply business rules, trigger actions, transfer data between systems and send notifications without requiring manual execution at every stage.",

    benefits: [
      "Reduced repetitive work",
      "Faster operational processes",
      "More consistent execution",
      "Lower risk of manual errors",
    ],

    useCases: [
      "Automated notifications",
      "Approval processes",
      "Data movement",
      "Scheduled operational tasks",
    ],
  },


  "security-monitoring-dashboard": {
    what:
      "A Security Monitoring Dashboard provides a centralized view of system activity, security information and events that may require attention.",

    does:
      "The dashboard collects and organizes security-related information into a clear interface so administrators can monitor activity, identify unusual events and understand the current security status.",

    benefits: [
      "Centralized security visibility",
      "Faster identification of suspicious activity",
      "Simplified monitoring",
      "Better operational awareness",
    ],

    useCases: [
      "Security event monitoring",
      "Infrastructure visibility",
      "System activity tracking",
      "Operational security dashboards",
    ],
  },
};

/* ---------------------------------------------------------------------
   Brand narrative
--------------------------------------------------------------------- */

export const navigation = [
  { name: "Services", href: "/services" },
  { name: "Solutions", href: "/solutions" },
  { name: "Projects", href: "/projects" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

/** The four layers of an Aurexis system — mirrored by the glass plates in 3D. */
export const stackLayers = [
  {
    index: "01",
    name: "Experience",
    icon: LayoutPanelTop,
    title: "Interfaces people actually use.",
    body: "Web applications, portals and dashboards designed around real workflows — fast, accessible and clear on every screen.",
    tags: ["Web applications", "Dashboards", "Customer portals"],
  },
  {
    index: "02",
    name: "Intelligence",
    icon: BrainCircuit,
    title: "AI applied where it creates value.",
    body: "AI agents, chatbots and decision-support systems that understand information and take repetitive effort off your teams.",
    tags: ["AI agents", "Chatbots", "Document intelligence"],
  },
  {
    index: "03",
    name: "Automation",
    icon: Workflow,
    title: "Systems that talk to each other.",
    body: "Process automation and systems integration that connect applications, APIs and databases into one dependable environment.",
    tags: ["Workflow automation", "API integration", "Data sync"],
  },
  {
    index: "04",
    name: "Security",
    icon: Cctv,
    title: "Security systems that see and respond.",
    body: "AI-powered surveillance, smart cameras and access control that detect incidents in real time and keep people, sites and assets protected.",
    tags: ["Smart surveillance", "AI threat detection", "Access control"],
  },
] as const;

export const process = [
  {
    index: "01",
    title: "Understand the problem",
    body: "We begin with the business challenge, workflows, risks and the outcome you need — not with a technology trend.",
  },
  {
    index: "02",
    title: "Engineer the solution",
    body: "We design the architecture using AI, software, automation or security exactly where they create real value.",
  },
  {
    index: "03",
    title: "Build for scale",
    body: "Systems are built with maintainability, reliability and future growth designed in from day one.",
  },
  {
    index: "04",
    title: "Secure by design",
    body: "Security is part of the architecture rather than an afterthought — from data model to deployment.",
  },
] as const;

export const principles = [
  {
    name: "Intelligent",
    body: "AI is applied where it genuinely improves a system — never as decoration.",
  },
  {
    name: "Secure",
    body: "Security is part of the architecture, not an afterthought.",
  },
  {
    name: "Practical",
    body: "Every solution must solve a real problem and deliver measurable value.",
  },
] as const;

/** Every capability links to the service that delivers it. */
export const capabilities = [
  { name: "AI Agents", href: "/services/ai-solutions" },
  { name: "AI Chatbots", href: "/services/ai-chatbot-development" },
  { name: "SIS for Schools", href: "/services/web-application-development" },
  { name: "AI Security", href: "/services/cybersecurity-solutions" },
  { name: "Smart Surveillance", href: "/services/cybersecurity-solutions" },
  { name: "Custom Software", href: "/services/web-application-development" },
  { name: "Process Automation", href: "/services/business-process-automation" },
  { name: "Systems Integration", href: "/services/systems-integration" },
] as const;
