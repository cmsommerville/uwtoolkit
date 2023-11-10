import { useSelector } from "react-redux";
import { QuoteDataInterface } from "../types/upload_file";
import { EligibleMapper, Underwriter } from "../types/config";
import { RulesetType } from "../types/rulesets";

export const calculateLoadStatus = (
  quotes: QuoteDataInterface[] | null | undefined,
  underwriters: Underwriter[] | null | undefined,
  case_sizes: EligibleMapper[] | null | undefined,
  rulesets: RulesetType[] | null | undefined
) => {
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
};

export const useStoreStatus = () => {
  const quotes = useSelector((state: any) => state.quotes);
  const underwriters = useSelector((state: any) => state.config.underwriters);
  const case_sizes = useSelector((state: any) => state.config.case_sizes);
  const rulesets = useSelector((state: any) => state.rulesets);

  return {
    quotes: !!(quotes && quotes.length),
    underwriters: !!(underwriters && underwriters.length),
    case_sizes: !!(case_sizes && case_sizes.length),
    rulesets: !!(rulesets && rulesets.length),
  };
};
