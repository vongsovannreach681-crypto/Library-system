import React from 'react'

const LoadingState = () => {
  return (
    <div>
         <div className=" m-auto p-5 card flex flex-col items-center justify-center gap-3 bg-background">
          <p className="text-lg font-medium  text-primary font-primary">
            កំពុងទាញយកសៀវភៅ...
          </p>
          <p className="text-lg font-medium text-primary font-primary">
            សូមធ្វើការរង់ចាំ
          </p>
          <img
            className="w-[150px]"
            src="https://i.sstatic.net/kOnzy.gif"
            alt="Loading"
          />
        </div>
    </div>
  )
}

export default LoadingState