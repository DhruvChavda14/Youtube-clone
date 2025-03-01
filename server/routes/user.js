import express from 'express'

import { login,getUserPoints } from '../controllers/auth.js'

import {updateChanelData,getAllChanels} from '../controllers/chanel.js'



const routes = express.Router();

routes.post('/login',login)
routes.patch('/update/:id',updateChanelData)
routes.get('/getAllChanels',getAllChanels)
routes.get('/points/:userId', getUserPoints);

export default routes;
