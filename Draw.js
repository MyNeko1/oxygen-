class Draw {
    static draw_ox(ctx, oxygen_map, org_map, zoom, zoom_disp_pos) {
        const w = Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[zoom];
        const h = Constant.world_scale[1] * Constant.size / Constant.zoom_sizes[zoom];
        for (let i = 0; i < Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[zoom]; i++) {
            for (let j = 0; j < Constant.world_scale[1] * Constant.size / Constant.zoom_sizes[zoom]; j++) {
                let x, y, ox;
                if (zoom === 0) {
                    x = i;
                    y = j;
                    ox = oxygen_map[x][y];
                    if (ox > Constant.ox_render_maximum_coeff) {
                        ox = Constant.ox_render_maximum_coeff;
                    }
                    const color = Constant.gradient(
                        { r: 255, g: 255, b: 255 },
                        { r: 112, g: 219, b: 235 },
                        ox * (1 / Constant.ox_render_maximum_coeff)
                    );
                    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                    ctx.fillRect(x * Constant.size, y * Constant.size, Constant.size, Constant.size);
                    if (org_map[x][y] >= Constant.org_die_level) {
                        ctx.fillStyle = 'rgb(90, 0, 0)';
                        ctx.fillRect(x * Constant.size, y * Constant.size, Constant.size, Constant.size);
                    }
                } else {
                    x = i + zoom_disp_pos[0] - Math.floor(w / 2);
                    y = j + zoom_disp_pos[1] - Math.floor(h / 2);
                    if (x >= 0 && x < Constant.world_scale[0] && y >= 0 && y < Constant.world_scale[1]) {
                        ox = oxygen_map[x][y];
                        if (ox > Constant.ox_render_maximum_coeff) {
                            ox = Constant.ox_render_maximum_coeff;
                        }
                        const color = Constant.gradient(
                            { r: 255, g: 255, b: 255 },
                            { r: 112, g: 219, b: 235 },
                            ox * (1 / Constant.ox_render_maximum_coeff)
                        );
                        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                        ctx.fillRect(
                            i * Constant.zoom_sizes[zoom],
                            j * Constant.zoom_sizes[zoom],
                            Constant.zoom_sizes[zoom],
                            Constant.zoom_sizes[zoom]
                        );
                        if (org_map[x][y] >= Constant.org_die_level) {
                            ctx.fillStyle = 'rgb(90, 0, 0)';
                            ctx.fillRect(
                                i * Constant.zoom_sizes[zoom],
                                j * Constant.zoom_sizes[zoom],
                                Constant.zoom_sizes[zoom],
                                Constant.zoom_sizes[zoom]
                            );
                        }
                    }
                }
            }
        }
    }

    static draw_org(ctx, org_map, zoom, zoom_disp_pos) {
        const w = Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[zoom];
        const h = Constant.world_scale[1] * Constant.size / Constant.zoom_sizes[zoom];
        for (let i = 0; i < Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[zoom]; i++) {
            for (let j = 0; j < Constant.world_scale[1] * Constant.zoom_sizes[zoom]; j++) {
                let x, y, gr;
                if (zoom === 0) {
                    x = i;
                    y = j;
                    gr = Constant.border(org_map[x][y], Constant.org_die_level, 0);
                    const color = Constant.gradient(
                        { r: 255, g: 255, b: 255 },
                        { r: 0, g: 0, b: 0 },
                        gr / Constant.org_die_level
                    );
                    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                    ctx.fillRect(
                        x * Constant.zoom_sizes[zoom],
                        y * Constant.zoom_sizes[zoom],
                        Constant.zoom_sizes[zoom],
                        Constant.zoom_sizes[zoom]
                    );
                } else {
                    x = i + zoom_disp_pos[0] - Math.floor(w / 2);
                    y = j + zoom_disp_pos[1] - Math.floor(h / 2);
                    if (x >= 0 && x < Constant.world_scale[0] && y >= 0 && y < Constant.world_scale[1]) {
                        gr = Constant.border(org_map[x][y], Constant.org_die_level, 0);
                        const color = Constant.gradient(
                            { r: 255, g: 255, b: 255 },
                            { r: 0, g: 0, b: 0 },
                            gr / Constant.org_die_level
                        );
                        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                        ctx.fillRect(
                            i * Constant.zoom_sizes[zoom],
                            j * Constant.zoom_sizes[zoom],
                            Constant.zoom_sizes[zoom],
                            Constant.zoom_sizes[zoom]
                        );
                    }
                }
            }
        }
    }

    static draw_co2(ctx, co2_map, org_map, zoom, zoom_disp_pos) {
        const w = Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[zoom];
        const h = Constant.world_scale[1] * Constant.size / Constant.zoom_sizes[zoom];
        for (let i = 0; i < Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[zoom]; i++) {
            for (let j = 0; j < Constant.world_scale[1] * Constant.size / Constant.zoom_sizes[zoom]; j++) {
                let x, y, co2;
                if (zoom === 0) {
                    x = i;
                    y = j;
                    co2 = co2_map[x][y];
                    if (co2 > Constant.co2_render_maximum_coeff) {
                        co2 = Constant.co2_render_maximum_coeff;
                    }
                    const color = Constant.gradient(
                        { r: 255, g: 255, b: 255 },
                        { r: 38, g: 36, b: 235 },
                        co2 * (1 / Constant.co2_render_maximum_coeff)
                    );
                    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                    ctx.fillRect(x * Constant.size, y * Constant.size, Constant.size, Constant.size);
                    if (org_map[x][y] >= Constant.org_die_level) {
                        ctx.fillStyle = 'rgb(90, 0, 0)';
                        ctx.fillRect(x * Constant.size, y * Constant.size, Constant.size, Constant.size);
                    }
                } else {
                    x = i + zoom_disp_pos[0] - Math.floor(w / 2);
                    y = j + zoom_disp_pos[1] - Math.floor(h / 2);
                    if (x >= 0 && x < Constant.world_scale[0] && y >= 0 && y < Constant.world_scale[1]) {
                        co2 = co2_map[x][y];
                        if (co2 > Constant.co2_render_maximum_coeff) {
                            co2 = Constant.co2_render_maximum_coeff;
                        }
                        const color = Constant.gradient(
                            { r: 255, g: 255, b: 255 },
                            { r: 38, g: 36, b: 235 },
                            co2 * (1 / Constant.co2_render_maximum_coeff)
                        );
                        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                        ctx.fillRect(
                            i * Constant.zoom_sizes[zoom],
                            j * Constant.zoom_sizes[zoom],
                            Constant.zoom_sizes[zoom],
                            Constant.zoom_sizes[zoom]
                        );
                        if (org_map[x][y] >= Constant.org_die_level) {
                            ctx.fillStyle = 'rgb(90, 0, 0)';
                            ctx.fillRect(
                                i * Constant.zoom_sizes[zoom],
                                j * Constant.zoom_sizes[zoom],
                                Constant.zoom_sizes[zoom],
                                Constant.zoom_sizes[zoom]
                            );
                        }
                    }
                }
            }
        }
    }

    static draw_mnr(ctx, mnr_map) {
        for (let x = 0; x < Constant.world_scale[0]; x++) {
            for (let y = 0; y < Constant.world_scale[1]; y++) {
                const value = Math.floor(mnr_map[x][y] / 1000 * 255);
                ctx.fillStyle = `rgb(${255 - value}, ${255 - value}, 255)`;
                ctx.fillRect(x * Constant.size, y * Constant.size, Constant.size, Constant.size);
            }
        }
    }

    static draw_height(ctx, height_map, zoom, zoom_disp_pos) {
        const w = Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[zoom];
        const h = Constant.world_scale[1] * Constant.size / Constant.zoom_sizes[zoom];
        for (let i = 0; i < Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[zoom]; i++) {
            for (let j = 0; j < Constant.world_scale[1] * Constant.size / Constant.zoom_sizes[zoom]; j++) {
                let x, y, gr;
                if (zoom === 0) {
                    x = i;
                    y = j;
                    gr = Constant.border(255 - Math.floor(height_map[x][y] / 1000.0 * 255), 255, 0);
                    if (gr < 255) {
                        ctx.fillStyle = `rgb(${gr}, ${gr}, ${gr})`;
                        ctx.fillRect(
                            x * Constant.zoom_sizes[zoom],
                            y * Constant.zoom_sizes[zoom],
                            Constant.zoom_sizes[zoom],
                            Constant.zoom_sizes[zoom]
                        );
                    }
                } else {
                    x = i + zoom_disp_pos[0] - Math.floor(w / 2);
                    y = j + zoom_disp_pos[1] - Math.floor(h / 2);
                    if (x >= 0 && x < Constant.world_scale[0] && y >= 0 && y < Constant.world_scale[1]) {
                        gr = Constant.border(255 - Math.floor(height_map[x][y] / 1000.0 * 255), 255, 0);
                        if (gr < 255) {
                            ctx.fillStyle = `rgb(${gr}, ${gr}, ${gr})`;
                            ctx.fillRect(
                                i * Constant.zoom_sizes[zoom],
                                j * Constant.zoom_sizes[zoom],
                                Constant.zoom_sizes[zoom],
                                Constant.zoom_sizes[zoom]
                            );
                        }
                    }
                }
            }
        }
    }
                    }
