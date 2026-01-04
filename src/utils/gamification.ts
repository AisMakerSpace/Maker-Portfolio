// Gamification and Social utility functions

export interface Comment {
    id: string;
    userId: string;
    username: string;
    avatar?: string;
    text: string;
    timestamp: string;
}

export interface User {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
    points: number;
    badges: string[];
    bio?: string;
    isMock?: boolean;
}

export interface ProjectSocial {
    comments: Comment[];
    awards: string[]; // List of badge IDs awarded by other users
    madeItPhotos: string[]; // URLs of "I made it" submissions
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
        requirement: (_user, projects) => projects.filter((p: any) => p.status === 'completed').length >= 1
    },
    {
        id: 'popular_maker',
        name: 'Popular Maker',
        description: 'Received 10 appreciations',
        icon: '👏',
        requirement: (user) => user.points >= 50
    },
    {
        id: 'master_crafter',
        name: 'Master Crafter',
        description: 'Published 5 projects',
        icon: '🏆',
        requirement: (_user, projects) => projects.filter((p: any) => p.status === 'completed').length >= 5
    },
    {
        id: 'community_star',
        name: 'Community Star',
        description: 'Gave 20 appreciations to others',
        icon: '⭐',
        requirement: (user) => user.points >= 100
    }
];

// Awards that can be given by users
export const AWARDS = [
    { id: 'creative', name: 'Creative', icon: '🎨' },
    { id: 'helpful', name: 'Helpful', icon: '🤝' },
    { id: 'innovative', name: 'Innovative', icon: '🚀' },
    { id: 'aesthetic', name: 'Aesthetic', icon: '✨' }
];

// Points system
export const POINTS = {
    PUBLISH_PROJECT: 50,
    RECEIVE_APPRECIATION: 5,
    RECEIVE_LOVE: 5,
    RECEIVE_AWARD: 15,
    LEAVE_COMMENT: 5,
    GIVE_APPRECIATION: 2,
    SUBMIT_MADE_IT: 20
};

// Get all users
export const getAllUsers = (): User[] => {
    const usersStr = localStorage.getItem('maker-users');
    if (!usersStr) {
        const defaultUser: User = {
            id: 'user-1',
            username: 'Pratik (Google)',
            email: 'pratik@gmail.com',
            points: 120,
            badges: ['first_project'],
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            isMock: true
        };
        const secondUser: User = {
            id: 'user-2',
            username: 'Maker (Google)',
            email: 'maker@gmail.com',
            points: 85,
            badges: [],
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria',
            isMock: true
        };
        localStorage.setItem('maker-users', JSON.stringify([defaultUser, secondUser]));
        return [defaultUser, secondUser];
    }
    return JSON.parse(usersStr);
};

// Get leaderboard
export const getLeaderboard = (): User[] => {
    return getAllUsers().sort((a, b) => b.points - a.points);
};

// Authentication Shim
export const getCurrentUser = (): User | null => {
    const active = localStorage.getItem('maker-active-user');
    if (active) return JSON.parse(active);
    return null;
};

export const setCurrentUser = (user: User) => {
    localStorage.setItem('maker-active-user', JSON.stringify(user));

    // Ensure user exists in general users list
    const users = getAllUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex === -1) {
        users.push(user);
    } else {
        users[existingIndex] = { ...users[existingIndex], ...user };
    }
    localStorage.setItem('maker-users', JSON.stringify(users));

    // Trigger storage event manually for same-tab updates
    window.dispatchEvent(new Event('storage'));
};

export const logout = () => {
    localStorage.removeItem('maker-active-user');
    window.dispatchEvent(new Event('storage'));
};

// Update user points and persist
export const updateUserPoints = (userId: string, pointsToAdd: number): void => {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        users[userIndex].points += pointsToAdd;
        localStorage.setItem('maker-users', JSON.stringify(users));

        // Update active user if it's the same person
        const active = getCurrentUser();
        if (active && active.id === userId) {
            active.points += pointsToAdd;
            localStorage.setItem('maker-active-user', JSON.stringify(active));
        }
        window.dispatchEvent(new Event('storage'));
    }
};

// Social Actions
export const addComment = (projectId: string, text: string) => {
    const user = getCurrentUser();
    if (!user) return;

    const saved = localStorage.getItem('maker-projects');
    if (!saved) return;

    const allProjects = JSON.parse(saved);
    const updated = allProjects.map((p: any) => {
        if (p.id === projectId) {
            const social = p.social || { comments: [], awards: [], madeItPhotos: [] };
            return {
                ...p,
                social: {
                    ...social,
                    comments: [...social.comments, {
                        id: Math.random().toString(36).substr(2, 9),
                        userId: user.id,
                        username: user.username,
                        avatar: user.avatar,
                        text,
                        timestamp: new Date().toISOString()
                    }]
                }
            };
        }
        return p;
    });

    localStorage.setItem('maker-projects', JSON.stringify(updated));
    updateUserPoints(user.id, POINTS.LEAVE_COMMENT);
};

export const awardProject = (projectId: string, awardId: string) => {
    const user = getCurrentUser();
    if (!user) return;

    const saved = localStorage.getItem('maker-projects');
    if (!saved) return;

    const allProjects = JSON.parse(saved);
    const targetProjectIndex = allProjects.findIndex((p: any) => p.id === projectId);

    if (targetProjectIndex !== -1) {
        const targetProject = allProjects[targetProjectIndex];
        const social = targetProject.social || { comments: [], awards: [], madeItPhotos: [] };

        allProjects[targetProjectIndex] = {
            ...targetProject,
            social: { ...social, awards: [...social.awards, awardId] }
        };

        localStorage.setItem('maker-projects', JSON.stringify(allProjects));

        // Award points to the creator
        if (targetProject.authorId) {
            updateUserPoints(targetProject.authorId, POINTS.RECEIVE_AWARD);
        }
        // Small point reward for the gifter
        updateUserPoints(user.id, POINTS.GIVE_APPRECIATION);
    }
};
