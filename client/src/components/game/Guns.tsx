export interface ProjectileConfig {
    speed: number;
    damage: number;
    size: number;
    piercing: boolean;
    chargeTime?: number;
    color?: string;
    displayText: string;
}

export interface GunType {
    id: string;
    name: string;
    description: string;
    cost: number;
    baseFireRate: number;
    normal: ProjectileConfig;
    charged?: ProjectileConfig;
    special?: {
        name: string;
        description: string;
        cooldown: number;
    };
}

export const GUNS: { [key: string]: GunType } = {
    basic: {
        id: 'basic',
        name: 'Debug Logger',
        description: 'Standard console.log() projectiles',
        cost: 0,
        baseFireRate: 1,
        normal: {
            speed: 12,
            damage: 10,
            size: 8,
            piercing: false,
            displayText: 'consolllllle.log()'
        },
        charged: {
            speed: 15,
            damage: 25,
            size: 12,
            piercing: true,
            chargeTime: 1000,
            displayText: 'console.error()'
        }
    },
    spread: {
        id: 'spread',
        name: 'Multi Logger',
        description: 'Fires multiple console.logs in a spread pattern',
        cost: 1000,
        baseFireRate: 0.8,
        normal: {
            speed: 10,
            damage: 8,
            size: 6,
            piercing: false,
            displayText: 'LMAOOOOOOO'
        },
        special: {
            name: 'Log Burst',
            description: 'Fires a burst of logs in all directions',
            cooldown: 5000
        }
    },
    sniper: {
        id: 'sniper',
        name: 'Stack Trace',
        description: 'High-damage, high-speed single projectiles',
        cost: 2000,
        baseFireRate: 0.5,
        normal: {
            speed: 20,
            damage: 30,
            size: 10,
            piercing: true,
            displayText: 'throw new Error()'
        }
    }
};