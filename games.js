// games.js
// This file contains the logic for different gaze tracking tasks.
// All movements are deterministic (MATH based) so they are consistent every time.

const GAME_MODES = {
    // 1. ORIGINAL: Horizontal Sine Wave
    horizontal: {
        name: "Horizontal Sine",
        duration: 15000,
        // Function to calculate position at any given progress (0.0 to 1.0)
        getPos: (progress, w, h) => {
            const speed = 2; // 2 Hz
            const amplitude = w * 0.4;
            const x = (w / 2) + amplitude * Math.sin(progress * Math.PI * 2 * speed);
            const y = h / 2;
            return { x, y };
        }
    },

    // 2. CIRCULAR: Smooth circular pursuit
    circular: {
        name: "Circular Tracking",
        duration: 15000,
        getPos: (progress, w, h) => {
            const radius = h * 0.35; // Use height to ensure it fits on screen
            const speed = 2; // 2 Hz
            
            // Standard circle equation: x = r*cos(t), y = r*sin(t)
            const angle = progress * Math.PI * 2 * speed ; 
            
            const x = (w / 2) + radius * Math.cos(angle);
            const y = (h / 2) + radius * Math.sin(angle);
            return { x, y };
        }
    },

    // 3. JUMP (SACCADE): Appears and disappears at fixed spots
    // We use a fixed array of positions so it's the same every time.
    jump: {
        name: "Step / Saccade (Jump)",
        duration: 16000, // 8 jumps * 2 seconds each
        getPos: (progress, w, h) => {
            // Fixed sequence of locations (in % of screen width/height)
            // 0.5 = center, 0.2 = left/top, 0.8 = right/bottom
            const sequence = [
                {x: 0.5, y: 0.5}, // Center
                {x: 0.2, y: 0.2}, // Top Left
                {x: 0.8, y: 0.8}, // Bottom Right
                {x: 0.2, y: 0.8}, // Bottom Left
                {x: 0.8, y: 0.2}, // Top Right
                {x: 0.5, y: 0.2}, // Top Center
                {x: 0.5, y: 0.8}, // Bottom Center
                {x: 0.5, y: 0.5}  // Back to Center
            ];

            // Which step are we on?
            const stepIndex = Math.floor(progress * sequence.length);
            // Clamp to avoid array index out of bounds at progress=1.0
            const safeIndex = Math.min(stepIndex, sequence.length - 1);
            
            const target = sequence[safeIndex];
            
            return { 
                x: target.x * w, 
                y: target.y * h 
            };
        }
    },

    // 4. RANDOM (PSEUDO-RANDOM): "Chaotic" but consistent
    // We sum multiple sine waves with prime number frequencies.
    // This creates a path that never repeats but is mathematically identical every run.
    random: {
        name: "Random Pursuit",
        duration: 20000,
        getPos: (progress, w, h) => {
            // "Lissajous figure" approach for complexity
            const t = progress * 20; // Time multiplier
            
            // X combines 3 different frequencies
            // 0.5 is center, 0.4 is usable width amplitude
            const normX = 0.5 + 0.4 * (
                0.5 * Math.sin(t * 1.1) +  // Main slow wave
                0.3 * Math.cos(t * 2.3) +  // Medium wave
                0.2 * Math.sin(t * 3.7)    // Fast jitter
            );

            // Y combines 3 different frequencies (different primes)
            const normY = 0.5 + 0.4 * (
                0.5 * Math.sin(t * 1.4) + 
                0.3 * Math.cos(t * 2.9) + 
                0.2 * Math.sin(t * 4.1)
            );

            return { x: normX * w, y: normY * h };
        }
    }
};