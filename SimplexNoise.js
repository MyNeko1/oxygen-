class SimplexNoise {
    constructor(seed) {
        this.grad3 = [
            { X: 1, Y: 1 }, { X: -1, Y: 1 }, { X: 1, Y: -1 }, { X: -1, Y: -1 },
            { X: 1, Y: 0 }, { X: -1, Y: 0 }, { X: 1, Y: 0 }, { X: -1, Y: 0 },
            { X: 0, Y: 1 }, { X: 0, Y: -1 }, { X: 0, Y: 1 }, { X: 0, Y: -1 }
        ];

        this.p = [
            151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
            140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
            247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
            57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68,
            175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111,
            229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
            102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208,
            89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198,
            173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126,
            255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
            223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101,
            155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224,
            232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210,
            144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49,
            192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45,
            127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141,
            128, 195, 78, 66, 215, 61, 156, 180
        ];

        this.perm = new Array(512);
        this.permMod12 = new Array(512);

        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[(i + seed) & 255];
            this.permMod12[i] = this.perm[i] % 12;
        }

        this.F2 = 0.5 * (Math.sqrt(3) - 1);
        this.G2 = (3 - Math.sqrt(3)) / 6;
    }

    generateHeightmap(size, iterationCount, persistence, scale, low, high) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const colorValue = Math.floor(this.sumOctaves(iterationCount, i, j, persistence, scale, low, high));
                ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
                ctx.fillRect(i, j, 1, 1);
            }
        }

        return canvas; // Return canvas instead of BufferedImage
    }

    saveImage(canvas, pathToSave, name, ext) {
        // Browser: Create a downloadable link
        const dataURL = canvas.toDataURL(`image/${ext}`);
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${name}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    sumOctaves(iterationCount, x, y, persistence, scale, low, high) {
        let maxAmplitude = 0;
        let amplitude = 1;
        let frequency = scale;
        let noiseValue = 0;

        for (let i = 0; i < iterationCount; i++) {
            noiseValue += this.generateSimplexNoise(x * frequency, y * frequency) * amplitude;
            maxAmplitude += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        noiseValue /= maxAmplitude;
        return noiseValue * (high - low) / 2 + (high + low) / 2;
    }

    fastFloor(x) {
        const xi = Math.floor(x);
        return x < xi ? xi - 1 : xi;
    }

    dot(gradient, x, y) {
        return gradient.X * x + gradient.Y * y;
    }

    generateSimplexNoise(x, y) {
        let n0, n1, n2;
        const s = (x + y) * this.F2;

        const i = this.fastFloor(x + s);
        const j = this.fastFloor(y + s);

        const t = (i + j) * this.G2;

        const X0 = i - t;
        const Y0 = j - t;

        const x0 = x - X0;
        const y0 = y - Y0;

        let i1, j1;
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } else {
            i1 = 0;
            j1 = 1;
        }

        const x1 = x0 - i1 + this.G2;
        const y1 = y0 - j1 + this.G2;

        const x2 = x0 - 1.0 + 2.0 * this.G2;
        const y2 = y0 - 1.0 + 2.0 * this.G2;

        const ii = i & 255;
        const jj = j & 255;

        const gi0 = this.permMod12[ii + this.perm[jj]];
        const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
        const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];

        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) {
            n0 = 0.0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0.0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0.0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
        }

        return 40.0 * (n0 + n1 + n2);
    }
          }
