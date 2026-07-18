// return a random name from a array
export default function Generate_Username() : string {
     const words = [
          "raiden", "akira", "nezuko", "shinobi", "ryuji", "hollow", "kuro", "sakura",
          "vortex", "onyx", "kaizen", "asura", "phantasm", "reaper", "tensei", "yurei",
          "kitsune", "void", "zeke", "seraph", "nova", "aegis", "scar", "storm",
          "bane", "flame", "glitch", "rider", "phantom", "havoc", "curse", "ronin"
     ];

     const part1 = words[Math.floor(Math.random() * words.length)];
     let part2 = words[Math.floor(Math.random() * words.length)];

     while (part2 === part1) {
          part2 = words[Math.floor(Math.random() * words.length)];
     }

     const number = Math.floor(1000 + Math.random() * 9000);
     return `${part1}_${number}`;
}