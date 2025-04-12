class BotCommands {
    static add_neighbour_to_chain(bot, rot) {
        const pos = Constant.get_rotate_position(rot, [bot.xpos, bot.ypos]);
        if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
            if (bot.map[pos[0]][pos[1]] != null && bot.map[pos[0]][pos[1]].state === 0) {
                bot.chain[rot] = true;
                bot.map[pos[0]][pos[1]].chain[(rot + 4) % 8] = true;
            }
        }
    }

    static move(bot, rot) {
        const pos = Constant.get_rotate_position(rot, [bot.xpos, bot.ypos]);
        if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
            if (bot.map[pos[0]][pos[1]] == null) {
                const self = bot.map[bot.xpos][bot.ypos];
                bot.map[bot.xpos][bot.ypos] = null;
                bot.xpos = pos[0];
                bot.ypos = pos[1];
                bot.x = bot.xpos * Constant.size;
                bot.y = bot.ypos * Constant.size;
                bot.map[bot.xpos][bot.ypos] = self;
                return 1;
            }
        }
        return 0;
    }

    static attack(bot, rot) {
        const pos = Constant.get_rotate_position(rot, [bot.xpos, bot.ypos]);
        if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
            if (bot.map[pos[0]][pos[1]] != null) {
                const victim = bot.map[pos[0]][pos[1]];
                if (victim != null) {
                    bot.energy += victim.energy;
                    BotUtils.die_with_organics(victim);
                    bot.go_red();
                }
            }
        }
    }

    static see(bot, rot) {
        const pos = Constant.get_rotate_position(rot, [bot.xpos, bot.ypos]);
        if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
            if (bot.org_map[pos[0]][pos[1]] >= Constant.org_die_level) {
                return 3; // Excess organics
            } else {
                if (bot.map[pos[0]][pos[1]] == null) {
                    return 1; // Nothing
                } else if (bot.map[pos[0]][pos[1]].state === 0) {
                    return 2; // Bot
                }
            }
        }
        return 0; // Boundary
    }

    static give(bot, rot) {
        const pos = Constant.get_rotate_position(rot, [bot.xpos, bot.ypos]);
        if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
            if (bot.map[pos[0]][pos[1]] != null && bot.map[pos[0]][pos[1]].state === 0) {
                const relative = bot.map[pos[0]][pos[1]];
                if (relative.killed === 0) {
                    relative.energy += bot.energy / 4;
                    bot.energy -= bot.energy / 4;
                }
            }
        }
    }

    static unif_distrib(bot, rot) {
        const pos = Constant.get_rotate_position(rot, [bot.xpos, bot.ypos]);
        if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
            if (bot.map[pos[0]][pos[1]] != null && bot.map[pos[0]][pos[1]].state === 0) {
                const relative = bot.map[pos[0]][pos[1]];
                if (relative.killed === 0) {
                    const enr = (relative.energy + bot.energy) / 2;
                    relative.energy = enr;
                    bot.energy = enr;
                }
            }
        }
    }

    static recycle_organics_under(bot, org) {
        const pos = [bot.xpos, bot.ypos];
        if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
            const ox = BotUtils.count_oxygen(bot);
            if (bot.org_map[pos[0]][pos[1]] > org) {
                if (ox >= org * Constant.org_recycle_ox_coeff) {
                    bot.oxygen_map[bot.xpos][bot.ypos] -= org * Constant.org_recycle_ox_coeff;
                    bot.co2_map[bot.xpos][bot.ypos] += org * Constant.org_recycle_co2_coeff;
                    bot.energy += org;
                    bot.org_map[pos[0]][pos[1]] -= org;
                    bot.go_yellow();
                }
            } else {
                if (ox >= bot.org_map[pos[0]][pos[1]] * Constant.org_recycle_ox_coeff) {
                    bot.oxygen_map[bot.xpos][bot.ypos] -= bot.org_map[pos[0]][pos[1]] * Constant.org_recycle_ox_coeff;
                    bot.co2_map[bot.xpos][bot.ypos] += bot.org_map[pos[0]][pos[1]] * Constant.org_recycle_co2_coeff;
                    bot.energy += bot.org_map[pos[0]][pos[1]];
                    if (bot.org_map[pos[0]][pos[1]] !== 0) {
                        bot.go_yellow();
                    }
                    bot.org_map[pos[0]][pos[1]] = 0;
                }
            }
        }
    }

    static recycle_organics(bot, rot, org) {
        const pos = Constant.get_rotate_position(rot, [bot.xpos, bot.ypos]);
        if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
            const ox = BotUtils.count_oxygen(bot);
            if (bot.org_map[pos[0]][pos[1]] > org) {
                if (ox >= org * Constant.org_recycle_ox_coeff) {
                    bot.oxygen_map[bot.xpos][bot.ypos] -= org * Constant.org_recycle_ox_coeff;
                    bot.co2_map[bot.xpos][bot.ypos] += org * Constant.org_recycle_co2_coeff;
                    bot.energy += org;
                    bot.org_map[pos[0]][pos[1]] -= org;
                    bot.go_yellow();
                }
            } else {
                if (ox >= bot.org_map[pos[0]][pos[1]] * Constant.org_recycle_ox_coeff) {
                    bot.oxygen_map[bot.xpos][bot.ypos] -= bot.org_map[pos[0]][pos[1]] * Constant.org_recycle_ox_coeff;
                    bot.co2_map[bot.xpos][bot.ypos] += bot.org_map[pos[0]][pos[1]] * Constant.org_recycle_co2_coeff;
                    bot.energy += bot.org_map[pos[0]][pos[1]];
                    if (bot.org_map[pos[0]][pos[1]] > 0) {
                        bot.go_yellow();
                    }
                    bot.org_map[pos[0]][pos[1]] = 0;
                }
            }
        }
    }

    static see_org(bot, rot, ind) {
        const pos = Constant.get_rotate_position(rot, [bot.xpos, bot.ypos]);
        if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
            if (bot.org_map[pos[0]][pos[1]] >= ind * 15) {
                return 0;
            } else {
                return 1;
            }
        }
        return 2;
    }

    static multiply(bot, rot, seed, time, new_type, ch, iterator) {
        const pos = Constant.get_rotate_position(rot, [bot.xpos, bot.ypos]);
        if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
            if (bot.map[pos[0]][pos[1]] == null) {
                bot.energy -= Constant.energy_for_multiply;
                if (bot.energy <= 0) {
                    BotUtils.die_with_organics(bot);
                } else {
                    let new_color;
                    if (Math.floor(Math.random() * 800) === 0) {
                        new_color = {
                            r: Math.floor(Math.random() * 256),
                            g: Math.floor(Math.random() * 256),
                            b: Math.floor(Math.random() * 256)
                        };
                    } else {
                        new_color = {
                            r: Constant.border(bot.color.r + Math.floor(Math.random() * 25) - 12, 255, 0),
                            g: Constant.border(bot.color.g + Math.floor(Math.random() * 25) - 12, 255, 0),
                            b: Constant.border(bot.color.b + Math.floor(Math.random() * 25) - 12, 255, 0)
                        };
                    }
                    const new_brain = bot.commands.slice();
                    if (Math.floor(Math.random() * 4) === 0) {
                        new_brain[Math.floor(Math.random() * 64)] = Math.floor(Math.random() * 64);
                    }
                    const new_bot = new Bot(
                        pos[0],
                        pos[1],
                        new_color,
                        bot.energy / 2,
                        new_type,
                        bot.oxygen_map,
                        bot.co2_map,
                        bot.org_map,
                        bot.map,
                        bot.objects
                    );
                    bot.energy /= 2;
                    new_bot.commands = new_brain;
                    new_bot.clan_color = bot.clan_color;

                    if (seed === 1) {
                        new_bot.state = 1;
                        new_bot.seed_time = time;
                        new_bot.rotate = rot;
                    } else if (ch) {
                        bot.chain[rot] = true;
                        new_bot.chain[(rot + 4) % 8] = true;
                    }

                    bot.objects.push(new_bot); // Add to objects array
                    bot.map[pos[0]][pos[1]] = new_bot;
                }
            }
        }
    }
                      }https://github.com/farmer2010/Oxygen
