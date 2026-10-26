import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
process.env.SQLITE_PATH=join(mkdtempSync(join(tmpdir(),'elo-browser-')),'db.sqlite');process.env.PORT='3220';process.env.ADMIN_EMAIL='browser@example.test';process.env.ADMIN_PASSWORD='Browser-test-password-42';process.env.NODE_ENV='test';
await import('../server.js');
