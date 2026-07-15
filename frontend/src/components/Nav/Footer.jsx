import React from "react";
import { Link } from "react-router-dom";
import logoLight from "../../assets/Logo.png";
import logoDark from "../../assets/NobgLogo.png";
import LibreWork from "./LibreWork";

const bookCategoriesCol1 = [
  "អក្សសិល្ប៍ខ្មែរ",
  "គិណិតវិទ្យា",
  "កម្សាន្ត",
  "កីឡា",
  "លំហាត់",
  "សៀវភៅដែលចែករំលែក",
];

const bookCategoriesCol2 = [
  "ចូលរូមចែករំលែក",
  "ចុះឈ្មោះចូល",
  "Upload សៀវភៅ",
  "អភិវឌ្ឍន៍កម្មវិធី",
  "ការជួយខ្លួនឯង",
];

const sitemapLinks = [
  { label: "ទំព័រដើម", to: "/" },
  { label: "ប្លុកវេទការ", to: "/" },
  { label: "បណ្ណាល័យ", to: "/library" },
  { label: "មេរៀន", to: "/favorites" },
  { label: "អំពីយើង", to: "/about" },
];

const socialLinks = [
  { icon: "fa-telegram", label: "Telegram" },
  { icon: "fa-facebook", label: "Facebook" },
  { icon: "fa-github", label: "GitHub" },
];

const Footer = () => {
  return (
    <>
      <LibreWork />
      <footer className="border-t border-white/10 bg-pure-white text-text-black dark:bg-slate-900">
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-3">
              <Link to="/" className="block">
                <img
                  src={logoLight}
                  className="mx-auto w-36 dark:hidden"
                  alt="LibreShelf"
                />
                <img
                  src={logoDark}
                  className="mx-auto hidden w-36 dark:block"
                  alt="LibreShelf"
                />
              </Link>

              <p className="mx-auto mt-4 max-w-xs text-center font-primary text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                បណ្ណាល័យឌីជីថលសម្រាប់អ្នកអានគ្រប់រូប។ រកសៀវភៅថ្មីៗ
                រក្សាទុកចូលចិត្ត និងរីករាយជាមួយបទពិសោធន៍អានដែលស្អាត និងងាយស្រួល។
              </p>

              <div className="mt-5 flex justify-center gap-2">
                {socialLinks.map(({ icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-primary transition-all duration-300 hover:bg-secondary hover:text-pure-white dark:text-pure-white"
                  >
                    <i className={`fa-brands ${icon} text-xl`} />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 flex lg:justify-center">
              <div className="w-full max-w-md">
                <h3 className="mb-8 inline-block border-b border-secondary/30 pb-2 font-primary text-lg font-bold uppercase tracking-wider text-primary dark:text-pure-white">
                  ប្រភេទសៀវភៅ
                </h3>

                <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm text-dark-gray dark:text-gray-400">
                  <div className="flex flex-col space-y-3">
                    {bookCategoriesCol1.map((label) => (
                      <span
                        key={label}
                        className="group flex items-center gap-2 font-primary transition-colors hover:text-secondary"
                      >
                        <i className="ph-bold ph-caret-right text-secondary opacity-0 transition-opacity group-hover:opacity-100" />
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col space-y-3">
                    {bookCategoriesCol2.map((label) => (
                      <span
                        key={label}
                        className="group flex items-center gap-2 font-primary transition-colors hover:text-secondary"
                      >
                        <i className="ph-bold ph-caret-right text-secondary opacity-0 transition-opacity group-hover:opacity-100" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:col-span-3 lg:items-end">
              <div className="w-full text-center lg:w-auto lg:text-right">
                <h3 className="mb-8 inline-block border-b border-secondary/30 pb-2 font-primary text-lg font-bold uppercase tracking-wider text-primary dark:text-pure-white">
                  គេហទំព័ររបស់យើង
                </h3>

                <ul className="space-y-4 text-sm text-dark-gray dark:text-gray-400">
                  {sitemapLinks.map(({ label, to }) => (
                    <li key={label}>
                      <Link
                        to={to}
                        className="font-primary transition-colors hover:text-secondary"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center border-t border-white/10 pt-6 text-center"></div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
