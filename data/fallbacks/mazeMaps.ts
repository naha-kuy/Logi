import { CellType } from '../../models/types';

// Tipe: 0=Jalan, 1=Tembok, 2=Pintu(Soal), 3=Finish, 4=Start, 5=Pintu Terbuka
// Ukuran Grid Standar: 21 Baris x 35 Kolom

const ROWS = 21;
const COLS = 35;

// Helper: Create Base Frame
const createBaseMap = (): CellType[][] => {
    const map: CellType[][] = Array(ROWS).fill(null).map(() => Array(COLS).fill(1));
    for(let r=1; r<ROWS-1; r++) {
        for(let c=1; c<COLS-1; c++) {
            map[r][c] = 0;
        }
    }
    return map;
};

// --- MAP 1: The Classic (Zig-Zag) ---
const map1 = createBaseMap();
for(let c=5; c<30; c+=5) {
    for(let r=1; r<15; r++) map1[r][c] = 1;
    for(let r=6; r<20; r++) map1[r][c+2] = 1;
}
map1[1][1] = 4; map1[ROWS-2][COLS-2] = 3;
map1[2][5] = 2; map1[10][5] = 2; map1[5][10] = 2; map1[15][15] = 2; map1[5][20] = 2; map1[10][25] = 2;

// --- MAP 2: The Spiral (Melingkar) ---
const map2 = createBaseMap();
for(let c=2; c<COLS-2; c++) { map2[2][c] = 1; map2[ROWS-3][c] = 1; }
for(let r=2; r<ROWS-3; r++) { map2[r][COLS-3] = 1; map2[r][2] = 1; }
for(let c=4; c<COLS-4; c++) { map2[4][c] = 1; map2[ROWS-5][c] = 1; }
map2[10][17] = 4; map2[1][1] = 3;
map2[3][10] = 2; map2[3][25] = 2; map2[ROWS-4][10] = 2; map2[10][5] = 2;

// --- MAP 3: The Grid (Kotak-Kotak) ---
const map3 = createBaseMap();
for(let r=2; r<ROWS; r+=4) {
    for(let c=2; c<COLS; c+=4) {
        map3[r][c] = 1; map3[r][c+1] = 1;
        map3[r+1][c] = 1; map3[r+1][c+1] = 1;
    }
}
map3[1][1] = 4; map3[ROWS-2][COLS-2] = 3;
map3[5][5] = 2; map3[10][10] = 2; map3[15][15] = 2; map3[5][25] = 2;

// --- MAP 4: The River (Sungai Panjang) ---
const map4 = createBaseMap();
for(let r=1; r<ROWS-1; r++) map4[r][17] = 1; // Tengah Vertical
for(let c=1; c<COLS-1; c++) map4[10][c] = 1; // Tengah Horizontal
map4[10][17] = 0; // Crossroad
map4[1][1] = 4; map4[ROWS-2][COLS-2] = 3;
map4[5][17] = 2; map4[15][17] = 2; map4[10][5] = 2; map4[10][30] = 2;

// --- MAP 5: The Rooms (Kamar-Kamar) ---
const map5 = createBaseMap();
for(let c=7; c<COLS; c+=7) { for(let r=1; r<ROWS-1; r++) map5[r][c] = 1; }
map5[5][7] = 2; map5[15][14] = 2; map5[5][21] = 2; map5[15][28] = 2;
map5[10][1] = 4; map5[10][COLS-2] = 3;

// --- MAP 6: The Snake (Ular) ---
const map6 = createBaseMap();
for(let r=2; r<ROWS-2; r+=2) {
    for(let c=1; c<COLS-1; c++) {
        if (r % 4 === 2 && c < COLS-4) map6[r][c] = 1;
        if (r % 4 === 0 && c > 4) map6[r][c] = 1;
    }
}
map6[1][1] = 4; map6[ROWS-2][COLS-2] = 3;
map6[3][5] = 2; map6[7][30] = 2; map6[11][5] = 2; map6[15][30] = 2;

// --- MAP 7: The Arena (Terbuka dengan Obstacle Acak) ---
const map7 = createBaseMap();
for(let i=0; i<30; i++) {
    const r = Math.floor(Math.random() * (ROWS-2)) + 1;
    const c = Math.floor(Math.random() * (COLS-2)) + 1;
    map7[r][c] = 1;
}
map7[1][1] = 4; map7[ROWS-2][COLS-2] = 3;
map7[5][5] = 2; map7[15][25] = 2;

// --- MAP 8: Twin Towers ---
const map8 = createBaseMap();
for(let r=5; r<15; r++) { map8[r][10] = 1; map8[r][25] = 1; }
for(let c=10; c<=25; c++) { map8[5][c] = 1; map8[15][c] = 1; }
map8[10][18] = 4; map8[1][1] = 3;
map8[5][18] = 2; map8[15][18] = 2;

// --- MAP 9: Checkers ---
const map9 = createBaseMap();
for(let r=1; r<ROWS-1; r+=2) {
    for(let c=1; c<COLS-1; c+=2) {
        map9[r][c] = 1;
    }
}
map9[1][2] = 4; map9[ROWS-2][COLS-3] = 3;
map9[2][2] = 2; map9[10][10] = 2;

// --- MAP 10: The Fortress ---
const map10 = createBaseMap();
for(let r=5; r<ROWS-5; r++) { map10[r][10] = 1; map10[r][COLS-10] = 1; }
for(let c=10; c<COLS-10; c++) { map10[5][c] = 1; map10[ROWS-6][c] = 1; }
map10[10][17] = 3; 
map10[1][1] = 4; 
map10[5][17] = 2; map10[ROWS-6][17] = 2; 

export const FALLBACK_MAZE_MAPS: CellType[][][] = [map1, map2, map3, map4, map5, map6, map7, map8, map9, map10];

export const getRandomMazeMap = (): CellType[][] => {
    const idx = Math.floor(Math.random() * FALLBACK_MAZE_MAPS.length);
    return FALLBACK_MAZE_MAPS[idx].map(row => [...row]);
};