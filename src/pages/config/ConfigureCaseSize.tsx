"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { EligibleMapper } from "../../types/data";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { db } from "../../store/local_storage";
import { setCaseSizes, calcRuleAppliedData } from "../../store/slices/data";
import { KEY_CASE_SIZES } from "../../store/constants";
import { flushSync } from "react-dom";

interface Props {
  className?: string;
  onChange: (case_sizes: EligibleMapper[]) => void;
}

const ConfigureCaseSize = ({ onChange, ...props }: Props) => {
  const dispatch = useDispatch();
  const case_sizes: EligibleMapper[] = useSelector(
    (state: any) => state.data.case_sizes
  );
  const [localCaseSizes, setLocalCaseSizes] = useState<EligibleMapper[]>([]);
  const [isPristineState, setIsPristineState] = useState(true);

  const addCaseSize = () => {
    setLocalCaseSizes((prev) => {
      return [...prev, { uuid: uuid(), key: "", lower: null, upper: null }];
    });
    setIsPristineState(false);
  };

  const changeHandler = (
    ix: number,
    key: keyof EligibleMapper,
    value: string
  ) => {
    setLocalCaseSizes((prev) => {
      return [
        ...prev.slice(0, ix),
        {
          ...prev.slice(ix)[0],
          [key]: value,
        },
        ...prev.slice(ix + 1, prev.length + 1),
      ];
    });
    setIsPristineState(false);
  };

  const onBlurHandler = () => {
    const updated_case_sizes = lowerUpperHandler(localCaseSizes);
    setLocalCaseSizes(updated_case_sizes);
    onChange(updated_case_sizes);
  };

  const deleteHandler = (uuid: string) => {
    const new_case_sizes = lowerUpperHandler(
      localCaseSizes.filter((row) => row.uuid !== uuid)
    );
    setLocalCaseSizes(new_case_sizes);
    onChange(new_case_sizes);
    setIsPristineState(false);
  };

  useEffect(() => {
    if (case_sizes && case_sizes.length > 0) {
      setLocalCaseSizes([...case_sizes.map((x) => ({ ...x }))]);
    } else {
      setLocalCaseSizes([{ uuid: uuid(), key: "", lower: null, upper: null }]);
    }
  }, [case_sizes]);

  return (
    <div className={props.className ?? ""}>
      <div className="flex flex-col items-start">
        {localCaseSizes && localCaseSizes.length
          ? localCaseSizes.map((u, ix) => {
              return (
                <div
                  key={u.uuid}
                  className="flex items-center justify-between space-x-2"
                >
                  <div className="grid grid-cols-7 my-1 relative w-5/6">
                    <div className="col-span-3">
                      <input
                        type="input"
                        id={`lower-${u.uuid}`}
                        className="w-20 text-right block w-full rounded-md border-0 px-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={formatNumber(u.lower)}
                        placeholder={`${ix * 1000}`}
                        onChange={(e) =>
                          changeHandler(ix, "lower", e.target.value)
                        }
                        onBlur={onBlurHandler}
                      />
                    </div>
                    <div className="col-span-4 mx-3 flex items-center space-x-2 text-sm">
                      <span>&#8212;</span>
                      <span>
                        {formatNumber(u.upper == null ? null : u.upper - 1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center items-end space-x-1 text-primary-500">
                    {ix === localCaseSizes.length - 1 ? (
                      <button
                        className="h-5 w-5 rounded-full p-0.5 cursor-pointer bg-primary-500 border border-primary-500 text-white hover:bg-primary-600 hover:border-primary-600 transition duration-100 ease"
                        onClick={addCaseSize}
                      >
                        <PlusIcon className="" />
                      </button>
                    ) : null}
                    <button className="h-5 w-5 rounded-full p-0.5 cursor-pointer bg-transparent border border-slate-500 text-slate-500 hover:text-rose-500 hover:border-rose-500 transition duration-100 ease">
                      <XMarkIcon onClick={() => deleteHandler(u.uuid)} />
                    </button>
                  </div>
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
};

const lowerUpperHandler = (case_sizes: EligibleMapper[]) => {
  const x = case_sizes
    .sort((a, b) => {
      if (a.lower == null) return 1;
      if (b.lower == null) return 1;
      return a.lower < b.lower ? -1 : 1;
    })
    .map((row, ix) => {
      const lower_str = String(row.lower);
      if (isNaN(parseInt(lower_str))) {
        return { ...row, lower: null, upper: null, key: "" };
      }
      const lower = parseInt(lower_str.replace(/,/g, ""));
      if (ix === case_sizes.length - 1) {
        return {
          ...row,
          lower,
          upper: 10000000,
          key: `${String(lower)}_10000000`,
        };
      }
      // set the current upper to be the next lower
      const upper_str = String(case_sizes[ix + 1].lower).replace(/,/g, "");
      const upper = parseInt(upper_str);
      return {
        ...row,
        lower,
        upper,
        key: `${String(lower)}_${String(upper)}`,
      };
    });
  console.log(x);
  return x;
};

const formatNumber = (val: number | null | undefined) => {
  if (val == null) return "";
  return val.toLocaleString("en-US");
};

export default ConfigureCaseSize;
