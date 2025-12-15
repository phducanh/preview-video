const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// config 3 level of details
const LEVELS = [
    {
        id: 'L1',
        name: 'Low Detail (10x10)',
        interval: 5,   // Every 5 seconds take 1 frame
        width: 80,     // Width of 1 thumbnail
        cols: 10,      // Grid 10 columns
        rows: 10       // Grid 10 rows
    },
    {
        id: 'L2',
        name: 'Medium Detail (5x5)',
        interval: 5,   // Every 5 seconds take 1 frame
        width: 160,    // Width of 1 thumbnail
        cols: 5,       // Grid 5 columns
        rows: 5        // Grid 5 rows
    },
    {
        id: 'L3',
        name: 'High Detail (3x3)',
        interval: 5,   // Every 5 seconds take 1 frame
        width: 320,    // Width of 1 thumbnail
        cols: 3,       // Grid 3 columns
        rows: 3        // Grid 3 rows
    }
];

const INPUT_FILE = 'input.mp4';
const OUTPUT_DIR = path.join(__dirname, 'public', 'assets');

// Create directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)){
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const generateLevel = (level) => {
    return new Promise((resolve, reject) => {
        console.log(`Processing Level: ${level.name}...`);
        
        // Calculate grid string for FFmpeg (e.g., 5x5)
        const tileStr = `${level.cols}x${level.rows}`;
        // Output file name: L2_M%03d.jpg (e.g., L2_M001.jpg)
        const filename = `${level.id}_M%03d.jpg`;
        const outputPath = path.join(OUTPUT_DIR, filename);

        // Command FFmpeg
        // fps=1/interval: Sampling rate (1/2 means 1 frame every 2 seconds)
        // scale=width:-1: Resize while maintaining aspect ratio
        // tile=colsxrows: Combine into a large tile
        const cmd = `ffmpeg -i ${INPUT_FILE} -vf "fps=1/${level.interval},scale=${level.width}:-1,tile=${tileStr}" -q:v 2 "${outputPath}" -y`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error when processing ${level.id}:`, error);
                reject(error);
                return;
            }
            console.log(`Finished ${level.id}!`);
            resolve();
        });
    });
};

const main = async () => {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error("ERROR: Could not find 'input.mp4'. Please copy a video file into this directory.");
        return;
    }

    try {
        // Process each level sequentially
        for (const level of LEVELS) {
            await generateLevel(level);
        }

        // Create Manifest file (JSON) for Frontend to read
        // This is a simplified version of the "spec" that YouTube sends down to the client
        const manifest = {
            levels: LEVELS.map(l => ({
                ...l,
                spriteTemplate: `assets/${l.id}_M$M.jpg`, // $M will be replaced by number
                height: Math.round(l.width * 9 / 16) // Assume 16:9 aspect ratio to calculate height
            }))
        };

        fs.writeFileSync(path.join(__dirname, 'public', 'manifest.json'), JSON.stringify(manifest, null, 2));
        console.log("-----------------------------------------");
        console.log("Finished all levels!");

    } catch (err) {
        console.error("ERROR occurred:", err);
    }
};

main();