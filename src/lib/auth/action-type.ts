const _AuthActions = ["register", "login"] as const;

export type AuthActionType = (typeof _AuthActions)[number];
