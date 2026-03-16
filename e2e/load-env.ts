import * as fs from 'fs';
import * as path from 'path';
import { expand } from 'dotenv-expand';
import { config as dotenvConfig } from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  expand(dotenvConfig({ path: envPath }));
}
