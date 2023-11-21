import { FastifyInstance } from "fastify";
import {fastifyMultipart} from '@fastify/multipart';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs';
import {pipeline} from 'node:stream';
import {promisify} from 'node:util';
import { prisma } from "../lib/prisma";
import path from "node:path";

const pump = promisify(pipeline)

export async function postUploadVideoResource(app: FastifyInstance){
    app.register(fastifyMultipart, {
        limits: {
            fileSize: 1048576 * 500 //500mb
        }
    })
    app.post('/video/upload', async (request, reply) => {
       const data = await request.file()

       if(!data){
        return reply.status(400).send({
            error: 'Missing file input.'
        })
       }

       const extension = path.extname(data.filename)

       //because the front end of aplication modify the video and sends to here in mp3 treated
       if (extension !== '.mp3'){
        return reply.status(400).send({
            error: 'The extension file was not MP3. Please, verify audio of video convertion.'
        })
       }

       const fileBasename = path.basename(data.filename, extension)

       const fileUploadName = `${fileBasename}-${randomUUID()}${extension}`

       const uploadDestinationPath = path.resolve(__dirname, '../../temp', fileUploadName)

       console.log('IS HERE')

       // waiting the intire upload of mp4 using promisse by promisify

       //TODO verify if the folder already exist before create write stream 

       await pump(data.file, fs.createWriteStream(uploadDestinationPath))

       console.log('Input video information on db.')

       const video = await prisma.videoInformation.create({
            data: {
                name: data.filename,
                save_path: uploadDestinationPath,
            }
       })
    
       return reply.send({
        sucess: `Upload of video created with sucess by name ${video.name}`
       })
    })
}