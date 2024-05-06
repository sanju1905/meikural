import path from 'path';
import mongoose from 'mongoose';
import express from 'express';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import license from 'rollup-plugin-license';
import * as pkg from './package.json';

const NODE_ENV = process.argv.mode || 'development';
const VERSION = pkg.version;
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://sanjay:sanjay@cluster0.fjcbkym.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Connection error:', err));

// Define Mongoose schema
const jsonDataSchema = new mongoose.Schema({
  data: Object // Assuming your JSON data structure is stored as an object
});

// Create a model
const JsonData = mongoose.model('JsonData', jsonDataSchema);

// Middleware to parse JSON request body
app.use(express.json());

// POST endpoint to save JSON data to MongoDB
app.post('/saveDataEndpoint', (req, res) => {
  const jsonData = req.body.data;
  console.log('Received JSON data:', req.body);

  JsonData.create({ data: jsonData })
  .then(() => {
    console.log('JSON data saved to MongoDB:', jsonData);
    res.status(200).send('JSON data saved successfully');
  })
  .catch(error => {
    console.error('Error saving JSON data:', error);
    res.status(500).send('Error saving JSON data');
  });
});

// Serve static files from the 'dist' directory
app.use(express.static(path.resolve(__dirname, 'dist')));

// Start the Express server
const port = 5173;
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

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
