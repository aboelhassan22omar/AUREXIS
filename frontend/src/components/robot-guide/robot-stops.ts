import type {
  RobotBreakpoint,
  RobotPlacement,
  RobotStop,
} from "@/components/robot-guide/robot-guide.types";


export const GLOBAL_FOOTER_STOP: RobotStop = {
  id: "global-footer",
  pathname: "*",
  match: "prefix",
  sectionId: "footer",
  selector: "footer",
  desktop: { x: 0.9, y: 0.76, scale: 0.78 },
  tablet: { x: 0.88, y: 0.8, scale: 0.72 },
  mobile: { x: 0.88, y: 0.84, scale: 0.42 },
  message: "Need anything else? AUREXIS is one message away.",
  bubbleSide: "left",
  pose: "idle",
};


export const HOME_HERO_STOP: RobotStop = {
  id: "home-hero",
  pathname: "/",
  match: "exact",
  sectionId: "hero",
  selector: ".hero",
  anchorSelector: ".hero-visual .orbit-three",
  desktop: { x: 0.68, y: 0.56, scale: 1 },
  tablet: { x: 0.73, y: 0.58, scale: 0.9 },
  mobile: { x: 0.5, y: 0.5, scale: 0.64 },
  message: "Hi, I’m AUREXIS. Let me show you around.",
  bubbleSide: "left",
  pose: "wave",
};

export const DASHBOARD_DEFAULT_STOP: RobotStop = {
  id: "dashboard-intro",
  pathname: "/dashboard",
  match: "exact",
  sectionId: "dashboard-intro",
  selector: ".dashboard-shell",
  desktop: { x: 0.92, y: 0.8, scale: 0.64 },
  tablet: { x: 0.88, y: 0.82, scale: 0.58 },
  mobile: { x: 0.88, y: 0.82, scale: 0.42 },
  message: "Your AUREXIS workspace keeps your account and actions together.",
  bubbleSide: "left",
  pose: "wave",
};

export const ADMIN_DASHBOARD_DEFAULT_STOP: RobotStop = {
  id: "admin-safe",
  pathname: "/admin",
  match: "prefix",
  sectionId: "admin",
  selector: ".admin-main",
  desktop: { x: 0.94, y: 0.78, scale: 0.54 },
  tablet: { x: 0.88, y: 0.84, scale: 0.5 },
  mobile: { x: 0.88, y: 0.84, scale: 0.4 },
  message: "Your AUREXIS control center is ready.",
  bubbleSide: "left",
  pose: "idle",
};

export const robotStops: RobotStop[] = [
  HOME_HERO_STOP,
  {
    id: "home-services",
    pathname: "/",
    match: "exact",
    sectionId: "services",
    selector: "#services",
    desktop: { x: 0.9, y: 0.67, scale: 0.94 },
    tablet: { x: 0.88, y: 0.72, scale: 0.84 },
    mobile: { x: 0.88, y: 0.82, scale: 0.48 },
    message: "Explore the intelligent services we can build for you.",
    bubbleSide: "left",
    pose: "explain",
  },
  {
    id: "home-solutions",
    pathname: "/",
    match: "exact",
    sectionId: "solutions",
    selector: ".solutions-layout",
    desktop: { x: 0.1, y: 0.7, scale: 0.9 },
    tablet: { x: 0.12, y: 0.74, scale: 0.82 },
    mobile: { x: 0.88, y: 0.78, scale: 0.46 },
    message: "Smart solutions start with the real business problem.",
    bubbleSide: "right",
    pose: "idle",
  },
  {
    id: "home-projects",
    pathname: "/",
    match: "exact",
    sectionId: "projects",
    selector: "#projects",
    desktop: { x: 0.9, y: 0.68, scale: 0.9 },
    tablet: { x: 0.88, y: 0.72, scale: 0.82 },
    mobile: { x: 0.88, y: 0.82, scale: 0.47 },
    message: "Here are systems we’ve brought from idea to reality.",
    bubbleSide: "left",
    pose: "explain",
  },
  {
    id: "home-about",
    pathname: "/",
    match: "exact",
    sectionId: "about",
    selector: ".about-card",
    desktop: { x: 0.1, y: 0.7, scale: 0.88 },
    tablet: { x: 0.12, y: 0.74, scale: 0.8 },
    mobile: { x: 0.88, y: 0.78, scale: 0.46 },
    message: "See the thinking behind how AUREXIS builds useful technology.",
    bubbleSide: "right",
    pose: "idle",
  },
  {
    id: "home-cta",
    pathname: "/",
    match: "exact",
    sectionId: "cta",
    selector: ".cta-card",
    desktop: { x: 0.9, y: 0.72, scale: 0.84 },
    tablet: { x: 0.88, y: 0.76, scale: 0.78 },
    mobile: { x: 0.88, y: 0.8, scale: 0.44 },
    message: "Have an idea? Let’s turn it into something useful.",
    bubbleSide: "left",
    pose: "wave",
  },
  {
    id: "services-hero",
    pathname: "/services",
    match: "exact",
    sectionId: "services-hero",
    selector: ".page-hero",
    desktop: { x: 0.88, y: 0.56, scale: 0.9 },
    tablet: { x: 0.86, y: 0.62, scale: 0.82 },
    mobile: { x: 0.88, y: 0.8, scale: 0.46 },
    message: "Choose the capability that fits the problem you’re solving.",
    bubbleSide: "left",
    pose: "wave",
  },
  {
    id: "services-list",
    pathname: "/services",
    match: "exact",
    sectionId: "services-list",
    selector: ".services-page-section",
    desktop: { x: 0.92, y: 0.7, scale: 0.84 },
    tablet: { x: 0.88, y: 0.74, scale: 0.78 },
    mobile: { x: 0.88, y: 0.82, scale: 0.44 },
    message: "Open any service to see what it does and why.",
    bubbleSide: "left",
    pose: "explain",
  },

  {
    id: "solutions-hero",
    pathname: "/solutions",
    match: "exact",
    sectionId: "solutions-hero",
    selector: ".page-hero",
    desktop: { x: 0.88, y: 0.56, scale: 0.9 },
    tablet: { x: 0.86, y: 0.62, scale: 0.82 },
    mobile: { x: 0.88, y: 0.8, scale: 0.46 },
    message: "This is how AUREXIS turns complex needs into clear systems.",
    bubbleSide: "left",
    pose: "wave",
  },
  {
    id: "solutions-principles",
    pathname: "/solutions",
    match: "exact",
    sectionId: "solutions-principles",
    selector: ".solutions-principles-grid",
    desktop: { x: 0.1, y: 0.7, scale: 0.84 },
    tablet: { x: 0.12, y: 0.74, scale: 0.78 },
    mobile: { x: 0.88, y: 0.82, scale: 0.44 },
    message: "Each principle keeps the solution practical, secure and scalable.",
    bubbleSide: "right",
    pose: "explain",
  },

  {
    id: "projects-hero",
    pathname: "/projects",
    match: "exact",
    sectionId: "projects-hero",
    selector: ".page-hero",
    desktop: { x: 0.88, y: 0.56, scale: 0.9 },
    tablet: { x: 0.86, y: 0.62, scale: 0.82 },
    mobile: { x: 0.88, y: 0.8, scale: 0.46 },
    message: "These projects show how AUREXIS solves real requirements.",
    bubbleSide: "left",
    pose: "wave",
  },
  {
    id: "projects-list",
    pathname: "/projects",
    match: "exact",
    sectionId: "projects-list",
    selector: ".projects-page-section",
    desktop: { x: 0.92, y: 0.7, scale: 0.84 },
    tablet: { x: 0.88, y: 0.74, scale: 0.78 },
    mobile: { x: 0.88, y: 0.82, scale: 0.44 },
    message: "Open a project for the problem, approach and business value.",
    bubbleSide: "left",
    pose: "explain",
  },

  {
    id: "about-hero",
    pathname: "/about",
    match: "exact",
    sectionId: "about-hero",
    selector: ".page-hero",
    desktop: { x: 0.88, y: 0.56, scale: 0.9 },
    tablet: { x: 0.86, y: 0.62, scale: 0.82 },
    mobile: { x: 0.88, y: 0.8, scale: 0.46 },
    message: "Meet the ideas and standards behind AUREXIS.",
    bubbleSide: "left",
    pose: "wave",
  },
  {
    id: "about-story",
    pathname: "/about",
    match: "exact",
    sectionId: "about-story",
    selector: ".about-card",
    desktop: { x: 0.1, y: 0.7, scale: 0.84 },
    tablet: { x: 0.12, y: 0.74, scale: 0.78 },
    mobile: { x: 0.88, y: 0.82, scale: 0.44 },
    message: "AUREXIS builds technology only when it creates measurable value.",
    bubbleSide: "right",
    pose: "idle",
  },
  {
    id: "about-values",
    pathname: "/about",
    match: "exact",
    sectionId: "about-values",
    selector: ".about-values-grid",
    desktop: { x: 0.9, y: 0.72, scale: 0.8 },
    tablet: { x: 0.88, y: 0.76, scale: 0.74 },
    mobile: { x: 0.88, y: 0.82, scale: 0.43 },
    message: "Intelligence, engineering and security guide every AUREXIS build.",
    bubbleSide: "left",
    pose: "explain",
  },

  {
    id: "contact-hero",
    pathname: "/contact",
    match: "exact",
    sectionId: "contact-hero",
    selector: ".page-hero",
    desktop: { x: 0.88, y: 0.56, scale: 0.9 },
    tablet: { x: 0.86, y: 0.62, scale: 0.82 },
    mobile: { x: 0.88, y: 0.8, scale: 0.45 },
    message: "Tell us the problem, idea or opportunity you have.",
    bubbleSide: "left",
    pose: "wave",
  },
  {
    id: "contact-form",
    pathname: "/contact",
    match: "exact",
    sectionId: "contact-form",
    selector: ".contact-grid",
    desktop: { x: 0.94, y: 0.72, scale: 0.8 },
    tablet: { x: 0.9, y: 0.76, scale: 0.74 },
    mobile: { x: 0.88, y: 0.84, scale: 0.42 },
    message: "Share the details here and we’ll take it from there.",
    bubbleSide: "left",
    pose: "explain",
  },

  {
    id: "login",
    pathname: "/login",
    match: "exact",
    sectionId: "login",
    selector: ".auth-shell",
    desktop: { x: 0.84, y: 0.72, scale: 0.82 },
    tablet: { x: 0.86, y: 0.76, scale: 0.74 },
    mobile: { x: 0.88, y: 0.82, scale: 0.38 },
    message: "Sign in to continue to your Aurexis workspace.",
    bubbleSide: "left",
    pose: "idle",
  },
  {
    id: "register",
    pathname: "/register",
    match: "exact",
    sectionId: "register",
    selector: ".auth-shell",
    desktop: { x: 0.84, y: 0.72, scale: 0.82 },
    tablet: { x: 0.86, y: 0.76, scale: 0.74 },
    mobile: { x: 0.88, y: 0.82, scale: 0.38 },
    message: "Create your workspace and start building with AUREXIS.",
    bubbleSide: "left",
    pose: "wave",
  },

  DASHBOARD_DEFAULT_STOP,
  {
    id: "dashboard-profile",
    pathname: "/dashboard",
    match: "exact",
    sectionId: "dashboard-profile",
    selector: ".dashboard-profile-grid",
    desktop: DASHBOARD_DEFAULT_STOP.desktop,
    tablet: DASHBOARD_DEFAULT_STOP.tablet,
    mobile: DASHBOARD_DEFAULT_STOP.mobile,
    message: "This area summarizes your Aurexis account and access.",
    bubbleSide: "left",
    pose: "idle",
  },
  {
    id: "dashboard-actions",
    pathname: "/dashboard",
    match: "exact",
    sectionId: "dashboard-actions",
    selector: ".dashboard-grid",
    desktop: DASHBOARD_DEFAULT_STOP.desktop,
    tablet: DASHBOARD_DEFAULT_STOP.tablet,
    mobile: DASHBOARD_DEFAULT_STOP.mobile,
    message: "Jump straight to services, projects or a new request.",
    bubbleSide: "right",
    pose: "explain",
  },

  {
    id: "service-detail-hero",
    pathname: "/services/",
    match: "prefix",
    sectionId: "service-detail-hero",
    selector: ".detail-hero",
    desktop: { x: 0.9, y: 0.58, scale: 0.84 },
    tablet: { x: 0.88, y: 0.64, scale: 0.78 },
    mobile: { x: 0.88, y: 0.82, scale: 0.41 },
    message: "Here’s what this service is designed to solve.",
    bubbleSide: "left",
    pose: "wave",
  },
  {
    id: "service-detail-explanation",
    pathname: "/services/",
    match: "prefix",
    sectionId: "service-detail-explanation",
    selector: ".detail-explanation-grid",
    desktop: { x: 0.92, y: 0.72, scale: 0.8 },
    tablet: { x: 0.9, y: 0.76, scale: 0.74 },
    mobile: { x: 0.88, y: 0.82, scale: 0.42 },
    message: "This explains how the service works in practical terms.",
    bubbleSide: "left",
    pose: "explain",
  },
  {
    id: "service-detail-usecases",
    pathname: "/services/",
    match: "prefix",
    sectionId: "service-detail-usecases",
    selector: ".detail-usecase-section",
    desktop: { x: 0.08, y: 0.72, scale: 0.78 },
    tablet: { x: 0.1, y: 0.76, scale: 0.72 },
    mobile: { x: 0.88, y: 0.82, scale: 0.4 },
    message: "These are common places where this capability creates value.",
    bubbleSide: "right",
    pose: "idle",
  },
  {
    id: "service-detail-cta",
    pathname: "/services/",
    match: "prefix",
    sectionId: "service-detail-cta",
    selector: ".detail-cta",
    desktop: { x: 0.9, y: 0.74, scale: 0.76 },
    tablet: { x: 0.88, y: 0.78, scale: 0.7 },
    mobile: { x: 0.88, y: 0.84, scale: 0.39 },
    message: "Need this solution? Aurexis can shape it around you.",
    bubbleSide: "left",
    pose: "wave",
  },

  {
    id: "project-detail-hero",
    pathname: "/projects/",
    match: "prefix",
    sectionId: "project-detail-hero",
    selector: ".detail-hero",
    desktop: { x: 0.9, y: 0.58, scale: 0.84 },
    tablet: { x: 0.88, y: 0.64, scale: 0.78 },
    mobile: { x: 0.88, y: 0.8, scale: 0.43 },
    message: "Here’s the project, its challenge and the solution behind it.",
    bubbleSide: "left",
    pose: "wave",
  },
  {
    id: "project-detail-explanation",
    pathname: "/projects/",
    match: "prefix",
    sectionId: "project-detail-explanation",
    selector: ".detail-explanation-grid",
    desktop: { x: 0.92, y: 0.72, scale: 0.8 },
    tablet: { x: 0.9, y: 0.76, scale: 0.74 },
    mobile: { x: 0.88, y: 0.82, scale: 0.42 },
    message: "This section breaks down what the project actually does.",
    bubbleSide: "left",
    pose: "explain",
  },
  {
    id: "project-detail-usecases",
    pathname: "/projects/",
    match: "prefix",
    sectionId: "project-detail-usecases",
    selector: ".detail-usecase-section",
    desktop: { x: 0.08, y: 0.72, scale: 0.78 },
    tablet: { x: 0.1, y: 0.76, scale: 0.72 },
    mobile: { x: 0.88, y: 0.82, scale: 0.4 },
    message: "These are the situations where this project delivers value.",
    bubbleSide: "right",
    pose: "idle",
  },
  {
    id: "project-detail-cta",
    pathname: "/projects/",
    match: "prefix",
    sectionId: "project-detail-cta",
    selector: ".detail-cta",
    desktop: { x: 0.9, y: 0.74, scale: 0.76 },
    tablet: { x: 0.88, y: 0.78, scale: 0.7 },
    mobile: { x: 0.88, y: 0.84, scale: 0.39 },
    message: "Want something similar? Let’s design it around your needs.",
    bubbleSide: "left",
    pose: "wave",
  },

  ADMIN_DASHBOARD_DEFAULT_STOP,
];

export const safeDefaultStop: RobotStop = {
  id: "safe-default",
  pathname: "*",
  match: "prefix",
  sectionId: "page",
  selector: "main",
  desktop: { x: 0.92, y: 0.82, scale: 0.72 },
  tablet: { x: 0.9, y: 0.82, scale: 0.68 },
  mobile: { x: 0.88, y: 0.84, scale: 0.4 },
  message: "I’m here if you want a quick guide.",
  bubbleSide: "left",
  pose: "idle",
};

function stopMatchesPath(
  stop: RobotStop,
  pathname: string
): boolean {
  if (stop.pathname === "*") {
    return true;
  }

  if (stop.match === "prefix") {
    return pathname.startsWith(stop.pathname);
  }

  return pathname === stop.pathname;
}

export function getRobotStopsForPath(
  pathname: string
): RobotStop[] {
  const exactStops = robotStops.filter(
    (stop) =>
      stop.match !== "prefix" &&
      stopMatchesPath(stop, pathname)
  );

  if (exactStops.length > 0) {
    return exactStops;
  }

  const prefixGroups = robotStops
    .filter(
      (stop) =>
        stop.match === "prefix" &&
        stopMatchesPath(stop, pathname)
    )
    .sort(
      (a, b) =>
        b.pathname.length - a.pathname.length
    );

  if (prefixGroups.length === 0) {
    return [safeDefaultStop];
  }

  const longestPrefix =
    prefixGroups[0].pathname;

  return prefixGroups.filter(
    (stop) =>
      stop.pathname === longestPrefix
  );
}

export function getRobotPlacement(
  stop: RobotStop,
  breakpoint: RobotBreakpoint
): RobotPlacement {
  return stop[breakpoint];
}
