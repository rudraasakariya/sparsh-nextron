import { getUserInfo } from '../userController';

jest.mock('../../firebase/firebase', () => {
  const get = jest.fn().mockResolvedValue({
    data: () => ({
      email: 'mock@example.com',
      name: 'Mock User',
      profileURL: 'mockUrl',
    }),
  });
  const doc = jest.fn(() => ({ get }));
  const collection = jest.fn(() => ({ doc }));
  return { __esModule: true, default: { collection } };
});

describe('getUserInfo', () => {
  it('responds with user data', async () => {
    const req = { email: 'test@example.com' };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      email: 'mock@example.com',
      name: 'Mock User',
      profileURL: 'mockUrl',
    });
  });
});
