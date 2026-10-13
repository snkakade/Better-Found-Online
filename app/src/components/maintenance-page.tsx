import { ArrowUpRight } from "@phosphor-icons/react";

export function MaintenancePage() {
  return (
    <main className="maintenance" id="main">
      <header className="maintenance-header">
        <a className="maintenance-brand" href="/" aria-label="Better Found Online home">
          <img src="/assets/brand/mark-light.svg" width="52" height="56" alt="" />
          <span>better found online.</span>
        </a>

        <p className="maintenance-status">
          <span aria-hidden="true" />
          Site improvement in progress
        </p>
      </header>

      <section className="maintenance-stage" aria-labelledby="maintenance-title">
        <div className="maintenance-copy">
          <p className="maintenance-kicker">A brief intermission</p>
          <h1 id="maintenance-title">
            Plot twist:<br />
            we&apos;re working<br />
            <em>on ourselves.</em>
          </h1>
          <p className="maintenance-intro">
            The new Better Found Online is nearly online. Awkward, we know.
          </p>
          <a className="maintenance-cta" href="mailto:hello@betterfoundonline.com">
            Talk while we tinker
            <ArrowUpRight size={19} weight="light" aria-hidden="true" />
          </a>
        </div>

        <div className="maintenance-workbench" aria-hidden="true">
          <div className="workbench-topline">
            <span>SELF-IMPROVEMENT MACHINE</span>
            <span className="workbench-live">RUNNING</span>
          </div>

          <div className="workbench-window">
            <div className="workbench-ruler"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
            <div className="workbench-word workbench-word-one">RETHINK</div>
            <div className="workbench-word workbench-word-two">REWRITE</div>
            <div className="workbench-word workbench-word-three">REDRAW</div>
            <div className="workbench-cursor">+</div>
          </div>

          <div className="workbench-output">
            <span>OUTPUT</span>
            <strong>SOMETHING BETTER.</strong>
            <small>ETA: SOON-ISH</small>
          </div>
        </div>
      </section>

      <footer className="maintenance-footer">
        <p>Still taking on good ideas.</p>
        <nav aria-label="Contact Better Found Online">
          <a href="mailto:hello@betterfoundonline.com">hello@betterfoundonline.com</a>
          <a href="tel:+15707077078">+1 (570) 707-7078</a>
          <a href="https://wa.me/15707077078" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="https://www.linkedin.com/company/better-found-online" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </nav>
      </footer>
    </main>
  );
}
