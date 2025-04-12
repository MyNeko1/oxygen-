// Main.js
import World from './World.js'; // Assuming World is a JavaScript class/module

export function main() {
    // Directory creation (Node.js environment)
    if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        
        // Create directories synchronously
        const directories = [
            'record/predators-oxygen',
            'record/energy',
            'record/color',
            'record/predators-org',
            'record/predators-co2',
            'saved worlds'
        ];
        
        directories.forEach(dir => {
            try {
                fs.mkdirSync(dir, { recursive: true });
            } catch (err) {
                console.error(`Failed to create directory ${dir}:`, err);
            }
        });
    } else {
        // Browser environment: Log that file system access is not available
        console.warn('File system access is not available in the browser. Consider using localStorage or IndexedDB for saving data.');
    }

    // Set up the canvas (browser environment)
    const canvas = document.createElement('canvas');
    canvas.width = 1920; // Matches JFrame size
    canvas.height = 1080;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    document.body.appendChild(canvas);
    
    // Initialize the World (assumed to handle the simulation)
    const world = new World(canvas);
    
    // Optional: Fullscreen mode
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    
    // Start the simulation (assuming World has a method to run)
    if (typeof world.start === 'function') {
        world.start();
    } else {
        console.warn('World class does not have a start method. Ensure it is implemented.');
    }
}
