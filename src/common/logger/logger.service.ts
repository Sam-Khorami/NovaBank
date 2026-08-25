import { Injectable, LoggerService } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class AppLogger implements LoggerService {

    private readonly logDirectory = path.join(process.cwd(), 'logs');
    private ensureLogDirectory() {

        if (!fs.existsSync(this.logDirectory)) fs.mkdirSync(this.logDirectory, { recursive: true });
        
    }

    constructor() {
        
        this.ensureLogDirectory();

    }


    private write(level: string, message: unknown, context?: string) {

        const timestamp = new Date().toISOString();

        const log = { timestamp, level, context: context ?? null, message };

        const fileName = `${new Date().toISOString().slice(0, 10)}.log`;
        const filePath = path.join(this.logDirectory, fileName);

        fs.appendFileSync(filePath, JSON.stringify(log) + '\n', 'utf8');
    
    }

    log(message: unknown, context?: string) {
    
        this.write('INFO', message, context);
    
    }

    error(message: unknown, trace?: string, context?: string) {

        this.write('ERROR', { message, trace }, context);
    
    }

    warn(message: unknown, context?: string) {

        this.write('WARN', message, context);

    }

    debug(message: unknown, context?: string) {

        this.write('DEBUG', message, context);

    }

    verbose(message: unknown, context?: string) {

        this.write('VERBOSE', message, context);

    }

}