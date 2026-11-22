import { AppDataSource } from '../database/dataSource';
import { Winner, WinnerProof, Notification } from '../entities';
import { VerificationStatus } from '../constants';

export interface SubmitProofInput {
  winnerId: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number;
  notes?: string;
}

export class WinnerVerificationService {
  private winnerRepo = AppDataSource.getRepository(Winner);
  private proofRepo = AppDataSource.getRepository(WinnerProof);
  private notifRepo = AppDataSource.getRepository(Notification);

  async submitProof(userId: string, input: SubmitProofInput): Promise<WinnerProof> {
    const winner = await this.winnerRepo.findOne({
      where: { id: input.winnerId, userId },
    });

    if (!winner) {
      throw new Error('Winner record not found or unauthorized.');
    }

    if (winner.verificationStatus === VerificationStatus.APPROVED) {
      throw new Error('This win has already been approved.');
    }

    const proof = this.proofRepo.create({
      winnerId: winner.id,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
      fileSizeBytes: input.fileSizeBytes,
      submittedNotes: input.notes || null,
    });

    const savedProof = await this.proofRepo.save(proof);

    // Reset status to PENDING if previously rejected so admin can re-review
    if (winner.verificationStatus === VerificationStatus.REJECTED) {
      winner.verificationStatus = VerificationStatus.PENDING;
      winner.rejectionReason = null;
      await this.winnerRepo.save(winner);
    }

    return savedProof;
  }

  async adminVerifyWinner(
    adminUserId: string,
    winnerId: string,
    approve: boolean,
    rejectionReason?: string
  ): Promise<Winner> {
    const winner = await this.winnerRepo.findOne({
      where: { id: winnerId },
      relations: ['user', 'draw'],
    });

    if (!winner) {
      throw new Error('Winner record not found.');
    }

    if (approve) {
      winner.verificationStatus = VerificationStatus.APPROVED;
      winner.verifiedByUserId = adminUserId;
      winner.verifiedAt = new Date();
      winner.rejectionReason = null;
    } else {
      winner.verificationStatus = VerificationStatus.REJECTED;
      winner.verifiedByUserId = adminUserId;
      winner.verifiedAt = new Date();
      winner.rejectionReason = rejectionReason || 'Score verification proof was rejected by administration.';
    }

    const saved = await this.winnerRepo.save(winner);

    // Send notification to winner
    await this.notifRepo.save(
      this.notifRepo.create({
        userId: winner.userId,
        title: approve ? 'Score Verification Approved!' : 'Score Verification Update',
        message: approve
          ? `Your scorecard proof for Draw #${winner.draw.drawNumber} has been approved! Payout of $${(winner.prizeAmountCents / 100).toFixed(2)} is now eligible for disbursement.`
          : `Your scorecard proof for Draw #${winner.draw.drawNumber} was rejected: ${winner.rejectionReason}`,
        type: 'PROOF_REQUEST',
        metadata: { winnerId: winner.id, status: winner.verificationStatus },
      })
    );

    return saved;
  }

  async getMyWinnings(userId: string): Promise<Winner[]> {
    return this.winnerRepo.find({
      where: { userId },
      relations: ['draw', 'prizeTier', 'proofs', 'payout'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAdminPendingWinners(): Promise<Winner[]> {
    return this.winnerRepo.find({
      where: { verificationStatus: VerificationStatus.PENDING },
      relations: ['draw', 'user', 'user.profile', 'prizeTier', 'proofs'],
      order: { createdAt: 'ASC' },
    });
  }
}
