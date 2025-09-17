y# AI Fashion Virtual Try On

A Next.js + TypeScript application that provides virtual try-on functionality using the FASHN AI Try-On v1.6 API.

## Features

- **Three-column layout**: Separate inputs for top garment, bottom garment, and model images
- **Sequential try-on process**: 
  1. Applies bottom garment to model first
  2. Applies top garment to the intermediate result
- **Real-time image previews** for all input URLs
- **Modern UI** with Tailwind CSS styling
- **Error handling** and loading states
- **Progress tracking** with percentage display
- **Image download functionality**

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your FASHN AI API key:

```
FASHN_API_KEY=your_actual_api_key_here
```

You can get your API key from the [FASHN AI Dashboard](https://docs.fashn.ai/api-reference/tryon-v1-6).

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3456](http://localhost:3456) in your browser.

## Usage

1. **Input URLs**: Enter public URLs for:
   - Top garment image (left column)
   - Bottom garment image (left column)  
   - Model image (middle column)

2. **Generate**: Click "开始生成" to start the sequential try-on process

3. **View Results**: The final result will appear in the right column with:
   - The generated image URL (copyable)
   - Image preview
   - Option to view in new window

## API Reference

This app uses the [FASHN AI Try-On v1.6 API](https://docs.fashn.ai/api-reference/tryon-v1-6) with the following parameters:

- **Model**: `tryon-v1.6`
- **Mode**: `balanced` (8 second processing time)
- **Output**: PNG format
- **Polling**: Automatic status polling until completion

## Technical Details

### Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes for FASHN AI integration
- **Image handling**: Remote image URLs with preview functionality

### API Flow

1. User submits URLs → Frontend validates inputs
2. Frontend calls `/api/tryon` → Backend calls FASHN AI `/v1/run`
3. Backend polls `/v1/status/{id}` → Returns completed result
4. Frontend displays final image URL and preview

### File Structure

```
fashn_tryon4/
├── app/
│   ├── api/tryon/route.ts     # FASHN AI integration
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main try-on interface
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
└── next.config.js             # Next.js config
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FASHN_API_KEY` | Your FASHN AI API key | Yes |

## Error Handling

The app handles common errors:

- **Invalid URLs**: Client-side validation
- **API failures**: Server-side error responses
- **Timeout**: 5-minute maximum wait time
- **Image load errors**: Fallback placeholders

## Deployment

For production deployment:

1. Set environment variables in your deployment platform
2. Ensure all image URLs are publicly accessible
3. Configure proper CORS settings if needed

## Quick Deploy

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/fashn-tryon4&env=FASHN_API_KEY&envDescription=Your%20FASHN%20AI%20API%20Key&envLink=https://docs.fashn.ai/api-reference/tryon-v1-6)

### Manual Deployment

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Set Environment Variables:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project → Settings → Environment Variables
   - Add: `FASHN_API_KEY` = `fa-lt14ddiVbyfI-IGGCvQVge7vDkwjwz5B2uvT0`

5. **Redeploy:**
```bash
vercel --prod
```

Your app will be live at: `https://your-project-name.vercel.app`

## License

This project is for demonstration purposes. Please refer to FASHN AI's terms of service for commercial usage.
