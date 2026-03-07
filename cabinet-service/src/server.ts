import app from './app';

const port = parseInt(process.env.PORT || '3003', 10);

app.listen(port, () => {
  console.log(`Cabinet service listening on port ${port}`);
});
