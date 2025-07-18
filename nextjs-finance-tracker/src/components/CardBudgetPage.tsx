import { BudgetModel, formatRupiah, thisDate } from "@/db/type/type";
import Link from "next/link";
import { LuWallet } from "react-icons/lu";
interface props {
  data: BudgetModel;
}
export default function CardBudgetPage({ data }: props) {
  const jumlahTransaksi = data.transactions.length;
  return (
    <div className="w-[223px] h-56 bg-blue-950 text-white rounded-2xl p-4 flex flex-col justify-between">
      <div className="flex justify-start items-center gap-2 ">
        <LuWallet className="text-2xl" />
        <div className="text-md font-semibold">{thisDate(data.startDate)}</div>
      </div>
      <div className="flex flex-col">
        <div className="font-semibold text-2xl">
          {formatRupiah(data.amount)}
        </div>
        <div className="text-xs text-slate-400">Total budget this month</div>
      </div>
      <div className="flex flex-col">
        <div>{jumlahTransaksi}</div>
        <div className="text-xs text-slate-400">
          Total number of transactions
        </div>
      </div>
      <Link
        className="bg-green-700 p-2 text-center rounded-md  hover:bg-green-900 text-xs"
        href={`/budget/${data._id}`}
      >
        DETAIL
      </Link>
    </div>
  );
}
