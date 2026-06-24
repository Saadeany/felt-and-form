import React from "react";

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h2 className="font-display text-xl">{title}</h2>
    <div className="stitch-rule w-12 text-ink/20" />
    <div className="text-sm text-charcoal/70 leading-relaxed space-y-2">{children}</div>
  </div>
);

const TermsPage = () => (
  <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 space-y-10">
    <div>
      <p className="eyebrow mb-2">Last updated: June 2024</p>
      <h1 className="font-display text-4xl">Terms &amp; Conditions</h1>
      <div className="stitch-rule mt-4 w-20 text-ink/30" />
    </div>
    <Section title="Acceptance of Terms">
      <p>By accessing or purchasing from the Felt &amp; Form website, you agree to be bound by these terms. If you do not agree, please do not use the site.</p>
    </Section>
    <Section title="Orders and Payment">
      <p>All prices are listed in Egyptian Pounds (EGP) and include applicable taxes. Orders are confirmed by email. We reserve the right to cancel orders due to stock errors or suspected fraud.</p>
    </Section>
    <Section title="Shipping and Delivery">
      <p>Delivery timelines are estimates. We are not liable for delays caused by carriers or circumstances outside our control. Risk of loss passes to you upon delivery.</p>
    </Section>
    <Section title="Returns and Refunds">
      <p>Items may be returned within 14 days of delivery if unworn and in original condition. Refunds are processed within 5–7 business days of us receiving the returned item.</p>
    </Section>
    <Section title="Intellectual Property">
      <p>All content on this website — photography, copy, logo, and design — is the property of Felt &amp; Form and may not be reproduced without written permission.</p>
    </Section>
    <Section title="Limitation of Liability">
      <p>Felt &amp; Form is not liable for indirect, incidental, or consequential damages arising from your use of our products or website beyond the amount you paid for the relevant order.</p>
    </Section>
  </div>
);

export default TermsPage;
