
y# FASHN AI Virtual Try-On App

A Next.js + TypeScript application that provides virtual try-on functionality using the FASHN AI Try-On v1.6 API.

## Features

- **Three-column layout**: Separate inputs for top garment, bottom garment, and model images
- **File Upload Support**: 
  - Local file upload via drag-and-drop or click to browse
  - Automatic upload to Vercel Blob storage
  - Generates public URLs for API consumption
  - Support for JPG, PNG, WebP formats (max 10MB)
- **Sequential try-on process**: 
  1. Applies top garment to model
  2. Applies bottom garment to the intermediate result
- **Real-time image previews** for all input URLs and uploaded files
- **Upload progress indicators** with visual feedback
- **Modern UI** with Tailwind CSS styling
- **Error handling** and loading states

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

Edit `.env.local` and add your API keys:

```
FASHN_API_KEY=your_actual_api_key_here
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

**Getting your API keys:**
- **FASHN API Key**: Get it from the [FASHN AI Dashboard](https://docs.fashn.ai/api-reference/tryon-v1-6)
- **Vercel Blob Token**: 
  1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
  2. Select your project → Storage → Create Database → Blob
  3. Copy the `BLOB_READ_WRITE_TOKEN` from the connection string

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3456](http://localhost:3456) in your browser.

## Usage

### Option 1: Upload Local Files
1. **Upload Images**: Drag and drop or click to browse for:
   - Top garment image (left column)
   - Bottom garment image (left column)  
   - Model image (middle column)
2. **Automatic Processing**: Files are automatically uploaded to Vercel Blob and URLs are generated
3. **Progress Tracking**: Watch upload progress with visual indicators

### Option 2: Use Image URLs
1. **Input URLs**: Enter public URLs directly in the text fields for:
   - Top garment image (left column)
   - Bottom garment image (left column)  
   - Model image (middle column)

### Generate Results
1. **Generate**: Click "开始生成" to start the sequential try-on process
2. **View Results**: The final result will appear in the right column with:
   - The generated image URL (copyable)
   - Image preview
   - Option to view in new window
   - Download button

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
│   ├── api/
│   │   ├── tryon/route.ts     # FASHN AI integration
│   │   └── upload/route.ts    # File upload to Vercel Blob
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main try-on interface with upload
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
└── next.config.js             # Next.js config
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FASHN_API_KEY` | Your FASHN AI API key | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token | Yes (for file uploads) |

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

## 🚀 Quick Deploy

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
