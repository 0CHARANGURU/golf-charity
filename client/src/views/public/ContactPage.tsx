import React, { useState } from 'react';
import { Mail, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-offWhite tracking-tight">
          Get in Touch
        </h1>
        <p className="text-lg text-offWhite-muted leading-relaxed">
          Questions regarding charity partnerships, draw audits, or your subscription? We are here to help.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8 border border-charcoal-border">
        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-lime mx-auto" />
            <h3 className="text-2xl font-bold text-offWhite">Message Received</h3>
            <p className="text-sm text-offWhite-muted">
              Thank you for contacting Golf Charity. Our support and compliance team will respond within 24 hours.
            </p>
            <Button variant="secondary" onClick={() => setSubmitted(false)}>
              Send Another Inquiry
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-offWhite-muted mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jack Nicklaus"
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-charcoal-border text-offWhite placeholder-offWhite-muted/50 focus:border-lime focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-offWhite-muted mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jack@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-charcoal-border text-offWhite placeholder-offWhite-muted/50 focus:border-lime focus:outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-offWhite-muted mb-1.5">
                Subject
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Charity Partnership or Verification Question"
                className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-charcoal-border text-offWhite placeholder-offWhite-muted/50 focus:border-lime focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-offWhite-muted mb-1.5">
                Message
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we assist you today?"
                className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-charcoal-border text-offWhite placeholder-offWhite-muted/50 focus:border-lime focus:outline-none text-sm"
              />
            </div>

            <Button type="submit" className="w-full py-3">
              Send Message
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
