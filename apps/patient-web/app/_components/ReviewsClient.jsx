"use client";

import { useState } from "react";
import Link from "next/link";
import { reviewSchema } from "@doctor/types";
import { reviewService, applyApiError } from "@doctor/api-client";
import { Alert, Avatar, Button, Card, CardBody, EmptyState, Modal, Textarea } from "@doctor/ui";

function StarRating({ value, onChange, error }) {
  return (
    <fieldset>
      <legend className="mb-1 block text-sm font-medium text-navy-800">Your rating</legend>
      <div role="radiogroup" aria-label="Star rating" className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange(star)}
            className={`rounded p-1 text-2xl leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-medical-500 ${
              star <= value ? "text-amber-500" : "text-navy-300 hover:text-amber-400"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </fieldset>
  );
}

export function ReviewsClient({ reviews, reviewable }) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null); // appointmentId just reviewed
  const [serverError, setServerError] = useState(null);

  function openModal(appointment) {
    setTarget(appointment);
    setRating(0);
    setComment("");
    setErrors({});
    setServerError(null);
    setSubmitted(null);
    setOpen(true);
  }

  async function submit() {
    setServerError(null);
    const parsed = reviewSchema.safeParse({
      appointmentId: target.id,
      rating,
      comment,
    });
    if (!parsed.success) {
      const fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      // POST /api/v1/reviews (PATIENT). Body { appointmentId(uuid), rating(1-5), comment? };
      // the service omits an empty comment. appointmentId must be a real UUID.
      await reviewService.create(parsed.data);
      setSubmitted(target.id);
    } catch (err) {
      applyApiError(err, setErrors, setServerError);
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    setOpen(false);
    setTarget(null);
  }

  return (
    <div className="space-y-6">
      {/* Completed visits awaiting review */}
      <section aria-labelledby="awaiting-heading">
        <h2 id="awaiting-heading" className="mb-3 text-xl font-semibold text-navy-900">
          Rate your recent visits
        </h2>
        {reviewable.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {reviewable.map((a) => (
              <li key={a.id}>
                <Card>
                  <CardBody className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={a.doctor ? a.doctor.name : "Doctor"} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy-900">
                          {a.doctor ? a.doctor.name : "Doctor"}
                        </p>
                        <p className="text-xs text-navy-500">
                          {new Date(`${a.date}T00:00:00`).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {a.doctor ? ` · ${a.doctor.specialization}` : ""}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => openModal(a)}>
                      Write a review
                    </Button>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <EmptyState
              title="Nothing to review right now"
              description="When you complete a consultation, you'll be able to rate it here."
            />
          </Card>
        )}
      </section>

      {/* Submitted reviews */}
      <section aria-labelledby="mine-heading">
        <h2 id="mine-heading" className="mb-3 text-xl font-semibold text-navy-900">My reviews</h2>
        {reviews.length ? (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id}>
                <Card>
                  <CardBody className="space-y-2 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-navy-900">{r.doctor ? r.doctor.name : "Doctor"}</p>
                      <span className="text-amber-500" aria-label={`Rated ${r.rating} out of 5`}>
                        {"★".repeat(r.rating)}
                        <span className="text-navy-300">{"★".repeat(5 - r.rating)}</span>
                      </span>
                    </div>
                    {r.comment ? <p className="text-sm text-navy-700">{r.comment}</p> : null}
                    <p className="text-xs text-navy-500">
                      {new Date(`${r.date}T00:00:00`).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <EmptyState
              title="No reviews yet"
              description="Your submitted doctor reviews will appear here."
              action={
                <Link href="/doctors">
                  <Button variant="outline" size="sm">Find doctors</Button>
                </Link>
              }
            />
          </Card>
        )}
      </section>

      {/* Review modal */}
      <Modal open={open} onClose={close} title={target && target.doctor ? `Rate ${target.doctor.name}` : "Write a review"}>
        {submitted ? (
          <div className="space-y-4 text-center">
            <Alert variant="success" title="Review submitted">
              Thank you — your feedback helps other patients choose with confidence.
            </Alert>
            <Button size="sm" onClick={close}>Done</Button>
          </div>
        ) : target ? (
          <div className="space-y-4">
            {serverError ? <Alert variant="danger" role="alert">{serverError}</Alert> : null}
            <StarRating value={rating} onChange={(v) => { setRating(v); setErrors((p) => ({ ...p, rating: undefined })); }} error={errors.rating} />
            <Textarea
              label="Your experience (optional)"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              error={errors.comment}
              hint="Max 500 characters."
              placeholder="How was the consultation, wait time and explanation?"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={close}>Cancel</Button>
              <Button size="sm" onClick={submit} loading={submitting}>Submit review</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
