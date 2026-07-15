import React from "react";

const LoadingState = () => {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-12">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="font-primary text-lg font-medium text-primary dark:text-white">
            កំពុងទាញយកសៀវភៅ...
          </p>
          <p className="font-primary text-lg font-medium text-primary dark:text-white">
            សូមរង់ចាំ
          </p>
          <img
            className="w-[150px]"
            src="https://i.sstatic.net/kOnzy.gif"
            alt="Loading"
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
