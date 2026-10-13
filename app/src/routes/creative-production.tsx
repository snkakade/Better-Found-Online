import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";
import { CreativeCapabilityCarousel, CreativeFaq, CreativeProcessStory, OrbitShapeTransition } from "@/components/creative-story-components";
import { InformationScrollStory } from "@/components/information-scroll-story";

export const Route = createFileRoute("/creative-production")({
  component: CreativeProductionPage,
  head: () => ({
    meta: [
      { title: "Creative Production, Video & CGI | Better Found Online" },
      { name: "description", content: "Explore video editing, CGI, motion graphics, animation, and graphic design for digital campaigns, brand content, and promotional projects." },
      { property: "og:title", content: "Creative Production, Video & CGI | Better Found Online" },
      { property: "og:description", content: "Video editing, CGI, motion graphics, animation, and graphic design for digital campaigns and promotional projects." },
    ],
    links: [{ rel: "canonical", href: "https://betterfoundonline.com/creative-production" }],
  }),
});

const capabilities = [
  { number: "01", sliderTitle: "Brand films", title: "Video Production & Editing", headline: "Make every second count.", body: "From brand videos and promotional edits to campaign content and social clips, we shape visual material into clear, engaging stories.", tags: "Brand Videos / Promotional Edits / Social Videos / Trailers / Ad Videos", cta: "Explore Video Services", href: "/services/video-production-editing", image: "/assets/world/poster.webp", video: "https://videos.pexels.com/video-files/14219844/14219844-hd_1920_1080_24fps.mp4" },
  { number: "02", sliderTitle: "Product CGI", title: "3D Design, CGI & Rendering", headline: "Bring the hard-to-show into focus.", body: "Use 3D modeling, CGI, and rendering to present products, spaces, concepts, and visual ideas with more detail and creative freedom.", tags: "3D Modeling / CGI / Product Renders / Environments / Visual Effects", cta: "Explore 3D & CGI", href: "/services/3d-cgi-rendering", image: "/assets/portals.webp", video: "https://videos.pexels.com/video-files/12806512/12806512-hd_1920_1080_60fps.mp4" },
  { number: "03", sliderTitle: "Motion systems", title: "2D Animation & Motion Graphics", headline: "Give your ideas a little movement.", body: "Turn static information into visual stories through motion graphics, animated content, and 2D animation created around your message.", tags: "2D Animation / Motion Graphics / Promotional Animation / Animated Assets", cta: "Explore Motion Design", href: "/services/motion-graphics-animation", image: "/assets/connect.webp", video: "https://videos.pexels.com/video-files/2397239/2397239-sd_960_506_24fps.mp4" },
  { number: "04", sliderTitle: "Campaign trailers", title: "Trailers & Advertisement Videos", headline: "Make the opening count.", body: "Promotional trailers and advertisement videos designed to communicate the idea quickly, build interest, and support the wider campaign.", tags: "Promotional Trailers / Advertisement Videos / Brand Campaign Content", cta: "Discuss an Ad Video", href: "/services/video-production-editing#scope", image: "/assets/world/poster-mobile.webp", video: "https://videos.pexels.com/video-files/14952031/14952031-sd_960_540_30fps.mp4" },
  { number: "05", sliderTitle: "Graphic worlds", title: "Graphic Design", headline: "Make the message look the part.", body: "Graphic design for marketing, digital communication, social content, and promotional campaigns, with visuals that stay consistent with the brand.", tags: "Social Graphics / Campaign Visuals / Promotional Assets / Digital Design", cta: "Explore Graphic Design", href: "/services/graphic-design", image: "/assets/macro.webp", video: "https://videos.pexels.com/video-files/20271094/20271094-uhd_2560_1440_25fps.mp4" },
  { number: "06", sliderTitle: "Social stories", title: "Social Content Production", headline: "Build a story people can follow.", body: "Create adaptable visual content for social channels, from short-form edits and motion assets to campaign-ready graphic systems.", tags: "Short-form Video / Social Motion / Content Systems / Campaign Assets", cta: "Explore Social Content", href: "/services/social-media-management", image: "/assets/connect.webp", video: "https://videos.pexels.com/video-files/2887463/2887463-hd_1920_1080_25fps.mp4" },
  { number: "07", sliderTitle: "Digital campaigns", title: "Campaign Creative", headline: "Give the campaign a visual pulse.", body: "Unify video, motion, CGI, and graphic design around one campaign idea so every format feels connected and recognizably yours.", tags: "Campaign Direction / Paid Creative / Motion Assets / Multi-format Delivery", cta: "Explore Campaign Support", href: "/services/performance-marketing", image: "/assets/portals.webp", video: "https://videos.pexels.com/video-files/4990245/4990245-hd_1920_1080_30fps.mp4" },
];

const process = [
  ["01", "Understand", "Define the message, audience, format, and purpose."],
  ["02", "Plan", "Agree on the creative direction, materials, and deliverables."],
  ["03", "Create", "Develop the visual content for the approved scope."],
  ["04", "Refine", "Review the work and make agreed adjustments."],
  ["05", "Deliver", "Prepare approved assets for the intended channels and formats."],
];

const faq = [
  ["What creative production services does Better Found Online offer?", "Better Found Online offers video editing, promotional video content, 3D modeling and CGI, 2D animation, motion graphics, graphic design, and campaign-related visual assets."],
  ["Can you edit video footage we already have?", "Yes. Video editing is part of the service offering. Share your existing footage, intended audience, and preferred formats so the project can be scoped."],
  ["Can you create 3D visuals for products and promotional campaigns?", "Yes. Our creative capabilities include 3D modeling, CGI, rendering, and visual effects for product and promotional content."],
  ["Can you also manage the content on social media?", "Social media management is available as a separate or related service, covering content planning, creative coordination, publishing, and ongoing management."],
  ["Do you offer on-location filming?", "Physical filming requirements are reviewed separately. Tell us what the production involves so we can confirm the appropriate scope before making a commitment."],
  ["Can creative production be combined with digital marketing?", "Yes. Creative content can be planned alongside supported services such as SEO, paid campaigns, and social media management."],
];

function CreativeSchema() {
  const url = "https://betterfoundonline.com/creative-production";
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "Service", "@id": `${url}#service`, name: "Creative Production Services", serviceType: ["Video production and editing", "3D design and CGI", "2D animation and motion graphics", "Graphic design"], description: "Video editing, CGI, animation, motion graphics, and graphic design for brand content, campaigns, and promotional projects.", url, provider: { "@id": "https://betterfoundonline.com/#organization" }, areaServed: ["US", "GB", "CA", "AU"] }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://betterfoundonline.com" }, { "@type": "ListItem", position: 2, name: "Creative Production", item: url }] }] }) }} />;
}

function CreativeProductionPage() {
  const whatsapp = `https://wa.me/15707077078?text=${encodeURIComponent("Hi Better Found Online, I'd like to discuss a creative production project.")}`;
  return (
    <div className="site interior-site creative-page">
      <PageTransition /><CreativeSchema /><a className="skip-link" href="#main">Skip to Content</a><SiteHeader frostFromSelector=".scroll63-story" />
      <main id="main">
        <section className="creative-hero" aria-labelledby="creative-title">
          <div><p className="eyebrow">Creative Production</p><h1 id="creative-title">Make something worth<br /><span>a second look.</span></h1><p>Video production, editing, CGI, animation, and graphic design for brands that need clear ideas and distinctive visual content.</p><div className="creative-actions"><a className="primary-btn" href={whatsapp} target="_blank" rel="noopener noreferrer">Discuss a Creative Project <ArrowUpRight size={17} weight="light" /></a><a className="story-link" href="#capabilities">Explore Our Services <ArrowDown size={16} weight="light" /></a></div></div>
          <div className="creative-orbit" aria-hidden="true"><span>VIDEO</span><span>CGI</span><span>MOTION</span><span>DESIGN</span><i /></div>
        </section>

        <InformationScrollStory
          foregroundImage="/assets/world/poster.webp"
          foregroundAlt="Abstract metallic sculpture representing creative production"
          foregroundHeading="Ideas become images people remember."
          leftTitle="Shape the message"
          leftBody="Video, CGI, animation, and design begin with what the audience needs to notice, understand, and remember."
          rightTitle="Build the moment"
          rightBody="We choose the format, pace, visual language, and finish around the purpose of the content and the channel where it will live."
          outroImages={[
            { src: "/assets/connect.webp", alt: "Metallic ribbon composition representing motion and animation" },
            { src: "/assets/macro.webp", alt: "Close-up metallic form representing detailed visual craft" },
          ]}
          outroHeading="Make every frame matter."
          outroCtaLabel="Discuss a Creative Project"
          outroCtaHref={whatsapp}
          afterHeading="Video. CGI. Motion. Design."
          afterBody="One connected creative direction can adapt across brand films, product visuals, campaign assets, social content, and promotional work."
        />
        <CreativeCapabilityCarousel capabilities={capabilities} />

        <section className="creative-growth section-pad" aria-labelledby="creative-growth-title"><div><p className="eyebrow">Related growth services</p><h2 id="creative-growth-title">Great creative needs<br />somewhere to go.</h2><p>Creative production works alongside the channels where your audience discovers, sees, and engages with your business.</p></div><div className="creative-growth-grid"><article><span>01 / Paid campaigns</span><h3>Performance Marketing</h3><p>Paid campaign support that connects audience targeting, campaign creative, and ongoing optimization to business objectives.</p><TransitionLink href="/services/performance-marketing">Explore Performance Marketing <ArrowUpRight size={17} weight="light" /></TransitionLink></article><article><span>02 / Ongoing content</span><h3>Social Media Management</h3><p>Content planning, creative coordination, publishing, and ongoing social media support that helps your business communicate consistently.</p><TransitionLink href="/services/social-media-management">Explore Social Media Management <ArrowUpRight size={17} weight="light" /></TransitionLink></article></div></section>

        <OrbitShapeTransition />
        <CreativeProcessStory process={process} />
        <CreativeFaq faq={faq} />

        <section className="service-detail-closing section-pad"><p className="eyebrow">Ready to make it?</p><h2>Have an idea worth<br />bringing to life?</h2><p className="creative-closing-copy">Tell us what you're making, who it's for, and what the finished content needs to do.</p><a href={whatsapp} target="_blank" rel="noopener noreferrer">Discuss a Creative Project <ArrowUpRight size={28} weight="light" /></a></section>
      </main><SiteFooter />
    </div>
  );
}
