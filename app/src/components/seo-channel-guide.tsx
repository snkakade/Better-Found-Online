import { ArrowUpRight } from "@phosphor-icons/react";
import { TransitionLink } from "@/components/site-chrome";
import "@/seo-channel-guide.css";

const channels = [
  {
    title: "SEO: get found in search.",
    when: "Use it when people regularly search for your services or ask the same questions.",
    outputs: ["Service pages and useful FAQs", "Technical fixes and internal links", "Search and enquiry tracking"],
  },
  {
    title: "Google Ads: test an offer.",
    when: "Use it when your offer, landing page and test budget are ready.",
    outputs: ["Targeted search campaigns", "Ads matched to landing pages", "Tracked calls and form submissions"],
    href: "/services/performance-marketing",
  },
  {
    title: "Both: connect ads and content.",
    when: "Use campaign search terms to improve your pages and reduce irrelevant clicks.",
    outputs: ["A shared search-term and page plan", "Clear answers before the enquiry", "Reports on visits and enquiries"],
  },
];

export function SeoChannelGuide() {
  return (
    <section className="seo-channel-guide section-pad" id="search-plan" aria-labelledby="search-plan-title">
      <header>
        <h2 id="search-plan-title">Choose SEO, Google Ads, or both.</h2>
        <p>SEO helps people find useful pages. Ads help you test an offer. Both need enquiry tracking.</p>
      </header>
      <div className="seo-channel-grid">
        {channels.map(channel => (
          <article key={channel.title}>
            <h3>{channel.title}</h3>
            <p>{channel.when}</p>
            <ul>{channel.outputs.map(output => <li key={output}>{output}</li>)}</ul>
            {channel.href && <TransitionLink className="seo-channel-link" href={channel.href}>Explore Google Ads <ArrowUpRight size={18} aria-hidden="true" /></TransitionLink>}
          </article>
        ))}
      </div>
      <div className="seo-channel-proof">
        <div><h3>A healthcare website example</h3><p>Clear treatment pages, links between related services, and an easy-to-find enquiry form.</p></div>
        <div className="seo-channel-actions">
          <TransitionLink className="primary-btn" href="/#contact">Discuss Your Search Goals</TransitionLink>
          <TransitionLink className="story-link" href="/work">See Website Projects <ArrowUpRight size={18} aria-hidden="true" /></TransitionLink>
        </div>
      </div>
    </section>
  );
}
