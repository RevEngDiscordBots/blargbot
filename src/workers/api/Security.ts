import config from '@config';
import { sign, verify } from 'jsonwebtoken';

export default class Security {
    public static generateToken(id: string): string {
        const currentDate: number = Math.floor(Date.now() / 1000);
        const expiry: number = config.website.sessionExpiry;
        const payload = {
            id, exp: + currentDate + expiry
        };

        const token: string = sign(payload, config.website.sessionSecret);

        return token;
    }

    public static validateToken(token: string): string | null {
        try {
            const payload = verify(token, config.website.sessionSecret) as { id: string; };
            return payload.id;
        } catch {
            return null;
        }
    }
}
