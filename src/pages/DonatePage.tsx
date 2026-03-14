import { PageWrapper } from '@/components/layout/PageWrapper';
import { SEO } from '@/components/seo/SEO';
import { DonateSection } from '@/components/donate/DonateSection';

export default function DonatePage() {
  return (
    <PageWrapper>
      <SEO
        title="Donate to WhatIsBTC — Support Free Bitcoin Education"
        description="Support WhatIsBTC and help us keep building free, open-source Bitcoin education for everyone."
        canonical="/donate"
      />
      <div className="flex flex-col items-center gap-8 py-8">
        <DonateSection />
      </div>
    </PageWrapper>
  );
}
