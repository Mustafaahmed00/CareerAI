// app/api/transcribe/route.js
import { SpeechClient } from '@google-cloud/speech';
import { NextResponse } from 'next/server';

const client = new SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.audio) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    const audioBytes = Buffer.from(body.audio, 'base64');

    const request = {
      audio: {
        content: audioBytes.toString('base64')
      },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        model: 'latest_long',  // Better for full transcriptions
        enableAutomaticPunctuation: true,
        maxAlternatives: 1,
        useEnhanced: true,
        // Add speech contexts to improve recognition
        speechContexts: [{
          phrases: [
            'interview',
            'question',
            'answer',
            'experience',
            'project',
            'technology',
            'development',
            'management',
            'team',
            'skills'
          ],
          boost: 20
        }]
      },
    };

    const [response] = await client.recognize(request);
    
    // Combine all transcripts for a complete response
    const transcript = response.results
      ?.map(result => result.alternatives[0]?.transcript || '')
      .join(' ')
      .trim();

    return NextResponse.json({
      transcript,
      isFinal: true
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error.message },
      { status: 500 }
    );
  }
}