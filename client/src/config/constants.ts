export const VIEWPORT = {
    WIDTH: 1200,
    HEIGHT: 800,
    PLAYABLE_MARGIN: 32,
} as const;

export const PLAYER = {
    SIZE: 32,
    BASE_SPEED: 8,
    DASH_SPEED_MULTIPLIER: 2.5,
    DASH_DURATION_MS: 150,
    DASH_COOLDOWN_MS: 450,
    MAX_HEALTH: 100,
} as const;

export const PROJECTILE = {
    SIZE: 8,
    NORMAL: {
        SPEED: 12,
        DAMAGE: 25,
    },
    CHARGED: {
        SPEED: 15,
        DAMAGE: 75,
        CHARGE_TIME_MS: 1000,
    },
} as const;

export const ENEMY = {
    SIZE: 24,
    BASE_SPEED: 2,
    COLLISION_DAMAGE: 10,
    COLLISION_IMMUNITY_DURATION_MS: 1000,
    HEALTH_RESTORE_ON_KILL: 2,
    BASE_HEALTH: 100,
    SPAWN_INTERVAL: 800,
    SCORE_VALUE: 100,
} as const;