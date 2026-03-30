"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface FileData {
  name: string;
  url: string;
}

interface EditableFilePreviewProps {
  title: string;
  files: FileData[];
  onReplace: (index: number, file: File) => void;
  onDelete: (index: number) => void;
  wrapLayout?: boolean;
  fileTitle?: string;
}

export default function EditableFilePreview({
  title,
  files,
  onReplace,
  onDelete,
  wrapLayout,
  fileTitle,
}: EditableFilePreviewProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleEditClick = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const handleFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      onReplace(index, file);
    }
  };

  useEffect(() => {
    if (deleteIndex !== null) {
      document.body.classList.add("overflow-hidden");
      document.documentElement.classList.add("overflow-hidden");
      document.body.style.overflowY = "hidden";
    } else {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
      document.body.style.overflowY = "";
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
      document.body.style.overflowY = "";
    };
  }, [deleteIndex]);

  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold mb-2">{title}</h3>
      <div
        className={wrapLayout ? "flex flex-wrap gap-4" : "flex flex-col gap-4"}
      >
        {files.map((file, index) => (
          <React.Fragment key={file.name || index}>
            <div className="flex items-center gap-4 bg-gray-200 px-4 py-2 shadow-sm rounded-md">
              <span className="text-sm font-medium truncate max-w-[180px]">
                {fileTitle ? fileTitle : file.name.replace(/([A-Z])/g, " $1")}
              </span>

              <div className="flex items-center gap-3 ml-auto">
                {/* View */}
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800"
                  title="View File"
                >
                  <Eye size={18} />
                </a>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => handleEditClick(index)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Replace File"
                >
                  <Pencil size={18} />
                </button>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  ref={(el) => {
                    fileInputRefs.current[index] = el;
                  }}
                  onChange={(e) => handleFileChange(index, e)}
                />

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => setDeleteIndex(index)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete File"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {deleteIndex !== null && files[deleteIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-plus-sans backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Confirm Deletion
            </h2>
            <p className="text-gray-800 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {fileTitle ? fileTitle : files[deleteIndex].name}
              </span>
              ?
            </p>
            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setDeleteIndex(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteIndex);
                  setDeleteIndex(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
