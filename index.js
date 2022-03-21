const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const authRouter = require('./routes/auth.routes')
const app = express();
const corsMiddleWare = require('./middleware/cors.middleware')

const PORT = process.env.PORT || config.get("serverPort");

app.use(corsMiddleWare)
app.use(express.json());
app.use('/api/auth', authRouter)



const start = async () => {
    try {

        mongoose.connect(config.get("dbUrl"));

        app.listen(PORT, () => {
            console.log('Server was started on port ', PORT);
        })
    } catch (error) {
        
    }
}

start();