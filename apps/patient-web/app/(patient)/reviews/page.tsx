import { PageHeader } from "@doctor/ui";
import { listMyReviews, listReviewableAppointments } from "../../_data/patient";
import { ReviewsClient } from "../../_components/ReviewsClient";

export const metadata = {
  title: "Reviews",
  description: "Rate completed consultations and see your submitted reviews.",
};

export default function PatientReviewsPage() {
  // Mock data — Phase 09 wires POST /api/v1/reviews + review listing.
  const reviews = listMyReviews();
  const reviewable = listReviewableAppointments();

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reviews" }]}
        title="Reviews"
        description="Share feedback on completed visits and track the reviews you've written."
      />
      <div className="mt-6">
        <ReviewsClient reviews={reviews} reviewable={reviewable} />
      </div>
    </div>
  );
}
