import { expect, describe, it, beforeEach, vi, afterEach } from 'vitest';
import { inMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository';
import { CheckInUseCase } from './check-in';
import { inMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository';
import { Decimal } from '@prisma/client/runtime/library';

let checkInsRepository: inMemoryCheckInsRepository;
let gymsRepository: inMemoryGymsRepository;
let sut: CheckInUseCase;

describe('Check-in Use Case', () => {
  beforeEach(() => {
    checkInsRepository = new inMemoryCheckInsRepository();
    gymsRepository = new inMemoryGymsRepository();
    sut = new CheckInUseCase(checkInsRepository, gymsRepository);

    gymsRepository.items.push({
      id: 'gym-id',
      title: 'Soras Gym',
      description: 'The best gym in the world from Soras',
      phone: '',
      latitude: new Decimal(0),
      longitude: new Decimal(0)
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-id',
      userId: 'user-id',
      userLatitude: -23.5717125,
      userLongitude: -46.6354195
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    await sut.execute({
      gymId: 'gym-id',
      userId: 'user-id',
      userLatitude: -23.5717125,
      userLongitude: -46.6354195
    });

    await expect(() =>
      sut.execute({
        gymId: 'gym-id',
        userId: 'user-id',
        userLatitude: -23.5717125,
        userLongitude: -46.6354195
      })
    ).rejects.toBeInstanceOf(Error);
  });

  it('should be able to check in a different day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    await sut.execute({
      gymId: 'gym-id',
      userId: 'user-id',
      userLatitude: -23.5717125,
      userLongitude: -46.6354195
    });

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0));

    const { checkIn } = await sut.execute({
      gymId: 'gym-id',
      userId: 'user-id',
      userLatitude: -23.5717125,
      userLongitude: -46.6354195
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });
});
