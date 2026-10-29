import { Plus } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { TransitionLink } from "@/components/site-chrome";

type ServiceOffering = {
  name: string;
  preview: string;
  lead: string;
  body: string;
  items: readonly string[];
  cta: string;
  href: string;
};

const serviceLinks: Record<string, string> = {
  "Website Design & Development": "/services/websites",
  "SEO & Search Visibility": "/services/seo-ai-search",
  "Performance Marketing": "/services/performance-marketing",
};

export function ServicesAccordion({ services, motionDisabled = false }: {
  services: readonly ServiceOffering[];
  motionDisabled?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current || motionDisabled || window.matchMedia("(max-width: 900px)").matches) return;
    const panels = Array.from(root.current.querySelectorAll<HTMLDetailsElement>(".service"));
    const motions = new Map<HTMLDetailsElement, { animation: Animation; opening: boolean }>();

    const animatePanel = (panel: HTMLDetailsElement, opening: boolean) => {
      const summary = panel.querySelector("summary")!;
      const content = panel.querySelector<HTMLElement>(".service-content")!;
      const startHeight = panel.getBoundingClientRect().height;
      motions.get(panel)?.animation.cancel();
      panel.style.height = `${startHeight}px`;
      panel.style.overflow = "hidden";
      panel.open = true;
      const borderHeight = panel.offsetHeight - panel.clientHeight;
      const endHeight = summary.offsetHeight + borderHeight + (opening ? content.offsetHeight : 0);
      const animation = panel.animate(
        [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
        { duration: 420, easing: "cubic-bezier(.22, 1, .36, 1)" },
      );
      motions.set(panel, { animation, opening });
      animation.onfinish = () => {
        if (motions.get(panel)?.animation !== animation) return;
        panel.open = opening;
        panel.style.removeProperty("height");
        panel.style.removeProperty("overflow");
        motions.delete(panel);
      };
    };

    const detach = panels.map((panel) => {
      // Retain native details behavior as the no-JS/reduced-motion fallback.
      // While enhanced, coordinate the closing animation before hiding content.
      panel.removeAttribute("name");
      const summary = panel.querySelector("summary")!;
      const onClick = (event: MouseEvent) => {
        event.preventDefault();
        const opening = !(motions.get(panel)?.opening ?? panel.open);
        if (opening) {
          panels.forEach((other) => {
            if (other !== panel && (motions.get(other)?.opening ?? other.open)) animatePanel(other, false);
          });
        }
        animatePanel(panel, opening);
      };
      summary.addEventListener("click", onClick);
      return () => summary.removeEventListener("click", onClick);
    });

    return () => {
      detach.forEach((remove) => remove());
      motions.forEach(({ animation, opening }, panel) => {
        animation.cancel();
        panel.open = opening;
        panel.style.removeProperty("height");
        panel.style.removeProperty("overflow");
      });
      panels.forEach((panel) => panel.setAttribute("name", "services"));
    };
  }, [motionDisabled]);

  return (
    <div className={`service-list${motionDisabled ? " service-list--still" : ""}`} ref={root}>
      {services.map((service, index) => {
        const panelId = `service-panel-${service.name.toLowerCase()}`;
        return (
          <details className="service" key={service.name} name="services" open={index === 0 ? true : undefined}>
            <summary aria-controls={panelId}>
              <span className="service-expand" aria-hidden="true"><Plus size={28} weight="regular" /></span>
              <h3>{service.name}</h3>
              <span className="service-lead">{service.lead}</span>
              <span className="service-preview" aria-hidden="true"><img src={service.preview} alt="" loading="lazy" /></span>
            </summary>
            <div className="service-content" id={panelId}>
              <div className="service-artwork" aria-hidden="true"><img src={service.preview} alt="" loading="lazy" decoding="async" /></div>
              <div className="service-description">
                <p>{service.body}</p>
                <ul>
                  {service.items.map((item) => <li key={item}>{serviceLinks[item] ? <TransitionLink href={serviceLinks[item]}>{item}</TransitionLink> : item}</li>)}
                </ul>
                <TransitionLink href={service.href} className="service-link">{service.cta}</TransitionLink>
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}
