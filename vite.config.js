import path from 'path';
import mongoose from 'mongoose';
import express from 'express';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import license from 'rollup-plugin-license';
import * as pkg from './package.json';
// const bodyParser = require('body-parser');
const NODE_ENV = process.argv.mode || 'development';
const VERSION = pkg.version;
const app = express();
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
app.use(express.json());
app.post('/saveDataEndpoint', (req, res) => {
  const jsonData = req.body;

  // Save JSON data to MongoDB
  JsonData.create(jsonData)
    .then(() => {
      console.log('JSON data saved to MongoDB:', jsonData);
      res.status(200).send('JSON data saved successfully');
    })
    .catch(error => {
      console.error('Error saving JSON data:', error);
      res.status(500).send('Error saving JSON data');
    });
});


app.use(express.static(path.resolve(__dirname, 'dist')));



// app.use(bodyParser.json());
// // Create an Express application
// let savedData = null; // Variable to store the saved data


// // Define a POST endpoint to handle data
// app.post('/saveDataEndpoint', (req, res) => {
//   // Assuming the JSON data is sent as the request body
//   savedData = req.body.data;

//   // Log the received data
//   console.log('Received data:', savedData);

//   // Send a response to acknowledge the successful operation
//   res.status(200).send('Data received successfully');
// });







// Serve static files from the 'dist' directory
app.use(express.static(path.resolve(__dirname, 'dist')));

// Start the Express server
const port = 3303;
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
                // Manually allow html-janitor (https://github.com/guardian/html-janitor/blob/master/LICENSE)
                // because of missing LICENSE file in published package
                if (dependency.name === 'html-janitor') {
                  return true;
                }

                // Return false for unlicensed dependencies.
                if (!dependency.license) {
                  return false;
                }

                // Allow MIT and Apache-2.0 licenses.
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

  // server: {
  //   port: 3303,
  //   open: true,
  // },


    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3303',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
 

  plugins: [
    cssInjectedByJsPlugin(),
  ],
};
