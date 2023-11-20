import { Fragment, useEffect, useState, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useSelector, useDispatch } from "react-redux";
import { DateTime } from "luxon";
import { Cog6ToothIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ConfigureCaseSize from "./ConfigureCaseSize";
import { db } from "../../store/local_storage";
import { setCaseSizes, calcRuleAppliedData } from "../../store/slices/data";
import { KEY_CASE_SIZES } from "../../store/constants";
import { EligibleMapper } from "../../types/data";

interface ConfigSlideoverProps {
  className?: string;
  open?: boolean | null | undefined;
}

export default function ConfigSlideover(props: ConfigSlideoverProps) {
  const dispatch = useDispatch();
  const quotes = useSelector((state: any) => state.data.quotes);
  const [open, setOpen] = useState(false);
  const [localMinDate, setLocalMinDate] = useState<DateTime>();
  const [localMaxDate, setLocalMaxDate] = useState<DateTime>();

  const saveCaseSizes = useCallback(
    (case_sizes: EligibleMapper[]) => {
      db.setItem(KEY_CASE_SIZES, case_sizes);
      dispatch(setCaseSizes(case_sizes));
      dispatch(calcRuleAppliedData({ case_sizes: case_sizes }));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!open) return;

    const min_dt = quotes.reduce((prev: DateTime, curr: any) => {
      const dt: DateTime = DateTime.fromISO(curr.received_date);
      return prev < dt ? prev : dt;
    }, DateTime.fromISO("9999-12-31"));

    const max_dt = quotes.reduce((prev: DateTime, curr: any) => {
      const dt: DateTime = DateTime.fromISO(curr.received_date);
      return prev > dt ? prev : dt;
    }, DateTime.fromISO("1900-01-01"));

    setLocalMinDate(min_dt);
    setLocalMaxDate(max_dt);
  }, [quotes, open]);

  useEffect(() => {
    if (props.open != null) {
      setOpen(props.open);
    }
  }, [props.open]);

  return (
    <>
      <Cog6ToothIcon
        className={`cursor-pointer ${props.className ?? ""}`}
        onClick={() => setOpen(true)}
      />
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <div className="fixed inset-0" />

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-sm">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Configure
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => setOpen(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 flex-col px-4 sm:px-6 space-y-8">
                        {/* <div className="flex space-x-4">
                          <div>
                            <label
                              htmlFor="min-dt"
                              className="block text-sm font-medium leading-6 text-slate-900"
                            >
                              Received Date Range
                            </label>
                            <input
                              type="date"
                              id="min-dt"
                              className="block rounded-md border-0 px-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={
                                localMinDate
                                  ? localMinDate.toISODate() ?? ""
                                  : ""
                              }
                              onChange={(e) =>
                                setLocalMinDate(
                                  DateTime.fromISO(e.target.value)
                                )
                              }
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="min-dt"
                              className="block text-sm font-medium leading-6 invisible"
                            >
                              Hidden text
                            </label>
                            <input
                              type="date"
                              id="max-dt"
                              value={
                                localMaxDate
                                  ? localMaxDate.toISODate() ?? ""
                                  : ""
                              }
                              className="block rounded-md border-0 px-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              onChange={(e) =>
                                setLocalMaxDate(
                                  DateTime.fromISO(e.target.value)
                                )
                              }
                            />
                          </div>
                        </div>
                        <hr /> */}
                        <div className="w-3/4">
                          <span className="text-sm">Case Sizes</span>
                          <ConfigureCaseSize
                            className="w-full"
                            onChange={saveCaseSizes}
                          />
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
