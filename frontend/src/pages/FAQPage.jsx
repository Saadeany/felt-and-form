import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "How do I track my order?", a: "Log in to your account and visit My Orders. Every order shows its current status from pending through to delivered." },
  { q: "What is your return policy?", a: "We accept returns within 14 days of delivery for unworn, unwashed items with tags attached. Contact hello@feltandform.com to start a return." },
  { q: "Do you ship outside Egypt?", a: "Currently we ship within Egypt only. International shipping is on our roadmap for early 2025." },
  { q: "How long does delivery take?", a: "Standard delivery takes 2–4 business days within Cairo and 4–7 business days for other governorates." },
  { q: "Can I change or cancel my order?", a: "Orders can be cancelled before they enter 'Processing' status. Contact us immediately by phone or email and we'll do our best to help." },
  { q: "How do I know which size to choose?", a: "Each product page lists available sizes. Our basics are cut true to size; oversized pieces are labelled as such." },
  { q: "What payment methods do you accept?", a: "We accept Cash on Delivery, Credit Card (Visa/Mastercard), Vodafone Cash, and InstaPay." },
  { q: "Are your products ethically made?", a: "Yes. All our manufacturing partners are based in Egypt and are audited annually for fair working conditions and wages." },
];

const FAQPage = () => {
  const [open, setOpen] = useState(null);

  return (
    <div>
      <section className="bg-ink text-paper py-20 text-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-6 border border-dashed border-paper/15" />
        <h1 className="font-display text-5xl">FAQ</h1>
        <div className="stitch-rule mx-auto mt-5 w-20 text-paper/30" />
      </section>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 space-y-2">
        {FAQS.map(({ q, a }, i) => (
          <div key={i} className="border border-ink/10">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <span className="text-sm font-medium">{q}</span>
              <ChevronDown size={16} className={`shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="border-t border-ink/10 px-5 pb-5">
                <p className="text-sm text-charcoal/70 leading-relaxed pt-3">{a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
