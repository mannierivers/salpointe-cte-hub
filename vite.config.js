import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Increase the warning limit slightly (optional, prevents minor warnings)
    chunkSizeWarningLimit: 1000, 
    
    // 2. Tell Rollup how to split the code
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Put Node Modules (libraries) into separate chunks
          if (id.includes('node_modules')) {
            
            // Split Firebase into its own file (it's heavy)
            if (id.includes('firebase')) {
              return 'firebase';
            }
            
            // Split Lucide Icons into its own file (it's heavy)
            if (id.includes('lucide-react')) {
              return 'icons';
            }

            // Put all other libraries (React, etc.) in a 'vendor' file
            return 'vendor';
          }
        },
      },
    },
  },
});