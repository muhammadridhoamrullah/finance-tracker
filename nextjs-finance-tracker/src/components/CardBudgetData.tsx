import { BudgetModel, formatId, formatRupiah, thisYear } from "@/db/type/type";
import { FaCcMastercard } from "react-icons/fa";

interface props {
  data: BudgetModel;
}

export default function CardBudgetData({ data }: props) {
  return (
    <div className="bg-black/40 py-2 px-6 rounded-md text-white shadow-md w-full h-20 flex flex-col justify-between text-xs">
      <div className="uppercase font-semibold">
        {data.name} {thisYear}
      </div>
      <div className="text-white/50">{formatId(data._id.toUpperCase())}</div>
      <div className="font-semibold flex w-full justify-between items-center">
        {formatRupiah(data.amount)}
        <FaCcMastercard className="text-xl" />
      </div>
    </div>
  );
}
