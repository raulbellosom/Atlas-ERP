export const attachmentsMock = {
  uploadAttachment: jest.fn().mockResolvedValue({ id: 'att-1' }),
  findByEntity: jest.fn().mockResolvedValue([]),
  softDelete: jest.fn().mockResolvedValue(true),
};
