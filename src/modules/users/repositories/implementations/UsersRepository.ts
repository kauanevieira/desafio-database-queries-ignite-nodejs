import { getRepository, Repository } from 'typeorm';

import { IFindUserByFullNameDTO, IFindUserWithGamesDTO } from '../../dtos';
import { User } from '../../entities/User';
import { IUsersRepository } from '../IUsersRepository';

export class UsersRepository implements IUsersRepository {
    private repository: Repository<User>;

    constructor() {
        this.repository = getRepository(User);
    }

    async findUserWithGamesById({ user_id }: IFindUserWithGamesDTO): Promise<User> {
        return await this.repository.findOneOrFail({ where: { id: user_id }, relations: ['games'] });
    }

    async findAllUsersOrderedByFirstName(): Promise<User[]> {
        return this.repository.query('select * from users order by first_name');
    }

    async findUserByFullName({
        first_name,
        last_name,
    }: IFindUserByFullNameDTO): Promise<User[] | undefined> {
        return this.repository.query(
            'select * from users where LOWER(first_name) = $1 and LOWER(last_name) = $2 order by first_name',
            [ first_name.toLowerCase() , last_name.toLowerCase() ]
        );
    }
}