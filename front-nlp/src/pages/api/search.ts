import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'No query provided' });
    }

    exec(`python3 script.py "${query}"`, (error, stdout, stderr) => {
      console.log(query);
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({ error: 'Failed to execute script' });
      }

      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);

      res.status(200).json({ stdout, stderr });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
