import {fastify} from 'fastify';
import  {fastifyCors} from '@fastify/cors'
import { getAllPromptsResource } from './resource/get-all-prompts-resource';
import { postUploadVideoResource } from './resource/post-upload-videos-resource';
import { postCreateTranscriptionResource } from './resource/post-transcription-resource';
import { postGenerateCompletionResource } from './resource/post-generate-completion';

const app = fastify()

app.register(fastifyCors, {
    //put the host of front end
    origin: '*'
})

// GET 
app.register(getAllPromptsResource)

//POST 
app.register(postUploadVideoResource)
app.register(postCreateTranscriptionResource)
app.register(postGenerateCompletionResource)

app.listen({port:3333}).then(()=>{
    console.log('Server running...')
})