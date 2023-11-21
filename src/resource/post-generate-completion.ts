import { FastifyInstance } from "fastify";
import { createReadStream } from "node:fs";
import {prisma} from "../lib/prisma";
import {z} from 'zod'
import { openai } from "../lib/openai";

export async function postGenerateCompletionResource(app: FastifyInstance){
    app.post('/completion', async (req, reply) => {
        const paramSchema = z.object({
            videoId: z.string().uuid()
        })

        const bodySchema = z.object({
            videoId: z.string().uuid(),
            template: z.string(),
            temperature: z.number().min(0).max(1).default(0.5)
        })

        const {videoId, template, temperature} = bodySchema.parse(req.body)

        const video = await prisma.videoInformation.findFirstOrThrow({
            where: {
                id: videoId
            }
        })

        if (!video.transcription){
            return reply.status(404).send({
                error: 'The value transcription was not found.'
            })
        }

        const promptMessage = template.replace('{transcription}', video.transcription)

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo-16k',
            temperature,
            messages: [
                {role: 'user', content: promptMessage}
            ]
        })

        return response
    })
}