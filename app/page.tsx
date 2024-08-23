import { RoutingForm } from "@/components/forms/RoutingForm";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-24 gap-5">
        <h1 className="text-3xl font-bold">Place Router</h1>
        <RoutingForm/>
    </main>
  );
}
