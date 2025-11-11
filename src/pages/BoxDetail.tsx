import { useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";

export default function BoxDetail() {
  const { boxId } = useParams();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Box {boxId}</h1>
      <Card title="Overview"><div className="text-gray-300">Details, photos, parts, status…</div></Card>
    </div>
  );
}
