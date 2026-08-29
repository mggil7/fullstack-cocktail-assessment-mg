import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, QueryFailedError, Repository } from 'typeorm';
import { Cocktails } from './cocktails.entity';

const PG_UNIQUE_VIOLATION = '23505';

type PgDriverError = {
  code?: string;
  driverError?: { code?: string };
};
@Injectable()
export class CocktailsService {
  constructor(
    @InjectRepository(Cocktails)
    private cocktailsRepository: Repository<Cocktails>,
  ) {}

  findAll(search?: string): Promise<Cocktails[]> {
    if (search) {
      return this.cocktailsRepository.find({
        where: { description: ILike(`%${search}%`) },
        order: { id: 'ASC' },
      });
    }
    return this.cocktailsRepository.find({ order: { id: 'ASC' } });
  }

  findOne(id: number): Promise<Cocktails | null> {
    return this.cocktailsRepository.findOneBy({ id });
  }

  async create(cocktail: Partial<Cocktails>): Promise<Cocktails> {
    try {
      return await this.cocktailsRepository.save(
        this.cocktailsRepository.create(cocktail),
      );
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          `A cocktail named "${cocktail.title}" already exists. Titles must be unique.`,
        );
      }
      throw error;
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const pgError = error as unknown as PgDriverError;
    return (
      pgError.code === PG_UNIQUE_VIOLATION ||
      pgError.driverError?.code === PG_UNIQUE_VIOLATION
    );
  }
}
