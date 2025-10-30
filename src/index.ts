import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import * as controllers from './Modules/controllers.index';
import { dbConnection } from './DB/db.connection';
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
app.use((err:Error|null, req:Request , res:Response, next:NextFunction)=>{
    const status = 500
    const message = 'Something went wrong'
    return res.status(status).json({message:err?.message || message})
})


const port:number | string = process.env.PORT || 5000
app.listen(port, () => {
    console.log('Server is running on port ' + port);
})