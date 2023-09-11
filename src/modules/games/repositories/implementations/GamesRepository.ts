import { getRepository, Repository } from 'typeorm';

import { User } from '../../../users/entities/User';
import { Game } from '../../entities/Game';

import { IGamesRepository } from '../IGamesRepository';

export class GamesRepository implements IGamesRepository {
    private repository: Repository<Game>;

    constructor() {
        this.repository = getRepository(Game);
    }
    
    async findByTitleContaining(param: string): Promise<Game[]> {
        return this.repository
            .createQueryBuilder()
            .where('title ilike :param', { param: `%${param}%` })
            .getMany();
    }

    async countAllGames(): Promise<[{ count: string }]> {
        return this.repository.query('select * from (select count(*) from games) gc'); // Complete usando raw query
    }

    async findUsersByGameId(id: string): Promise<User[]> {
        return this.repository
            .manager
            .getRepository(User)
            .createQueryBuilder('user')
            .select('user')
            .leftJoin('user.games', 'game')
            .where('game.id = :id', { id })
            .getMany();
    }
}