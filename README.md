# 🖼️ IMAGE GROUND

A modern, interactive image gallery built with Next.js, featuring 3D card effects, seamless image uploads, and responsive design. Experience your photos with stunning visual effects and intuitive navigation.

![Next.js](https://img.shields.io/badge/Next.js-13+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)
![Cloudinary](https://img.shields.io/badge/Cloudinary-blue?style=for-the-badge&logo=cloudinary)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 **Core Functionality**
- **📤 Drag & Drop Upload**: Easy image uploading with real-time progress indicators
- **🖼️ Dynamic Gallery**: Responsive masonry layout that adapts to any screen size
- **🔍 Full-Screen Modal**: Immersive viewing experience with smooth transitions
- **🎠 Carousel Navigation**: Browse through images with intuitive prev/next controls

### 🎨 **Visual Experience**
- **🎭 3D Card Effects**: Interactive hover effects that bring your gallery to life
- **✨ Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **📱 Responsive Design**: Perfect viewing experience across all devices
- **🌙 Modern UI**: Clean, contemporary interface with backdrop blur effects

### 🚀 **Performance & UX**
- **⚡ Fast Loading**: Optimized images with automatic blur placeholders
- **📊 Loading States**: Visual feedback during uploads and image loading
- **🛡️ Error Handling**: Graceful error recovery with retry options
- **🔄 Real-time Updates**: Instantly see uploaded images without page refresh

## 🛠️ Tech Stack

- **Framework**: [Next.js 13+](https://nextjs.org/) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth animations
- **Image Management**: [Cloudinary](https://cloudinary.com/) for cloud storage and optimization
- **UI Components**: Custom 3D card components with interactive effects
- **File Handling**: Built-in drag & drop with FileReader API

## 📁 Project Structure

```
with-cloudinary-app/
├── components/
│   ├── CardContainer.tsx      # 3D card wrapper component
│   ├── Modal.tsx              # Main modal controller
│   ├── SharedModal.tsx        # Modal content with carousel
│   └── Icons/                 # SVG icon components
├── pages/
│   ├── index.tsx              # Main gallery page
│   ├── api/
│   │   └── upload.ts          # Image upload API endpoint
│   └── p/
│       └── [photoId].tsx      # Dynamic photo page routing
├── utils/
│   ├── cloudinary.ts          # Cloudinary configuration
│   ├── types.ts               # TypeScript type definitions
│   └── animationVariants.ts   # Framer Motion animations
└── styles/
    └── index.css              # Global styles and Tailwind imports
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A [Cloudinary](https://cloudinary.com/) account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd with-cloudinary-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_FOLDER=your_folder_name
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### 📤 **Uploading Images**
1. Click the **"+"** upload card (always positioned first in the gallery)
2. Select an image file (JPG, PNG, GIF, etc.)
3. Watch the upload progress with real-time feedback
4. Your image appears instantly at the front of the gallery

### 🖼️ **Viewing Images**
- **Gallery View**: Hover over cards to see 3D tilt effects
- **Full Screen**: Click any image to open in modal view
- **Navigation**: Use arrow keys or click prev/next buttons
- **Carousel**: Navigate through thumbnails at the bottom

### 📱 **Mobile Experience**
- Touch and swipe gestures for navigation
- Responsive layout adapts to screen size
- Optimized image loading for mobile networks

## 🎨 Customization

### **Styling**
- Modify colors and effects in `tailwind.config.js`
- Update 3D effects in `components/CardContainer.tsx`
- Customize animations in `utils/animationVariants.ts`

### **Upload Settings**
- Adjust file size limits in `pages/api/upload.ts`
- Modify accepted file types in upload validation
- Customize upload progress messages

### **Layout**
- Change masonry columns in the gallery grid classes
- Adjust card dimensions and spacing
- Modify modal and carousel layouts

## 🔧 Configuration

### **Cloudinary Setup**
1. Create a free account at [cloudinary.com](https://cloudinary.com/)
2. Get your Cloud Name from the dashboard
3. Generate API credentials in Settings → API Keys
4. Create a folder for your gallery images
5. Add credentials to your `.env.local` file

### **Build Configuration**
- Next.js configuration in `next.config.js`
- TypeScript settings in `tsconfig.json`
- PostCSS and Tailwind in respective config files

## 📊 Performance Features

- **Image Optimization**: Automatic compression and format conversion
- **Lazy Loading**: Images load as they come into view
- **CDN Delivery**: Global content delivery via Cloudinary
- **Blur Placeholders**: Smooth loading experience
- **Caching**: Browser and CDN caching for faster loads

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙋‍♂️ Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the [Next.js documentation](https://nextjs.org/docs)
- Visit [Cloudinary documentation](https://cloudinary.com/documentation)

---

**Built with ❤️ using Next.js and modern web technologies**
