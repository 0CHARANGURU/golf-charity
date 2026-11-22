import { AppDataSource } from '../database/dataSource';
import { Charity, UserCharityPreference, CharityDonation } from '../entities';

export interface CharityFilter {
  category?: string;
  isFeatured?: boolean;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export class CharityService {
  private charityRepo = AppDataSource.getRepository(Charity);
  private prefRepo = AppDataSource.getRepository(UserCharityPreference);
  private donationRepo = AppDataSource.getRepository(CharityDonation);

  async getCharities(filter: CharityFilter = {}): Promise<{ charities: Charity[]; totalCount: number }> {
    const query = this.charityRepo.createQueryBuilder('c');

    if (filter.category) {
      query.andWhere('c.category = :category', { category: filter.category });
    }

    if (filter.isFeatured !== undefined) {
      query.andWhere('c.isFeatured = :isFeatured', { isFeatured: filter.isFeatured });
    }

    if (filter.searchQuery) {
      query.andWhere('(c.name ILIKE :q OR c.description ILIKE :q)', {
        q: `%${filter.searchQuery}%`,
      });
    }

    query.orderBy('c.isFeatured', 'DESC').addOrderBy('c.name', 'ASC');

    const totalCount = await query.getCount();

    if (filter.limit) {
      query.take(filter.limit);
    }
    if (filter.offset) {
      query.skip(filter.offset);
    }

    const charities = await query.getMany();
    return { charities, totalCount };
  }

  async getCharity(id?: string, slug?: string): Promise<Charity | null> {
    if (id) {
      return this.charityRepo.findOne({ where: { id } });
    }
    if (slug) {
      return this.charityRepo.findOne({ where: { slug } });
    }
    return null;
  }

  async setCharityPreference(
    userId: string,
    charityId: string,
    percentage: number
  ): Promise<UserCharityPreference> {
    if (percentage < 10.0 || percentage > 100.0) {
      throw new Error('Charity allocation must be at least 10.00% and at most 100.00%.');
    }

    const charity = await this.charityRepo.findOne({ where: { id: charityId } });
    if (!charity) {
      throw new Error('Target charity organization not found.');
    }

    let pref = await this.prefRepo.findOne({ where: { userId } });
    if (!pref) {
      pref = this.prefRepo.create({
        userId,
        charityId,
        percentage,
        isPrimary: true,
      });
    } else {
      pref.charityId = charityId;
      pref.percentage = percentage;
    }

    const saved = await this.prefRepo.save(pref);
    saved.charity = charity;
    return saved;
  }

  async getMyCharityPreference(userId: string): Promise<UserCharityPreference | null> {
    return this.prefRepo.findOne({
      where: { userId },
      relations: ['charity'],
    });
  }

  async recordDonation(
    charityId: string,
    amountCents: number,
    userId?: string,
    paymentId?: string,
    sourceType = 'SUBSCRIPTION_PERCENTAGE'
  ): Promise<CharityDonation> {
    const donation = this.donationRepo.create({
      charityId,
      userId: userId || null,
      paymentId: paymentId || null,
      amountCents,
      currency: 'USD',
      sourceType,
      status: 'ACCRUED',
    });

    const saved = await this.donationRepo.save(donation);

    // Increment total received cents on charity
    await this.charityRepo.increment({ id: charityId }, 'totalReceivedCents', amountCents);

    return saved;
  }
}
