import DeclaracionXml from "@/app/components/Declaracion";
import PlanillaLiquidacion from "@/app/components/PlanillaLiquidacion";
import PlanillaView from "@/app/components/PlanillaView";


export default function DeclaracioPage() {
    return (

        <div className="flex justify-center items-center px-10">
            <div className="flex justify-center items-center  h-[95vh] w-[100%]   p-10">
                <PlanillaView />
            </div>
        </div>

    );
}
