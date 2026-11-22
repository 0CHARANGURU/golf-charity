import bcrypt from 'bcryptjs';
import { AppDataSource } from '../dataSource';
import {
  User,
  UserProfile,
  SubscriptionPlan,
  Charity,
  DrawConfiguration,
} from '../../entities';
import { UserRole, UserStatus, PlanInterval, DrawMode } from '../../constants';

export async function runSeeds() {
  console.log('--- Running Baseline Seeds ---');
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  // 1. Subscription Plans
  const planRepo = AppDataSource.getRepository(SubscriptionPlan);
  const monthlyCount = await planRepo.count({ where: { slug: 'monthly-standard' } });
  if (monthlyCount === 0) {
    const monthlyPlan = planRepo.create({
      name: 'Standard Monthly Membership',
      slug: 'monthly-standard',
      stripePriceId: 'price_monthly_sample_123',
      stripeProductId: 'prod_monthly_sample_123',
      interval: PlanInterval.MONTH,
      amountCents: 2000, // $20.00
      currency: 'USD',
      entriesPerDraw: 1,
      isActive: true,
    });
    await planRepo.save(monthlyPlan);
    console.log('Seeded Monthly Plan ($20.00)');
  }

  const annualCount = await planRepo.count({ where: { slug: 'annual-champion' } });
  if (annualCount === 0) {
    const annualPlan = planRepo.create({
      name: 'Champion Annual Membership',
      slug: 'annual-champion',
      stripePriceId: 'price_annual_sample_456',
      stripeProductId: 'prod_annual_sample_456',
      interval: PlanInterval.YEAR,
      amountCents: 20000, // $200.00
      currency: 'USD',
      entriesPerDraw: 1,
      isActive: true,
    });
    await planRepo.save(annualPlan);
    console.log('Seeded Annual Plan ($200.00)');
  }

  // 2. Admin User
  const userRepo = AppDataSource.getRepository(User);
  const profileRepo = AppDataSource.getRepository(UserProfile);
  const existingAdmin = await userRepo.findOne({ where: { email: 'admin@golfcharity.com' } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('AdminPassword123!', 12);
    const adminUser = userRepo.create({
      email: 'admin@golfcharity.com',
      passwordHash,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
    });
    await userRepo.save(adminUser);

    const adminProfile = profileRepo.create({
      userId: adminUser.id,
      firstName: 'Platform',
      lastName: 'Administrator',
      country: 'US',
      golfHandicap: 5.2,
      homeClub: 'Pebble Beach Golf Links',
    });
    await profileRepo.save(adminProfile);
    console.log('Seeded Admin User (admin@golfcharity.com / AdminPassword123!)');
  }

  // 3. Partner Charities
  const charityRepo = AppDataSource.getRepository(Charity);
  const initialCharities = [
    {
      name: 'Youth Golf Foundation',
      slug: 'youth-golf-foundation',
      registrationNumber: 'EIN-84-1928371',
      description: 'Empowering underprivileged youth through mentorship, golf training, and educational scholarships.',
      category: 'Youth Development',
      logoUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=200&h=200&fit=crop',
      websiteUrl: 'https://example.org/youth-golf',
      isFeatured: true,
      isVerified: true,
    },
    {
      name: 'Veterans Tee Time Alliance',
      slug: 'veterans-tee-time-alliance',
      registrationNumber: 'EIN-73-9283741',
      description: 'Providing rehabilitative golf clinics, community integration, and wellness therapy for military veterans.',
      category: 'Veterans & Wellness',
      logoUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=200&h=200&fit=crop',
      websiteUrl: 'https://example.org/veterans-golf',
      isFeatured: true,
      isVerified: true,
    },
    {
      name: 'Fairway Green Restoration Project',
      slug: 'fairway-green-restoration',
      registrationNumber: 'EIN-91-8374652',
      description: 'Supporting native habitat conservation, water reclamation, and biodiversity across community golf courses.',
      category: 'Environmental Conservation',
      logoUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=200&h=200&fit=crop',
      websiteUrl: 'https://example.org/fairway-green',
      isFeatured: false,
      isVerified: true,
    },
    {
      name: 'Junior Cancer Golf Hope',
      slug: 'junior-cancer-golf-hope',
      registrationNumber: 'EIN-45-7896541',
      description: 'Funding pediatric cancer research and organizing family recreational golf therapy retreats.',
      category: 'Healthcare & Hope',
      logoUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&h=200&fit=crop',
      websiteUrl: 'https://example.org/junior-cancer-hope',
      isFeatured: true,
      isVerified: true,
    },
  ];

  for (const c of initialCharities) {
    const exists = await charityRepo.findOne({ where: { slug: c.slug } });
    if (!exists) {
      await charityRepo.save(charityRepo.create(c));
      console.log(`Seeded Charity: ${c.name}`);
    }
  }

  // 4. Default Draw Configuration
  const configRepo = AppDataSource.getRepository(DrawConfiguration);
  const existingConfig = await configRepo.findOne({ where: { name: 'Official Monthly Championship Draw' } });
  if (!existingConfig) {
    const drawConfig = configRepo.create({
      name: 'Official Monthly Championship Draw',
      drawMode: DrawMode.RANDOM,
      minNumber: 1,
      maxNumber: 45,
      numbersDrawnCount: 5,
      prizeDistribution5Match: 40.00,
      prizeDistribution4Match: 35.00,
      prizeDistribution3Match: 25.00,
      rolloverUnclaimed: true,
      isActive: true,
    });
    await configRepo.save(drawConfig);
    console.log('Seeded Draw Configuration (Random mode, 1-45, 5 numbers, tiers: 40/35/25)');
  }

  console.log('--- Baseline Seeds Completed ---');
}

if (require.main === module) {
  runSeeds()
    .then(async () => {
      await AppDataSource.destroy();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed execution error:', err);
      process.exit(1);
    });
}
