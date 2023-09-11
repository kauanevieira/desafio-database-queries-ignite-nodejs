import {
  Connection, createConnection, getRepository, Repository,
} from 'typeorm';

import { Game } from '../modules/games/entities/Game';
import { User } from '../modules/users/entities/User';

import { UsersRepository } from '../modules/users/repositories/implementations/UsersRepository';
import { GamesRepository } from '../modules/games/repositories/implementations/GamesRepository';

const usersSeed: User[] = [
  {
    first_name: 'Kauane',
    last_name: 'Vieira',
    email: 'kauaneviieira@gmail.com',
  },
  {
    first_name: 'Kauane',
    last_name: 'Vieira',
    email: 'kauaneviieira@gmail.com',
  },
  {
    first_name: 'Kauane',
    last_name: 'Vieira',
    email: 'kauaneviieira@gmail.com',
  },
  {
    first_name: 'Kauane',
    last_name: 'Vieira',
    email: 'kauaneviieira@gmail.com',
  },
] as User[];

const gamesSeed: Pick<Game, 'title'>[] = [
  {
    title: 'Rocket League',
  },
  {
    title: 'The Last Of Us',
  },
  {
    title: 'Need For Speed: Most Wanted',
  },
  {
    title: 'Need For Speed: Payback',
  },
];

describe('Repositories', () => {
  let connection: Connection;

  let ormUsersRepository: Repository<User>;
  let ormGamesRepository: Repository<Game>;

  let usersRepository: UsersRepository;
  let gamesRepository: GamesRepository;

  beforeAll(async () => {
    connection = await createConnection();

    ormUsersRepository = getRepository(User);
    ormGamesRepository = getRepository(Game);

    usersRepository = new UsersRepository();
    gamesRepository = new GamesRepository();

    await connection.query('DROP TABLE IF EXISTS users_games_games');
    await connection.query('DROP TABLE IF EXISTS users');
    await connection.query('DROP TABLE IF EXISTS games');
    await connection.query('DROP TABLE IF EXISTS migrations');

    await connection.runMigrations();

    const [RL, TLOU, NFSMW, NFSP] = await ormGamesRepository.save(gamesSeed);

    const [kauane01, kauane02, kauane03, kauane04] = usersSeed;

    kauane01.games = [RL, NFSMW, NFSP];
    kauane02.games = [RL, NFSMW, TLOU];
    kauane03.games = [RL, NFSMW];
    kauane04.games = [NFSMW, NFSP, TLOU];

    await ormUsersRepository.save(usersSeed);
  });

  afterAll(async () => {
    await connection.close();
  });

  it("[UsersRepository] should be able to find user with games list by user's ID", async () => {
    const { id: user_id } = await ormUsersRepository.findOneOrFail({
      where: { email: 'kauaneviieira@gmail.com' },
    });

    const user = await usersRepository.findUserWithGamesById({
      user_id,
    });

    expect(user).toMatchObject({
      first_name: 'Kauane',
      last_name: 'Vieira',
      email: 'kauaneviieira@gmail.com',
      games: [
        expect.objectContaining({
          title: 'Rocket League',
        }),
        expect.objectContaining({
          title: 'Need For Speed: Most Wanted',
        }),
        expect.objectContaining({
          title: 'The Last Of Us',
        }),
      ],
    });
  });

  it('[UsersRepository] should be able to list users ordered by first name', async () => {
    const users = await usersRepository.findAllUsersOrderedByFirstName();

    expect(users).toEqual([
      expect.objectContaining({
        first_name: 'Kauane01',
      }),
      expect.objectContaining({
        first_name: 'Kauane02',
      }),
      expect.objectContaining({
        first_name: 'Kauane03',
      }),
      expect.objectContaining({
        first_name: 'Kauane04',
      }),
    ]);
  });

  it('[UsersRepository] should be able to find user by full name', async () => {
    const result1 = await usersRepository.findUserByFullName({
      first_name: 'Kauane',
      last_name: 'Vieira',
    });

    const result2 = await usersRepository.findUserByFullName({
      first_name: 'Kauane',
      last_name: 'Vieira',
    });

    expect(result1).toEqual([
      expect.objectContaining({
        first_name: 'Kauane',
        last_name: 'Vieira',
        email: 'kauaneviieira@gmail.com',
      }),
    ]);

    expect(result2).toEqual([
      expect.objectContaining({
        first_name: 'Kauane',
        last_name: 'Vieira',
        email: 'kauaneviieira@gmail.com',
      }),
    ]);
  });

  it('[GamesRepository] should be able find a game by entire or partial given title', async () => {
    const result1 = await gamesRepository.findByTitleContaining('of u');
    const result2 = await gamesRepository.findByTitleContaining('eed');
    const result3 = await gamesRepository.findByTitleContaining('rocket league');

    expect(result1).toEqual([
      expect.objectContaining({
        title: 'The Last Of Us',
      }),
    ]);

    expect(result2).toEqual([
      expect.objectContaining({
        title: 'Need For Speed: Most Wanted',
      }),
      expect.objectContaining({
        title: 'Need For Speed: Payback',
      }),
    ]);

    expect(result3).toEqual([
      expect.objectContaining({
        title: 'Rocket League',
      }),
    ]);
  });

  it('[GamesRepository] should be able to get the total count of games', async () => {
    const [{ count }] = await gamesRepository.countAllGames();

    expect(count).toBe('4');
  });

  it('[GamesRepository] should be able to list users who have given game id', async () => {
    const game = await ormGamesRepository.findOneOrFail({
      where: {
        title: 'Rocket League',
      },
    });

    const users = await gamesRepository.findUsersByGameId(game.id);

    expect(users).toEqual([
      expect.objectContaining({
        first_name: 'Kauane',
        last_name: 'Vieira',
        email: 'kauaneviieira@gmail.com',
      }),
      expect.objectContaining({
        first_name: 'Kauane',
        last_name: 'Vieira',
        email: 'kauaneviieira@gmail.com',
      }),
      expect.objectContaining({
        first_name: 'Kauane',
        last_name: 'Vieira',
        email: 'kauaneviieira@gmail.com',
      }),
    ]);
  });
});