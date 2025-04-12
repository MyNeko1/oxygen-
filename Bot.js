class Bot {
    constructor(new_xpos, new_ypos, new_color, new_energy, new_type, new_oxygen_map, new_co2_map, new_org_map, new_map, new_objects) {
        this.rand = Math.random; // Random number generator (0 to 1)
        this.objects = new_objects;
        this.map = new_map;
        this.oxygen_map = new_oxygen_map;
        this.co2_map = new_co2_map;
        this.org_map = new_org_map;

        this.xpos = new_xpos;
        this.ypos = new_ypos;
        this.x = new_xpos * Constant.size;
        this.y = new_ypos * Constant.size;
        this.color = new_color; // Expected as {r, g, b} object
        this.clan_color = {
            r: Math.floor(this.rand() * 256),
            g: Math.floor(this.rand() * 256),
            b: Math.floor(this.rand() * 256)
        };
        this.energy = new_energy;
        this.type = new_type;

        this.age = Constant.max_age;
        this.memory = 0;
        this.commands = new Array(64).fill(0).map(() => Math.floor(this.rand() * 64));
        this.index = 0;
        this.rotate = Math.floor(this.rand() * 8);
        this.chain = new Array(8).fill(false);

        this.c_red = -1;
        this.c_green = -1;
        this.c_blue = -1;

        this.state = 0;
        this.pht_org_block = 0;
        this.seed_time = 0;
        this.killed = 0;
    }

    draw(ctx, draw_type, zoom, pos) {
        // ctx is a CanvasRenderingContext2D
        let color = this.get_color(draw_type);
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;

        if (zoom === 0) {
            ctx.fillRect(this.x, this.y, Constant.size, Constant.size);
        } else if (zoom === 1) {
            let w = Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[zoom];
            let h = Constant.world_scale[1] * Constant.size / Constant.zoom_sizes[zoom];
            if (this.xpos >= pos[0] - w / 2 && this.xpos < pos[0] + w / 2 &&
                this.ypos >= pos[1] - h / 2 && this.ypos < pos[1] + h / 2) {
                ctx.fillRect((this.xpos - pos[0] + w / 2) * 5, (this.ypos - pos[1] + h / 2) * 5, 5, 5);
            }
        } else if (zoom === 2) {
            let w = Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[zoom];
            let h = Constant.world_scale[1] * Constant.size / Constant.zoom_sizes[zoom];
            if (this.xpos >= pos[0] - w / 2 && this.xpos < pos[0] + w / 2 &&
                this.ypos >= pos[1] - h / 2 && this.ypos < pos[1] + h / 2) {
                ctx.fillStyle = 'rgb(0, 0, 0)';
                ctx.fillRect((this.xpos - pos[0] + w / 2) * 10, (this.ypos - pos[1] + h / 2) * 10, 10, 10);
                ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                ctx.fillRect((this.xpos - pos[0] + w / 2) * 10 + 1, (this.ypos - pos[1] + h / 2) * 10 + 1, 8, 8);
            }
        }
    }

    update(iterator) {
        if (this.killed === 0) {
            if (this.state === 0) {
                this.age -= Math.floor(this.oxygen_map[this.xpos][this.ypos] * Constant.age_minus_coeff) + 1;
                this.energy -= Constant.energy_for_life;

                let count = BotUtils.bot_count(this) + 1;
                if (BotUtils.count_oxygen(this) >= Constant.life_ox_coeff * count) {
                    this.oxygen_map[this.xpos][this.ypos] -= Constant.life_ox_coeff * count;
                    this.co2_map[this.xpos][this.ypos] += Constant.life_co2_coeff * count;
                    this.update_commands(iterator);
                    if (this.energy >= Constant.energy_for_auto_multiply) {
                        BotCommands.multiply(this, this.rotate, 0, 0, 0, false, iterator);
                    }
                }
                this.update_chain();

                if (this.energy > 1000) {
                    this.energy = 1000;
                }

                if (this.age <= 0 || this.org_map[this.xpos][this.ypos] >= Constant.org_die_level || this.energy <= 0) {
                    BotUtils.die_with_organics(this);
                    return 0;
                }
            } else if (this.state === 1) {
                if (this.org_map[this.xpos][this.ypos] >= Constant.org_die_level) {
                    BotUtils.die_with_organics(this);
                    return 0;
                }

                let res = BotCommands.move(this, this.rotate);
                if (res === 0) {
                    let pos = Constant.get_rotate_position(this.rotate, [this.xpos, this.ypos]);
                    if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
                        if (this.map[pos[0]][pos[1]] != null) {
                            BotUtils.die_with_organics(this);
                            BotUtils.die_with_organics(this.map[pos[0]][pos[1]]);
                            return 0;
                        }
                    }
                }

                this.seed_time--;
                if (this.seed_time === 0) {
                    this.state = 0;
                    this.rotate = Math.floor(this.rand() * 8);
                }
            }
        }
        return 0;
    }

    update_chain() {
        let c = 1;
        let energy_sum = this.energy;
        for (let i = 0; i < 8; i++) {
            if (this.chain[i]) {
                let pos = Constant.get_rotate_position(i, [this.xpos, this.ypos]);
                if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
                    if (this.map[pos[0]][pos[1]] != null && this.map[pos[0]][pos[1]].state === 0) {
                        energy_sum += this.map[pos[0]][pos[1]].energy;
                        c++;
                    } else {
                        this.chain[i] = false;
                    }
                }
            }
        }
        if (c !== 1) {
            let enr = energy_sum / c;
            this.energy = enr;
            for (let i = 0; i < 8; i++) {
                if (this.chain[i]) {
                    let pos = Constant.get_rotate_position(i, [this.xpos, this.ypos]);
                    if (pos[1] >= 0 && pos[1] < Constant.world_scale[1]) {
                        this.map[pos[0]][pos[1]].energy = enr;
                    }
                }
            }
        }
    }

    update_commands(iterator) {
        for (let i = 0; i < 5; i++) {
            let command = this.commands[this.index];
            if (command === 0) {
                this.rotate = (this.rotate + (this.commands[(this.index + 1) % 64] % 8)) % 8;
                this.index = (this.index + 2) % 64;
            } else if (command === 1) {
                this.rotate = this.commands[(this.index + 1) % 64] % 8;
                this.index = (this.index + 2) % 64;
            } else if (command >= 2 && command <= 4) {
                let sector = Constant.sector(this.ypos);
                if (sector <= 7 && this.pht_org_block !== 2 && BotUtils.count_co2(this) >= Constant.pht_co2_coeff) {
                    this.pht_org_block = 1;
                    this.energy += BotUtils.photo_energy(this, sector);
                    this.go_green();
                    this.oxygen_map[this.xpos][this.ypos] += Constant.pht_ox_coeff * BotUtils.photo_energy(this, sector);
                    if (this.oxygen_map[this.xpos][this.ypos] > 1) {
                        this.oxygen_map[this.xpos][this.ypos] = 1;
                    }
                    this.co2_map[this.xpos][this.ypos] -= Constant.pht_co2_coeff;
                }
                this.index = (this.index + 1) % 64;
                break;
            } else if (command === 5) {
                let count = BotUtils.bot_count(this) + 1;
                if (BotUtils.count_oxygen(this) >= Constant.move_ox_coeff * count && BotUtils.count_chains(this) === 0) {
                    this.oxygen_map[this.xpos][this.ypos] -= Constant.move_ox_coeff * count;
                    let sens = BotCommands.move(this, this.commands[(this.index + 1) % 64] % 8);
                    if (sens === 1) {
                        this.energy -= Constant.energy_for_move;
                    }
                }
                this.index = (this.index + 2) % 64;
                break;
            } else if (command === 6) {
                let count = BotUtils.bot_count(this) + 1;
                if (BotUtils.count_oxygen(this) >= Constant.move_ox_coeff * count && BotUtils.count_chains(this) === 0) {
                    this.oxygen_map[this.xpos][this.ypos] -= Constant.move_ox_coeff * count;
                    BotCommands.move(this, this.rotate);
                    this.energy -= Constant.energy_for_move;
                }
                this.index = (this.index + 1) % 64;
                break;
            } else if (command === 7) {
                let count = BotUtils.bot_count(this) + 1;
                if (BotUtils.count_oxygen(this) >= Constant.attack_ox_coeff * count) {
                    this.oxygen_map[this.xpos][this.ypos] -= Constant.attack_ox_coeff * count;
                    BotCommands.attack(this, this.commands[(this.index + 1) % 64] % 8);
                }
                this.index = (this.index + 2) % 64;
                break;
            } else if (command === 8) {
                let count = BotUtils.bot_count(this) + 1;
                if (BotUtils.count_oxygen(this) >= Constant.attack_ox_coeff * count) {
                    this.oxygen_map[this.xpos][this.ypos] -= Constant.attack_ox_coeff * count;
                    BotCommands.attack(this, this.rotate);
                }
                this.index = (this.index + 1) % 64;
                break;
            } else if (command === 9) {
                let rot = this.commands[(this.index + 1) % 64] % 8;
                this.index = this.commands[(this.index + 2 + BotCommands.see(this, rot)) % 64];
            } else if (command === 10) {
                this.index = this.commands[(this.index + 1 + BotCommands.see(this, this.rotate)) % 64];
            } else if (command === 11 || command === 12) {
                BotCommands.give(this, this.commands[(this.index + 1) % 64] % 8);
                this.index = (this.index + 2) % 64;
                break;
            } else if (command === 13 || command === 14) {
                BotCommands.give(this, this.rotate);
                this.index = (this.index + 1) % 64;
                break;
            } else if (command === 15) {
                let ind = this.commands[(this.index + 1) % 64] * 15;
                this.index = this.energy >= ind
                    ? this.commands[(this.index + 2) % 64]
                    : this.commands[(this.index + 3) % 64];
            } else if (command === 16) {
                let sector = Constant.sector(this.ypos);
                this.index = sector <= 5
                    ? this.commands[(this.index + 1) % 64]
                    : this.commands[(this.index + 2) % 64];
            } else if (command === 17) {
                let sector = Constant.sector(this.ypos);
                this.index = sector <= 7 && sector >= 5
                    ? this.commands[(this.index + 1) % 64]
                    : this.commands[(this.index + 2) % 64];
            } else if (command === 18) {
                let new_type = this.commands[(this.index + 2) % 64] % 8;
                BotCommands.multiply(this, this.commands[(this.index + 1) % 64] % 8, 0, 0, new_type, false, iterator);
                this.index = (this.index + 3) % 64;
                break;
            } else if (command === 19) {
                let new_type = this.commands[(this.index + 1) % 64] % 8;
                BotCommands.multiply(this, this.rotate, 0, 0, new_type, false, iterator);
                this.index = (this.index + 2) % 64;
                break;
            } else if (command === 20) {
                let ind = this.commands[(this.index + 1) % 64] / 64.0;
                this.index = (this.xpos / Constant.world_scale[0]) >= ind
                    ? this.commands[(this.index + 2) % 64]
                    : this.commands[(this.index + 3) % 64];
            } else if (command === 21) {
                let ind = this.commands[(this.index + 1) % 64] / 64.0;
                this.index = (this.ypos / Constant.world_scale[1]) >= ind
                    ? this.commands[(this.index + 2) % 64]
                    : this.commands[(this.index + 3) % 64];
            } else if (command === 22) {
                let ind = this.commands[(this.index + 1) % 64] * 15;
                this.index = this.age >= ind
                    ? this.commands[(this.index + 2) % 64]
                    : this.commands[(this.index + 3) % 64];
            } else if (command === 23) {
                BotCommands.unif_distrib(this, this.commands[(this.index + 1) % 64] % 8);
                this.index = (this.index + 2) % 64;
                break;
            } else if (command === 24) {
                BotCommands.unif_distrib(this, this.rotate);
                this.index = (this.index + 1) % 64;
                break;
            } else if (command === 25) {
                this.index = this.commands[(this.index + 1) % 64];
            } else if (command === 26) {
                let ind = this.commands[(this.index + 1) % 64] / 63;
                this.index = this.oxygen_map[this.xpos][this.ypos] >= ind
                    ? this.commands[(this.index + 2) % 64]
                    : this.commands[(this.index + 3) % 64];
            } else if (command === 27 || command === 28) {
                if (this.pht_org_block !== 1) {
                    this.pht_org_block = 2;
                    BotCommands.recycle_organics_under(this, Math.floor(this.commands[(this.index + 1) % 64] * Constant.org_recycle_coeff));
                }
                this.index = (this.index + 2) % 64;
                break;
            } else if (command === 29 || command === 30) {
                if (this.pht_org_block !== 1) {
                    this.pht_org_block = 2;
                    BotCommands.recycle_organics(this, this.commands[(this.index + 1) % 64] % 8, Math.floor(this.commands[(this.index + 2) % 64] * Constant.org_recycle_coeff));
                }
                this.index = (this.index + 3) % 64;
                break;
            } else if (command === 31 || command === 32 || command === 47) {
                if (this.pht_org_block !== 1) {
                    this.pht_org_block = 2;
                    BotCommands.recycle_organics(this, this.rotate, Math.floor(this.commands[(this.index + 2) % 64] * Constant.org_recycle_coeff));
                }
                this.index = (this.index + 2) % 64;
                break;
            } else if (command === 33) {
                let ind = this.commands[(this.index + 1) % 64];
                this.index = this.org_map[this.xpos][this.ypos] >= ind * 15
                    ? this.commands[(this.index + 2) % 64]
                    : this.commands[(this.index + 3) % 64];
            } else if (command === 34) {
                let rot = this.commands[(this.index + 1) % 64] % 8;
                let ind = this.commands[(this.index + 2) % 64];
                this.index = this.commands[(this.index + 3 + BotCommands.see_org(this, rot, ind)) % 64];
            } else if (command === 35) {
                let ind = this.commands[(this.index + 1) % 64];
                this.index = this.commands[(this.index + 2 + BotCommands.see_org(this, this.rotate, ind)) % 64];
            } else if (command === 36) {
                let ind = this.commands[(this.index + 1) % 64] % 8;
                if (this.rotate > ind) {
                    this.index = this.commands[(this.index + 2) % 64];
                } else if (this.rotate === ind) {
                    this.index = this.commands[(this.index + 3) % 64];
                } else {
                    this.index = this.commands[(this.index + 4) % 64];
                }
            } else if (command === 37) {
                this.rotate = Math.floor(this.rand() * 8);
                this.index = (this.index + 1) % 64;
            } else if (command === 38) {
                let ind = this.commands[(this.index + 1) % 64] % 8;
                let count = BotUtils.bot_count(this);
                if (count > ind) {
                    this.index = this.commands[(this.index + 2) % 64];
                } else if (count === ind) {
                    this.index = this.commands[(this.index + 3) % 64];
                } else {
                    this.index = this.commands[(this.index + 4) % 64];
                }
            } else if (command === 39) {
                let rot = this.commands[(this.index + 1) % 64] % 8;
                let time = (this.commands[(this.index + 2) % 64] % 16) + 1;
                let new_type = this.commands[(this.index + 3) % 64] % 8;
                BotCommands.multiply(this, rot, 1, time, new_type, false, iterator);
                this.index = (this.index + 4) % 64;
                break;
            } else if (command === 40) {
                let time = (this.commands[(this.index + 1) % 64] % 16) + 1;
                let new_type = this.commands[(this.index + 2) % 64] % 8;
                BotCommands.multiply(this, this.rotate, 1, time, new_type, false, iterator);
                this.index = (this.index + 3) % 64;
                break;
            } else if (command === 41) {
                this.index = this.commands[(this.index + 1 + this.type) % 64];
            } else if (command === 42) {
                let new_type = this.commands[(this.index + 2) % 64] % 8;
                BotCommands.multiply(this, this.commands[(this.index + 1) % 64] % 8, 0, 0, new_type, true, iterator);
                this.index = (this.index + 3) % 64;
                break;
            } else if (command === 43) {
                let new_type = this.commands[(this.index + 1) % 64] % 8;
                BotCommands.multiply(this, this.rotate, 0, 0, new_type, true, iterator);
                this.index = (this.index + 2) % 64;
                break;
            } else if (command === 44) {
                let c = BotUtils.count_chains(this);
                let ind = this.commands[(this.index + 1) % 64] % 8;
                if (c > ind) {
                    this.index = this.commands[(this.index + 2) % 64];
                } else if (c < ind) {
                    this.index = this.commands[(this.index + 3) % 64];
                } else {
                    this.index = this.commands[(this.index + 4) % 64];
                }
            } else if (command === 45) {
                BotCommands.add_neighbour_to_chain(this, this.commands[(this.index + 1) % 64] % 8);
                this.index = (this.index + 2) % 64;
                break;
            } else if (command === 46) {
                BotCommands.add_neighbour_to_chain(this, this.rotate);
                this.index = (this.index + 1) % 64;
                break;
            } else {
                this.index = (this.index + command) % 64;
            }
        }
    }

    get_color(draw_type) {
        let c = { r: 0, g: 0, b: 0 };
        if (this.state === 0) {
            if (draw_type === 0) {
                if (this.c_red === -1 || this.c_green === -1 || this.c_blue === -1) {
                    c = { r: 128, g: 128, b: 128 };
                } else {
                    c = { r: this.c_red, g: this.c_green, b: this.c_blue };
                }
            } else if (draw_type === 1) {
                c = this.color;
            } else if (draw_type === 2) {
                let g = Constant.border(this.energy / 1000.0, 1, 0);
                c = Constant.gradient({ r: 255, g: 255, b: 0 }, { r: 255, g: 0, b: 0 }, g);
            } else if (draw_type === 3) {
                c = this.clan_color;
            } else if (draw_type === 4) {
                c = Constant.gradient({ r: 0, g: 0, b: 255 }, { r: 255, g: 255, b: 0 }, this.age / Constant.max_age);
            } else if (draw_type === 5) {
                const colors = [
                    { r: 0, g: 0, b: 255 },   // type 0
                    { r: 0, g: 255, b: 0 },   // type 1
                    { r: 255, g: 0, b: 0 },   // type 2
                    { r: 255, g: 255, b: 0 }, // type 3
                    { r: 255, g: 0, b: 255 }, // type 4
                    { r: 0, g: 255, b: 255 }, // type 5
                    { r: 128, g: 128, b: 128 }, // type 6
                    { r: 0, g: 128, b: 255 }  // type 7
                ];
                c = colors[this.type] || c;
            } else if (draw_type === 6) {
                let count_ch = BotUtils.count_chains(this);
                if (count_ch === 0) {
                    c = { r: 255, g: 255, b: 128 };
                } else if (count_ch === 1) {
                    c = { r: 85, g: 0, b: 85 };
                } else if (count_ch === 2) {
                    c = { r: 200, g: 0, b: 200 };
                } else {
                    c = { r: 255, g: 0, b: 255 };
                }
            }
        } else if (this.state === 1) {
            c = { r: 127, g: 60, b: 0 };
        }
        return c;
    }

    go_red() {
        if (this.c_red === -1 && this.c_green === -1 && this.c_blue === -1) {
            this.c_red = 255;
            this.c_green = 0;
            this.c_blue = 0;
        } else {
            this.c_red = Constant.border(this.c_red + 3, 255, 0);
            this.c_green = Constant.border(this.c_green - 3, 255, 0);
            this.c_blue = Constant.border(this.c_blue - 3, 255, 0);
        }
    }

    go_green() {
        if (this.c_red === -1 && this.c_green === -1 && this.c_blue === -1) {
            this.c_red = 0;
            this.c_green = 255;
            this.c_blue = 0;
        } else {
            this.c_red = Constant.border(this.c_red - 3, 255, 0);
            this.c_green = Constant.border(this.c_green + 3, 255, 0);
            this.c_blue = Constant.border(this.c_blue - 3, 255, 0);
        }
    }

    go_blue() {
        if (this.c_red === -1 && this.c_green === -1 && this.c_blue === -1) {
            this.c_red = 0;
            this.c_green = 0;
            this.c_blue = 255;
        } else {
            this.c_red = Constant.border(this.c_red - 3, 255, 0);
            this.c_green = Constant.border(this.c_green - 3, 255, 0);
            this.c_blue = Constant.border(this.c_blue + 3, 255, 0);
        }
    }

    go_yellow() {
        if (this.c_red === -1 && this.c_green === -1 && this.c_blue === -1) {
            this.c_red = 255;
            this.c_green = 255;
            this.c_blue = 0;
        } else {
            this.c_red = Constant.border(this.c_red + 3, 255, 0);
            this.c_green = Constant.border(this.c_green + 3, 255, 0);
            this.c_blue = Constant.border(this.c_blue - 3, 255, 0);
        }
    }
                }
