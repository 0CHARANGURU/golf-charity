import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Heart, Search, ExternalLink, ShieldCheck } from 'lucide-react';
import { GET_CHARITIES_QUERY } from '../../graphql/operations';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

export const CharityDirectoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalCharity, setActiveModalCharity] = useState<any | null>(null);

  const { data, loading } = useQuery(GET_CHARITIES_QUERY, {
    variables: {
      filter: {
        searchQuery: searchQuery || undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      },
    },
  });

  const categories = ['ALL', 'Youth Development', 'Veterans & Wellness', 'Environmental Conservation', 'Healthcare & Hope'];
  const charities = data?.charities?.charities || [];

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-charcoal border border-lime/30 text-xs font-mono text-lime">
          <Heart className="w-3.5 h-3.5" />
          <span>VERIFIED NON-PROFIT DIRECTORY</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-offWhite tracking-tight">
          Certified Philanthropic Partners
        </h1>
        <p className="text-lg text-offWhite-muted leading-relaxed">
          Every partner is vetted for 501(c)(3) / charity commission status. Allocate 10% to 100% of your subscription directly to any cause below.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-offWhite-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search charities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-charcoal border border-charcoal-border text-offWhite placeholder-offWhite-muted/50 focus:border-lime focus:outline-none text-sm"
          />
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-lime text-navy font-semibold'
                  : 'bg-charcoal text-offWhite-muted hover:text-offWhite border border-charcoal-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Charity Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="glass-card rounded-2xl p-6 h-48 animate-pulse bg-charcoal/50" />
          ))}
        </div>
      ) : charities.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <Heart className="w-8 h-8 text-offWhite-muted mx-auto" />
          <h3 className="text-lg font-bold text-offWhite">No charities found</h3>
          <p className="text-sm text-offWhite-muted">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {charities.map((charity: any) => (
            <div
              key={charity.id}
              className="glass-card rounded-2xl p-6 space-y-4 border border-charcoal-border hover:border-lime/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-offWhite">{charity.name}</h3>
                    <span className="text-xs font-mono text-offWhite-muted">{charity.registrationNumber}</span>
                  </div>
                  <Badge variant={charity.isFeatured ? 'lime' : 'gray'}>
                    {charity.category}
                  </Badge>
                </div>
                <p className="text-sm text-offWhite-muted line-clamp-3 leading-relaxed">
                  {charity.description}
                </p>
              </div>

              <div className="pt-4 border-t border-charcoal-border flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-mono uppercase text-offWhite-muted">Total Received</span>
                  <span className="text-base font-bold text-lime">
                    ${((charity.totalReceivedCents || 0) / 100).toFixed(2)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveModalCharity(charity)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {activeModalCharity && (
        <Modal
          isOpen={!!activeModalCharity}
          onClose={() => setActiveModalCharity(null)}
          title={activeModalCharity.name}
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center space-x-2 text-xs text-lime">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Non-Profit: {activeModalCharity.registrationNumber}</span>
            </div>
            <p className="text-offWhite-muted leading-relaxed">
              {activeModalCharity.description}
            </p>
            <div className="p-4 rounded-xl bg-navy-950 border border-charcoal-border space-y-2">
              <div className="flex justify-between">
                <span className="text-offWhite-muted">Category:</span>
                <span className="text-offWhite font-medium">{activeModalCharity.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-offWhite-muted">Total Contributed:</span>
                <span className="text-lime font-bold">
                  ${((activeModalCharity.totalReceivedCents || 0) / 100).toFixed(2)}
                </span>
              </div>
            </div>
            {activeModalCharity.websiteUrl && (
              <a
                href={activeModalCharity.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-lime hover:underline"
              >
                <span>Visit Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
