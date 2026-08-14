import { WalkInRegistration } from "../../_components/WalkInRegistration";
import { getFrontDeskContext } from "../../_data/receptionist";

export default function WalkInBookingPage() {
  const { doctors, clinic } = getFrontDeskContext();
  return <WalkInRegistration doctors={doctors} clinicId={clinic?.id ?? null} />;
}
