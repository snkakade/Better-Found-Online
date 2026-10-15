export type PerformanceMetric = {
  label: string;
  value: string;
};

export type PerformanceEvidenceAsset = {
  src: string;
  alt: string;
  platform: "Google Ads" | "Amazon Ads";
  period: string;
  width: number;
  height: number;
  caption: string;
};

export type PerformanceProofCard = {
  category: string;
  headline: string;
  challenge: string;
  approach: string;
  evidenceLabel: string;
  evidenceNote: string;
  metrics?: PerformanceMetric[];
  evidence?: PerformanceEvidenceAsset[];
  resultGroups?: {
    title: string;
    headline: string;
    period: string;
    metrics: PerformanceMetric[];
    explanation: string;
    evidence: PerformanceEvidenceAsset;
  }[];
  whyItMatters?: string;
  cta?: string;
};

type PerformanceProofCardsProps = {
  items: PerformanceProofCard[];
  disclosure: string;
};

function PlatformBadge({ platform }: { platform: PerformanceEvidenceAsset["platform"] }) {
  return (
    <span className={`performance-platform-badge ${platform === "Google Ads" ? "performance-platform-google" : "performance-platform-amazon"}`}>
      <img
        src={platform === "Google Ads" ? "/assets/platforms/google-ads-logo.webp" : "/assets/platforms/amazon-ads-logo.webp"}
        alt={`${platform} logo`}
        width={platform === "Google Ads" ? 512 : 4730}
        height={platform === "Google Ads" ? 256 : 1220}
      />
    </span>
  );
}

function ProofNarrative({ item }: { item: PerformanceProofCard }) {
  return (
    <div className="performance-proof-narrative">
      <dl>
        <div><dt>Challenge</dt><dd>{item.challenge}</dd></div>
        <div><dt>Approach</dt><dd>{item.approach}</dd></div>
      </dl>
      <div className="performance-proof-status">
        <span>{item.evidenceLabel}</span>
        <p>{item.evidenceNote}</p>
      </div>
    </div>
  );
}

export function PerformanceProofCards({ items, disclosure }: PerformanceProofCardsProps) {
  return (
    <section className="performance-proof" id="results" aria-labelledby="performance-proof-title">
      <div className="performance-proof-heading">
        <div className="performance-proof-heading-copy">
          <p className="eyebrow">Selected campaign work</p>
          <h2 id="performance-proof-title">Proof, with the context left in.</h2>
          <p>Two anonymized campaign systems. Each connects the business problem, media decision, source report, and outcome it actually measured.</p>
        </div>
      </div>

      <div className="performance-proof-list">
        {items.map((item, itemIndex) => (
          <article className={`performance-proof-case performance-proof-case--${itemIndex === 0 ? "industrial" : "consumer"}`} key={item.headline}>
            <header className="performance-proof-case-heading">
              <span><b>{String(itemIndex + 1).padStart(2, "0")}</b>{item.category}</span>
              <div>
                <p>Campaign brief</p>
                <h3>{item.headline}</h3>
              </div>
            </header>

            <div className={`performance-proof-story performance-proof-story--${itemIndex === 0 ? "campaign" : "source"}`}>
              {itemIndex === 0 ? (
                <figure className="performance-campaign-evidence-card">
                  <img src="/assets/world/poster.webp" alt="Abstract metallic forms representing two connected campaign systems" width="1200" height="1200" loading="lazy" />
                  <figcaption><span>Campaign evidence</span><strong>02 connected systems</strong></figcaption>
                </figure>
              ) : item.resultGroups?.[0] ? (
                <div className="performance-consumer-source">
                  <div className="performance-consumer-visual">
                    <figure>
                      <div className="performance-evidence-media">
                        <img src={item.resultGroups[0].evidence.src} alt={item.resultGroups[0].evidence.alt} width={item.resultGroups[0].evidence.width} height={item.resultGroups[0].evidence.height} loading="lazy" decoding="async" />
                      </div>
                      <figcaption>{item.resultGroups[0].evidence.caption}</figcaption>
                    </figure>
                    <ProofNarrative item={item} />
                  </div>
                  <aside>
                    <div className="performance-consumer-brand">
                      <PlatformBadge platform={item.resultGroups[0].evidence.platform} />
                      <span>Source report / {item.resultGroups[0].period}</span>
                    </div>
                    <h4>{item.resultGroups[0].headline}</h4>
                    <dl className="performance-metric-strip" aria-label={`${item.resultGroups[0].title} platform-reported metrics`}>
                      {item.resultGroups[0].metrics.map((metric) => <div key={`${metric.label}-${metric.value}`}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}
                    </dl>
                    <p className="performance-consumer-reading">{item.resultGroups[0].explanation}</p>
                  </aside>
                </div>
              ) : null}
              {itemIndex === 0 ? <ProofNarrative item={item} /> : null}
            </div>

            {item.resultGroups?.filter((_, groupIndex) => !(itemIndex === 1 && groupIndex === 0)).map((group) => (
              <section className="performance-result-group" key={group.title} aria-label={`${item.category}: ${group.title}`}>
                <header>
                  <div><PlatformBadge platform={group.evidence.platform} /><span>{group.title}</span><small>{group.period}</small></div>
                  <h4>{group.headline}</h4>
                </header>
                <div className="performance-result-stage">
                  <div className="performance-result-visual">
                    <figure>
                      <div className="performance-evidence-media">
                        <img src={group.evidence.src} alt={group.evidence.alt} width={group.evidence.width} height={group.evidence.height} loading="lazy" decoding="async" />
                      </div>
                      <figcaption>{group.evidence.caption}</figcaption>
                    </figure>
                    {itemIndex === 0 && item.whyItMatters ? (
                      <footer className="performance-proof-case-footer performance-proof-case-footer--inline">
                        <div className="performance-proof-value"><span>The commercial point</span><p>{item.whyItMatters}</p></div>
                        {item.cta ? <a className="performance-proof-cta" href="/#contact">{item.cta} <span aria-hidden="true">↗</span></a> : null}
                      </footer>
                    ) : null}
                  </div>
                  <aside className="performance-result-dossier">
                    <span>Source report</span>
                    <dl className="performance-metric-strip" aria-label={`${group.title} platform-reported metrics`}>
                      {group.metrics.map((metric) => <div key={`${metric.label}-${metric.value}`}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}
                    </dl>
                    <div className="performance-result-reading"><span>What the figures tell us</span><p>{group.explanation}</p></div>
                  </aside>
                </div>
              </section>
            ))}

            {!item.resultGroups?.length && item.metrics?.length ? (
              <dl className="performance-metric-strip" aria-label={`${item.category} platform-reported metrics`}>
                {item.metrics.map((metric) => <div key={`${metric.label}-${metric.value}`}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}
              </dl>
            ) : null}

            {!item.resultGroups?.length && item.evidence?.length ? (
              <div className={`performance-evidence-gallery performance-evidence-gallery--${item.evidence.length}`}>
                {item.evidence.map((asset) => (
                  <figure key={asset.src}>
                    <div className="performance-evidence-media">
                      <img src={asset.src} alt={asset.alt} width={asset.width} height={asset.height} loading="lazy" decoding="async" />
                      <div className="performance-evidence-meta">
                        <PlatformBadge platform={asset.platform} />
                        <span>{asset.period}</span>
                      </div>
                    </div>
                    <figcaption>{asset.caption}</figcaption>
                  </figure>
                ))}
              </div>
            ) : !item.resultGroups?.length ? (
              <div className="performance-proof-no-media"><span>Approach only</span><p>No result screenshot was supplied for this example, so no result is claimed.</p></div>
            ) : null}

            {itemIndex !== 0 ? <footer className="performance-proof-case-footer">
              {item.whyItMatters ? <div className="performance-proof-value"><span>The commercial point</span><p>{item.whyItMatters}</p></div> : null}
              {item.cta ? <a className="performance-proof-cta" href="/#contact">{item.cta} <span aria-hidden="true">↗</span></a> : null}
            </footer> : null}
          </article>
        ))}
      </div>

      <p className="performance-proof-disclosure">{disclosure}</p>
    </section>
  );
}
