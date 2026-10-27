import { supabase } from "./supabase";

/**
 * Uploads a file to Supabase Storage in the specified folder of the 'images' bucket.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImageToSupabase(
  file: File,
  folder: "products" | "banners" | "categories" = "products",
): Promise<string> {
  // Generate a clean, unique file path
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileExt = sanitizedName.split(".").pop() || "jpg";
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const filePath = `${folder}/${uniqueId}.${fileExt}`;

  const { data, error } = await supabase.storage.from("images").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(data.path);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error("Failed to retrieve public URL from Supabase Storage.");
  }

  return publicUrlData.publicUrl;
}

// import { supabase } from "./supabase";

// /**
//  * Compresses an image file in the browser using HTML5 Canvas.
//  * - Resizes images exceeding maxDimension (default 1200px) maintaining aspect ratio.
//  * - Converts to optimized WebP format (or JPEG fallback) at 0.82 quality.
//  * - Drastically shrinks 5MB-10MB camera/phone photos to ~80KB-150KB while keeping high visual clarity.
//  */
// export async function compressImage(
//   file: File,
//   maxDimension = 1200,
//   quality = 0.82
// ): Promise<File> {
//   // If not an image (e.g. SVG), return original
//   if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
//     return file;
//   }

//   return new Promise((resolve) => {
//     const img = new Image();
//     const objectUrl = URL.createObjectURL(file);

//     img.onload = () => {
//       URL.revokeObjectURL(objectUrl);

//       let { width, height } = img;

//       // Calculate new dimensions maintaining aspect ratio
//       if (width > maxDimension || height > maxDimension) {
//         if (width > height) {
//           height = Math.round((height * maxDimension) / width);
//           width = maxDimension;
//         } else {
//           width = Math.round((width * maxDimension) / height);
//           height = maxDimension;
//         }
//       }

//       const canvas = document.createElement("canvas");
//       canvas.width = width;
//       canvas.height = height;

//       const ctx = canvas.getContext("2d");
//       if (!ctx) {
//         resolve(file); // Fallback to original if canvas context unavailable
//         return;
//       }

//       // Smooth resizing
//       ctx.imageSmoothingEnabled = true;
//       ctx.imageSmoothingQuality = "high";
//       ctx.drawImage(img, 0, 0, width, height);

//       // Determine optimal output format (WebP is widely supported & highly compressed)
//       const outputType = "image/webp";
//       const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
//       const newFileName = `${fileNameWithoutExt}.webp`;

//       canvas.toBlob(
//         (blob) => {
//           if (!blob) {
//             resolve(file);
//             return;
//           }

//           // If compressed blob is somehow larger than original, use original
//           if (blob.size >= file.size) {
//             resolve(file);
//             return;
//           }

//           const compressedFile = new File([blob], newFileName, {
//             type: outputType,
//             lastModified: Date.now(),
//           });

//           resolve(compressedFile);
//         },
//         outputType,
//         quality
//       );
//     };

//     img.onerror = () => {
//       URL.revokeObjectURL(objectUrl);
//       resolve(file); // Fallback to original on error
//     };

//     img.src = objectUrl;
//   });
// }

// /**
//  * Automatically compresses and uploads an image to Supabase Storage.
//  * Returns the public CDN URL of the uploaded image.
//  */
// export async function uploadImageToSupabase(
//   file: File,
//   folder: "products" | "banners" | "categories" = "products"
// ): Promise<string> {
//   // 1. Compress image client-side before sending across the wire
//   const fileToUpload = await compressImage(file);

//   // 2. Generate clean, unique filename
//   const sanitizedName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, "_");
//   const fileExt = sanitizedName.split(".").pop() || "webp";
//   const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
//   const filePath = `${folder}/${uniqueId}.${fileExt}`;

//   // 3. Upload to Supabase Storage
//   const { data, error } = await supabase.storage
//     .from("images")
//     .upload(filePath, fileToUpload, {
//       cacheControl: "31536000", // 1 year browser cache
//       upsert: false,
//       contentType: fileToUpload.type || "image/webp",
//     });

//   if (error) {
//     throw new Error(`Upload failed: ${error.message}`);
//   }

//   // 4. Retrieve public URL
//   const { data: publicUrlData } = supabase.storage
//     .from("images")
//     .getPublicUrl(data.path);

//   if (!publicUrlData || !publicUrlData.publicUrl) {
//     throw new Error("Failed to retrieve public URL from Supabase Storage.");
//   }

//   return publicUrlData.publicUrl;
// }
