export enum NuditySafetyValue {
    EROTICA = 0.1,
    SEXUAL_DISPLAY = 0.1,
    SEXUAL_ACTIVITY = 0.1,
}

export type NudityResponse = {
    sexual_activity: number;
    sexual_display: number;
    erotica: number;
    very_suggestive: number;
    suggestive: number;
    mildly_suggestive: number;
    suggestive_classes: {
        bikini: number;
        cleavage: number;
        cleavage_categories: {
            very_revealing: number;
            revealing: number;
            none: number;
        };
        lingerie: number;
        male_chest: number;
        male_chest_categories: {
            very_revealing: number;
            revealing: number;
            slightly_revealing: number;
            none: number;
        };
        male_underwear: number;
        miniskirt: number;
        minishort: number;
        nudity_art: number;
        schematic: number;
        sextoy: number;
        suggestive_focus: number;
        suggestive_pose: number;
        swimwear_male: number;
        swimwear_one_piece: number;
        visibly_undressed: number;
        other: number;
    };
    none: number;
    context: {
        sea_lake_pool: number;
        outdoor_other: number;
        indoor_other: number;
    };
};

export type SightEngineResponse = {
    status: string;
    request: {
        id: string;
        timestamp: number;
        operations: number;
    };
    nudity: NudityResponse;
    media: {
        id: string;
        uri: string;
    };
};
