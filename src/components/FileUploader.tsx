import { useEffect, useRef, useState } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { db } from "../store/local_storage";
import { KEY_CASE_FILES } from "../store/constants";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  children?: React.ReactNode;
  onSelectFile: (file_list: FileList) => void;
}

const FileUploader = ({
  children,
  className,
  onSelectFile,
  ...props
}: Props) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileList | null | undefined>();

  const resetHandler = () => {
    if (fileInput.current) {
      fileInput.current.value = "";
      fileInput.current.type = "text";
      fileInput.current.type = "file";
    }
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    db.setItem(KEY_CASE_FILES, e.target.files);
    if (!e.target.files) return;
    if (onSelectFile) {
      onSelectFile(e.target.files);
    }
  };

  useEffect(() => {
    const getCaseData = async () => {
      const file_list: FileList | null = await db.getItem(KEY_CASE_FILES);
      if (!file_list) return;
      setFiles(file_list);
    };
    getCaseData();
  }, []);

  return (
    <div className={className}>
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-bray-800 dark:bg-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <CloudArrowUpIcon className="w-8 h-8 mb-4 text-slate-500 dark:text-slate-400" />
            {files && files.length ? (
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                <span>{files[0].name ?? ""}</span>
              </p>
            ) : (
              <>
                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                  <span className="font-semibold">Click to upload</span>{" "}
                  <span>or drag and drop</span>
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  XLS, XLSX, XLSB, or XLSM
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            className="hidden"
            onClick={resetHandler}
            onChange={onChangeHandler}
            {...props}
          />
        </label>
      </div>
    </div>
  );
};

export default FileUploader;
