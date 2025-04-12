class BotUtils {
    static bot_count(bot) {
        let count = 0;
        for (let i = 0; i < 8; i++) {
            const pos = Constant.get_rotate_position(i, [bot.xpos, bot.ypos]);
            if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
                if (bot.map[pos[0]][pos[1]] != null && bot.map[pos[0]][pos[1]].state === 0) {
                    count++;
                }
            }
        }
        return count;
    }

    static count_oxygen(bot) {
        const ox_total = bot.oxygen_map[bot.xpos][bot.ypos];
        const co2_total = bot.co2_map[bot.xpos][bot.ypos];
        const sum = ox_total + co2_total;
        const ox = sum === 0 ? 0 : ox_total * (ox_total / sum);
        return ox;
    }

    static count_co2(bot) {
        const ox_total = bot.oxygen_map[bot.xpos][bot.ypos];
        const co2_total = bot.co2_map[bot.xpos][bot.ypos];
        const sum = ox_total + co2_total;
        const co2 = sum === 0 ? 0 : co2_total * (co2_total / sum);
        return co2;
    }

    static photo_energy(bot, sector) {
        const count = BotUtils.bot_count(bot);
        const enr = Constant.pht_energy_list[sector] * 
                    (bot.org_map[bot.xpos][bot.ypos] / Constant.pht_coeff) * 
                    Constant.pht_neighbours_coeff[count];
        return enr;
    }

    static die_with_organics(bot) {
        bot.killed = 1;
        bot.map[bot.xpos][bot.ypos] = null;
        const enr = Constant.energy_for_multiply / 9.0;
        for (let i = 0; i < 8; i++) {
            const pos = Constant.get_rotate_position(i, [bot.xpos, bot.ypos]);
            if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
                bot.org_map[pos[0]][pos[1]] += enr;
            }
        }
        bot.org_map[bot.xpos][bot.ypos] += enr;
        bot.co2_map[bot.xpos][bot.ypos] += Constant.die_co2_coeff * enr;
        bot.oxygen_map[bot.xpos][bot.ypos] -= Constant.die_ox_coeff;
        if (bot.oxygen_map[bot.xpos][bot.ypos] < 0) {
            bot.oxygen_map[bot.xpos][bot.ypos] = 0;
        }
        BotUtils.delete_chain(bot);
    }

    static delete_chain(bot) {
        for (let g = 0; g < 8; g++) {
            if (bot.chain[g]) {
                const pos = Constant.get_rotate_position(g, [bot.xpos, bot.ypos]);
                if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
                    if (bot.map[pos[0]][pos[1]] != null && bot.map[pos[0]][pos[1]].state === 0) {
                        bot.map[pos[0]][pos[1]].chain[(g + 4) % 8] = false;
                    }
                }
            }
        }
    }

    static count_chains(bot) {
        let sum = 0;
        for (let i = 0; i < 8; i++) {
            if (bot.chain[i]) {
                sum++;
            }
        }
        return sum;
    }
}
