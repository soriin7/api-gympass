import { expect, describe, it, beforeEach } from 'vitest';
import { inMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository';
import { AuthenticateUseCase } from './authenticate';
import { hash } from 'bcryptjs';
import { InvalidCredentialsError } from './errors/invalid-credentials-error';
import { UsersRepository } from '@/repositories/users-repository';

let usersRepository: UsersRepository;
let sut: AuthenticateUseCase;

describe('Register Use Case', () => {
  beforeEach(() => {
    usersRepository = new inMemoryUsersRepository();
    sut = new AuthenticateUseCase(usersRepository);
  });

  it('should be able to authenticate', async () => {
    await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('123456', 6)
    });

    const { user } = await sut.execute({
      email: 'john@doe.com',
      password: '123456'
    });

    expect(user.id).toEqual(expect.any(String));
  });

  it('should not be able to authenticate with wrong email', async () => {
    expect(() => sut.execute({
      email: 'john@doe.com',
      password: '123456'
    })).rejects.toBeInstanceOf(InvalidCredentialsError);


  });

  it('should not be able to authenticate with wrong password', async () => {
    await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('123456', 6)
    });

    expect(() => sut.execute({
      email: 'john@doe.com',
      password: '123123'
    })).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});