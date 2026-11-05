import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Browser, ChartLineUp, FilmStrip, Megaphone } from "@phosphor-icons/react";
import { AmbientVideo } from "@/components/ambient-video";
import { searchAdsMedia } from "@/search-ads-media";
import { humanImages } from "@/editorial-images";
import { SeoChannelGuide } from "@/components/seo-channel-guide";
import { PageTransition, SiteFooter, SiteHeader, TransitionLink } from "@/components/site-chrome";
import "@/service-growth-pages.css";
import "@/seo-page.css";

const title = "SEO & AI Search Optimization | Better Found Online";
const description = "Technical SEO, content strategy, search visibility, and AI-search readiness to help businesses make their expertise easier to discover and understand.";
const canonical = "https://betterfoundonline.com/services/seo-ai-search";
export const Route = createFileRoute("/services_/seo-ai-search")({ component: SeoAiPage, head: () => ({ meta: [
  { title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: canonical }, { name: "twitter:card", content: "summary_large_image" },
], links: [{ rel: "canonical", href: canonical }] }) });

const services = [
  ["01","Technical SEO","Fix indexing, redirects, page speed and the issues blocking search engines."],
  ["02","Clear service pages","Improve page titles, headings and links so customers can find the right service."],
  ["03","Useful content","Plan pages and FAQs around the questions customers actually ask."],
  ["04","AI search readiness","Make business facts, expertise and answers clear, consistent and supported by evidence."],
  ["05","Search and enquiry tracking","Review search visits, calls and form submissions to guide the next improvements."],
];
const foundation = ["Pages search engines can access","Clear titles and service information","Working links and redirects","Readable mobile layouts","Relevant structured data","Calls and forms tracked"];
const process = [["01","Understand","Agree on your services, customers and search goals."],["02","Audit","Check important pages, technical issues and current tracking."],["03","Prioritise","Agree which fixes and content need attention first."],["04","Improve","Make the agreed technical, content and page changes."],["05","Review","Report what changed and decide the next priorities."]];
const nextSteps = [
  { title: "Website Design", description: "Make your offer clear and enquiries easy.", href: "/services/websites", icon: Browser },
  { title: "Paid Advertising", description: "Test offers with targeted ads and tracked enquiries.", href: "/services/performance-marketing", icon: Megaphone },
  { title: "Content & Creative", description: "Explain your services with useful video and graphics.", href: "/creative-production", icon: FilmStrip },
  { title: "Analytics & Optimization", description: "See which visits lead to calls and forms.", href: "/services#improve", icon: ChartLineUp },
];
const faqs = [
  ["What is SEO?","Search engine optimization improves technical accessibility, content relevance, structure, and usefulness so search engines can better discover and understand pages."],
  ["What is AI Search Optimization or GEO?","It focuses on making information clear, accurate, well-structured, and useful where search systems generate or summarize answers."],
  ["Does GEO replace SEO?","No. Technical accessibility, useful content, clear page structure, and trustworthy information support both traditional and AI-powered discovery."],
  ["Can you guarantee visibility in AI-generated answers?","No. These systems determine their own sources and outputs. We improve the quality, accessibility, and clarity of the information available."],
  ["How long does SEO take?","There is no universal timeline. Outcomes depend on the website, market, competition, content requirements, and work performed."],
  ["Do you provide technical SEO audits?","Reviews can cover crawling, indexing, metadata, architecture, internal links, redirects, page performance, and other agreed areas."],
  ["Can you optimize an existing website?","Yes. Existing content, technical foundations, service pages, internal linking, and measurement can be reviewed and improved."],
  ["Do you also create SEO content?","Search-focused planning and page improvements are part of the offering. Writing and publishing scope is agreed before work begins."],
  ["Should I choose SEO or Google Ads?","It depends on how quickly you need evidence, whether your offer is ready, and whether the economics support paid acquisition. Both can be useful."],
  ["Is structured data enough to appear in AI search?","No. It can communicate supported facts, but it does not guarantee rankings, citations, or inclusion in generated answers."],
];
function Schema(){return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"Service",name:"SEO and AI Search Optimization",serviceType:["Technical SEO","On-page SEO","Content strategy","Generative engine optimization","Answer engine optimization"],url:canonical,description,provider:{"@id":"https://betterfoundonline.com/#organization"},areaServed:["US","GB","CA","AU"]},{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:"https://betterfoundonline.com"},{"@type":"ListItem",position:2,name:"Services",item:"https://betterfoundonline.com/services"},{"@type":"ListItem",position:3,name:"SEO & AI Search",item:canonical}]}]})}}/>}

function SeoAiPage(){return <div className="site interior-site growth-service-page seo-service-page"><PageTransition/><Schema/><a className="skip-link" href="#main">Skip to Content</a><SiteHeader/><main id="main">
  <section className="growth-hero seo-growth-hero"><div><p className="eyebrow">SEO &amp; AI Search</p><h1>Get found in search.<br/><em>Give customers answers.</em></h1><p>Technical SEO, useful content and clear service pages, with tracking that connects search visits to enquiries.</p><div className="growth-actions"><TransitionLink className="primary-btn" href="/#contact">Discuss Your Search Visibility <ArrowUpRight/></TransitionLink><a href="#approach">Explore Our Approach <ArrowDown/></a></div></div><figure className="seo-hero-video"><AmbientVideo {...searchAdsMedia.search} /></figure></section>
  <section className="search-journey search-journey--video section-pad" aria-labelledby="search-discovery-title">
    <div>
      <p className="eyebrow">Getting found has changed</p>
      <h2 id="search-discovery-title">Show up where customers search.</h2>
      <p>Keep your service pages, listings and answers consistent, so customers can recognise your business and take the next step.</p>
    </div>
    <figure className="search-customer-video"><AmbientVideo {...searchAdsMedia.customer} /></figure>
  </section>
  <section className="format-section section-pad"><header><p className="eyebrow">What we work on</p><h2>What we improve.</h2></header><div>{services.map(([n,l,h])=><article key={n}><span>{n}</span><div><h3>{l}</h3><p>{h}</p></div></article>)}</div><TransitionLink className="text-cta" href="/#contact">Discuss Your SEO Goals <ArrowUpRight/></TransitionLink></section>
  <section className="split-editorial section-pad"><figure><img {...humanImages.websiteWorkshop} sizes="(max-width: 900px) 100vw, 45vw" loading="lazy" decoding="async"/></figure><div><p className="eyebrow">Before more content</p><h2>Start with the pages that need fixing.</h2><p>Review the technical issues, service pages and enquiry paths before investing in more content.</p><ul>{foundation.map(item=><li key={item}>{item}</li>)}</ul></div></section>
  <SeoChannelGuide />
  <section className="process-section section-pad" id="approach"><header><p className="eyebrow">Our approach</p><h2>From audit to action.</h2></header><ol>{process.map(([n,h,c])=><li key={n}><span>{n}</span><h3>{h}</h3><p>{c}</p></li>)}</ol></section>
  <section className="expectations section-pad"><p className="eyebrow">Realistic expectations</p><h2>No guaranteed rankings<br/><em>or AI citations.</em></h2><p>Rankings and AI answers depend on search systems, your market and your website. We agree priorities and report what changes.</p></section>
  <section className="seo-next-steps section-pad" aria-labelledby="seo-next-title">
    <header><h2 id="seo-next-title">Turn search visits into enquiries.</h2><p>Choose the next improvement your business needs.</p></header>
    <nav aria-label="Services that support SEO">
      {nextSteps.map(({ title, description, href, icon: Icon }) => (
        <TransitionLink className="seo-next-link" href={href} key={href}>
          <Icon className="seo-next-icon" size={30} weight="light" aria-hidden="true" />
          <h3>{title}</h3><p>{description}</p>
          <span className="seo-next-arrow"><ArrowUpRight size={22} aria-hidden="true" /></span>
        </TransitionLink>
      ))}
    </nav>
  </section>
  <section className="faq-section section-pad"><header><p className="eyebrow">Frequently asked questions</p><h2>Your SEO questions, answered.</h2></header><div>{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
  <section className="growth-closing section-pad"><p className="eyebrow">Ready to be better found?</p><h2>Find out what your<br/><em>website needs next.</em></h2><p>Have a website that isn't showing up where it should? Tell us what you're trying to achieve.</p><div className="growth-actions"><TransitionLink className="primary-btn" href="/#contact">Discuss Your Search Visibility <ArrowUpRight/></TransitionLink><TransitionLink href="/services/websites">Explore Our Websites <ArrowUpRight/></TransitionLink></div></section>
 </main><SiteFooter showProjectCta={false}/></div>}
