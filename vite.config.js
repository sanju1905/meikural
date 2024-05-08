import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import express from 'express';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import license from 'rollup-plugin-license';
import * as pkg from './package.json';

const NODE_ENV = process.argv.mode || 'development';
const VERSION = pkg.version;
const app = express();
app.use(cors());
// Connect to MongoDB
mongoose.connect('mongodb+srv://sanjay:sanjay@cluster0.fjcbkym.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Connection error:', err));




// Define Mongoose schema
const jsonDataSchema = new mongoose.Schema({
  time: Number,
  data: String, // Store the entire data as a string
  version: String
});
 
// Create a model
const JsonData = mongoose.model('JsonData', jsonDataSchema);

// Middleware to parse JSON request body
app.use(express.json());
// Endpoint to save data
app.post('/savedata', async (req, res) => {
  try {
    const { data } = req.body; // Assuming the frontend sends the data in a property named 'data'
    const newData = new JsonData({ data });
    console.log(newData);
    const savedData = await newData.save();
    res.json(savedData);
  } catch (error) {
    res.status(500).json({ error: 'Saving error', details: error.message });
  }
});


// Endpoint to get all data
app.get('/api/getdata', async (req, res) => {
  try {
    const allData = await JsonData.find({});
    res.json(allData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
});






// Serve static files from the 'dist' directory
app.use(express.static(path.resolve(__dirname, 'dist')));

// Start the Express server
const port = 5173;
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
import { defineConfig } from 'vite';


export default {
  build: {
    copyPublicDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src', 'codex.ts'),
      name: 'EditorJS',
      fileName: 'editorjs',
    },
    rollupOptions: {
      plugins: [
        license({
          thirdParty: {
            allow: {
              test: (dependency) => {
                // Manually allow html-janitor because of missing LICENSE file
                if (dependency.name === 'html-janitor') {
                  return true;
                }
                // Return false for unlicensed dependencies
                if (!dependency.license) {
                  return false;
                }
                // Allow MIT and Apache-2.0 licenses
                return ['MIT', 'Apache-2.0'].includes(dependency.license);
              },
              failOnUnlicensed: true,
              failOnViolation: true,
            },
            output: path.resolve(__dirname, 'dist', 'vendor.LICENSE.txt'),
          },
        }),
      ],
    },
  },
  define: {
    'NODE_ENV': JSON.stringify(NODE_ENV),
    'VERSION': JSON.stringify(VERSION),
  },
 
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    cssInjectedByJsPlugin(),
  ],
};
