import { useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";

export default function SaleDetail() {
  const { saleId } = useParams();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Sale {saleId}</h1>
      <Card title="Overview"><div className="text-gray-300">Bids, mapping, terms, timers…</div></Card>
    </div>
  );
}
