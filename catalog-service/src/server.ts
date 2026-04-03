import app from './app';

const port = parseInt(process.env.PORT || '3002', 10);

app.listen(port, () => {
  console.log(`Catalog service listening on port ${port}`);
});
