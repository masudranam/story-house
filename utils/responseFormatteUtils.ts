import { Response } from 'express';
import js2xmlparser from 'js2xmlparser';
import { userRequest } from '../dto/user/userRequest';

class ResponseFormatter {
  format(
    req: userRequest,
    res: Response,
    data?: unknown,
    statusCode = 200,
  ): Response {
    const accept = req.headers.accept;

    if (accept?.includes('application/xml')) {
      res.type('application/xml');
      return res.status(statusCode).send(js2xmlparser.parse('response', data));
    }

    if (accept?.includes('text/html')) {
      res.type('text/html');
      return res
        .status(statusCode)
        .send(`<pre>${JSON.stringify(data, null, 2)}</pre>`);
    }

    if (accept?.includes('text/plain')) {
      res.type('text/plain');
      return res.status(statusCode).send(JSON.stringify(data, null, 2));
    }

    return res.status(statusCode).json(data);
  }
}

export const responseFormatter = new ResponseFormatter();
