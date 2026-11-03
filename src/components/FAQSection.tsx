"use client";

import React from "react";
import { FAQ_ITEMS } from "@/data/faq";

export const FAQSection: React.FC = () => {
  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="section-title-wrap">
          <div className="section-eyebrow">Frequently Answered Questions</div>
          <h2 className="section-title">The Philosophy of Anti-Algorithm Curation</h2>
        </div>

        <div className="faq-grid">
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx} className="faq-card">
              <h3 className="faq-q">{item.q}</h3>
              <p className="faq-a">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
