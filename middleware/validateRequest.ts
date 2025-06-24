import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidateSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validateRequest =
  (schemas: ValidateSchemas) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          res.status(400).json({
            errors: result.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          });
          return;
        }
        req.body = result.data;
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          res.status(400).json({
            errors: result.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          });
          return;
        }
        req.params = result.data;
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          res.status(400).json({
            errors: result.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          });
          return;
        }
        Object.assign(req.query, result.data);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }

      next(error);
    }
  };
