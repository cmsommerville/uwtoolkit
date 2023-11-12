"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { Underwriter } from "../../types/data";
import {
  ArrowUpOnSquareIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { setUnderwriters, calcRuleAppliedData } from "../../store/slices/data";
import { KEY_UNDERWRITERS } from "../../store/constants";
import { db } from "../../store/local_storage";
import "./ConfigureUnderwriters.css";

const ConfigureUnderwriters = () => {
  const dispatch = useDispatch();
  const underwriters: Underwriter[] = useSelector(
    (state: any) => state.data.underwriters
  );
  const [localUnderwriters, setLocalUnderwriters] = useState<Underwriter[]>([]);

  const addUnderwriter = () => {
    setLocalUnderwriters((prev) => {
      return [
        ...prev,
        { uuid: uuid(), name: "", color: "#dddddd", type: "underwriter" },
      ];
    });
  };

  const changeHandler = (ix: number, key: keyof Underwriter, value: string) => {
    setLocalUnderwriters((prev) => {
      return [
        ...prev.slice(0, ix),
        { ...prev.slice(ix)[0], [key]: value },
        ...prev.slice(ix + 1, prev.length + 1),
      ];
    });
  };

  const deleteHandler = (uuid: string) => {
    setLocalUnderwriters((prev) => {
      const new_uws = prev.filter((u) => u.uuid !== uuid);
      if (new_uws.length === 0)
        return prev.map((uw) => ({ ...uw, name: "", type: "underwriter" }));
      return new_uws;
    });
  };

  const saveHandler = () => {
    db.setItem(KEY_UNDERWRITERS, localUnderwriters);
    dispatch(setUnderwriters(localUnderwriters));
    dispatch(calcRuleAppliedData({ underwriters: localUnderwriters }));
  };

  useEffect(() => {
    if (underwriters && underwriters.length > 0) {
      setLocalUnderwriters([...underwriters.map((u) => ({ ...u }))]);
    } else {
      setLocalUnderwriters([
        {
          uuid: uuid() as string,
          name: "",
          color: "#dddddd",
          type: "underwriter",
        },
      ]);
    }
  }, [underwriters]);
  return (
    <>
      <div className="text-xs text-slate-600 mb-4">
        Check the checkbox if an Underwriter. Uncheck if part of Underwriting
        Support!
      </div>
      {localUnderwriters && localUnderwriters.length
        ? localUnderwriters.map((u, ix) => {
            return (
              <div key={u.uuid} className="flex items-center space-x-2">
                <div className="my-1 relative w-full ">
                  <input
                    type="input"
                    className="block w-full rounded-md border-0 pl-4 pr-10 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    placeholder="e.g. Sally"
                    value={u.name}
                    onChange={(e) => changeHandler(ix, "name", e.target.value)}
                  />

                  <input
                    type="color"
                    className="input-color-rounded absolute inset-y-0 bg-transparent right-1 flex items-center cursor-pointer"
                    value={u.color}
                    onChange={(e) => changeHandler(ix, "color", e.target.value)}
                  />
                </div>
                <div className="flex h-6 items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 mx-3 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    checked={u.type === "underwriter"}
                    onChange={() => {
                      const newType =
                        u.type === "underwriter" ? "support" : "underwriter";
                      changeHandler(ix, "type", newType);
                    }}
                  />
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
          onClick={addUnderwriter}
        >
          <PlusIcon className="w-5 h-5 mr-1" /> Add
        </button>
        <button
          className="rounded-md py-1 px-2 flex items-center bg-primary-500 text-white ring-2 ring-primary-500 hover:ring-primary-600 hover:bg-primary-600 transition ease duration-100"
          onClick={saveHandler}
        >
          <ArrowUpOnSquareIcon className="w-5 h-5 mr-1" />
          Save
        </button>
      </div>
    </>
  );
};

export default ConfigureUnderwriters;
