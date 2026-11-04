import { useState } from "react";
import { editorialImages } from "@/editorial-images";

const items = [
  { title: "Clarity", image: editorialImages.websitePlanning, text: "Make the important things easy to find and understand." },
  { title: "Character", image: editorialImages.productPhotography, text: "Build a visual and verbal identity people can recognize." },
  { title: "Continuity", image: editorialImages.connectedWorkflow, text: "Make the message, experience, and next step feel connected." },
];

export function ImageAccordion() {
  const [active, setActive] = useState(0);
  return (
    <section className="image-accordion-section section-pad" id="principles" aria-labelledby="principles-title">
      <div className="accordion-heading"><p className="eyebrow">What guides the work</p><h2 id="principles-title">Every detail needs a reason.</h2></div>
      <div className="image-accordion">
        {items.map((item, index) => (
          <button key={item.title} className={index === active ? "accordion-panel active" : "accordion-panel"} onPointerEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)} aria-pressed={index === active}>
            <img {...item.image} sizes="(max-width: 900px) 100vw, 70vw" alt="" loading="lazy" decoding="async" />
            <span><b>{item.title}</b><small>{item.text}</small></span>
          </button>
        ))}
      </div>
    </section>
  );
}
