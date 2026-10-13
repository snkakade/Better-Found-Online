export type PerformanceProofCard = {
  category: string;
  headline: string;
  challenge: string;
  approach: string;
  evidenceLabel: string;
  evidenceNote: string;
};

type PerformanceProofCardsProps = {
  items: PerformanceProofCard[];
  disclosure: string;
};

/**
 * Reusable presentation for permissioned performance-marketing evidence.
 * Intentionally not imported by a public route until every evidence gate is approved.
 */
export function PerformanceProofCards({ items, disclosure }: PerformanceProofCardsProps) {
  return (
    <section className="performance-proof" aria-labelledby="performance-proof-title">
      <div className="performance-proof-heading">
        <p className="eyebrow">Campaign evidence</p>
        <h2 id="performance-proof-title">Different challenges. A reason behind every decision.</h2>
        <p>A useful campaign story starts with the problem, the choice of channels, and what the available evidence actually measures.</p>
      </div>
      <div className="performance-proof-grid">
        {items.map((item) => (
          <article key={item.headline}>
            <span>{item.category}</span>
            <h3>{item.headline}</h3>
            <dl>
              <div><dt>Challenge</dt><dd>{item.challenge}</dd></div>
              <div><dt>Approach</dt><dd>{item.approach}</dd></div>
              <div><dt>{item.evidenceLabel}</dt><dd>{item.evidenceNote}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      <p className="performance-proof-disclosure">{disclosure}</p>
    </section>
  );
}
