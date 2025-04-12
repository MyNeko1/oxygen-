class WorldUtils {
    static minerals(mnr_map) {
        // Mineral influx
        const ymin = Constant.world_scale[1] - Math.floor(Constant.world_scale[1] / 8 * 2);
        for (let i = 0; i < 100; i++) {
            const x = Math.floor(Math.random() * Constant.world_scale[0]);
            const y = Math.floor(Math.random() * (Constant.world_scale[1] - ymin)) + ymin;
            mnr_map[x][y] += Math.floor(Math.random() * (30 - 10 + 1)) + 10; // Random between 10 and 30
            if (mnr_map[x][y] > 1000) {
                mnr_map[x][y] = 1000;
            }
        }

        // Logic (incomplete in original code)
        const new_map = Array(Constant.world_scale[0]).fill().map(() =>
            Array(Constant.world_scale[1]).fill(0)
        );
        for (let x = 0; x < Constant.world_scale[0]; x++) {
            for (let y = 0; y < Constant.world_scale[1]; y++) {
                if (mnr_map[x][y] > 0) {
                    // Placeholder: Original code has empty block
                    new_map[x][y] = mnr_map[x][y]; // Copy as-is (no logic provided)
                }
            }
        }

        // Update mnr_map
        for (let x = 0; x < Constant.world_scale[0]; x++) {
            for (let y = 0; y < Constant.world_scale[1]; y++) {
                mnr_map[x][y] = new_map[x][y];
            }
        }
    }

    static gas(gas_map, org_map) {
        const new_map = Array(Constant.world_scale[0]).fill().map(() =>
            Array(Constant.world_scale[1]).fill(0)
        );

        for (let x = 0; x < Constant.world_scale[0]; x++) {
            for (let y = 0; y < Constant.world_scale[1]; y++) {
                if (gas_map[x][y] >= Constant.ox_distribution_min) {
                    gas_map[x][y] *= Constant.evaporation_ox_coeff; // Evaporation
                    const ox = gas_map[x][y] / 9;
                    new_map[x][y] += ox;
                    let count = 0;
                    for (let i = 0; i < 8; i++) {
                        const pos = Constant.get_rotate_position(i, [x, y]);
                        if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
                            new_map[pos[0]][pos[1]] += ox;
                            if (new_map[pos[0]][pos[1]] > 1) {
                                new_map[pos[0]][pos[1]] = 1;
                            }
                        } else {
                            count++;
                        }
                    }
                    for (let i = 0; i < count; i++) {
                        new_map[x][y] += ox;
                    }
                    if (new_map[x][y] > 1) {
                        new_map[x][y] = 1;
                    }
                } else {
                    new_map[x][y] += gas_map[x][y];
                    if (new_map[x][y] > 1) {
                        new_map[x][y] = 1;
                    }
                }
            }
        }

        // Update gas_map
        for (let x = 0; x < Constant.world_scale[0]; x++) {
            for (let y = 0; y < Constant.world_scale[1]; y++) {
                gas_map[x][y] = new_map[x][y];
            }
        }
    }
}
