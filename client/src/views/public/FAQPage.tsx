import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How are my 5 golf scores translated into my draw ticket?',
      a: 'The platform takes your 5 active scores (each between 1 and 45 points). If you have 5 distinct scores, they directly form your ticket numbers. If duplicates exist, a deterministic modulo formula ensures you receive 5 unique numbers.',
    },
    {
      q: 'What is the minimum charity contribution?',
      a: 'Subscribers must designate at least 10% of their subscription fee directly to their selected non-profit. You can increase this percentage up to 100% anytime in your dashboard.',
    },
    {
      q: 'How does the jackpot rollover work?',
      a: 'If an official draw produces zero winners in the 5-match jackpot tier (or 4-match / 3-match tiers), 100% of that tier\'s prize funds roll over into the next monthly draw.',
    },
    {
      q: 'How are winning scores verified?',
      a: 'When you match 3, 4, or 5 numbers, you receive an in-app and email alert. You have a 30-day window to upload an image of your signed club scorecard or golf app handicap record. Our compliance team verifies it before payout disbursement.',
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Yes. You can manage your billing directly in your dashboard or through the Stripe Customer Portal. If you cancel, your entry remains active until the end of your prepaid period.',
    },
  ];

  return (
    <div className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-offWhite tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-offWhite-muted leading-relaxed">
          Everything you need to know about scoring, charitable allocations, and audited prize draws.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="glass-card rounded-2xl border border-charcoal-border overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between font-semibold text-offWhite hover:text-lime transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-offWhite-muted transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-lime' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-6 text-sm text-offWhite-muted leading-relaxed border-t border-charcoal-border/50 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
