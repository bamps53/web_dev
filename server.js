const path = require('path');
const express = require('express');
const { createRequestHandler } = require('@remix-run/express');

const app = express();
const port = process.env.PORT || 3000;

// Remixの静的アセットを提供
app.use(
  '/build',
  express.static('public/build', { immutable: true, maxAge: '1y' })
);
app.use(express.static('public', { maxAge: '1h' }));

// Remixリクエストハンドラーを設定
app.all(
  '*',
  createRequestHandler({
    build: path.join(process.cwd(), 'build'),
    mode: process.env.NODE_ENV
  })
);

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
