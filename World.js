class World {
    constructor() {
        // Initialize arrays and properties
        this.objects = [];
        this.rand = {
            nextInt: (min, max) => {
                if (max === undefined) {
                    return Math.floor(Math.random() * min);
                }
                return Math.floor(Math.random() * (max - min)) + min;
            }
        };
        this.noise = new SimplexNoise(0);
        this.Map = Array(Constant.world_scale[0]).fill().map(() => Array(Constant.world_scale[1]).fill(null));
        this.oxygen_map = Array(Constant.world_scale[0]).fill().map(() => Array(Constant.world_scale[1]).fill(0));
        this.co2_map = Array(Constant.world_scale[0]).fill().map(() => Array(Constant.world_scale[1]).fill(0));
        this.org_map = Array(Constant.world_scale[0]).fill().map(() => Array(Constant.world_scale[1]).fill(0));
        this.mnr_map = Array(Constant.world_scale[0]).fill().map(() => Array(Constant.world_scale[1]).fill(0));
        this.height_map = Array(Constant.world_scale[0]).fill().map(() => Array(Constant.world_scale[1]).fill(0));

        // Colors
        this.gray = { r: 100, g: 100, b: 100 };
        this.black = { r: 0, g: 0, b: 0 };

        // Variables
        this.steps = 0;
        this.b_count = 0;
        this.obj_count = 0;
        this.org_count = 0;
        this.count_ox = -1;
        this.count_org = -1;
        this.count_mnr = -1;
        this.count_co2 = -1;
        this.mouse = 0;
        this.draw_type = 0;
        this.gas_draw_type = 0;
        this.zoom = 0;
        this.zoom_disp_pos = [100, 100];
        this.delay = 10;
        this.pause = false;
        this.render = true;
        this.sh_brain = false;
        this.rec = false;
        this.selection = null;
        this.for_set = null;

        // Setup canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = Constant.W;
        this.canvas.height = Constant.H;
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);

        // Setup UI
        this.setupUI();

        // Event listeners
        this.canvas.addEventListener('mousedown', this.handleMouse.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseDrag.bind(this));

        // Start simulation
        this.kill_all();
        this.start();
    }

    setupUI() {
        const uiContainer = document.createElement('div');
        uiContainer.style.position = 'absolute';
        uiContainer.style.top = '0';
        uiContainer.style.left = `${Constant.W - 300}px`;
        document.body.appendChild(uiContainer);

        // Stop/Start button
        this.stop_button = document.createElement('button');
        this.stop_button.textContent = 'Stop';
        this.stop_button.style.position = 'absolute';
        this.stop_button.style.top = '125px';
        this.stop_button.style.width = '125px';
        this.stop_button.style.height = '35px';
        this.stop_button.addEventListener('click', () => this.start_stop());
        uiContainer.appendChild(this.stop_button);

        // Skip slider
        this.skip_slider = document.createElement('input');
        this.skip_slider.type = 'range';
        this.skip_slider.min = '1';
        this.skip_slider.max = '10';
        this.skip_slider.value = '2';
        this.skip_slider.style.position = 'absolute';
        this.skip_slider.style.top = '125px';
        this.skip_slider.style.left = '130px';
        this.skip_slider.style.width = '125px';
        uiContainer.appendChild(this.skip_slider);

        // Draw type buttons
        const drawButtons = [
            { text: 'Predators', type: 0, top: '190px', left: '0px' },
            { text: 'Energy', type: 2, top: '190px', left: '100px' },
            { text: 'Clans', type: 3, top: '215px', left: '100px' },
            { text: 'Age', type: 4, top: '190px', left: '200px' },
            { text: 'Color', type: 1, top: '215px', left: '0px' },
            { text: 'Type', type: 5, top: '215px', left: '200px' },
            { text: 'Chain', type: 6, top: '240px', left: '0px' }
        ];
        drawButtons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.style.position = 'absolute';
            button.style.top = btn.top;
            button.style.left = btn.left;
            button.style.width = '95px';
            button.style.height = '20px';
            button.addEventListener('click', () => { this.draw_type = btn.type; this.repaint(); });
            uiContainer.appendChild(button);
        });

        // Gas draw type buttons
        const gasButtons = [
            { text: 'None', type: 0, top: '280px', left: '0px' },
            { text: 'Oxygen', type: 1, top: '280px', left: '100px' },
            { text: 'Organics', type: 2, top: '280px', left: '200px' },
            { text: 'Minerals', type: 3, top: '305px', left: '0px' },
            { text: 'Co2', type: 4, top: '305px', left: '100px' }
        ];
        gasButtons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.style.position = 'absolute';
            button.style.top = btn.top;
            button.style.left = btn.left;
            button.style.width = '95px';
            button.style.height = '20px';
            button.addEventListener('click', () => { this.gas_draw_type = btn.type; this.repaint(); });
            uiContainer.appendChild(button);
        });

        // Mouse function buttons
        const mouseButtons = [
            { text: 'Select', type: 0, top: '505px', left: '0px' },
            { text: 'Set', type: 1, top: '505px', left: '100px' },
            { text: 'Remove', type: 2, top: '505px', left: '200px' }
        ];
        mouseButtons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.style.position = 'absolute';
            button.style.top = btn.top;
            button.style.left = btn.left;
            button.style.width = '95px';
            button.style.height = '20px';
            button.addEventListener('click', () => { this.mouse = btn.type; });
            uiContainer.appendChild(button);
        });

        // Save and show brain buttons
        this.save_button = document.createElement('button');
        this.save_button.textContent = 'Save';
        this.save_button.style.position = 'absolute';
        this.save_button.style.top = '425px';
        this.save_button.style.width = '125px';
        this.save_button.style.height = '20px';
        this.save_button.disabled = true;
        uiContainer.appendChild(this.save_button);

        this.show_brain_button = document.createElement('button');
        this.show_brain_button.textContent = 'Show brain';
        this.show_brain_button.style.position = 'absolute';
        this.show_brain_button.style.top = '425px';
        this.show_brain_button.style.left = '130px';
        this.show_brain_button.style.width = '125px';
        this.show_brain_button.style.height = '20px';
        this.show_brain_button.disabled = true;
        this.show_brain_button.addEventListener('click', () => this.shbr());
        uiContainer.appendChild(this.show_brain_button);

        // Text fields
        this.for_save = document.createElement('input');
        this.for_save.type = 'text';
        this.for_save.style.position = 'absolute';
        this.for_save.style.top = '465px';
        this.for_save.style.width = '250px';
        this.for_save.style.height = '20px';
        uiContainer.appendChild(this.for_save);

        this.for_load = document.createElement('input');
        this.for_load.type = 'text';
        this.for_load.style.position = 'absolute';
        this.for_load.style.top = '565px';
        this.for_load.style.width = '250px';
        this.for_load.style.height = '20px';
        uiContainer.appendChild(this.for_load);

        // Load/save world buttons
        const worldButtons = [
            { text: 'Load bot', action: () => {}, top: '590px', left: '0px' },
            { text: 'Load world', action: () => this.load_world(), top: '590px', left: '95px' },
            { text: 'Save world', action: () => this.save_world(), top: '590px', left: '190px' }
        ];
        worldButtons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.style.position = 'absolute';
            button.style.top = btn.top;
            button.style.left = btn.left;
            button.style.width = '90px';
            button.style.height = '20px';
            button.addEventListener('click', btn.action);
            uiContainer.appendChild(button);
        });

        // Kill all and new population
        const controlButtons = [
            { text: 'Kill all', action: () => this.kill_all(), top: '635px', left: '130px' },
            { text: 'New population', action: () => this.newPopulation(), top: '635px', left: '0px' }
        ];
        controlButtons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.style.position = 'absolute';
            button.style.top = btn.top;
            button.style.left = btn.left;
            button.style.width = '125px';
            button.style.height = '20px';
            button.addEventListener('click', btn.action);
            uiContainer.appendChild(button);
        });

        // Render and record buttons
        this.render_button = document.createElement('button');
        this.render_button.textContent = 'Render: on';
        this.render_button.style.position = 'absolute';
        this.render_button.style.top = '660px';
        this.render_button.style.width = '125px';
        this.render_button.style.height = '20px';
        this.render_button.addEventListener('click', () => this.rndr());
        uiContainer.appendChild(this.render_button);

        this.record_button = document.createElement('button');
        this.record_button.textContent = 'Record: off';
        this.record_button.style.position = 'absolute';
        this.record_button.style.top = '660px';
        this.record_button.style.left = '130px';
        this.record_button.style.width = '125px';
        this.record_button.style.height = '20px';
        this.record_button.addEventListener('click', () => this.rcrd());
        uiContainer.appendChild(this.record_button);

        // Zoom buttons
        const zoomButtons = [
            { text: 'x1', zoom: 0, top: '705px', left: '0px' },
            { text: 'x2.5', zoom: 1, top: '705px', left: '100px' },
            { text: 'x5', zoom: 2, top: '705px', left: '200px' }
        ];
        zoomButtons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.style.position = 'absolute';
            button.style.top = btn.top;
            button.style.left = btn.left;
            button.style.width = '95px';
            button.style.height = '20px';
            button.addEventListener('click', () => this.changeZoom(btn.zoom));
            uiContainer.appendChild(button);
        });
    }

    start() {
        this.timer = setInterval(() => {
            if (!this.pause) {
                this.update();
            }
            this.repaint();
        }, this.delay);
    }

    repaint() {
        // Clear canvas
        this.ctx.fillStyle = `rgb(${this.gray.r}, ${this.gray.g}, ${this.gray.b})`;
        this.ctx.fillRect(0, 0, Constant.W, Constant.H);
        this.ctx.fillStyle = 'rgb(255, 255, 255)';
        this.ctx.fillRect(0, 0, Constant.world_scale[0] * Constant.size, Constant.world_scale[1] * Constant.size);

        // Render background and bots
        if (this.render) {
            if (this.gas_draw_type !== 0) {
                if (this.gas_draw_type === 1) {
                    Draw.draw_ox(this.ctx, this.oxygen_map, this.org_map, this.zoom, this.zoom_disp_pos);
                } else if (this.gas_draw_type === 2) {
                    Draw.draw_org(this.ctx, this.org_map, this.zoom, this.zoom_disp_pos);
                } else if (this.gas_draw_type === 3) {
                    Draw.draw_mnr(this.ctx, this.mnr_map);
                } else if (this.gas_draw_type === 4) {
                    Draw.draw_co2(this.ctx, this.co2_map, this.org_map, this.zoom, this.zoom_disp_pos);
                } else if (this.gas_draw_type === 5) {
                    Draw.draw_height(this.ctx, this.height_map, this.zoom, this.zoom_disp_pos);
                }
            }
            for (const bot of this.objects) {
                bot.Draw(this.ctx, this.draw_type, this.zoom, this.zoom_disp_pos);
            }
        }

        // Draw text
        this.ctx.fillStyle = `rgb(${this.black.r}, ${this.black.g}, ${this.black.b})`;
        this.ctx.font = 'bold 18px Arial';
        const texts = [
            { text: 'Main: ', y: 20 },
            { text: 'version 4 ', y: 40 },
            { text: `steps: ${this.steps}`, y: 60 },
            { text: `objects: ${this.obj_count}, bots: ${this.b_count}`, y: 80 },
            { text: `render type: ${Constant.draw_type_names[this.draw_type]} view`, y: 100 },
            { text: `mouse function: ${Constant.mouse_func_names[this.mouse]}`, y: 120 },
            { text: 'Render types:', y: 180 },
            { text: 'Background render types:', y: 275 },
            { text: 'Selection:', y: 340 },
            { text: 'enter name:', y: 460 },
            { text: 'Mouse functions:', y: 500 },
            { text: 'Load:', y: 540 },
            { text: 'enter name:', y: 560 },
            { text: 'Controls:', y: 630 },
            { text: 'Zoom:', y: 700 },
            { text: `Zoom position: ${this.zoom_disp_pos[0]}, ${this.zoom_disp_pos[1]}`, y: 740 },
            { text: `Oxygen: ${this.count_ox}`, y: 760 },
            { text: `Organics: ${this.count_org}`, y: 780 },
            { text: `Co2: ${this.count_co2}`, y: 800 }
        ];
        texts.forEach(t => {
            this.ctx.fillText(t.text, Constant.W - 300, t.y);
        });

        // Draw selection
        if (this.selection) {
            this.ctx.fillText(`energy: ${this.selection.energy}, : 0`, Constant.W - 300, 360);
            this.ctx.fillText(`age: ${this.selection.age}`, Constant.W - 300, 380);
            this.ctx.fillText(`position: [${this.selection.xpos}, ${this.selection.ypos}]`, Constant.W - 300, 400);
            this.ctx.fillText(
                `color: (${this.selection.color.r}, ${this.selection.color.g}, ${this.selection.color.b})`,
                Constant.W - 300,
                420
            );
            this.ctx.fillStyle = 'rgba(90, 90, 90, 0.35)';
            this.ctx.fillRect(0, 0, Constant.world_scale[0] * Constant.size, Constant.world_scale[1] * Constant.size);
            this.ctx.fillStyle = 'rgb(255, 0, 0)';
            const w = Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[this.zoom];
            const h = Constant.world_scale[1] * Constant.size / Constant.zoom_sizes[this.zoom];
            if (this.zoom === 0) {
                this.ctx.fillRect(
                    this.selection.xpos * Constant.size,
                    this.selection.ypos * Constant.size,
                    Constant.size,
                    Constant.size
                );
            } else {
                this.ctx.fillRect(
                    (this.selection.xpos - this.zoom_disp_pos[0] + w / 2) * Constant.zoom_sizes[this.zoom],
                    (this.selection.ypos - this.zoom_disp_pos[1] + h / 2) * Constant.zoom_sizes[this.zoom],
                    Constant.zoom_sizes[this.zoom],
                    Constant.zoom_sizes[this.zoom]
                );
            }
        } else {
            this.ctx.fillText('none', Constant.W - 300, 295);
        }

        // Draw brain
        if (this.sh_brain && this.selection) {
            this.ctx.fillStyle = 'rgb(90, 90, 90)';
            this.ctx.fillRect(0, 0, 360, 360);
            for (let x = 0; x < 8; x++) {
                for (let y = 0; y < 8; y++) {
                    this.ctx.fillStyle = 'rgb(128, 128, 128)';
                    this.ctx.fillRect(x * 45, y * 45, 40, 40);
                    this.ctx.fillStyle = 'rgb(0, 0, 0)';
                    this.ctx.fillText(
                        String(this.selection.commands[x + y * 8]),
                        x * 45 + 20,
                        y * 45 + 20
                    );
                }
            }
        }
    }

    record() {
        const buff = [];
        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 1000;
            canvas.height = 1000;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillRect(0, 0, 1000, 1000);
            if (i !== 1) {
                Draw.draw_ox(ctx, this.oxygen_map, this.org_map, this.zoom, this.zoom_disp_pos);
            } else {
                Draw.draw_org(ctx, this.org_map, this.zoom, this.zoom_disp_pos);
            }
            for (const bot of this.objects) {
                const dt = i > 1 ? i - 1 : 0;
                bot.Draw(ctx, dt, 0, this.zoom_disp_pos);
            }
            buff.push(canvas);
        }

        // Save images
        const names = ['predators-oxygen', 'predators-org', 'color', 'energy'];
        buff.forEach((canvas, i) => {
            const dataURL = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = `record/${names[i]}/screen${Math.floor(this.steps / 25)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    handleMouse(e) {
        const x = e.offsetX;
        const y = e.offsetY;
        if (x < Constant.world_scale[0] * Constant.size && y < Constant.world_scale[1] * Constant.size) {
            const botpos = this.getBotPosition(x, y);
            this.count_ox = this.oxygen_map[botpos[0]][botpos[1]];
            this.count_org = this.org_map[botpos[0]][botpos[1]];
            this.count_mnr = this.mnr_map[botpos[0]][botpos[1]];
            this.count_co2 = this.co2_map[botpos[0]][botpos[1]];
            this.update_mouse(botpos, 1);
        } else {
            this.count_ox = -1;
            this.count_org = -1;
            this.count_mnr = -1;
            this.count_co2 = -1;
        }
        this.repaint();
    }

    handleMouseDrag(e) {
        const x = e.offsetX;
        const y = e.offsetY;
        if (x < Constant.world_scale[0] * Constant.size && y < Constant.world_scale[1] * Constant.size) {
            const botpos = this.getBotPosition(x, y);
            this.count_ox = this.oxygen_map[botpos[0]][botpos[1]];
            this.count_org = this.org_map[botpos[0]][botpos[1]];
            this.count_mnr = this.mnr_map[botpos[0]][botpos[1]];
            this.count_co2 = this.co2_map[botpos[0]][botpos[1]];
            this.update_mouse(botpos, 0);
        } else {
            this.count_ox = -1;
            this.count_org = -1;
            this.count_mnr = -1;
            this.count_co2 = -1;
        }
        this.repaint();
    }

    getBotPosition(x, y) {
        const w = Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[this.zoom];
        const h = Constant.world_scale[1] * Constant.size / Constant.zoom_sizes[this.zoom];
        let botpos = [0, 0];
        if (this.zoom === 0) {
            botpos[0] = Math.floor(x / Constant.size);
            botpos[1] = Math.floor(y / Constant.size);
        } else {
            botpos[0] = Math.floor(x / Constant.zoom_sizes[this.zoom]) + this.zoom_disp_pos[0] - Math.floor(w / 2);
            botpos[1] = Math.floor(y / Constant.zoom_sizes[this.zoom]) + this.zoom_disp_pos[1] - Math.floor(h / 2);
        }
        return botpos;
    }

    update() {
        for (let i = 0; i < parseInt(this.skip_slider.value); i++) {
            this.steps++;
            this.b_count = 0;
            this.obj_count = 0;
            this.org_count = 0;

            const iterator = {
                list: this.objects,
                index: 0,
                hasNext: function() { return this.index < this.list.length; },
                next: function() { return this.list[this.index++]; },
                remove: function() { this.list.splice(this.index - 1, 1); this.index--; }
            };

            while (iterator.hasNext()) {
                const bot = iterator.next();
                bot.Update(iterator);
                if (this.selection && bot.xpos === this.selection.xpos && bot.ypos === this.selection.ypos && bot !== this.selection) {
                    this.selection = null;
                    this.save_button.disabled = true;
                    this.show_brain_button.disabled = true;
                    this.sh_brain = false;
                }
                this.obj_count++;
                if (bot.state !== 0) {
                    this.org_count++;
                } else {
                    this.b_count++;
                }
            }

            if (this.selection && (this.selection.killed === 1 || !this.Map[this.selection.xpos][this.selection.ypos] || this.selection.state !== 0)) {
                this.selection = null;
                this.save_button.disabled = true;
                this.show_brain_button.disabled = true;
                this.sh_brain = false;
            }

            WorldUtils.gas(this.oxygen_map, this.org_map);
            WorldUtils.gas(this.co2_map, this.org_map);

            if (this.rec && this.steps % 25 === 0) {
                this.record();
            }

            // Clean up killed bots
            this.objects = this.objects.filter(bot => bot.killed !== 1);
        }
    }

    update_mouse(botpos, select_work) {
        if (botpos[0] >= 0 && botpos[0] < Constant.world_scale[0] && botpos[1] >= 0 && botpos[1] < Constant.world_scale[1]) {
            if (this.mouse === 0 && select_work === 1) {
                if (this.Map[botpos[0]][botpos[1]] && this.Map[botpos[0]][botpos[1]].state === 0) {
                    this.selection = this.objects.find(b => b.xpos === botpos[0] && b.ypos === botpos[1]);
                    this.save_button.disabled = !this.selection;
                    this.show_brain_button.disabled = !this.selection;
                } else {
                    this.selection = null;
                    this.save_button.disabled = true;
                    this.show_brain_button.disabled = true;
                    this.sh_brain = false;
                }
                if (this.zoom === 0) {
                    this.zoom_disp_pos = [botpos[0], botpos[1]];
                } else {
                    const w = Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[this.zoom];
                    const h = Constant.world_scale[1] * Constant.size / Constant.zoom_sizes[this.zoom];
                    this.zoom_disp_pos[0] = Constant.border(botpos[0], Constant.world_scale[0] - Math.floor(w / 2), Math.floor(w / 2));
                    this.zoom_disp_pos[1] = Constant.border(botpos[1], Constant.world_scale[1] - Math.floor(h / 2), Math.floor(h / 2));
                }
            } else if (this.mouse === 1 && this.for_set) {
                if (!this.Map[botpos[0]][botpos[1]]) {
                    this.objects.push(this.for_set);
                    this.Map[botpos[0]][botpos[1]] = this.for_set;
                }
            } else if (this.mouse === 2 && this.Map[botpos[0]][botpos[1]]) {
                const bot = this.objects.find(b => b.xpos === botpos[0] && b.ypos === botpos[1]);
                if (bot) {
                    bot.energy = 0;
                    bot.killed = 1;
                    this.Map[botpos[0]][botpos[1]] = null;
                }
            }
        }
    }

    newPopulation() {
        this.kill_all();
        for (let i = 0; i < Constant.starting_bot_count; i++) {
            let x, y;
            do {
                x = this.rand.nextInt(Constant.world_scale[0]);
                y = this.rand.nextInt(Constant.world_scale[1]);
            } while (this.Map[x][y]);
            const new_bot = new Bot(
                x, y,
                { r: this.rand.nextInt(256), g: this.rand.nextInt(256), b: this.rand.nextInt(256) },
                1000,
                0,
                this.oxygen_map,
                this.co2_map,
                this.org_map,
                this.Map,
                this.objects
            );
            this.objects.push(new_bot);
            this.Map[x][y] = new_bot;
        }
        this.repaint();
    }

    kill_all() {
        this.steps = 0;
        this.objects = [];
        this.Map = Array(Constant.world_scale[0]).fill().map(() => Array(Constant.world_scale[1]).fill(null));
        this.oxygen_map = Array(Constant.world_scale[0]).fill().map(() => Array(Constant.world_scale[1]).fill(Constant.starting_ox));
        this.co2_map = Array(Constant.world_scale[0]).fill().map(() => Array(Constant.world_scale[1]).fill(Constant.starting_co2));
        this.org_map = Array(Constant.world_scale[0]).fill().map(() => Array(Constant.world_scale[1]).fill(Constant.starting_org));
        this.mnr_map = Array(Constant.world_scale[0]).fill().map(() => Array(Constant.world_scale[1]).fill(0));
        this.height_map = Array(Constant.world_scale[0]).fill().map(() => Array(Constant.world_scale[1]).fill(0));
        for (let x = 0; x < Constant.world_scale[0]; x++) {
            for (let y = 0; y < Constant.world_scale[1]; y++) {
                this.height_map[x][y] = this.noise.sumOctaves(8, x, y, 0.5, 0.007, 0, 1000);
            }
        }
    }

    shbr() {
        this.sh_brain = !this.sh_brain;
        this.pause = this.sh_brain ? true : this.pause ? false : this.pause;
        this.repaint();
    }

    rndr() {
        this.render = !this.render;
        this.render_button.textContent = `Render: ${this.render ? 'on' : 'off'}`;
        this.repaint();
    }

    rcrd() {
        this.rec = !this.rec;
        this.record_button.textContent = `Record: ${this.rec ? 'on' : 'off'}`;
    }

    start_stop() {
        this.pause = !this.pause;
        this.stop_button.textContent = this.pause ? 'Start' : 'Stop';
    }

    load_world() {
        // Note: Browser-based file reading requires user interaction
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.dat';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = event.target.result;
                    const l = data.split(';');
                    this.steps = parseInt(l[0]);
                    this.objects = [];
                    this.Map = Array(Constant.world_scale[0]).fill().map(() => Array(Constant.world_scale[1]).fill(null));

                    const ox = l[1].split(':');
                    for (let i = 0; i < ox.length && i < Constant.world_scale[0]; i++) {
                        const ox_col = ox[i].split("'");
                        for (let j = 0; j < ox_col.length && j < Constant.world_scale[1]; j++) {
                            this.oxygen_map[i][j] = parseFloat(ox_col[j]) || 0;
                        }
                    }

                    const organics = l[2].split(':');
                    for (let i = 0; i < organics.length && i < Constant.world_scale[0]; i++) {
                        const organics_col = organics[i].split("'");
                        for (let j = 0; j < organics_col.length && j < Constant.world_scale[1]; j++) {
                            this.org_map[i][j] = parseFloat(organics_col[j]) || 0;
                        }
                    }

                    const co2 = l[3].split(':');
                    for (let i = 0; i < co2.length && i < Constant.world_scale[0]; i++) {
                        const co2_col = co2[i].split("'");
                        for (let j = 0; j < co2_col.length && j < Constant.world_scale[1]; j++) {
                            this.co2_map[i][j] = parseFloat(co2_col[j]) || 0;
                        }
                    }

                    const bots = l[4].split(':').filter(b => b);
                    for (const bot_data of bots) {
                        const data = bot_data.split("'");
                        if (data.length < 82) continue;
                        const new_bot = new Bot(
                            parseInt(data[2]),
                            parseInt(data[3]),
                            { r: parseInt(data[9]), g: parseInt(data[10]), b: parseInt(data[11]) },
                            parseFloat(data[0]),
                            0,
                            this.oxygen_map,
                            this.co2_map,
                            this.org_map,
                            this.Map,
                            this.objects
                        );
                        new_bot.age = parseInt(data[1]);
                        new_bot.rotate = parseInt(data[4]);
                        new_bot.state = parseInt(data[5]);
                        new_bot.c_red = parseInt(data[6]);
                        new_bot.c_green = parseInt(data[7]);
                        new_bot.c_blue = parseInt(data[8]);
                        new_bot.index = parseInt(data[15]);
                        new_bot.clan_color = {
                            r: parseInt(data[12]),
                            g: parseInt(data[13]),
                            b: parseInt(data[14])
                        };
                        new_bot.pht_org_block = parseInt(data[16]);
                        new_bot.seed_time = parseInt(data[17]);
                        new_bot.commands = data.slice(18, 82).map(v => parseInt(v));
                        this.Map[new_bot.xpos][new_bot.ypos] = new_bot;
                        this.objects.push(new_bot);
                    }
                    this.repaint();
                } catch (err) {
                    console.error('Error reading file:', err);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    save_world() {
        let data = `${this.steps};`;
        for (let x = 0; x < Constant.world_scale[0]; x++) {
            for (let y = 0; y < Constant.world_scale[1]; y++) {
                data += `${this.oxygen_map[x][y]}'`;
            }
            data += ':';
        }
        data += ';';
        for (let x = 0; x < Constant.world_scale[0]; x++) {
            for (let y = 0; y < Constant.world_scale[1]; y++) {
                data += `${Math.floor(this.org_map[x][y])}'`;
            }
            data += ':';
        }
        data += ';';
        for (let x = 0; x < Constant.world_scale[0]; x++) {
            for (let y = 0; y < Constant.world_scale[1]; y++) {
                data += `${this.co2_map[x][y]}'`;
            }
            data += ':';
        }
        data += ';';
        for (const b of this.objects) {
            data += `${b.energy}'${b.age}'${b.xpos}'${b.ypos}'${b.rotate}'${b.state}'${b.c_red}'${b.c_green}'${b.c_blue}'` +
                    `${b.color.r}'${b.color.g}'${b.color.b}'${b.clan_color.r}'${b.clan_color.g}'${b.clan_color.b}'` +
                    `${b.index}'${b.pht_org_block}'${b.seed_time}'${b.commands.join("'")}'`;
            data += ':';
        }

        const blob = new Blob([data], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.for_load.value || 'world'}.dat`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    changeZoom(number) {
        this.zoom = number;
        if (this.zoom !== 0) {
            const w = Constant.world_scale[0] * Constant.size / Constant.zoom_sizes[this.zoom];
            const h = Constant.world_scale[1] * Constant.size / Constant.zoom_sizes[this.zoom];
            this.zoom_disp_pos[0] = Constant.border(this.zoom_disp_pos[0], Constant.world_scale[0] - Math.floor(w / 2), Math.floor(w / 2));
            this.zoom_disp_pos[1] = Constant.border(this.zoom_disp_pos[1], Constant.world_scale[1] - Math.floor(h / 2), Math.floor(h / 2));
        }
        this.repaint();
    }
          }
