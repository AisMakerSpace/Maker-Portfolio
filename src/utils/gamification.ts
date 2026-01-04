// Gamification utility functions

export interface User {
    id: string;
    username: string;
    avatar?: string;
    points: number;
    badges: string[];
}

export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    requirement: (user: User, projects: any[]) => boolean;
}

// Badge definitions
export const BADGES: BadgeDefinition[] = [
    {
        id: 'first_project',
        name: 'First Steps',
        description: 'Published your first project',
        icon: '🌟',
        requirement: (user, projects) => projects.filter(p => p.status === 'completed').length >= 1
    },
    {
        id: 'popular_maker',
        name: 'Popular Maker',
        description: 'Received 10 appreciations',
        icon: '👏',
        requirement: (user) => user.points >= 50 // 10 appreciations * 5 points each
    },
    {
        id: 'master_crafter',
        name: 'Master Crafter',
        description: 'Published 5 projects',
        icon: '🏆',
        requirement: (user, projects) => projects.filter(p => p.status === 'completed').length >= 5
    },
    {
        id: 'community_star',
        name: 'Community Star',
        description: 'Gave 20 appreciations to others',
        icon: '⭐',
        requirement: (user) => user.points >= 100 // Assuming user also gives appreciations
    },
    {
        id: 'creative_genius',
        name: 'Creative Genius',
        description: 'Received 50 reactions total',
        icon: '🎨',
        requirement: (user) => user.points >= 250
    },
    {
        id: 'helping_hand',
        name: 'Helping Hand',
        description: 'Left 10 helpful comments',
        icon: '💬',
        requirement: (user) => user.points >= 20 // 10 comments * 2 points each
    }
];

// Points system
export const POINTS = {
    PUBLISH_PROJECT: 50,
    RECEIVE_APPRECIATION: 5,
    RECEIVE_LOVE: 5,
    RECEIVE_BADGE_AWARD: 10,
    LEAVE_COMMENT: 2,
    GIVE_APPRECIATION: 1
};

// Calculate points for a user
export const calculatePoints = (actions: { type: string; count: number }[]): number => {
    return actions.reduce((total, action) => {
        const pointValue = POINTS[action.type as keyof typeof POINTS] || 0;
        return total + (pointValue * action.count);
    }, 0);
};

// Check which badges a user has unlocked
export const checkBadges = (user: User, projects: any[]): string[] => {
    return BADGES
        .filter(badge => badge.requirement(user, projects))
        .map(badge => badge.id);
};

// Get leaderboard
export const getLeaderboard = (): User[] => {
    const usersStr = localStorage.getItem('maker-users');
    if (!usersStr) {
        // Create default user if none exists
        const defaultUser: User = {
            id: 'user-1',
            username: 'Maker',
            points: 0,
            badges: []
        };
        localStorage.setItem('maker-users', JSON.stringify([defaultUser]));
        return [defaultUser];
    }

    const users: User[] = JSON.parse(usersStr);
    return users.sort((a, b) => b.points - a.points);
};

// Update user points
export const updateUserPoints = (userId: string, pointsToAdd: number): void => {
    const users = getLeaderboard();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        users[userIndex].points += pointsToAdd;
        localStorage.setItem('maker-users', JSON.stringify(users));
    }
};

// Award badge to user
export const awardBadge = (userId: string, badgeId: string): void => {
    const users = getLeaderboard();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1 && !users[userIndex].badges.includes(badgeId)) {
        users[userIndex].badges.push(badgeId);
        localStorage.setItem('maker-users', JSON.stringify(users));
    }
};

// Get current user (for demo, just return first user)
export const getCurrentUser = (): User => {
    const users = getLeaderboard();
    return users[0];
};
