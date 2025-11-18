import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.svg" />
          <meta
            name="description"
            content="IMAGE GROUND - A modern, interactive image gallery with 3D effects, seamless uploads, and stunning visual experiences. Explore your photos like never before."
          />
          <meta property="og:site_name" content="IMAGE GROUND" />
          <meta
            property="og:description"
            content="Modern image gallery with 3D card effects, drag & drop uploads, and immersive viewing experience."
          />
          <meta property="og:title" content="IMAGE GROUND - Modern Image Gallery" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="IMAGE GROUND - Interactive Gallery" />
          <meta
            name="twitter:description"
            content="Experience your photos with stunning 3D effects and seamless navigation in this modern gallery."
          />
          <meta name="keywords" content="image gallery, photo gallery, 3D effects, image upload, modern gallery, interactive gallery" />
          <meta name="author" content="IMAGE GROUND" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <body className="bg-black antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
