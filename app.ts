import express from 'express';
import dotenv from 'dotenv';
import { User, Auth} from './database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
 

app.get('/', async(req, res) =>{
    const users = await User.findAll();
    res.status(200).json(users);
});

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})