const Constant = {
    W: 1920,
    H: 1080,
    size: 2,
    world_scale: [810, 540],
    starting_bot_count: 45000,
    starting_ox: 0.02,
    starting_co2: 0.02,
    starting_org: 200,
    ox_render_maximum_coeff: 0.0625,
    co2_render_maximum_coeff: 0.0625,
    draw_type_names: ["predators", "energy", "color", "clans", "age", "types", "chains"],
    mouse_func_names: ["select", "set", "remove"],
    zoom_sizes: [2, 5, 10],

    org_recycle_ox_coeff: 0.00003,
    life_ox_coeff: 0.002,
    move_ox_coeff: 0.003,
    attack_ox_coeff: 0.01,
    pht_ox_coeff: 0.004,
    die_ox_coeff: 0.01,
    evaporation_ox_coeff: 0.98,
    ox_distribution_min: 0.001,

    life_co2_coeff: 0.0004,
    pht_co2_coeff: 0.0003,
    org_recycle_co2_coeff: 0.0001,
    die_co2_coeff: 0.0005,

    org_die_level: 800.0,
    age_minus_coeff: 20,
    energy_for_life: 1,
    energy_for_move: 1,
    energy_for_multiply: 50,
    energy_for_auto_multiply: 800,
    max_age: 1500,

    pht_coeff: 400,
    pht_energy_list: [12, 11, 10, 9, 8, 7, 6, 5],
    pht_neighbours_coeff: [1, 0.8, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0],
    org_recycle_coeff: 0.5,

    movelist: [
        [0, -1],
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, -1]
    ],

    border(number, border1, border2) {
        if (typeof number === "number") {
            if (number > border1) {
                number = border1;
            } else if (number < border2) {
                number = border2;
            }
            return number;
        }
        // Handle both integer and float inputs
        return Math.max(border2, Math.min(border1, number));
    },

    sector(y) {
        let sec = Math.floor(y / (Constant.world_scale[1] / 8));
        if (sec > 7) {
            sec = 7;
        }
        return sec;
    },

    get_rotate_position(rot, sp) {
        let pos = [
            (sp[0] + Constant.movelist[rot][0]) % Constant.world_scale[0],
            sp[1] + Constant.movelist[rot][1]
        ];
        if (pos[0] < 0) {
            pos[0] = Constant.world_scale[0] - 1;
        } else if (pos[0] >= Constant.world_scale[0]) {
            pos[0] = 0;
        }
        return pos;
    },

    gradient(color1, color2, grad) {
        const r = Math.floor(color1.r * (1 - grad) + color2.r * grad);
        const g = Math.floor(color1.g * (1 - grad) + color2.g * grad);
        const b = Math.floor(color1.b * (1 - grad) + color2.b * grad);
        return { r, g, b };
    }
};
