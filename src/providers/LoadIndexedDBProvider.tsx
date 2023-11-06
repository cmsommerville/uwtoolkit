"use client";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import { db } from "../store/local_storage";
import ResumeOrRestart from "../components/ResumeOrRestart";

import { parseExcelFile } from "../handlers/upload_file";
import { CASE_DATA_COLUMN_MAPPER } from "../config";
import { newBrokerAnalyzer } from "../handlers/broker_handlers";

import { saveRulesets } from "../store/slices/rulesets";
import { setQuoteData } from "../store/slices/quotes";
import {
  setBrokers,
  setCaseSizes,
  setUnderwriters,
} from "../store/slices/config";
import { setRuleAppliedData } from "../store/slices/derived_data";
import {
  KEY_ASSIGNMENTS,
  KEY_RULESETS,
  KEY_BROKER_LIST,
  KEY_CASE_FILES,
  KEY_CASE_SIZES,
  KEY_UNDERWRITERS,
} from "../store/constants";

import { BrokerType, RulesetType } from "../types/rulesets";
import { QuoteDataInterface } from "../types/upload_file";
import { EligibleMapper, Underwriter } from "../types/config";

const fileListHandler = async (
  file_list: FileList,
  dispatch: Dispatch<AnyAction>
) => {
  const data = await parseExcelFile(file_list, CASE_DATA_COLUMN_MAPPER);
  const old_brokers: BrokerType[] | null = await db.getItem(KEY_BROKER_LIST);

  const brokers_analyzed = newBrokerAnalyzer(data, old_brokers);
  db.setItem(KEY_BROKER_LIST, brokers_analyzed);

  dispatch(setQuoteData(data));
  dispatch(setBrokers(brokers_analyzed));
  return data;
};

const loadData = async (dispatch: Dispatch<AnyAction>) => {
  const [file_list, rulesets, assignments, case_sizes, underwriters] =
    await Promise.all([
      db.getItem(KEY_CASE_FILES),
      db.getItem(KEY_RULESETS),
      db.getItem(KEY_ASSIGNMENTS),
      db.getItem(KEY_CASE_SIZES),
      db.getItem(KEY_UNDERWRITERS),
    ]);
  let quotes: QuoteDataInterface[];
  if (file_list) {
    quotes = await fileListHandler(file_list as FileList, dispatch);
    dispatch(
      setRuleAppliedData({
        quotes,
        rulesets,
        assignments,
        case_sizes,
      })
    );
  }
  if (rulesets) dispatch(saveRulesets(rulesets));
  if (case_sizes) dispatch(setCaseSizes(case_sizes));
  if (underwriters) dispatch(setUnderwriters(underwriters));
};

const useLoadIndexedDB = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    loadData(dispatch);
  }, [dispatch]);
};

interface Props {
  children: React.ReactNode;
}

const LoadIndexedDBProvider = (props: Props) => {
  useLoadIndexedDB();
  const navigate = useNavigate();
  const underwriters: Underwriter[] = useSelector(
    (state: any) => state.config.underwriters
  );
  const case_sizes: EligibleMapper[] = useSelector(
    (state: any) => state.config.case_sizes
  );
  const rulesets: RulesetType[] = useSelector((state: any) => state.rulesets);
  const quotes: QuoteDataInterface[] = useSelector(
    (state: any) => state.quotes
  );

  let resumePath: string = "/";
  if (!quotes || quotes.length === 0) resumePath = "/quotes";
  else if (!underwriters || underwriters.length === 0) resumePath = "/config";
  else if (!case_sizes || case_sizes.length === 0) resumePath = "/config";
  else if (!rulesets || rulesets.length === 0) resumePath = "/config";
  else resumePath = "/assignments";

  const status = useMemo(() => {
    if (
      quotes &&
      quotes.length &&
      underwriters &&
      underwriters.length &&
      case_sizes &&
      case_sizes.length &&
      rulesets &&
      rulesets.length
    )
      return "FULLY_CONFIGURED";
    if (
      (!quotes || quotes.length === 0) &&
      (!underwriters || underwriters.length === 0) &&
      (!case_sizes || case_sizes.length === 0) &&
      (!rulesets || rulesets.length === 0)
    )
      return "NOT_CONFIGURED";
    return "PARTIALLY_CONFIGURED";
  }, [quotes, underwriters, case_sizes, rulesets]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (status === "NOT_CONFIGURED") {
        navigate("/quotes");
        return;
      }
    }, 1500);

    return () => {
      clearTimeout(timeout);
    };
  }, [status, navigate]);

  return (
    <>
      {props.children}
      {status === "PARTIALLY_CONFIGURED" ? (
        <ResumeOrRestart resumePath={resumePath} />
      ) : null}
    </>
  );
};

export default LoadIndexedDBProvider;
