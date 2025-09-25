import { NextRequest, NextResponse } from 'next/server';

// Function to validate if an image URL is accessible
async function validateImageUrl(url: string, maxRetries = 3): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
        return true;
      }
    } catch (error) {
      console.log(`Image validation attempt ${i + 1} failed:`, error);
    }
    
    // Wait 2 seconds before retrying
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    console.log('API route called');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { model_image, garment_image, num_samples = 1 } = body;

    if (!model_image || !garment_image) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Both model_image and garment_image are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.FASHN_API_KEY;
    console.log('API key configured:', !!apiKey);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'FASHN API key not configured' },
        { status: 500 }
      );
    }

    // Step 1: Submit the try-on request
    const submitResponse = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_name: "tryon-v1.6",
        inputs: {
          model_image,
          garment_image
        },
        num_samples: num_samples
      }),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      return NextResponse.json(
        { error: `FASHN API error: ${errorText}` },
        { status: submitResponse.status }
      );
    }

    const submitResult = await submitResponse.json();
    const predictionId = submitResult.id;

    if (!predictionId) {
      return NextResponse.json(
        { error: 'No prediction ID returned from FASHN API' },
        { status: 500 }
      );
    }

    // Step 2: Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max wait time
    const pollInterval = 5000; // 5 seconds

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await fetch(`https://api.fashn.ai/v1/status/${predictionId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!statusResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to check status' },
          { status: statusResponse.status }
        );
      }

      const statusResult = await statusResponse.json();

      if (statusResult.status === 'completed') {
        const outputUrl = statusResult.output?.[0];
        
        if (!outputUrl) {
          return NextResponse.json(
            { error: 'No output image URL received' },
            { status: 500 }
          );
        }

        // Validate that the generated image is accessible
        const isImageValid = await validateImageUrl(outputUrl);
        
        if (!isImageValid) {
          console.error('Generated image URL is not accessible:', outputUrl);
          // Still return the URL, but log the issue
        }

        return NextResponse.json({
          success: true,
          output: statusResult.output, // This will now be an array of URLs
          prediction_id: predictionId
        });
      }

      if (statusResult.status === 'failed') {
        return NextResponse.json(
          { error: `Try-on failed: ${statusResult.error?.message || 'Unknown error'}` },
          { status: 500 }
        );
      }

      attempts++;
    }

    return NextResponse.json(
      { error: 'Try-on request timed out' },
      { status: 408 }
    );

  } catch (error) {
    console.error('Try-on API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
