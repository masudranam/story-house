import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) =>{
    res.status(200).send('Hello from the server!');
})

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})