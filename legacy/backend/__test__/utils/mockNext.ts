import { NextFunction } from 'express';

export function mockNext(): NextFunction {
  return jest.fn() as NextFunction;
}
