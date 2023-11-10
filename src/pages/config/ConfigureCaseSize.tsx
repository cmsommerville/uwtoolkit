"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { EligibleMapper } from "../../types/config";
import {
  ArrowUpOnSquareIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { db } from "../../store/local_storage";
import { setCaseSizes } from "../../store/slices/config";
import { KEY_CASE_SIZES } from "../../store/constants";

interface Props {
  className?: string;
}

const ConfigureCaseSize = (props: Props) => {
  const dispatch = useDispatch();
  const case_sizes: EligibleMapper[] = useSelector(
    (state: any) => state.config.case_sizes
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

  const lowerUpperHandler = () => {
    setLocalCaseSizes((prev) => {
      const n = prev
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
          if (ix === prev.length - 1) {
            return {
              ...row,
              lower,
              upper: 10000000,
              key: `${String(lower)}_10000000`,
            };
          }
          // set the current upper to be the next lower
          const upper_str = String(prev[ix + 1].lower).replace(/,/g, "");
          const upper = parseInt(upper_str);
          return {
            ...row,
            lower,
            upper,
            key: `${String(lower)}_${String(upper)}`,
          };
        });

      return n;
    });
  };

  const deleteHandler = (uuid: string) => {
    setLocalCaseSizes((prev) => {
      const new_case_sizes = prev.filter((row) => row.uuid !== uuid);
      if (new_case_sizes.length === 0)
        return prev.map((c) => ({ ...c, lower: null, upper: null }));
      return new_case_sizes;
    });
    lowerUpperHandler();
    setIsPristineState(false);
  };

  const saveHandler = () => {
    db.setItem(KEY_CASE_SIZES, localCaseSizes);
    dispatch(setCaseSizes(localCaseSizes));
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
      <div>
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
                        onBlur={() => lowerUpperHandler()}
                      />
                    </div>
                    <div className="col-span-4 mx-3 flex items-center space-x-2 text-sm">
                      <span>&#8212;</span>
                      <span>
                        {formatNumber(u.upper == null ? null : u.upper - 1)}
                      </span>
                    </div>
                  </div>
                  <div className="h-6 w-6 flex justify-center items-center ">
                    <XCircleIcon
                      className="cursor-pointer hover:text-rose-500 transition duration-100 ease"
                      onClick={() => deleteHandler(u.uuid)}
                    />
                  </div>
                </div>
              );
            })
          : null}
        <hr className="my-3"></hr>
        <div className="flex justify-center mt-4 mb-4 space-x-6">
          <button
            className="rounded-md py-1 px-2 flex items-center bg-transparent text-primary-600 ring-2 ring-primary-600 hover:ring-primary-500 hover:text-primary-500 hover:bg-primary-500/10 transition ease duration-100"
            onClick={addCaseSize}
          >
            <PlusIcon className="w-5 h-5 mr-1" /> Add
          </button>

          <button
            className="rounded-md py-1 px-2 flex items-center bg-primary-500 text-white ring-2 ring-primary-500 hover:ring-primary-600 hover:bg-primary-600 transition ease duration-100"
            onClick={saveHandler}
            disabled={isPristineState}
          >
            <ArrowUpOnSquareIcon className="w-5 h-5 mr-1" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const formatNumber = (val: number | null | undefined) => {
  if (val == null) return "";
  return val.toLocaleString("en-US");
};

export default ConfigureCaseSize;
