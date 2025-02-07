// app/api/transcribe/route.js
import { SpeechClient } from '@google-cloud/speech';
import { NextResponse } from 'next/server';

const getGCPCredentials = () => {
    if (process.env.GCP_PRIVATE_KEY) {
      // For Vercel (Production)
      return {
        credentials: {
          client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fix newlines for private key
        },
        projectId: process.env.GCP_PROJECT_ID,
      };
    } else if (process.env.NODE_ENV === 'development') {
      // For Local Development
      return {
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Path to JSON file in local dev
      };
    } else {
      throw new Error('Missing Google Cloud credentials');
    }
  };
  
  // Initialize the SpeechClient with the appropriate credentials
  const gcpCredentials = getGCPCredentials();
  const client = new SpeechClient(gcpCredentials);
  
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