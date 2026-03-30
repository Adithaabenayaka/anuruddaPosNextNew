"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

interface FilePreviewSectionProps {
  title: string;
  files: {
    name: string;
    url: string;
  }[];
  wrapLayout?: boolean;
  onEdit?: (file: { name: string; url: string }) => void;
  onDelete?: (file: { name: string; url: string }) => void;
  fileTitle?: string;
}

export default function FilePreviewSection({
  title,
  files,
  wrapLayout,
  onEdit,
  onDelete,
  fileTitle,
}: FilePreviewSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold mb-2">{title}</h3>
      <div
        className={wrapLayout ? "flex flex-wrap gap-4" : "flex flex-col gap-4"}
      >
        {files.map((file) => (
          <div
            key={file.name}
            className="flex items-center gap-4 bg-gray-200 px-4 py-2 shadow-sm rounded-md"
          >
            <span className="text-sm font-medium truncate max-w-[180px]">
              {fileTitle ? fileTitle : file.name}
            </span>

            <div className="flex items-center gap-3 ml-auto">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-800"
                title="View File"
              >
                <Eye size={18} />
              </a>

              {onEdit && (
                <button
                  onClick={() => onEdit(file)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit File"
                >
                  <Pencil size={18} />
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(file)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete File"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
