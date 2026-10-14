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
};

type PerformanceProofCardsProps = {
  items: PerformanceProofCard[];
  disclosure: string;
};

function PlatformBadge({ platform }: { platform: PerformanceEvidenceAsset["platform"] }) {
  if (platform === "Google Ads") {
    return (
      <span className="performance-platform-badge performance-platform-google">
        <svg viewBox="0 0 28 24" aria-hidden="true">
          <path d="M10.2 2.2a4.2 4.2 0 0 1 7.3 0l9.9 17.1a3.1 3.1 0 0 1-5.4 3.1L10.2 2.2Z" fill="#4285f4" />
          <path d="M10.7 2.2 1 18.9a3.4 3.4 0 1 0 5.9 3.4L17.5 4a4.2 4.2 0 0 0-6.8-1.8Z" fill="#34a853" />
          <circle cx="4" cy="20.5" r="3.4" fill="#fbbc04" />
        </svg>
        Google Ads
      </span>
    );
  }

  return (
    <span className="performance-platform-badge performance-platform-amazon">
      <span>amazon</span> ads
      <svg viewBox="0 0 46 10" aria-hidden="true"><path d="M3 2.2c9.5 5.6 25.8 6.1 39.4.5M36.7 1.4l5.7 1.3-3.1 4.5" /></svg>
    </span>
  );
}

export function PerformanceProofCards({ items, disclosure }: PerformanceProofCardsProps) {
  return (
    <section className="performance-proof" id="results" aria-labelledby="performance-proof-title">
      <div className="performance-proof-heading">
        <p className="eyebrow">Anonymous campaign evidence</p>
        <h2 id="performance-proof-title">Results with the reporting context left in.</h2>
        <p>Real platform excerpts, permanently anonymized. Every number is described using the label shown by the advertising platform, without turning configured actions into claims the report cannot prove.</p>
      </div>

      <div className="performance-proof-list">
        {items.map((item, itemIndex) => (
          <article className="performance-proof-case" key={item.headline}>
            <header className="performance-proof-case-heading">
              <span>{String(itemIndex + 1).padStart(2, "0")} / {item.category}</span>
              <h3>{item.headline}</h3>
            </header>

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

            {item.metrics?.length ? (
              <dl className="performance-metric-strip" aria-label={`${item.category} platform-reported metrics`}>
                {item.metrics.map((metric) => <div key={`${metric.label}-${metric.value}`}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}
              </dl>
            ) : null}

            {item.evidence?.length ? (
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
            ) : (
              <div className="performance-proof-no-media"><span>Approach only</span><p>No result screenshot was supplied for this example, so no result is claimed.</p></div>
            )}
          </article>
        ))}
      </div>

      <p className="performance-proof-disclosure">{disclosure}</p>
    </section>
  );
}
