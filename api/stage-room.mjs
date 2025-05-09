import fs from 'fs/promises';
import path from 'path';

const USAGE_STORE_PATH = path.resolve('/tmp/stager-usage.json');

async function readUsageStore() {
  try {
    return JSON.parse(await fs.readFile(USAGE_STORE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}
async function writeUsageStore(store) {
  await fs.writeFile(USAGE_STORE_PATH, JSON.stringify(store), 'utf-8');
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured.' });
    }
    const ip =
      (req.headers['x-forwarded-for'] || '').split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';
    // Enhanced: also use device fingerprint if available
    let deviceId = req.headers['x-device-id'] || null;
    const usageStore = await readUsageStore();
    // Block if used by IP or device
    if ((usageStore[ip]?.used) || (deviceId && usageStore[`device_${deviceId}`]?.used)) {
      return res.status(403).json({ error: 'Free use exhausted for this device/IP. Please upgrade to continue.' });
    }
    const formidable = (await import('formidable')).default;
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      try {
        if (err) {
          if (!res.headersSent) res.status(400).json({ error: 'Error parsing form data.', details: err.message });
          return;
        }
        console.log('[VirtualStager] formidable fields:', fields);
        console.log('[VirtualStager] formidable files:', files);
        // Always use first element for fields and files
        const prompt = Array.isArray(fields.prompt) ? fields.prompt[0] : fields.prompt;
        const model = Array.isArray(fields.model) ? fields.model[0] : (fields.model || 'gpt-image-1');
        const size = Array.isArray(fields.size) ? fields.size[0] : (fields.size || '1024x1024');
        const n = Array.isArray(fields.n) ? fields.n[0] : (fields.n || 1);
        const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
        const maskFile = Array.isArray(files.mask) ? files.mask[0] : files.mask;

        // Use global FormData and File (Node 18+)
        const openaiForm = new FormData();
        openaiForm.append('prompt', prompt);
        openaiForm.append('model', model);
        openaiForm.append('size', size);
        openaiForm.append('n', n);
        if (imageFile?.filepath) {
          const imageBuffer = await fs.readFile(imageFile.filepath);
          openaiForm.append(
            'image',
            new File(
              [imageBuffer],
              imageFile.originalFilename || 'image.png',
              { type: imageFile.mimetype || 'image/png' }
            )
          );
        }
        if (maskFile?.filepath) {
          const maskBuffer = await fs.readFile(maskFile.filepath);
          openaiForm.append(
            'mask',
            new File(
              [maskBuffer],
              maskFile.originalFilename || 'mask.png',
              { type: maskFile.mimetype || 'image/png' }
            )
          );
        }
        // Log FormData keys and types
        for (const [key, value] of openaiForm.entries()) {
          console.log(`[VirtualStager] FormData: ${key} =>`, value, value instanceof File ? value.name : typeof value);
        }

        try {
          const openaiRes = await fetch('https://api.openai.com/v1/images/edits', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}` },
            body: openaiForm,
          });
          const text = await openaiRes.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
          if (!openaiRes.ok) {
            console.error('[VirtualStager] OpenAI API error', openaiRes.status, data);
            if (!res.headersSent) res.status(openaiRes.status).json({ error: 'OpenAI API error', status: openaiRes.status, details: data });
            return;
          }
          usageStore[ip] = { used: true, at: Date.now() };
          if (deviceId) {
            usageStore[`device_${deviceId}`] = { used: true, at: Date.now() };
          }
          await writeUsageStore(usageStore);
          if (!res.headersSent) res.status(openaiRes.status).json(data);
        } catch (error) {
          if (!res.headersSent) res.status(500).json({ error: 'Failed to contact OpenAI API.', details: error.message });
        }
      } catch (error) {
        if (!res.headersSent) res.status(500).json({ error: 'Server error in form handler.', details: error.message });
      }
    });
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ error: error.message || 'A server error occurred.' });
  }
}
