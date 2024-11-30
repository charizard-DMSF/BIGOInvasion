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
    normal: ProjectileConfig;
    charged?: ProjectileConfig;
}

export const GUNS: { [key: string]: GunType } = {
    basic: {
        id: 'basic',
        name: 'Debug Logger',
        description: 'Standard console.log() projectiles',
        cost: 0,
        normal: {
            speed: 12,
            damage: 10,
            size: 8,
            piercing: false,
            displayText: 'console.log()'
        },
        charged: {
            speed: 15,
            damage: 25,
            size: 50,
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
        normal: {
            speed: 15,
            damage: 8,
            size: 6,
            piercing: false,
            displayText: 'WARNNNNNN'
        },
        charged: {
            speed: 12,
            damage: 20,
            size: 40,
            piercing: true,
            chargeTime: 800,  // Faster charge time for spread
            displayText: 'WARNNNNNN'  // Different text
        }
    },
    sniper: {
        id: 'sniper',
        name: 'Stack Trace',
        description: 'High-damage, high-speed single projectiles',
        cost: 2000,
        normal: {
            speed: 20,
            damage: 30,
            size: 10,
            piercing: false,
            displayText: 'KBOOOOOOOOOM'
        },
        charged: {
            speed: 25,       // Faster because it's a sniper
            damage: 50,      // Higher damage
            size: 30,        // Smaller size for precision
            piercing: true,
            chargeTime: 1500,  // Longer charge time to balance high damage
            displayText: 'KBOOOOOOOOOM'  // Themed text
        }
    }
};