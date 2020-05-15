const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const util = require('util');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'text/plain' }));

// Uncomment this out once you've made your first route.
app.use(express.static(path.join(__dirname, 'client', 'build')));

// some helper functions you can use
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readDir = util.promisify(fs.readdir);

// some more helper functions
const DATA_DIR = 'data';
const TAG_RE = /#\w+/g;
function slugToPath(slug) {
  const filename = `${slug}.md`;
  return path.join(DATA_DIR, filename);
}
function jsonOK(res, data) {
  res.json({ status: 'ok', ...data });
}
function jsonError(res, message) {
  res.json({ status: 'error', message });
}

app.get('/', (req, res) => {
  res.json({ wow: 'it works!' });
});

// If you want to see the wiki client, run npm install && npm build in the client folder,
// then comment the line above and uncomment out the lines below and comment the line above.
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
// });

// GET: '/api/page/:slug'
// success response: {status: 'ok', body: '<file contents>'}
// failure response: {status: 'error', message: 'Page does not exist.'}
app.get('/api/page/:slug', (req, res) => {
  const filePath = slugToPath(req.params.slug);
  readFile(filePath, 'utf-8')
    .then((text) => {
      res.send({ status: 'ok', body: text });
    })
    .catch((error) => {
      res.send({ status: 'error', message: 'Page does not exist.' });
    });
});

// POST: '/api/page/:slug'
// body: {body: '<file text content>'}
// success response: {status: 'ok'}
// failure response: {status: 'error', message: 'Could not write page.'}
app.post('/api/page/:slug', (req, res) => {
  const filePath = slugToPath(req.params.slug);
  const text = req.body.toString();
  writeFile(filePath, text, 'utf-8')
    .then((text) => {
      res.send({ status: 'ok', body: text });
    })
    .catch((error) => {
      res.send({ status: 'error', message: 'Could not write page' });
    });
});

// GET: '/api/pages/all'
// success response: {status:'ok', pages: ['fileName', 'otherFileName']}
//  file names do not have .md, just the name!
// failure response: no failure response
app.get('/api/pages/all', (req, res) => {
  readDir(DATA_DIR, 'utf8')
    .then((files) => {
      let filesList = files.map(function (e) {
        return e.replace('.md', '');
      });
      res.send({ status: 'ok', body: filesList });
    })
    .catch((error) => {
      res.send({ status: 'error' });
    });
});

// GET: '/api/tags/all'
// success response: {status:'ok', tags: ['tagName', 'otherTagName']}
//  tags are any word in all documents with a # in front of it
// failure response: no failure response

// readDir(DATA_DIR, 'utf8')
//   .then((tags) => {
//     let tagsAll = tags.filter((TAG_RE) => input.includes(TAG_RE));
//     res.send({ status: 'ok', body: tagsAll });
//   })
//   .catch((error) => {
//     res.send({ status: 'error' });
//   });

// app.get('/api/tags/all', (req, res) => {
//   readDir(DATA_DIR)
//     .then((list) => {
//       let listTags = [];
//       let listTags = list.map(function (e) {
//         return e.replace('.md', '');
//       });
//       let list = readFile(path.join(DATA_DIR, file), 'utf-8');
//       let listTags = list.includes(TAG_RE);
//       res.send({ status: 'ok', body: filesList });
//     })
//     .catch((error) => {
//       res.send({ status: 'error' });
//     });
// });

// GET: '/api/tags/:tag'
// success response: {status:'ok', tag: 'tagName', pages: ['tagName', 'otherTagName']}
//  file names do not have .md, just the name!
// failure response: no failure response

app.get('/api/page/all', async (req, res) => {
  const names = await fs.readdir(DATA_DIR);
  console.log(names);
  jsonOK(res, {});
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Wiki app is serving at http://localhost:${port}`));
