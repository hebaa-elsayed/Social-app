import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import * as controllers from './Modules/controllers.index';
import { dbConnection } from './DB/db.connection';
import { HttpException , FailedResponse} from './Utils';

const app = express();

app.use(express.json());

dbConnection ()

app.use('/api/auth', controllers.authController);
app.use('/api/users', controllers.profileController);
app.use('/api/posts', controllers.postController);
app.use('/api/comments', controllers.commentController);
app.use('/api/reacts', controllers.reactController);
// app.use('/api/follows', controllers.followController);
// app.use('/api/messages', controllers.messageController);
// app.use('/api/notifications', controllers.notificationController);

// error handling middleware
app.use((err: HttpException |Error|null, req:Request , res:Response, next:NextFunction)=>{
    if(err){
        if(err instanceof HttpException){
            res.status(err.statusCode).json(FailedResponse(err.message, err.statusCode, err.error))
    }else{
        res.status(500).json(FailedResponse('Something went wrong', 500, err))
    }
}})


const port:number | string = process.env.PORT || 3000
app.listen(port, () => {
    console.log('Server is running on port ' + port);
})