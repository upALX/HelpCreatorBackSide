import { FastifyInstance } from "fastify";
import { createReadStream } from "node:fs";
import {prisma} from "../lib/prisma";
import {z} from 'zod'
import { openai } from "../lib/openai";

export async function postCreateTranscriptionResource(app: FastifyInstance){
    app.post('/video/:videoId/transcription', async (req, reply) => {
        const paramSchema = z.object({
            videoId: z.string().uuid()
        })

        const {videoId} = paramSchema.parse(req.params)

        const bodySchema = z.object({
            prompt: z.string()
        })

        const {prompt} = bodySchema.parse(req.body)

        const video = await prisma.videoInformation.findUniqueOrThrow({
            where: {
                id: videoId,
            }
        })

        const videoPath = video.save_path

        const audioReadStream = createReadStream(videoPath)

        console.log('Generating transcription...')

        const response = await openai.audio.transcriptions.create({
            file: audioReadStream,
            model: 'whisper-1',
            language: 'pt',
            response_format: 'json',
            temperature: 0,
            prompt
        })

        const transcription = response.text

        console.log('Inputing transcription generated on database')

        await prisma.videoInformation.update({
            where: {
                id: videoId
            },
            data: {
                transcription: transcription
            }
        })

        console.log('Sucess to save transcription on database')

        return reply.status(200).send({
            transcription
        })
    })
}