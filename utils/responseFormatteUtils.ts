import js2xmlparser from 'js2xmlparser';

// ResponseFormatter.ts
 class responseFormatter {
  format(req: any, res: any, data: any) {
    const accept = req.headers.accept;

    if (accept?.includes('application/xml')) {
      res.type('application/xml');
      return res.send(js2xmlparser.parse('response',data));
    }

    if (accept?.includes('text/html')) {
      res.type('text/html');
      return res.send(`<pre>${JSON.stringify(data, null, 2)}</pre>`);
    }

    if (accept?.includes('text/plain')) {
      res.type('text/plain');
      return res.send(JSON.stringify(data, null, 2));
    }
    return res.json(data);
  }
}

export const contentType = new responseFormatter();