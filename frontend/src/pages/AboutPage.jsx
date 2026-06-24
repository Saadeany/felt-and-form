import React from "react";
import { Link } from "react-router-dom";

const AboutPage = () => (
  <div>
    <section className="bg-ink text-paper py-24 px-4 text-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-6 border border-dashed border-paper/15" />
      <p className="eyebrow text-paper/50 mb-3">Est. 2024 — Cairo, Egypt</p>
      <h1 className="font-display text-5xl sm:text-7xl">Our Story</h1>
      <div className="stitch-rule mx-auto mt-5 w-20 text-paper/30" />
    </section>

    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 space-y-10">
      {[
        {
          eyebrow: "The idea",
          title: "Built for Real Life",
          body: "Felt & Form started as a question: why do most basics fall apart after six washes? We set out to make clothing that doesn't. Not luxury, not fast fashion — just honest, well-made clothes at prices people can actually afford.",
        },
        {
          eyebrow: "The craft",
          title: "Weight that holds",
          body: "Every fabric we choose is tested for weight, shrinkage, and colorfastness before it reaches a pattern. We work with local manufacturers who share our obsession with the small details — the stitch density on a cuff, the hang of a waistband, the way a seam falls.",
        },
        {
          eyebrow: "The future",
          title: "Growing slowly, on purpose",
          body: "We don't drop new styles every week. We'd rather get one silhouette exactly right than add ten mediocre ones. When we say something is in the collection, it means we're proud of it.",
        },
      ].map(({ eyebrow, title, body }) => (
        <div key={title} className="space-y-3">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="font-display text-3xl">{title}</h2>
          <div className="stitch-rule w-16 text-ink/30" />
          <p className="text-charcoal/70 leading-relaxed">{body}</p>
        </div>
      ))}
    </section>

    <section className="bg-cream py-16 text-center px-4">
      <p className="eyebrow mb-3">Ready to explore?</p>
      <h2 className="font-display text-4xl mb-6">Shop the Collection</h2>
      <Link to="/shop" className="btn-primary inline-flex">Shop Now</Link>
    </section>
  </div>
);

export default AboutPage;
