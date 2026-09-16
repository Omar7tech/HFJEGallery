export type LivingFeeling = {
    id: string;
    name: string;
    icon: string | null;
};

export type LivingSpace = {
    id: string;
    name: string;
    icon: string | null;
    feelings: LivingFeeling[];
};
