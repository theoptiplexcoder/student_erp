import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * ActiveTermService
 *
 * Provides a lightweight, cached-per-call helper that resolves the currently
 * ACTIVE AcademicTerm for an institution.  Every transactional record in the
 * platform stores a nullable `termId` so actions can be audited by term.
 *
 * Usage (inject via constructor, no extra module registration needed because
 * DatabaseModule is @Global):
 *
 *   constructor(private readonly activeTerm: ActiveTermService) {}
 *
 *   const termId = await this.activeTerm.resolve(institutionId);
 *   await this.prisma.grievance.create({ data: { ...dto, termId } });
 */
@Injectable()
export class ActiveTermService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the id of the ACTIVE term for the institution, or null if none exists.
   * Never throws — callers should treat null as "term context unknown".
   */
  async resolve(institutionId: string): Promise<string | null> {
    try {
      const term = await this.prisma.academicTerm.findFirst({
        where: { institutionId, status: 'ACTIVE' },
        select: { id: true },
        orderBy: { startDate: 'desc' },
      });
      return term?.id ?? null;
    } catch {
      return null;
    }
  }
}
