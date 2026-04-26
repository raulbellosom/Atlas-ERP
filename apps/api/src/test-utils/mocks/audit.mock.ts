export const auditMock = {
  auditAction: jest.fn().mockResolvedValue(undefined),
  findAll: jest.fn().mockResolvedValue([]),
};
