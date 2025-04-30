"use client"

import { useState, useRef } from "react";
import { FiUpload, FiX } from "react-icons/fi";

const ImageUploader = ({ onImageSelect }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageSelect(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageSelect(null);
  };

  return (
    <div className="mb-6">
      <div className="dropzone">
        {!preview ? (
          <>
            <label htmlFor="image-upload" className="cursor-pointer">
              <FiUpload className="mx-auto text-[#FF6F61] text-3xl mb-2" />
              <p className="text-[#212121] font-medium">Drag & drop or click to upload an image</p>
              <p className="text-sm text-[#757575]">Supported formats: JPG, PNG</p>
            </label>
            <input
              id="image-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="rounded-lg max-w-full h-auto"
              style={{ maxHeight: "400px" }}
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1 bg-[#FF6F61] text-white rounded-full hover:bg-[#1E88E5]"
            >
              <FiX size={20} />
            </button>
          </div>
        )}
      </div>
      {preview && (
        <div className="flex items-center justify-center mt-4 animate-zoom-in">
          <div className="bg-[#E3F2FD] rounded-lg p-2 flex items-center">
            <img
              src={preview}
              alt="Selected"
              className="w-16 h-16 object-cover rounded-md mr-2"
            />
            <span className="text-[#212121] text-sm">
              {fileInputRef.current?.files[0]?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;