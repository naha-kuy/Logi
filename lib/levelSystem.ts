// KONFIGURASI LEVELING
// Rumus Kenaikan: Req = 500 + (CurrentLevel - 1) * 250
// Ini adalah Deret Aritmatika.

/**
 * Menghitung Level saat ini berdasarkan Total XP menggunakan rumus invers kuadratik.
 * Total XP = 125k^2 + 375k, dimana k = level - 1
 * 
 * @param {number} xp - Total XP yang dimiliki pengguna.
 * @returns {number} Level saat ini yang dihitung dari XP.
 */
export const getLevelFromXP = (xp: number): number => {
  if (xp < 0) return 1;
  
  // Kita mencari k (level - 1) dari persamaan kuadrat:
  // 125k^2 + 375k - XP = 0
  // Rumus ABC: k = (-b + sqrt(b^2 - 4ac)) / 2a
  const a = 125;
  const b = 375;
  const c = -xp;

  const k = (-b + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
  
  // Level = k + 1
  return Math.floor(k) + 1;
};

/**
 * Menghitung Total XP minimal yang dibutuhkan untuk mencapai Level tertentu.
 * Menggunakan rumus jumlah deret aritmatika (Sum).
 * 
 * @param {number} level - Level target yang ingin dicapai.
 * @returns {number} Total XP yang dibutuhkan untuk mencapai level tersebut.
 */
export const getXPRequiredForLevel = (level: number): number => {
  if (level <= 1) return 0;
  
  const k = level - 1;
  // Rumus Total: (k/2) * (2*a + (k-1)d)
  // Total = (k/2) * (2*500 + (k-1)*250)
  // Total = 125k^2 + 375k
  return (125 * Math.pow(k, 2)) + (375 * k);
};

/**
 * Menghitung detail progress bar level, termasuk persentase dan sisa XP.
 * 
 * @param {number} currentXP - Total XP yang dimiliki pengguna saat ini.
 * @returns {object} Objek yang berisi detail progress level (currentLevel, nextLevel, percentage, dll).
 */
export const getLevelProgress = (currentXP: number) => {
  const currentLevel = getLevelFromXP(currentXP);
  const nextLevel = currentLevel + 1;

  const xpStartOfLevel = getXPRequiredForLevel(currentLevel);
  const xpNextLevelThreshold = getXPRequiredForLevel(nextLevel);

  // XP yang sudah didapat di level ini
  const progressInLevel = currentXP - xpStartOfLevel;
  
  // Total XP yang harus didapat selama berada di level ini (Gap)
  // Sesuai rumus user: 500 + (n-1)*250
  const xpNeededForNextLevel = xpNextLevelThreshold - xpStartOfLevel;

  // Persentase (0-100)
  const percentage = Math.min(100, Math.max(0, (progressInLevel / xpNeededForNextLevel) * 100));

  return {
    currentLevel,
    nextLevel,
    progressInLevel,
    xpNeededForNextLevel, // Total gap level ini
    xpToNextLevel: xpNextLevelThreshold - currentXP, // Sisa XP yang harus dicari
    percentage,
    xpStartOfLevel,
    xpNextLevelThreshold
  };
};