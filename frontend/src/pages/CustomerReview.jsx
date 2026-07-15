import React from "react";
import me from "../assets/me44.jpg";
const CustomerReview = () => {
  return (
    <div className='px-4 py-10 sm:px-6 lg:px-12"'>
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 w-full max-w-md">
          <h2 className="font-primary text-2xl font-semibold text-primary dark:text-white sm:text-3xl">
            ជួបជាមួយអ្នកបង្តើត
          </h2>
          <hr className="my-2 w-55 h-1 border-0 bg-primary dark:bg-accent" />
        </div>
        <section className="flex flex-wrap gap-20">
          <div className="text-center w-[25%]">
            <img className="w-[350px] rounded" src={me} alt="" />
            <h3 className="font-primary pt-5 font-semibold text-2xl text-primary dark:text-white ">
              និស្សិត វង សុវណ្ណរាជ
            </h3>
          </div>
          <div className=" w-[50%]">
            <h3 className="text-primary font-primary text-3xl font-semibold dark:text-white">
              ស្វាគមន៍មកកាន់បណ្ណាល័យសៀវភៅ
            </h3>
            <p className="text-primary pt-3 font-primary text-xl dark:text-gray-100">
              <span className="pl-2"></span> សួស្តី!ខ្ញុំឈ្មោះ វង សុវណ្ណរាជ ជាស្ថាបនិក
              និងជាអ្នកអភិវឌ្ឍន៍គេហទំព័រនេះឡើង។
              ក្នុងនាមជានិស្សិតផ្នែកបច្ចេកវិទ្យា
              ខ្ញុំបានបង្កើតបណ្ណាល័យឌីជីថលនេះឡើងក្នុងគោលបំណងចែករំលែកសៀវភៅល្អៗ
              និងលើកកម្ពស់ការអានក្នុងចំណោមយុវជនកម្ពុជា។
              ទីនេះគឺជាកន្លែងប្រមូលផ្តុំទៅដោយចំណេះដឹង គំនិតច្នៃប្រឌិត
              និងការបំផុសគំនិតថ្មីៗតាមរយៈសៀវភៅល្អៗជាច្រើនប្រភេទ។ យើងជឿជាក់ថា
              «ការអានគឺជាសោរគន្លឹះក្នុងការបើកទ្វារទៅកាន់ពិភពលោកដ៏ធំទូលាយ»។
              ចូលរួមជាមួយពួកយើងក្នុងការកសាងទម្លាប់នៃការអាន
              និងស្វែងរកសៀវភៅដែលអ្នកស្រឡាញ់នៅទីនេះ! <br />
              <span className="pl-2"> </span> សង្ឃឹមថាគេហទំព័រមួយនេះ
              នឹងក្លាយជាចំណែកមួយជួយសម្រួលដល់ការសិក្សាស្រាវជ្រាវ
              និងការកម្សាន្តរបស់មិត្តអ្នកអានទាំងអស់គ្នា។
            </p>
            <button className="text-white
            bg-primary dark:text-primary dark:bg-white font-primary px-3 py-2 font-semibold text-xl mt-5 rounded hover:bg-accent hover:text-white cursor-pointer">
                ទំនាក់ទនង
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerReview;
