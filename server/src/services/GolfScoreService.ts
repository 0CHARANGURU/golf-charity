import { AppDataSource } from '../database/dataSource';
import { GolfScore } from '../entities';

export interface SubmitScoreInput {
  scoreValue: number;
  playedAt: string;
  courseName: string;
  holesPlayed?: number;
}

export interface UpdateScoreInput {
  scoreValue?: number;
  playedAt?: string;
  courseName?: string;
  holesPlayed?: number;
}

export class GolfScoreService {
  private scoreRepo = AppDataSource.getRepository(GolfScore);

  async submitScore(userId: string, input: SubmitScoreInput): Promise<GolfScore> {
    // 1. Validation
    if (input.scoreValue < 1 || input.scoreValue > 45) {
      throw new Error('Golf score must be between 1 and 45 points.');
    }

    if (!input.playedAt) {
      throw new Error('Date of play is required.');
    }

    const playedDate = new Date(input.playedAt);
    if (isNaN(playedDate.getTime())) {
      throw new Error('Invalid date format.');
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (playedDate > today) {
      throw new Error('Score play date cannot be in the future.');
    }

    const holes = input.holesPlayed || 18;
    if (holes !== 9 && holes !== 18) {
      throw new Error('Holes played must be 9 or 18.');
    }

    // 2. Transactional Concurrency-Safe FIFO Archival
    return AppDataSource.transaction(async (manager) => {
      // Query active scores for user with pessimistic row lock
      const activeScores = await manager
        .createQueryBuilder(GolfScore, 'score')
        .setLock('pessimistic_write')
        .where('score.userId = :userId AND score.isActive = :isActive', {
          userId,
          isActive: true,
        })
        .orderBy('score.playedAt', 'DESC')
        .addOrderBy('score.createdAt', 'DESC')
        .getMany();

      // If already at or above 5 active scores, archive oldest to maintain max 5 active
      if (activeScores.length >= 5) {
        // Active scores are newest to oldest; scores from index 4 onwards are archived
        const toArchive = activeScores.slice(4);
        for (const oldScore of toArchive) {
          oldScore.isActive = false;
          oldScore.archivedAt = new Date();
          await manager.save(oldScore);
        }
      }

      // Insert new score
      const newScore = manager.create(GolfScore, {
        userId,
        scoreValue: input.scoreValue,
        playedAt: input.playedAt,
        courseName: input.courseName.trim(),
        holesPlayed: holes,
        isActive: true,
      });

      return manager.save(newScore);
    });
  }

  async getMyScores(userId: string, includeArchived = false): Promise<GolfScore[]> {
    const query = this.scoreRepo
      .createQueryBuilder('score')
      .where('score.userId = :userId', { userId });

    if (!includeArchived) {
      query.andWhere('score.isActive = :isActive', { isActive: true });
    }

    return query
      .orderBy('score.playedAt', 'DESC')
      .addOrderBy('score.createdAt', 'DESC')
      .getMany();
  }

  async updateScore(userId: string, scoreId: string, updates: UpdateScoreInput): Promise<GolfScore> {
    const score = await this.scoreRepo.findOne({
      where: { id: scoreId, userId },
    });

    if (!score) {
      throw new Error('Score record not found or unauthorized.');
    }

    if (updates.scoreValue !== undefined) {
      if (updates.scoreValue < 1 || updates.scoreValue > 45) {
        throw new Error('Golf score must be between 1 and 45 points.');
      }
      score.scoreValue = updates.scoreValue;
    }

    if (updates.playedAt !== undefined) {
      const date = new Date(updates.playedAt);
      if (isNaN(date.getTime()) || date > new Date()) {
        throw new Error('Invalid or future play date.');
      }
      score.playedAt = updates.playedAt;
    }

    if (updates.courseName !== undefined) {
      score.courseName = updates.courseName.trim();
    }

    if (updates.holesPlayed !== undefined) {
      if (updates.holesPlayed !== 9 && updates.holesPlayed !== 18) {
        throw new Error('Holes played must be 9 or 18.');
      }
      score.holesPlayed = updates.holesPlayed;
    }

    return this.scoreRepo.save(score);
  }

  async deleteScore(userId: string, scoreId: string): Promise<boolean> {
    const score = await this.scoreRepo.findOne({
      where: { id: scoreId, userId },
    });

    if (!score) {
      throw new Error('Score not found or unauthorized.');
    }

    await this.scoreRepo.remove(score);
    return true;
  }
}
