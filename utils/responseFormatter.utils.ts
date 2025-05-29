// utils/ResponseFormatter.ts
export class responseFormatter {
   format(req: any, res: any, data: any) {
    const accept = req.headers.accept;

    if (accept?.includes('application/xml')) {
      res.type('application/xml');
      return res.send(this.toXML(data));
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

   toXML(obj: any): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?><response>';
    for (const key in obj) {
      xml += `<${key}>${obj[key]}</${key}>`;
    }
    xml += '</response>';
    return xml;
  }
}


