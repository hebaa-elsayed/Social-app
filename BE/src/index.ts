import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors'
import morgan from 'morgan'
import fs from 'fs'

import * as controllers from './Modules/controllers.index';
import { dbConnection } from './DB/db.connection';
import { HttpException , FailedResponse} from './Utils';
import { ioInitializer } from './Gateways/socketIo.gateways';


const app = express();

app.use(cors())
app.use(express.json());

//create write stream
const accessLogStream = fs.createWriteStream('access.log')
app.use(morgan('dev', { stream: accessLogStream }));

dbConnection ()

app.use('/api/auth', controllers.authController);
app.use('/api/users', controllers.profileController);
app.use('/api/posts', controllers.postController);
app.use('/api/comments', controllers.commentController);
app.use('/api/reacts', controllers.reactController);


// error handling middleware
app.use((err: HttpException |Error|null, req:Request , res:Response, next:NextFunction)=>{
    if(err){
        if(err instanceof HttpException){
            res.status(err.statusCode).json(FailedResponse(err.message, err.statusCode, err.error))
    }else{
        if (err instanceof Error) {res.status(500).json(FailedResponse(err.message || 'Something went wrong',500,{name: err.name, message: err.message, stack: err.stack}));
            } else {
                res.status(500).json(FailedResponse('Unknown error', 500, err));
            }
        }
}})


const port:number | string = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log('Server is running on port ' + port);
})

ioInitializer(server)

