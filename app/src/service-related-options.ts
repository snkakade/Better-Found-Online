export const serviceRelatedOptions = {
  "/services/graphic-design": {
    heading: "Graphics for posts and campaigns",
    description: "Branded posts, carousels, and campaign visuals sized for the channels you use.",
    action: "Explore Graphic Design",
    icon: "graphics",
  },
  "/services/video-production-editing": {
    heading: "Reels and short video edits",
    description:
      "Turn existing footage into short clips with captions, graphics, and channel-ready exports.",
    action: "Explore Video Editing",
    icon: "video",
  },
  "/services/performance-marketing": {
    heading: "Paid campaigns with tracking",
    description: "Audience targeting, campaign setup, and reporting for your next offer.",
    action: "Explore Paid Advertising",
    icon: "advertising",
  },
  "/services/social-media-management": {
    heading: "Content planned and published",
    description:
      "Social topics, creative coordination, scheduling, and ongoing publishing support.",
    action: "Explore Social Management",
    icon: "social",
  },
  "/services/motion-graphics-animation": {
    heading: "Animated graphics and explainers",
    description: "Turn messages and existing brand assets into motion for your chosen channels.",
    action: "Explore Motion Graphics",
    icon: "motion",
  },
  "/creative-production": {
    heading: "Video, CGI, and design production",
    description: "Scope editing, animation, product renders, and graphic assets together.",
    action: "Explore Creative Production",
    icon: "creative",
  },
  "/services#build": {
    heading: "Landing pages and business websites",
    description: "Give people a clear page to explore your offer and make an inquiry.",
    action: "Explore Website Services",
    icon: "website",
  },
} as const;

export type RelatedServicePath = keyof typeof serviceRelatedOptions;
