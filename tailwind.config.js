/** @type {import('tailwindcss').Config} */
export default {
     content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
     theme: {
          extend: {
               colors:{
                    suboption: 'var(--text_suboption)',
                    product: 'var(--text_product)',
                    order: 'var(--text_product)',
               },
               keyframes: {
                    slideDown: {
                         "0%": { top: "-10%" },
                         "100%": { top: "11%" },
                    },
                    slideUp: {
                         "0%": { top: "11%" },
                         "100%": { top: "-10%" },
                    },
                    colorBorder: {
                         "0%,100%": { borderColor: "rgba(0,0,0,0.4)" },
                         "25%": { borderColor: "rgba(165,42,42,0.4)" },
                         "50%": { borderColor: "rgba(138,43,226,0.4)" },
                         "75%": { borderColor: "rgba(107,142,35,0.4)" },
                    },

                    'spin-glow': {
                         '0%': { transform: 'rotate(0deg)' },
                         '100%': { transform: 'rotate(360deg)' },
                    },

                    pulseShape: {
                         "0%, 100%": { transform: "scale(1)", opacity: "1" },
                         "50%": { transform: "scale(1.2)", opacity: "0.75" },
                    },

                    slide: {
                         "0%": { transform: "translateX(0)" },
                         "50%": { transform: "translateX(20px)" },
                         "100%": { transform: "translateX(0)" },
                    },

                    float: {
                         "0%, 100%": { transform: "translateY(0)" },
                         "50%": { transform: "translateY(-20px)" },
                    },
               },
               animation: {
                    'spin-glow': 'spin-glow 6s linear infinite',
                    error:
                         "slideDown 0.3s ease-out forwards, slideUp 0.3s ease-in 3s forwards",
                    colorBorder: "colorBorder 4s linear infinite",

                    rotate: "rotate 6s linear infinite",
                    pulseShape: "pulseShape 3s ease-in-out infinite",
                    slide: "slide 4s ease-in-out infinite",
                    float: "float 12s ease-in-out infinite",
               },
               fontFamily: {
                    banner: ["var(--font-banner)"],
                    notfound: ["var(--font-notfound)"]
               },
          },
     },
     plugins: [],
};
