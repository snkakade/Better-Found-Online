import { useRef, useState, type KeyboardEvent } from "react";
import { TransitionLink } from "@/components/site-chrome";
import type { CampaignReport } from "@/performance-evidence";
import "@/performance-evidence.css";

export function PerformanceProofCards({
  items,
  disclosure,
}: {
  items: readonly CampaignReport[];
  disclosure: string;
}) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const navigateReports = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % items.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section
      className="campaign-evidence section-pad"
      id="results"
      aria-labelledby="campaign-evidence-title"
    >
      <header className="campaign-evidence-heading">
        <h2 id="campaign-evidence-title">Ad spend. Recorded results. Source reports.</h2>
        <p>
          Three anonymized reports from two businesses. See what was spent, what each platform
          recorded, and what the numbers can tell you.
        </p>
      </header>

      <div className="campaign-report-tabs" role="tablist" aria-label="Choose a campaign report">
        {items.map((item, index) => (
          <button
            type="button"
            role="tab"
            id={`report-tab-${item.id}`}
            aria-controls={`report-panel-${item.id}`}
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            key={item.id}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            onClick={() => setActive(index)}
            onKeyDown={(event) => navigateReports(event, index)}
          >
            <span>{item.tabLabel}</span>
            <strong>{item.tabMetric}</strong>
          </button>
        ))}
      </div>

      {items.map((item, index) => (
        <div
          className="campaign-report-panel"
          role="tabpanel"
          id={`report-panel-${item.id}`}
          aria-labelledby={`report-tab-${item.id}`}
          tabIndex={0}
          hidden={active !== index}
          key={item.id}
        >
          <header className="campaign-report-heading">
            <h3>{item.title}</h3>
            <p>{item.context}</p>
            <p className="campaign-report-period">
              <b>{item.platform}</b>
              <span>{item.period}</span>
              <span>Indian rupees (INR)</span>
            </p>
          </header>

          <dl className="campaign-key-metrics" aria-label={`${item.tabLabel} reported results`}>
            {item.keyMetrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>
                  {metric.value.endsWith(" million") ? (
                    <>
                      {metric.value.slice(0, -8)}{" "}
                      <span className="campaign-metric-unit">million</span>
                    </>
                  ) : (
                    metric.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="campaign-report-body">
            <div className="campaign-report-source">
              <figure>
                <a
                  className="campaign-report-preview"
                  href={item.evidence.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open the full-size ${item.tabLabel} source report in a new tab`}
                >
                  <img
                    src={item.evidence.src}
                    alt={item.evidence.alt}
                    width={item.evidence.width}
                    height={item.evidence.height}
                    loading="lazy"
                    decoding="async"
                  />
                </a>
                <figcaption>
                  Original platform report. Business identifiers have been redacted.
                </figcaption>
              </figure>
              <a
                className="campaign-source-action"
                href={item.evidence.src}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View the full-size ${item.tabLabel} source report in a new tab`}
              >
                View Full-Size Report
              </a>
              <details className="campaign-report-details">
                <summary>More report figures &amp; calculations</summary>
                <dl>
                  {item.secondaryMetrics.map((metric) => (
                    <div key={metric.label}>
                      <dt>{metric.label}</dt>
                      <dd>{metric.value}</dd>
                    </div>
                  ))}
                </dl>
                {item.calculation && <p>{item.calculation}</p>}
              </details>
            </div>

            <div className="campaign-report-reading">
              <div>
                <h4>What the figures mean</h4>
                <p>{item.interpretation}</p>
              </div>
              <div>
                <h4>Work carried out</h4>
                <ul>
                  {item.work.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="campaign-report-limit">
                <h4>What this does not prove</h4>
                <p>{item.limitation}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="campaign-evidence-next">
        <div>
          <h3>Have campaigns to review?</h3>
          <p>Tell us what you sell, where you advertise, and which result you need to measure.</p>
        </div>
        <TransitionLink className="primary-btn" href="/#contact">
          Discuss Your Growth Goals
        </TransitionLink>
      </div>
      <p className="campaign-evidence-disclosure">{disclosure}</p>
    </section>
  );
}
