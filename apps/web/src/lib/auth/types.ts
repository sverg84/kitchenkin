const _AuthActions = ["register", "login"] as const;
const _UserProfileTabs = ["recipes", "favorites"] as const;

export type AuthActionType = (typeof _AuthActions)[number];
export type UserProfileTabType = (typeof _UserProfileTabs)[number];
