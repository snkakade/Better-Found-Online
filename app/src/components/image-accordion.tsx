import { useState } from "react";
import { humanImages } from "@/editorial-images";

const items = [
  { title: "A clear offer", image: humanImages.websiteWorkshop, text: "Make the important things easy to find and understand." },
  { title: "Distinctive design", image: humanImages.printCheck, text: "Build a visual and verbal identity people can recognize." },
  { title: "An easy enquiry", image: humanImages.customerFollowup, text: "Help visitors find the contact form and know what happens next." },
];

export function ImageAccordion() {
  const [active, setActive] = useState(0);
  return (
    <section className="image-accordion-section section-pad" id="principles" aria-labelledby="principles-title">
      <div className="accordion-heading"><p className="eyebrow">What guides the work</p><h2 id="principles-title">Make the customer journey easier.</h2></div>
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
