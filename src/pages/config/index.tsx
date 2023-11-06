"use client";
import { Disclosure, Transition } from "@headlessui/react";
import ConfigureUnderwriters from "./ConfigureUnderwriters";
import ConfigureCaseSize from "./ConfigureCaseSize";
import RulesetList from "./RulesetList";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const Config = () => {
  return (
    <div className="grid grid-cols-4 gap-8">
      <div className="col-span-3 shadow-md px-8 py-8 bg-white h-min">
        <RulesetList />
      </div>
      <div className="flex flex-col space-y-8">
        <div className="shadow-md px-8 py-8 bg-white">
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="text-lg text-slate-600 font-semibold mb-2 w-full flex justify-between items-center">
                  <div>Employees</div>
                  <div>
                    {open ? (
                      <ChevronUpIcon className="w-6 h-6" />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6" />
                    )}
                  </div>
                </Disclosure.Button>
                <Transition
                  show={open}
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-y-0 opacity-0"
                  enterTo="transform scale-y-100 opacity-100"
                  leave="transition duration-100 ease-out"
                  leaveFrom="transform scale-y-100 opacity-100"
                  leaveTo="transform scale-y-0 opacity-0"
                >
                  <Disclosure.Panel className="">
                    <ConfigureUnderwriters />
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        </div>

        <div className="shadow-md px-8 py-8 bg-white">
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="text-lg text-slate-600 font-semibold mb-2 w-full flex justify-between items-center">
                  <div>Case Sizes</div>
                  <div>
                    {open ? (
                      <ChevronUpIcon className="w-6 h-6" />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6" />
                    )}
                  </div>
                </Disclosure.Button>
                <Transition
                  show={open}
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-y-0 opacity-0"
                  enterTo="transform scale-y-100 opacity-100"
                  leave="transition duration-100 ease-out"
                  leaveFrom="transform scale-y-100 opacity-100"
                  leaveTo="transform scale-y-0 opacity-0"
                >
                  <Disclosure.Panel className="">
                    <ConfigureCaseSize className="flex justify-center" />
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        </div>
      </div>
    </div>
  );
};

export default Config;
